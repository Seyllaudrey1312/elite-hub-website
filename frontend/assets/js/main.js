// Elite Hub - Main JavaScript File

// Apply saved theme early to avoid flash
(function preloadTheme() {
    try {
        const saved = JSON.parse(localStorage.getItem('elitehub_theme'));
        if (saved === 'dark') {
            document.documentElement.classList.add('dark');
        }
    } catch (e) {
        /* ignore */
    }
})();

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
    setupThemeToggle();
    setupBackToTop();
    setupFloatingLabels();
    setupPageTransitions();
    setupGlobalLoader();
    startSessionWatcher();
    bindComingSoonTriggers();
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
    confirmNotification('Log out of Elite Hub?', 'Logout', 'Stay').then(confirmed => {
        if (confirmed) logoutStudent();
    });
}

// Login Form Handler
function initializeLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const remember = document.getElementById('rememberMe')?.checked || false;
            
            try {
                const result = await loginStudent(email, password, remember);
                showNotification('Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } catch (error) {
                if (error.verificationNeeded && error.verificationLink) {
                    showNotification('Please verify your email first. Opening verification page...', 'warning');
                    setTimeout(() => window.location.href = `verify-email.html?token=${encodeURIComponent(error.verificationLink.split('token=').pop())}&email=${encodeURIComponent(email)}`, 800);
                } else {
                    showNotification(error.message || 'Login failed', 'error');
                }
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

// Notifications/Toast Messages (slide-in top-right)
function showNotification(message, type = 'info', options = {}) {
    const { duration = 3200, actions = [] } = options;
    const icons = {
        success: '✅',
        error: '✖️',
        warning: '⚠️',
        info: 'ℹ️'
    };

    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-text">${message}</span>
    `;

    const actionWrap = document.createElement('div');
    actionWrap.style.marginLeft = 'auto';
    actionWrap.style.display = 'flex';
    actionWrap.style.gap = '0.35rem';

    actions.forEach(({ label, onClick }) => {
        const btn = document.createElement('button');
        btn.className = 'toast-action';
        btn.textContent = label;
        btn.onclick = () => {
            hideToast(toast);
            if (onClick) onClick();
        };
        actionWrap.appendChild(btn);
    });

    const closeBtn = document.createElement('button');
    closeBtn.className = 'toast-close';
    closeBtn.innerHTML = '✕';
    closeBtn.addEventListener('click', () => hideToast(toast));

    if (actions.length) {
        toast.appendChild(actionWrap);
    }
    toast.appendChild(closeBtn);

    container.appendChild(toast);

    if (duration > 0) {
        setTimeout(() => hideToast(toast), duration);
    }

    return toast;
}

function hideToast(toast) {
    if (!toast) return;
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 260);
}

function confirmNotification(message, confirmText = 'Yes', cancelText = 'Cancel') {
    return new Promise(resolve => {
        showNotification(message, 'warning', {
            duration: 0,
            actions: [
                { label: confirmText, onClick: () => resolve(true) },
                { label: cancelText, onClick: () => resolve(false) }
            ]
        });
    });
}

// Coming soon modal
function showComingSoon(message = 'This feature is coming soon. Enter your email to be notified.', title = 'Coming Soon', emoji = '🚀') {
    let backdrop = document.getElementById('cs-backdrop');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.id = 'cs-backdrop';
        backdrop.className = 'cs-modal-backdrop';
        document.body.appendChild(backdrop);
    }
    backdrop.innerHTML = `
        <div class="cs-modal">
            <span class="cs-emoji">${emoji}</span>
            <h3>${title}</h3>
            <p>${message}</p>
            <input type="email" id="cs-email" placeholder="you@example.com" class="w-full border border-gray-300 rounded-lg px-3 py-2">
            <button class="btn-primary" id="cs-submit">Notify Me</button>
            <button class="btn-close" id="cs-close">Maybe later</button>
        </div>
    `;
    backdrop.classList.remove('hidden');

    document.getElementById('cs-close').onclick = () => backdrop.classList.add('hidden');
    document.getElementById('cs-submit').onclick = () => {
        const email = document.getElementById('cs-email').value;
        if (!email) {
            showNotification('Please enter your email to be notified.', 'warning');
            return;
        }
        showNotification('Got it! We will email you when it goes live.', 'success');
        backdrop.classList.add('hidden');
    };
}

function bindComingSoonTriggers() {
    document.querySelectorAll('[data-coming-soon="true"]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            const msg = el.getAttribute('data-coming-message') || undefined;
            showComingSoon(msg);
        });
    });
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

// Back to top button
function setupBackToTop() {
    let btn = document.getElementById('back-to-top');
    if (!btn) {
        btn = document.createElement('button');
        btn.id = 'back-to-top';
        btn.innerHTML = '↑';
        document.body.appendChild(btn);
    }
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    window.addEventListener('scroll', () => {
        const shouldShow = window.scrollY > 300;
        btn.classList.toggle('visible', shouldShow);
    });
}

// Floating labels for existing forms
function setupFloatingLabels() {
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        const parent = input.parentElement;
        const label = parent ? parent.querySelector('label') : null;
        if (!parent || !label) return;
        parent.classList.add('floating-field');

        const update = () => {
            if (input.value) {
                parent.classList.add('is-filled');
            } else {
                parent.classList.remove('is-filled');
            }
        };

        parent.addEventListener('focusin', () => parent.classList.add('is-focused'));
        parent.addEventListener('focusout', () => parent.classList.remove('is-focused'));
        input.addEventListener('input', update);
        update();
    });
}

// Smooth page transitions
function setupPageTransitions() {
    document.body.classList.add('page-ready');
    const links = Array.from(document.querySelectorAll('a[href]')).filter(link => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('javascript') || href.startsWith('mailto:') || href.startsWith('tel:') || link.target === '_blank') return false;
        const url = new URL(href, window.location.href);
        return url.origin === window.location.origin;
    });

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (!href || href.startsWith('#')) return;
            e.preventDefault();
            document.body.classList.add('page-leave');
            setTimeout(() => window.location.href = link.href, 140);
        });
    });
}

// Global loading overlay (auto wraps fetch)
function setupGlobalLoader() {
    if (window.__eliteHubFetchPatched) return;
    window.__eliteHubFetchPatched = true;

    const nativeFetch = window.fetch.bind(window);
    let inFlight = 0;
    ensureLoadingOverlay();

    window.fetch = async (...args) => {
        inFlight++;
        showLoadingOverlay();
        try {
            return await nativeFetch(...args);
        } finally {
            inFlight = Math.max(0, inFlight - 1);
            if (inFlight === 0) {
                hideLoadingOverlay();
            }
        }
    };
}

let loadingOverlayEl = null;
function ensureLoadingOverlay() {
    loadingOverlayEl = document.getElementById('loading-overlay');
    if (!loadingOverlayEl) {
        loadingOverlayEl = document.createElement('div');
        loadingOverlayEl.id = 'loading-overlay';
        loadingOverlayEl.classList.add('hidden');
        loadingOverlayEl.innerHTML = `
            <div class="spinner-ring" aria-hidden="true"></div>
            <div class="spinner-logo">Elite <span>Hub</span></div>
            <p class="text-white font-semibold">Loading...</p>
        `;
        document.body.appendChild(loadingOverlayEl);
    }
}
function showLoadingOverlay() {
    if (loadingOverlayEl) loadingOverlayEl.classList.remove('hidden');
}
function hideLoadingOverlay() {
    if (loadingOverlayEl) loadingOverlayEl.classList.add('hidden');
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

function getTokenExpiryMs() {
    const exp = localStorage.getItem('authTokenExp');
    return exp ? parseInt(exp, 10) : null;
}

// Theme Toggle
function toggleTheme() {
    const currentTheme = getUserPreference('theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    saveUserPreference('theme', newTheme);
    if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    updateThemeToggleUI(newTheme);
    return newTheme;
}

function setupThemeToggle() {
    const navActions = document.querySelector('nav .md\\:flex') || document.querySelector('nav .hidden.md\\:flex');
    const mobileMenu = document.getElementById('mobile-menu');
    const desktopBtn = createThemeToggleButton('dark-mode-toggle');
    if (navActions) {
        navActions.appendChild(desktopBtn);
    }
    if (mobileMenu) {
        const mobileBtn = createThemeToggleButton('dark-mode-toggle-mobile');
        mobileBtn.classList.add('mt-2', 'w-full', 'justify-center', 'border', 'border-white/30');
        const li = document.createElement('div');
        li.className = 'px-3 py-2 flex';
        li.appendChild(mobileBtn);
        mobileMenu.appendChild(li);
    }
    const theme = getUserPreference('theme') || 'light';
    updateThemeToggleUI(theme);
}

function createThemeToggleButton(id) {
    const btn = document.createElement('button');
    btn.id = id;
    btn.setAttribute('aria-label', 'Toggle dark mode');
    btn.className = 'flex items-center gap-2 px-3 py-2 rounded-full border border-white/40 text-white';
    btn.innerHTML = `<span class="text-lg">🌙</span><span class="text-sm font-semibold">Dark</span>`;
    btn.addEventListener('click', () => toggleTheme());
    return btn;
}

function updateThemeToggleUI(theme) {
    const btns = document.querySelectorAll('#dark-mode-toggle, #dark-mode-toggle-mobile');
    btns.forEach(btn => {
        if (!btn) return;
        if (theme === 'dark') {
            btn.innerHTML = `<span class="text-lg">☀️</span><span class="text-sm font-semibold">Light</span>`;
        } else {
            btn.innerHTML = `<span class="text-lg">🌙</span><span class="text-sm font-semibold">Dark</span>`;
        }
    });
}

// ==================== CONSOLE ====================

// Console message for developers
console.log('%c Welcome to Elite Hub Student Platform', 'font-size: 18px; color: #003d82; font-weight: bold;');
console.log('%c Version 1.0.0 | Build Date: February 2026', 'font-size: 12px; color: #666;');

// ==================== SESSION WATCHER ====================

function startSessionWatcher() {
    const expMs = getTokenExpiryMs();
    if (!expMs) return;
    const now = Date.now();
    const warnAt = expMs - 5 * 60 * 1000; // 5 min
    const timeToWarn = warnAt - now;
    const timeToExpire = expMs - now;

    if (timeToWarn > 0) {
        setTimeout(showExpiryWarning, timeToWarn);
    } else if (timeToExpire > 0) {
        showExpiryWarning();
    } else {
        forceLogout();
    }
}

function showExpiryWarning() {
    const expMs = getTokenExpiryMs();
    if (!expMs) return;
    const timeLeft = Math.max(0, expMs - Date.now());
    const minutes = Math.ceil(timeLeft / 60000);
    showNotification(`Session expires in ~${minutes} minute${minutes === 1 ? '' : 's'}.`, 'warning', {
        duration: 0,
        actions: [
            { label: 'Stay Logged In', onClick: extendSession },
            { label: 'Logout', onClick: forceLogout }
        ]
    });
}

function extendSession() {
    // Optimistic client-side extend by 30 minutes; server token may still be valid
    const newExp = Date.now() + 30 * 60 * 1000;
    localStorage.setItem('authTokenExp', newExp.toString());
    startSessionWatcher();
}

function forceLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authTokenExp');
    localStorage.removeItem('student');
    const path = window.location.pathname;
    if (path.includes('/pages/')) {
        window.location.href = 'login.html';
    } else {
        window.location.href = 'pages/login.html';
    }
}

// ==================== ROUTE GUARD ====================

function guardProtectedPage() {
    const token = localStorage.getItem('authToken');
    const protectedPages = ['dashboard.html', 'student-quiz.html', 'profile-edit.html'];
    const currentPage = window.location.pathname.split('/').pop();
    if (protectedPages.includes(currentPage) && !token) {
        const loginUrl = currentPage === 'dashboard.html' ? 'login.html' : '../pages/login.html';
        window.location.href = `${loginUrl}?reason=auth_required`;
    }
}

guardProtectedPage();

