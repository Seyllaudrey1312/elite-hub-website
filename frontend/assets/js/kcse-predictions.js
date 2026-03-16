/**
 * kcse-predictions.js
 * Elite Hub — KCSE Readiness Prediction Card
 *
 * HOW TO USE:
 * 1. Add this to dashboard.html where you want the card:
 *    <div id="kcse-readiness-root"></div>
 *
 * 2. Include this script AFTER api.js and main.js:
 *    <script src="../assets/js/kcse-predictions.js"></script>
 *
 * That's it. The card builds and injects its own HTML automatically.
 */

(function () {
    'use strict';

    // ── KNEC GRADING SCALE (2025 — confirmed) ─────────────────────────────────
    var GRADE_SCALE = [
        { min: 80, grade: 'A',  points: 12 },
        { min: 75, grade: 'A-', points: 11 },
        { min: 70, grade: 'B+', points: 10 },
        { min: 65, grade: 'B',  points: 9  },
        { min: 60, grade: 'B-', points: 8  },
        { min: 55, grade: 'C+', points: 7  },
        { min: 50, grade: 'C',  points: 6  },
        { min: 45, grade: 'C-', points: 5  },
        { min: 40, grade: 'D+', points: 4  },
        { min: 35, grade: 'D',  points: 3  },
        { min: 30, grade: 'D-', points: 2  },
        { min: 0,  grade: 'E',  points: 1  }
    ];

    function getGrade(percentage) {
        for (var i = 0; i < GRADE_SCALE.length; i++) {
            if (percentage >= GRADE_SCALE[i].min) return GRADE_SCALE[i].grade;
        }
        return 'E';
    }

    // ── GRADE COLOUR MAPS ─────────────────────────────────────────────────────
    var GRADE_TEXT_COLOR = {
        'A': 'text-green-300',  'A-': 'text-green-300',
        'B+': 'text-blue-300',  'B':  'text-blue-300',   'B-': 'text-blue-300',
        'C+': 'text-yellow-300','C':  'text-yellow-300', 'C-': 'text-yellow-300',
        'D+': 'text-orange-300','D':  'text-orange-300', 'D-': 'text-orange-300',
        'E':  'text-red-300'
    };

    var GRADE_BAR_COLOR = {
        'A': 'bg-green-400',  'A-': 'bg-green-400',
        'B+': 'bg-blue-400',  'B':  'bg-blue-400',   'B-': 'bg-blue-400',
        'C+': 'bg-yellow-400','C':  'bg-yellow-400', 'C-': 'bg-yellow-400',
        'D+': 'bg-orange-400','D':  'bg-orange-400', 'D-': 'bg-orange-400',
        'E':  'bg-red-400'
    };

    function gradeTextColor(grade) { return GRADE_TEXT_COLOR[grade] || 'text-gray-300'; }
    function gradeBarColor(grade)  { return GRADE_BAR_COLOR[grade]  || 'bg-gray-400'; }

    // ── INJECT WIDGET HTML ────────────────────────────────────────────────────
    function injectHTML() {
        var root = document.getElementById('kcse-readiness-root');
        if (!root) return false;

        root.innerHTML = [
            '<div class="bg-gradient-to-br from-blue-900 to-green-700 rounded-lg shadow-lg p-6" id="kcse-readiness-card">',

                /* Header */
                '<div class="flex items-center justify-between mb-4">',
                    '<h3 class="text-lg font-bold text-white">&#127919; KCSE Readiness</h3>',
                    '<button onclick="KCSEPredictions.refresh()"',
                            'class="text-xs text-blue-200 hover:text-white transition font-semibold">',
                        '&#8635; Refresh',
                    '</button>',
                '</div>',

                /* Loading */
                '<div id="kp-loading" class="text-center py-6">',
                    '<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>',
                    '<p class="text-sm text-blue-200 mt-2">Analysing your performance...</p>',
                '</div>',

                /* No Data */
                '<div id="kp-nodata" class="hidden text-center py-6">',
                    '<p class="text-sm text-blue-200">Take more quizzes to unlock your KCSE readiness predictions.</p>',
                '</div>',

                /* Error */
                '<div id="kp-error" class="hidden text-center py-4">',
                    '<p class="text-sm text-red-300 mb-2">Failed to load predictions.</p>',
                    '<button onclick="KCSEPredictions.load()" class="text-xs text-blue-200 hover:text-white">Try Again</button>',
                '</div>',

                /* Content */
                '<div id="kp-content" class="hidden">',

                    /* Subject predictions */
                    '<div id="kp-subjects" class="space-y-3 mb-5"></div>',

                    /* Weak topics */
                    '<div id="kp-weak-section" class="mb-5">',
                        '<h4 class="text-white font-semibold mb-2 text-sm">&#128218; Areas to Focus On:</h4>',
                        '<div id="kp-weak-list" class="space-y-2"></div>',
                    '</div>',

                    /* Recommended resources */
                    '<div id="kp-resources-section">',
                        '<h4 class="text-white font-semibold mb-2 text-sm">&#128161; Recommended Study Materials:</h4>',
                        '<div id="kp-resources-list" class="space-y-2"></div>',
                    '</div>',

                    /* Disclaimer */
                    '<div class="mt-4 pt-4 border-t border-blue-800">',
                        '<p class="text-xs text-blue-200">',
                            '&#9888;&#65039; Predictions are based on your quiz performance on this platform only. ',
                            'Actual KCSE results may vary. Official cluster points use KNEC performance indices not available publicly.',
                        '</p>',
                    '</div>',
                '</div>',

            '</div>'
        ].join('');

        return true;
    }

    // ── HELPERS ───────────────────────────────────────────────────────────────
    function show(id) { var e = document.getElementById(id); if (e) e.classList.remove('hidden'); }
    function hide(id) { var e = document.getElementById(id); if (e) e.classList.add('hidden');    }
    function esc(s)   { var d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }

    // ── LOAD DATA ─────────────────────────────────────────────────────────────
    function load() {
        show('kp-loading');
        hide('kp-content');
        hide('kp-error');
        hide('kp-nodata');

        var token = localStorage.getItem('authToken');
        if (!token) {
            hide('kp-loading');
            show('kp-nodata');
            return;
        }

        fetch(API_BASE_URL + '/students/me/predictions', {
            headers: { 'Authorization': 'Bearer ' + token }
        })
        .then(function (res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
        })
        .then(function (data) {
            hide('kp-loading');
            if (!data || !data.subjectPredictions || !Object.keys(data.subjectPredictions).length) {
                show('kp-nodata');
                return;
            }
            renderAll(data);
            show('kp-content');
        })
        .catch(function (err) {
            console.error('KCSEPredictions error:', err);
            hide('kp-loading');
            show('kp-error');
        });
    }

    // ── RENDER ALL ────────────────────────────────────────────────────────────
    function renderAll(data) {
        renderSubjects(data.subjectPredictions || {});
        renderWeakTopics(data.weakTopics || {});
        renderResources(data.recommendedResources || []);
    }

    // ── SUBJECT PREDICTIONS ───────────────────────────────────────────────────
    function renderSubjects(predictions) {
        var container = document.getElementById('kp-subjects');
        var keys = Object.keys(predictions);

        if (!keys.length) {
            container.innerHTML = '<p class="text-sm text-blue-200">No subject data yet. Take more quizzes.</p>';
            return;
        }

        container.innerHTML = keys.map(function (subject) {
            var d            = predictions[subject];
            var grade        = d.predictedGrade || getGrade(d.averageScore || 0);
            var confidence   = Math.max((d.confidence || 0) * 100, 20);
            var avgScore     = Math.round(d.averageScore || 0);
            var confPct      = Math.round((d.confidence || 0) * 100);
            var textColor    = gradeTextColor(grade);
            var barColor     = gradeBarColor(grade);

            return [
                '<div class="flex items-center justify-between p-3 bg-white/10 rounded-lg">',
                    '<div class="flex-1 min-w-0 pr-3">',
                        '<div class="flex items-center justify-between mb-1">',
                            '<span class="font-semibold text-sm text-white">' + esc(subject) + '</span>',
                            '<span class="text-lg font-bold ' + textColor + '">' + grade + '</span>',
                        '</div>',
                        '<div class="w-full bg-white/20 rounded-full h-2 mb-1">',
                            '<div class="h-2 rounded-full ' + barColor + '" style="width:' + confidence + '%"></div>',
                        '</div>',
                        '<div class="flex justify-between text-xs text-blue-200">',
                            '<span>Avg: ' + avgScore + '%</span>',
                            '<span>Confidence: ' + confPct + '%</span>',
                        '</div>',
                    '</div>',
                '</div>'
            ].join('');
        }).join('');
    }

    // ── WEAK TOPICS ───────────────────────────────────────────────────────────
    function renderWeakTopics(weakTopics) {
        var section = document.getElementById('kp-weak-section');
        var list    = document.getElementById('kp-weak-list');
        var keys    = Object.keys(weakTopics);

        if (!keys.length) { section.classList.add('hidden'); return; }
        section.classList.remove('hidden');

        // Flatten all weak topics into one array and sort by lowest score
        var flat = [];
        keys.forEach(function (subject) {
            var topics = weakTopics[subject];
            if (Array.isArray(topics)) {
                topics.forEach(function (t) {
                    flat.push({ subject: subject, topicName: t.topicName || t.topic || '', averageScore: t.averageScore || 0 });
                });
            }
        });
        flat.sort(function (a, b) { return a.averageScore - b.averageScore; });

        list.innerHTML = flat.slice(0, 5).map(function (t) {
            return [
                '<div class="flex items-center justify-between p-2 bg-white/10 rounded text-sm">',
                    '<div>',
                        '<span class="font-semibold text-white">' + esc(t.topicName) + '</span>',
                        '<span class="text-blue-200 ml-2 text-xs">(' + esc(t.subject) + ')</span>',
                    '</div>',
                    '<span class="text-red-300 font-semibold text-xs">' + Math.round(t.averageScore) + '%</span>',
                '</div>'
            ].join('');
        }).join('');
    }

    // ── RECOMMENDED RESOURCES ─────────────────────────────────────────────────
    function renderResources(resources) {
        var section = document.getElementById('kp-resources-section');
        var list    = document.getElementById('kp-resources-list');

        if (!resources.length) { section.classList.add('hidden'); return; }
        section.classList.remove('hidden');

        list.innerHTML = resources.slice(0, 3).map(function (r) {
            return [
                '<div class="p-2 bg-white/10 rounded text-sm">',
                    '<div class="flex items-center justify-between">',
                        '<span class="font-semibold text-white">' + esc(r.title) + '</span>',
                        '<a href="./resources.html?id=' + esc(r._id) + '"',
                           'class="text-yellow-300 hover:text-yellow-100 text-xs font-semibold ml-2 flex-shrink-0">',
                            'View &#8594;',
                        '</a>',
                    '</div>',
                    '<div class="text-blue-200 text-xs mt-0.5">',
                        esc(r.subject || '') + (r.subject && r.type ? ' &bull; ' : '') + esc(r.type || ''),
                    '</div>',
                '</div>'
            ].join('');
        }).join('');
    }

    // ── BOOT ──────────────────────────────────────────────────────────────────
    function init() {
        if (!injectHTML()) return;
        load();
    }

    document.addEventListener('DOMContentLoaded', init);

    // ── PUBLIC API ────────────────────────────────────────────────────────────
    window.KCSEPredictions = {
        load:    load,
        refresh: load
    };

}());
