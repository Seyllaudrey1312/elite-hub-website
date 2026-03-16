/**
 * exam-countdown.js
 * Elite Hub — Exam Countdown Widget
 *
 * HOW TO USE:
 * 1. Add this to dashboard.html where you want the widget:
 *    <div id="exam-countdown-root"></div>
 *
 * 2. Include this script AFTER api.js and main.js:
 *    <script src="../assets/js/exam-countdown.js"></script>
 *
 * That's it. The widget builds and injects its own HTML automatically.
 */

(function () {
    'use strict';

    // ── STATE ─────────────────────────────────────────────────────────────────
    var examDates       = [];
    var timers          = {};       // { index: intervalId }
    var pendingDeleteId = null;

    // ── INJECT WIDGET HTML ────────────────────────────────────────────────────
    function injectHTML() {
        var root = document.getElementById('exam-countdown-root');
        if (!root) return false;

        root.innerHTML = [
            /* Widget card */
            '<div class="bg-white rounded-lg shadow-lg p-6 mb-6" id="exam-countdown-widget">',
                '<div class="flex items-center justify-between mb-4">',
                    '<h3 class="text-xl font-bold text-blue-900">&#9200; Exam Countdown</h3>',
                    '<button onclick="ExamCountdown.openAddModal()" class="text-sm text-blue-600 hover:text-blue-800 font-semibold transition">',
                        '+ Add Personal Exam',
                    '</button>',
                '</div>',

                /* Loading */
                '<div id="ec-loading" class="text-center py-6">',
                    '<div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-900 mx-auto"></div>',
                    '<p class="text-sm text-gray-500 mt-2">Loading exam dates...</p>',
                '</div>',

                /* Error */
                '<div id="ec-error" class="hidden text-center py-6">',
                    '<p class="text-red-500 text-sm mb-2">Failed to load exam dates.</p>',
                    '<button onclick="ExamCountdown.load()" class="text-sm text-blue-600 hover:text-blue-800 font-semibold">Retry</button>',
                '</div>',

                /* Content */
                '<div id="ec-content" class="hidden">',
                    '<div id="ec-cards" class="space-y-4"></div>',
                    '<div id="ec-empty" class="hidden text-center py-8 text-gray-400">',
                        '<p class="text-3xl mb-2">&#128197;</p>',
                        '<p class="text-sm mb-3">No upcoming exams scheduled</p>',
                        '<button onclick="ExamCountdown.openAddModal()" class="text-sm text-blue-600 hover:text-blue-800 font-semibold">',
                            'Add your first exam date',
                        '</button>',
                    '</div>',
                '</div>',
            '</div>',

            /* ── ADD EXAM MODAL ── */
            '<div id="ec-add-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50 px-4">',
                '<div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">',
                    '<div class="flex items-center justify-between mb-5">',
                        '<h3 class="text-lg font-bold text-blue-900">&#128197; Add Personal Exam Date</h3>',
                        '<button onclick="ExamCountdown.closeAddModal()" class="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>',
                    '</div>',
                    '<form id="ec-add-form">',
                        '<div class="mb-4">',
                            '<label for="ec-name" class="block text-gray-700 font-semibold mb-1 text-sm">Exam Name <span class="text-red-500">*</span></label>',
                            '<input type="text" id="ec-name" required placeholder="e.g. KCSE 2026, Mock Exam, End Term"',
                                   'class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />',
                        '</div>',
                        '<div class="mb-4">',
                            '<label for="ec-date" class="block text-gray-700 font-semibold mb-1 text-sm">Date &amp; Time <span class="text-red-500">*</span></label>',
                            '<input type="datetime-local" id="ec-date" required',
                                   'class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />',
                        '</div>',
                        '<div class="mb-4">',
                            '<label for="ec-subject" class="block text-gray-700 font-semibold mb-1 text-sm">Subject <span class="text-gray-400 font-normal">(optional)</span></label>',
                            '<select id="ec-subject" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">',
                                '<option value="">All Subjects / General</option>',
                                '<option value="Mathematics">Mathematics</option>',
                                '<option value="English">English</option>',
                                '<option value="Kiswahili">Kiswahili</option>',
                                '<option value="Physics">Physics</option>',
                                '<option value="Chemistry">Chemistry</option>',
                                '<option value="Biology">Biology</option>',
                                '<option value="History &amp; Government">History &amp; Government</option>',
                                '<option value="Geography">Geography</option>',
                                '<option value="Christian Religious Education">Christian Religious Education</option>',
                                '<option value="Business Studies">Business Studies</option>',
                                '<option value="Computer Studies">Computer Studies</option>',
                                '<option value="Agriculture">Agriculture</option>',
                                '<option value="Integrated Science">Integrated Science</option>',
                                '<option value="Core Mathematics">Core Mathematics</option>',
                            '</select>',
                        '</div>',
                        '<div class="mb-5">',
                            '<label class="flex items-center gap-2 cursor-pointer">',
                                '<input type="checkbox" id="ec-reminder" class="w-4 h-4 rounded" />',
                                '<span class="text-sm text-gray-700">Send me a reminder notification</span>',
                            '</label>',
                        '</div>',
                        '<div class="flex gap-3">',
                            '<button type="submit" id="ec-add-btn"',
                                    'class="flex-1 bg-blue-900 text-white py-2 rounded-lg font-bold hover:bg-blue-800 transition text-sm">',
                                'Add Exam',
                            '</button>',
                            '<button type="button" onclick="ExamCountdown.closeAddModal()"',
                                    'class="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-bold hover:bg-gray-300 transition text-sm">',
                                'Cancel',
                            '</button>',
                        '</div>',
                    '</form>',
                '</div>',
            '</div>',

            /* ── DELETE CONFIRM MODAL ── */
            '<div id="ec-delete-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50 px-4">',
                '<div class="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center">',
                    '<p class="text-4xl mb-3">&#128465;</p>',
                    '<h3 class="text-lg font-bold text-gray-800 mb-2">Remove Exam Date?</h3>',
                    '<p class="text-gray-500 text-sm mb-6">This exam will be removed from your countdown.</p>',
                    '<div class="flex gap-3">',
                        '<button id="ec-confirm-delete" class="flex-1 bg-red-600 text-white font-bold py-2 rounded-lg hover:bg-red-700 transition text-sm">Remove</button>',
                        '<button onclick="ExamCountdown.closeDeleteModal()" class="flex-1 bg-gray-200 text-gray-700 font-bold py-2 rounded-lg hover:bg-gray-300 transition text-sm">Cancel</button>',
                    '</div>',
                '</div>',
            '</div>',

            /* ── STYLES ── */
            '<style>',
                '.ec-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }',
                '.ec-card:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.10); }',
                '.ec-unit { background: rgba(59,130,246,0.08); border-radius: 8px; padding: 8px 4px; min-width: 0; }',
                '.ec-num  { font-size: 1.4rem; font-weight: 800; line-height: 1; color: #1e3a8a; }',
                '.ec-lbl  { font-size: 0.6rem; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 3px; }',
                '.ec-urgent { border-left-color: #ef4444 !important; background-color: #fef2f2; }',
                '.ec-soon   { border-left-color: #f59e0b !important; background-color: #fffbeb; }',
                '.ec-normal { border-left-color: #3b82f6 !important; background-color: #eff6ff; }',
            '</style>'
        ].join('');

        return true;
    }

    // ── SHOW / HIDE HELPERS ───────────────────────────────────────────────────
    function show(id) { var e = document.getElementById(id); if (e) e.classList.remove('hidden'); }
    function hide(id) { var e = document.getElementById(id); if (e) e.classList.add('hidden'); }
    function esc(s)   { var d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }
    function pad(n)   { return String(n).padStart(2, '0'); }

    // ── LOAD DATA ─────────────────────────────────────────────────────────────
    function load() {
        show('ec-loading');
        hide('ec-error');
        hide('ec-content');

        var token = localStorage.getItem('authToken');
        if (!token) {
            hide('ec-loading');
            show('ec-content');
            show('ec-empty');
            return;
        }

        var headers = { 'Authorization': 'Bearer ' + token };

        Promise.allSettled([
            fetch(API_BASE_URL + '/exam-dates/official',       { headers: headers }),
            fetch(API_BASE_URL + '/students/me/exam-dates',    { headers: headers })
        ]).then(function (results) {
            var official = [], personal = [];

            if (results[0].status === 'fulfilled' && results[0].value.ok) {
                results[0].value.json().then(function (d) {
                    official = normalise(d).map(function (e) { return assign(e, { isOfficial: true }); });
                    merge(official, personal);
                });
            } else {
                merge(official, personal);
            }

            if (results[1].status === 'fulfilled' && results[1].value.ok) {
                results[1].value.json().then(function (d) {
                    personal = normalise(d).map(function (e) { return assign(e, { isOfficial: false }); });
                    merge(official, personal);
                });
            }

            // Fallback if both fail
            setTimeout(function () {
                if (document.getElementById('ec-loading') &&
                    !document.getElementById('ec-loading').classList.contains('hidden')) {
                    hide('ec-loading');
                    show('ec-error');
                }
            }, 8000);

        }).catch(function (err) {
            console.error('ExamCountdown load error:', err);
            hide('ec-loading');
            show('ec-error');
        });
    }

    function normalise(d) {
        return Array.isArray(d) ? d : (Array.isArray(d.data) ? d.data : []);
    }

    function assign(obj, extra) {
        var result = {};
        for (var k in obj) { if (obj.hasOwnProperty(k)) result[k] = obj[k]; }
        for (var k2 in extra) { if (extra.hasOwnProperty(k2)) result[k2] = extra[k2]; }
        return result;
    }

    var mergeCallCount = 0;
    function merge(official, personal) {
        mergeCallCount++;
        if (mergeCallCount < 2) return; // wait for both fetches

        mergeCallCount = 0;
        var now = new Date();
        examDates = official.concat(personal)
            .filter(function (e) { return new Date(e.date) > now; })
            .sort(function (a, b) { return new Date(a.date) - new Date(b.date); });

        hide('ec-loading');
        show('ec-content');
        renderCards();
    }

    // ── RENDER CARDS ──────────────────────────────────────────────────────────
    function renderCards() {
        stopAllTimers();

        var container = document.getElementById('ec-cards');
        if (!container) return;
        container.innerHTML = '';

        if (!examDates.length) {
            show('ec-empty');
            return;
        }
        hide('ec-empty');

        examDates.forEach(function (exam, index) {
            var card = buildCard(exam, index);
            container.appendChild(card);
            startTimer(exam.date, index);
        });
    }

    function buildCard(exam, index) {
        var days     = Math.ceil((new Date(exam.date) - new Date()) / 86400000);
        var urgency  = days <= 7 ? 'ec-urgent' : days <= 30 ? 'ec-soon' : 'ec-normal';
        var badge    = exam.isOfficial
            ? '<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">&#9989; Official</span>'
            : '<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">&#128100; Personal</span>';
        var deleteBtn = !exam.isOfficial
            ? '<button onclick="ExamCountdown.confirmDelete(\'' + (exam._id || index) + '\')" ' +
              'class="text-gray-400 hover:text-red-500 transition text-xl leading-none font-bold ml-1" title="Remove">&times;</button>'
            : '';
        var dateStr = new Date(exam.date).toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });

        var card = document.createElement('div');
        card.className  = 'ec-card border-l-4 rounded-lg p-4 ' + urgency;
        card.id         = 'ec-card-' + index;
        card.innerHTML  =
            '<div class="flex items-start justify-between mb-1 gap-2">' +
                '<div class="flex-1 min-w-0">' +
                    '<h4 class="font-bold text-gray-800 text-base leading-tight">' + esc(exam.name) + '</h4>' +
                    (exam.subject ? '<p class="text-xs text-gray-500 mt-0.5">' + esc(exam.subject) + '</p>' : '') +
                '</div>' +
                '<div class="flex items-center flex-shrink-0">' + badge + deleteBtn + '</div>' +
            '</div>' +
            '<p class="text-xs text-gray-500 mb-3">&#128197; ' + dateStr + '</p>' +
            '<div id="ec-display-' + index + '" class="grid grid-cols-4 gap-2 text-center">' +
                unit('--', 'Days') + unit('--', 'Hours') + unit('--', 'Mins') + unit('--', 'Secs') +
            '</div>';
        return card;
    }

    function unit(val, label) {
        return '<div class="ec-unit"><div class="ec-num">' + val + '</div><div class="ec-lbl">' + label + '</div></div>';
    }

    // ── TIMERS ────────────────────────────────────────────────────────────────
    function startTimer(date, index) {
        tick(date, index);
        timers[index] = setInterval(function () { tick(date, index); }, 1000);
    }

    function tick(date, index) {
        var distance = new Date(date).getTime() - Date.now();
        var el = document.getElementById('ec-display-' + index);
        if (!el) { clearInterval(timers[index]); return; }

        if (distance <= 0) {
            clearInterval(timers[index]);
            var card = document.getElementById('ec-card-' + index);
            if (card) {
                card.style.opacity    = '0';
                card.style.transition = 'opacity 0.5s';
                setTimeout(function () {
                    if (card.parentNode) card.parentNode.removeChild(card);
                    if (!document.querySelectorAll('[id^="ec-card-"]').length) show('ec-empty');
                }, 500);
            }
            return;
        }

        var d = Math.floor(distance / 86400000);
        var h = Math.floor((distance % 86400000) / 3600000);
        var m = Math.floor((distance % 3600000) / 60000);
        var s = Math.floor((distance % 60000) / 1000);

        var nums = el.querySelectorAll('.ec-num');
        if (nums.length === 4) {
            nums[0].textContent = pad(d);
            nums[1].textContent = pad(h);
            nums[2].textContent = pad(m);
            nums[3].textContent = pad(s);
        }
    }

    function stopAllTimers() {
        for (var k in timers) { clearInterval(timers[k]); }
        timers = {};
    }

    // ── ADD MODAL ─────────────────────────────────────────────────────────────
    function openAddModal() {
        var now = new Date();
        var pad2 = function (n) { return String(n).padStart(2, '0'); };
        document.getElementById('ec-date').min =
            now.getFullYear() + '-' + pad2(now.getMonth() + 1) + '-' + pad2(now.getDate()) +
            'T' + pad2(now.getHours()) + ':' + pad2(now.getMinutes());
        document.getElementById('ec-add-modal').classList.remove('hidden');
    }

    function closeAddModal() {
        document.getElementById('ec-add-modal').classList.add('hidden');
        document.getElementById('ec-add-form').reset();
    }

    // ── ADD SUBMIT ────────────────────────────────────────────────────────────
    function handleAddSubmit(e) {
        e.preventDefault();
        var token = localStorage.getItem('authToken');
        if (!token) {
            if (typeof showNotification === 'function') showNotification('Please log in to add exam dates.', 'error');
            return;
        }

        var btn = document.getElementById('ec-add-btn');
        btn.disabled    = true;
        btn.textContent = 'Adding...';

        var payload = {
            name:     document.getElementById('ec-name').value.trim(),
            date:     document.getElementById('ec-date').value,
            subject:  document.getElementById('ec-subject').value || null,
            reminder: document.getElementById('ec-reminder').checked
        };

        fetch(API_BASE_URL + '/students/me/exam-dates', {
            method:  'POST',
            headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
            body:    JSON.stringify(payload)
        })
        .then(function (res) {
            if (!res.ok) return res.json().then(function (d) { throw new Error(d.message || 'Failed'); });
            if (typeof showNotification === 'function') showNotification('Exam date added! ✅', 'success');
            closeAddModal();
            load();
        })
        .catch(function (err) {
            if (typeof showNotification === 'function') showNotification('Could not add exam: ' + err.message, 'error');
        })
        .finally(function () {
            btn.disabled    = false;
            btn.textContent = 'Add Exam';
        });
    }

    // ── DELETE MODAL ──────────────────────────────────────────────────────────
    function confirmDelete(id) {
        pendingDeleteId = id;
        document.getElementById('ec-delete-modal').classList.remove('hidden');
    }

    function closeDeleteModal() {
        pendingDeleteId = null;
        document.getElementById('ec-delete-modal').classList.add('hidden');
    }

    function doDelete() {
        var id    = pendingDeleteId;
        var token = localStorage.getItem('authToken');
        closeDeleteModal();
        if (!id || !token) return;

        fetch(API_BASE_URL + '/students/me/exam-dates/' + id, {
            method:  'DELETE',
            headers: { 'Authorization': 'Bearer ' + token }
        })
        .then(function (res) {
            if (!res.ok) throw new Error('Delete failed');
            if (typeof showNotification === 'function') showNotification('Exam date removed.', 'success');
            load();
        })
        .catch(function () {
            if (typeof showNotification === 'function') showNotification('Could not remove exam date.', 'error');
        });
    }

    // ── BACKDROP CLOSE ────────────────────────────────────────────────────────
    function onBackdropClick(e) {
        if (e.target === document.getElementById('ec-add-modal'))    closeAddModal();
        if (e.target === document.getElementById('ec-delete-modal')) closeDeleteModal();
    }

    // ── BOOT ──────────────────────────────────────────────────────────────────
    function init() {
        if (!injectHTML()) return; // no root element on this page

        document.getElementById('ec-add-form').addEventListener('submit', handleAddSubmit);
        document.getElementById('ec-confirm-delete').addEventListener('click', doDelete);
        document.addEventListener('click', onBackdropClick);
        window.addEventListener('beforeunload', stopAllTimers);

        load();
    }

    document.addEventListener('DOMContentLoaded', init);

    // ── PUBLIC API (used by onclick attributes in injected HTML) ──────────────
    window.ExamCountdown = {
        load:            load,
        openAddModal:    openAddModal,
        closeAddModal:   closeAddModal,
        confirmDelete:   confirmDelete,
        closeDeleteModal: closeDeleteModal
    };

}());
