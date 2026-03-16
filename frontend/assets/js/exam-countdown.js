<!-- Exam Countdown Widget -->
<div class="bg-white rounded-lg shadow-lg p-6 mb-6" id="exam-countdown-widget">
    <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold text-blue-900">⏰ Exam Countdown</h3>
        <button onclick="openExamDateModal()" class="text-sm text-blue-600 hover:text-blue-800 font-semibold">
            + Add Personal Exam
        </button>
    </div>
    
    <div id="countdown-loading" class="text-center py-4">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-900 mx-auto"></div>
        <p class="text-sm text-gray-600 mt-2">Loading exam dates...</p>
    </div>
    
    <div id="countdown-container" class="hidden">
        <div id="countdown-cards" class="space-y-4">
            <!-- Countdown cards will be populated here -->
        </div>
        
        <div id="no-exams" class="hidden text-center py-6 text-gray-500">
            <p class="mb-2">No upcoming exams scheduled</p>
            <button onclick="openExamDateModal()" class="text-blue-600 hover:text-blue-800 font-semibold text-sm">
                Add your first exam date
            </button>
        </div>
    </div>
</div>

<!-- Add Exam Date Modal -->
<div id="examDateModal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 max-w-md mx-4 w-full">
        <h3 class="text-lg font-bold text-blue-900 mb-4">📅 Add Personal Exam Date</h3>
        
        <form id="examDateForm">
            <div class="mb-4">
                <label for="examName" class="block text-gray-700 font-semibold mb-2">Exam Name</label>
                <input type="text" id="examName" name="name" required 
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                       placeholder="e.g., KCSE 2026, Mock Exam">
            </div>
            
            <div class="mb-4">
                <label for="examDate" class="block text-gray-700 font-semibold mb-2">Exam Date</label>
                <input type="datetime-local" id="examDate" name="date" required 
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
            </div>
            
            <div class="mb-4">
                <label for="examSubject" class="block text-gray-700 font-semibold mb-2">Subject (Optional)</label>
                <select id="examSubject" name="subject" 
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                    <option value="">All Subjects</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="English">English</option>
                    <option value="Kiswahili">Kiswahili</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="History">History</option>
                    <option value="Geography">Geography</option>
                </select>
            </div>
            
            <div class="mb-6">
                <label class="flex items-center">
                    <input type="checkbox" id="examReminder" name="reminder" class="mr-2">
                    <span class="text-sm text-gray-700">Send me reminders</span>
                </label>
            </div>
            
            <div class="flex gap-3">
                <button type="submit" class="flex-1 bg-blue-900 text-white py-2 rounded font-bold hover:bg-blue-800 transition">
                    Add Exam
                </button>
                <button type="button" onclick="closeExamDateModal()" 
                        class="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 transition">
                    Cancel
                </button>
            </div>
        </form>
    </div>
</div>

<script>
// Exam Countdown System
let examDates = [];
let countdownIntervals = [];

async function loadExamDates() {
    const loadingEl = document.getElementById('countdown-loading');
    const containerEl = document.getElementById('countdown-container');
    
    loadingEl.classList.remove('hidden');
    containerEl.classList.add('hidden');
    
    try {
        // Load official exam dates
        const officialResponse = await fetch(`${API_BASE_URL}/exam-dates/official`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        
        // Load personal exam dates
        const personalResponse = await fetch(`${API_BASE_URL}/students/me/exam-dates`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        
        const officialDates = officialResponse.ok ? await officialResponse.json() : [];
        const personalDates = personalResponse.ok ? await personalResponse.json() : [];
        
        examDates = [...officialDates, ...personalDates];
        
        // Filter out past exams and sort by date
        const now = new Date();
        examDates = examDates
            .filter(exam => new Date(exam.date) > now)
            .sort((a, b) => new Date(a.date) - new Date(b.date));
        
        renderCountdownCards();
        
        loadingEl.classList.add('hidden');
        containerEl.classList.remove('hidden');
        
    } catch (error) {
        console.error('Failed to load exam dates:', error);
        loadingEl.innerHTML = '<p class="text-red-500 text-sm">Failed to load exam dates</p>';
    }
}

function renderCountdownCards() {
    const container = document.getElementById('countdown-cards');
    const noExamsEl = document.getElementById('no-exams');
    
    // Clear existing intervals
    countdownIntervals.forEach(interval => clearInterval(interval));
    countdownIntervals = [];
    
    if (!examDates.length) {
        container.innerHTML = '';
        noExamsEl.classList.remove('hidden');
        return;
    }
    
    noExamsEl.classList.add('hidden');
    
    container.innerHTML = examDates.map((exam, index) => {
        const isOfficial = exam.isOfficial;
        const urgencyClass = getUrgencyClass(exam.date);
        const badgeClass = isOfficial ? 'badge-success' : 'badge-primary';
        
        return `
            <div class="exam-countdown-card ${urgencyClass} p-4 rounded-lg border-l-4">
                <div class="flex items-center justify-between mb-2">
                    <div>
                        <h4 class="font-bold text-lg">${exam.name}</h4>
                        ${exam.subject ? `<p class="text-sm text-gray-600">${exam.subject}</p>` : ''}
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="badge ${badgeClass}">${isOfficial ? 'Official' : 'Personal'}</span>
                        ${!isOfficial ? `<button onclick="deleteExamDate('${exam._id}')" class="text-red-500 hover:text-red-700 text-sm">×</button>` : ''}
                    </div>
                </div>
                
                <div class="text-sm text-gray-600 mb-3">
                    📅 ${new Date(exam.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </div>
                
                <div id="countdown-${index}" class="countdown-display grid grid-cols-4 gap-2 text-center">
                    <div class="countdown-unit">
                        <div class="countdown-number text-2xl font-bold">--</div>
                        <div class="countdown-label text-xs text-gray-500">Days</div>
                    </div>
                    <div class="countdown-unit">
                        <div class="countdown-number text-2xl font-bold">--</div>
                        <div class="countdown-label text-xs text-gray-500">Hours</div>
                    </div>
                    <div class="countdown-unit">
                        <div class="countdown-number text-2xl font-bold">--</div>
                        <div class="countdown-label text-xs text-gray-500">Minutes</div>
                    </div>
                    <div class="countdown-unit">
                        <div class="countdown-number text-2xl font-bold">--</div>
                        <div class="countdown-label text-xs text-gray-500">Seconds</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Start countdown timers
    examDates.forEach((exam, index) => {
        const interval = setInterval(() => updateCountdown(exam.date, index), 1000);
        countdownIntervals.push(interval);
        updateCountdown(exam.date, index); // Initial update
    });
}

function updateCountdown(examDate, index) {
    const now = new Date().getTime();
    const examTime = new Date(examDate).getTime();
    const distance = examTime - now;
    
    const countdownEl = document.getElementById(`countdown-${index}`);
    if (!countdownEl) return;
    
    if (distance < 0) {
        // Exam has passed, remove it
        loadExamDates();
        return;
    }
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    const numbers = countdownEl.querySelectorAll('.countdown-number');
    numbers[0].textContent = days.toString().padStart(2, '0');
    numbers[1].textContent = hours.toString().padStart(2, '0');
    numbers[2].textContent = minutes.toString().padStart(2, '0');
    numbers[3].textContent = seconds.toString().padStart(2, '0');
}

function getUrgencyClass(examDate) {
    const now = new Date();
    const exam = new Date(examDate);
    const daysUntil = Math.ceil((exam - now) / (1000 * 60 * 60 * 24));
    
    if (daysUntil <= 7) return 'border-red-500 bg-red-50';
    if (daysUntil <= 30) return 'border-yellow-500 bg-yellow-50';
    return 'border-blue-500 bg-blue-50';
}

function openExamDateModal() {
    document.getElementById('examDateModal').classList.remove('hidden');
    document.getElementById('examDateModal').classList.add('flex');
    
    // Set minimum date to today
    const now = new Date();
    const minDate = now.toISOString().slice(0, 16);
    document.getElementById('examDate').min = minDate;
}

function closeExamDateModal() {
    document.getElementById('examDateModal').classList.add('hidden');
    document.getElementById('examDateModal').classList.remove('flex');
    document.getElementById('examDateForm').reset();
}

async function addExamDate(examData) {
    try {
        const response = await fetch(`${API_BASE_URL}/students/me/exam-dates`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(examData)
        });
        
        if (!response.ok) throw new Error('Failed to add exam date');
        
        showNotification('Exam date added successfully!', 'success');
        closeExamDateModal();
        loadExamDates();
        
    } catch (error) {
        showNotification('Failed to add exam date: ' + error.message, 'error');
    }
}

async function deleteExamDate(examId) {
    if (!confirm('Are you sure you want to delete this exam date?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/students/me/exam-dates/${examId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        
        if (!response.ok) throw new Error('Failed to delete exam date');
        
        showNotification('Exam date deleted successfully!', 'success');
        loadExamDates();
        
    } catch (error) {
        showNotification('Failed to delete exam date: ' + error.message, 'error');
    }
}

// Event Listeners
document.getElementById('examDateForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const examData = {
        name: formData.get('name'),
        date: formData.get('date'),
        subject: formData.get('subject') || null,
        reminder: formData.get('reminder') === 'on'
    };
    
    await addExamDate(examData);
});

// Load exam dates when dashboard loads
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('exam-countdown-widget')) {
        loadExamDates();
    }
});

// Cleanup intervals when page unloads
window.addEventListener('beforeunload', () => {
    countdownIntervals.forEach(interval => clearInterval(interval));
});
</script>

<style>
.countdown-display {
    animation: pulse 2s infinite;
}

.countdown-unit {
    background: rgba(59, 130, 246, 0.1);
    border-radius: 8px;
    padding: 8px 4px;
}

.exam-countdown-card {
    transition: all 0.3s ease;
}

.exam-countdown-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
}
</style>