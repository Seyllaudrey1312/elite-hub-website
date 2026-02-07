// Elite Hub - Main JavaScript File

// ==================== INITIALIZATION ====================

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', function() {
        mobileMenu.classList.toggle('hidden');
    });
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    initializeAuthentication();
    initializeLoginForm();
    activateNavLink();
    const theme = getUserPreference('theme') || 'light';
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    }
});

// ==================== AUTHENTICATION ====================

// Initialize authentication state
function initializeAuthentication() {
    const token = localStorage.getItem('authToken');
    const student = localStorage.getItem('student');
    
    if (token && student) {
        // User is logged in
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.textContent = 'Logout';
            loginBtn.onclick = () => logoutHandler();
        }
    }
}

// Check if user is authenticated
function isAuthenticated() {
    return localStorage.getItem('authToken') !== null;
}

// Get stored student info
function getStoredStudent() {
    const student = localStorage.getItem('student');
    return student ? JSON.parse(student) : null;
}

// Logout handler
function logoutHandler() {
    if (confirm('Are you sure you want to logout?')) {
        logoutStudent();
    }
}

// Login Form Handler
function initializeLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            try {
                const result = await loginStudent(email, password);
                showNotification('Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } catch (error) {
                showNotification(error.message || 'Login failed', 'error');
            }
        });
    }
}

// ==================== UI FUNCTIONS ====================

// Tab Switching for Quizzes Page
function switchTab(tabName) {
    const quizzesSection = document.getElementById('quizzes-section');
    const assignmentsSection = document.getElementById('assignments-section');
    
    if (quizzesSection && assignmentsSection) {
        if (tabName === 'quizzes') {
            quizzesSection.classList.remove('hidden');
            assignmentsSection.classList.add('hidden');
        } else {
            quizzesSection.classList.add('hidden');
            assignmentsSection.classList.remove('hidden');
        }
    }

    // Update button states
    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        btn.classList.add('border-transparent');
    });

    // Mark current tab as active
    event.target.classList.add('active');
    event.target.classList.remove('border-transparent');
}

// Subject Expansion
function toggleSubject(element) {
    const formList = element.querySelector('.form-list');
    const formPrompt = element.querySelector('.form-prompt');

    if (formList) {
        formList.classList.toggle('hidden');
        if (!formList.classList.contains('hidden')) {
            if (formPrompt) {
                formPrompt.classList.add('hidden');
            }
        } else {
            if (formPrompt) {
                formPrompt.classList.remove('hidden');
            }
        }
    }
}

// Notifications/Toast Messages
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg text-white z-50 shadow-lg animate-slideInUp ${
        type === 'success' ? 'bg-green-500' :
        type === 'error' ? 'bg-red-500' :
        type === 'warning' ? 'bg-yellow-500' :
        'bg-blue-500'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Logout Function (legacy support)
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        logoutStudent();
    }
}

// ==================== SEARCH FUNCTIONALITY ====================

// Initialize search
document.addEventListener('DOMContentLoaded', function() {
    const searchInputs = document.querySelectorAll('input[placeholder*="Search"]');
    
    searchInputs.forEach(input => {
        input.addEventListener('input', debounce(async function() {
            const searchTerm = this.value.trim();
            if (searchTerm.length > 2) {
                await performSearch(searchTerm);
            }
        }, 300));
    });
});

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Perform search across all resources
async function performSearch(query) {
    try {
        const results = await searchResources(query);
        displaySearchResults(results);
    } catch (error) {
        console.error('Search error:', error);
        showNotification('Search failed. Please try again.', 'error');
    }
}

// Display search results
function displaySearchResults(results) {
    // Create or update search results container
    let resultsContainer = document.getElementById('searchResults');
    
    if (!resultsContainer) {
        resultsContainer = document.createElement('div');
        resultsContainer.id = 'searchResults';
        resultsContainer.className = 'fixed top-24 left-4 right-4 bg-white rounded-lg shadow-xl z-40 max-h-96 overflow-y-auto';
        document.body.appendChild(resultsContainer);
    }
    
    let html = '<div class="p-4">';
    
    if (results.subjects.length) {
        html += '<div class="mb-4"><h3 class="font-bold text-blue-900 mb-2">Subjects</h3>';
        results.subjects.forEach(s => {
            html += `<a href="#" class="block p-2 hover:bg-gray-100 rounded">${s.name}</a>`;
        });
        html += '</div>';
    }
    
    if (results.quizzes.length) {
        html += '<div class="mb-4"><h3 class="font-bold text-blue-900 mb-2">Quizzes</h3>';
        results.quizzes.forEach(q => {
            html += `<a href="#" class="block p-2 hover:bg-gray-100 rounded">${q.title || 'Untitled Quiz'}</a>`;
        });
        html += '</div>';
    }
    
    if (results.resources.length) {
        html += '<div class="mb-4"><h3 class="font-bold text-blue-900 mb-2">Resources</h3>';
        results.resources.forEach(r => {
            html += `<a href="#" class="block p-2 hover:bg-gray-100 rounded">${r.title || 'Untitled Resource'}</a>`;
        });
        html += '</div>';
    }
    
    if (results.announcements.length) {
        html += '<div class="mb-4"><h3 class="font-bold text-blue-900 mb-2">Announcements</h3>';
        results.announcements.forEach(a => {
            html += `<a href="#" class="block p-2 hover:bg-gray-100 rounded">${a.title || 'Untitled Announcement'}</a>`;
        });
        html += '</div>';
    }
    
    if (!results.subjects.length && !results.quizzes.length && !results.resources.length && !results.announcements.length) {
        html += '<p class="text-gray-500 text-center py-4">No results found</p>';
    }
    
    html += '</div>';
    resultsContainer.innerHTML = html;
    resultsContainer.style.display = 'block';
}

// Close search results on escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const resultsContainer = document.getElementById('searchResults');
        if (resultsContainer) {
            resultsContainer.style.display = 'none';
        }
    }
});

// ==================== UTILITIES ====================

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Active Navigation Link
function activateNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('nav a, .nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('text-yellow-400', 'font-bold');
        }
    });
}

// Quiz Progress Bar
function updateProgressBar(current, total) {
    const percentage = (current / total) * 100;
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        progressBar.style.width = percentage + '%';
    }
}

// ==================== LOCAL STORAGE ====================

// Local Storage for Student Preferences
function saveUserPreference(key, value) {
    try {
        localStorage.setItem(`elitehub_${key}`, JSON.stringify(value));
    } catch (e) {
        console.log('LocalStorage not available');
    }
}

function getUserPreference(key) {
    try {
        const value = localStorage.getItem(`elitehub_${key}`);
        return value ? JSON.parse(value) : null;
    } catch (e) {
        console.log('LocalStorage not available');
        return null;
    }
}

// Theme Toggle (for future dark mode feature)
function toggleTheme() {
    const currentTheme = getUserPreference('theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    saveUserPreference('theme', newTheme);
    
    if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}

// ==================== CONSOLE ====================

// Console message for developers
console.log('%c Welcome to Elite Hub Student Platform', 'font-size: 18px; color: #003d82; font-weight: bold;');
console.log('%c Version 1.0.0 | Build Date: February 2026', 'font-size: 12px; color: #666;');

