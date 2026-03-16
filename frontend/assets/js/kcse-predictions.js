<!-- KCSE Readiness Card Component -->
<div class="bg-gradient-to-br from-blue-900 to-green-700 rounded-lg shadow-lg p-6 text-white" id="kcse-readiness-card">
    <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold">🎯 KCSE Readiness</h3>
        <button onclick="refreshPredictions()" class="text-xs text-blue-200 hover:text-white">Refresh</button>
    </div>
    
    <div id="predictions-loading" class="text-center py-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        <p class="text-sm mt-2">Analyzing your performance...</p>
    </div>
    
    <div id="predictions-content" class="hidden">
        <!-- Subject Predictions -->
        <div id="subject-predictions" class="space-y-3 mb-4">
            <!-- Predictions will be populated here -->
        </div>
        
        <!-- Weak Topics Section -->
        <div id="weak-topics-section" class="mb-4">
            <h4 class="font-semibold mb-2">📚 Areas to Focus On:</h4>
            <div id="weak-topics-list" class="space-y-2">
                <!-- Weak topics will be populated here -->
            </div>
        </div>
        
        <!-- Recommended Resources -->
        <div id="recommended-resources-section">
            <h4 class="font-semibold mb-2">💡 Recommended Study Materials:</h4>
            <div id="recommended-resources-list" class="space-y-2">
                <!-- Recommended resources will be populated here -->
            </div>
        </div>
        
        <!-- Disclaimer -->
        <div class="mt-4 pt-4 border-t border-blue-800">
            <p class="text-xs text-blue-200">
                ⚠️ Predictions are based on your quiz performance on this platform only. 
                Actual KCSE results may vary based on exam preparation and performance.
            </p>
        </div>
    </div>
    
    <div id="predictions-error" class="hidden text-center py-4">
        <p class="text-sm text-red-200">Failed to load predictions</p>
        <button onclick="loadPredictions()" class="text-xs text-blue-200 hover:text-white mt-2">Try Again</button>
    </div>
</div>

<script>
// KCSE Prediction System
let predictionsData = null;

async function loadPredictions() {
    const loadingEl = document.getElementById('predictions-loading');
    const contentEl = document.getElementById('predictions-content');
    const errorEl = document.getElementById('predictions-error');
    
    // Show loading state
    loadingEl.classList.remove('hidden');
    contentEl.classList.add('hidden');
    errorEl.classList.add('hidden');
    
    try {
        const response = await fetch(`${API_BASE_URL}/students/me/predictions`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        
        if (!response.ok) throw new Error('Failed to load predictions');
        
        predictionsData = await response.json();
        renderPredictions(predictionsData);
        
        loadingEl.classList.add('hidden');
        contentEl.classList.remove('hidden');
        
    } catch (error) {
        console.error('Predictions error:', error);
        loadingEl.classList.add('hidden');
        errorEl.classList.remove('hidden');
    }
}

function renderPredictions(data) {
    renderSubjectPredictions(data.subjectPredictions);
    renderWeakTopics(data.weakTopics);
    renderRecommendedResources(data.recommendedResources);
}

function renderSubjectPredictions(predictions) {
    const container = document.getElementById('subject-predictions');
    
    if (!predictions || !Object.keys(predictions).length) {
        container.innerHTML = '<p class="text-sm text-blue-200">Take more quizzes to get predictions</p>';
        return;
    }
    
    container.innerHTML = Object.entries(predictions).map(([subject, data]) => {
        const gradeColor = getGradeColorClass(data.predictedGrade);
        const confidenceWidth = Math.max(data.confidence * 100, 20); // Minimum 20% width
        
        return `
            <div class="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                <div class="flex-1">
                    <div class="flex items-center justify-between mb-1">
                        <span class="font-semibold text-sm">${subject}</span>
                        <span class="text-lg font-bold ${gradeColor}">${data.predictedGrade}</span>
                    </div>
                    <div class="w-full bg-white/20 rounded-full h-2">
                        <div class="h-2 rounded-full ${getGradeProgressColor(data.predictedGrade)}" 
                             style="width: ${confidenceWidth}%"></div>
                    </div>
                    <div class="flex justify-between text-xs text-blue-200 mt-1">
                        <span>Avg: ${Math.round(data.averageScore)}%</span>
                        <span>Confidence: ${Math.round(data.confidence * 100)}%</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderWeakTopics(weakTopics) {
    const container = document.getElementById('weak-topics-list');
    
    if (!weakTopics || !Object.keys(weakTopics).length) {
        document.getElementById('weak-topics-section').classList.add('hidden');
        return;
    }
    
    document.getElementById('weak-topics-section').classList.remove('hidden');
    
    const allWeakTopics = [];
    Object.entries(weakTopics).forEach(([subject, topics]) => {
        topics.forEach(topic => {
            allWeakTopics.push({ subject, ...topic });
        });
    });
    
    // Sort by lowest score first
    allWeakTopics.sort((a, b) => a.averageScore - b.averageScore);
    
    container.innerHTML = allWeakTopics.slice(0, 5).map(topic => `
        <div class="flex items-center justify-between p-2 bg-white/10 rounded text-sm">
            <div>
                <span class="font-semibold">${topic.topicName}</span>
                <span class="text-blue-200 ml-2">(${topic.subject})</span>
            </div>
            <span class="text-red-200 font-semibold">${Math.round(topic.averageScore)}%</span>
        </div>
    `).join('');
}

function renderRecommendedResources(resources) {
    const container = document.getElementById('recommended-resources-list');
    
    if (!resources || !resources.length) {
        document.getElementById('recommended-resources-section').classList.add('hidden');
        return;
    }
    
    document.getElementById('recommended-resources-section').classList.remove('hidden');
    
    container.innerHTML = resources.slice(0, 3).map(resource => `
        <div class="p-2 bg-white/10 rounded text-sm">
            <div class="flex items-center justify-between">
                <span class="font-semibold">${resource.title}</span>
                <a href="./resources.html?id=${resource._id}" 
                   class="text-yellow-300 hover:text-yellow-100 text-xs font-semibold">
                    View →
                </a>
            </div>
            <div class="text-blue-200 text-xs mt-1">
                ${resource.subject} • ${resource.type}
            </div>
        </div>
    `).join('');
}

function getGradeColorClass(grade) {
    const colors = {
        'A': 'text-green-300', 'A-': 'text-green-300',
        'B+': 'text-blue-300', 'B': 'text-blue-300', 'B-': 'text-blue-300',
        'C+': 'text-yellow-300', 'C': 'text-yellow-300', 'C-': 'text-yellow-300',
        'D+': 'text-orange-300', 'D': 'text-orange-300', 'D-': 'text-orange-300',
        'E': 'text-red-300'
    };
    return colors[grade] || 'text-gray-300';
}

function getGradeProgressColor(grade) {
    const colors = {
        'A': 'bg-green-400', 'A-': 'bg-green-400',
        'B+': 'bg-blue-400', 'B': 'bg-blue-400', 'B-': 'bg-blue-400',
        'C+': 'bg-yellow-400', 'C': 'bg-yellow-400', 'C-': 'bg-yellow-400',
        'D+': 'bg-orange-400', 'D': 'bg-orange-400', 'D-': 'bg-orange-400',
        'E': 'bg-red-400'
    };
    return colors[grade] || 'bg-gray-400';
}

function refreshPredictions() {
    loadPredictions();
}

// KNEC Grading Scale
function getKNECGrade(percentage) {
    if (percentage >= 80) return 'A';
    if (percentage >= 75) return 'A-';
    if (percentage >= 70) return 'B+';
    if (percentage >= 65) return 'B';
    if (percentage >= 60) return 'B-';
    if (percentage >= 55) return 'C+';
    if (percentage >= 50) return 'C';
    if (percentage >= 45) return 'C-';
    if (percentage >= 40) return 'D+';
    if (percentage >= 35) return 'D';
    if (percentage >= 30) return 'D-';
    return 'E';
}

// Load predictions when dashboard loads
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('kcse-readiness-card')) {
        loadPredictions();
    }
});
</script>