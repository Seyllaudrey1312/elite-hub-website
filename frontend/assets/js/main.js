// Elite Hub - Main JavaScript File

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', function() {
        mobileMenu.classList.toggle('hidden');
    });
}

// Tab Switching for Quizzes Page
function switchTab(tabName) {
    // Hide all sections
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

// Start Quiz Function
function startQuiz() {
    alert('Quiz starting... (Feature to be implemented)');
    // In a real application, this would redirect to a quiz page
}

// Logout Function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = '../pages/login.html';
    }
}

// Form Submission Handler
document.addEventListener('DOMContentLoaded', function() {
    // Contact Form
    const contactForm = document.querySelector('form');
    if (contactForm && contactForm.parentElement.classList.contains('bg-white')) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            // Show success message
            alert(`Thank you for your message, ${data.name}! We'll get back to you soon.`);
            
            // Reset form
            this.reset();
        });
    }
});

// Search Functionality (Study Resources Page)
document.addEventListener('DOMContentLoaded', function() {
    const searchInputs = document.querySelectorAll('input[placeholder*="Search"]');
    
    searchInputs.forEach(input => {
        input.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            // In a real app, this would filter the resources
            console.log('Searching for:', searchTerm);
        });
    });
});

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
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('text-yellow-400');
        }
    });
}

// Call on page load
window.addEventListener('load', activateNavLink);

// Notifications/Toast Messages
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg text-white z-50 ${
        type === 'success' ? 'bg-green-500' :
        type === 'error' ? 'bg-red-500' :
        type === 'warning' ? 'bg-yellow-500' :
        'bg-blue-500'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Quiz Progress Bar (if needed)
function updateProgressBar(current, total) {
    const percentage = (current / total) * 100;
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        progressBar.style.width = percentage + '%';
    }
}

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

// Initialize theme on page load
window.addEventListener('load', function() {
    const theme = getUserPreference('theme') || 'light';
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    }
});

// Console message for developers
console.log('%c Welcome to Elite Hub Student Platform', 'font-size: 18px; color: #003d82; font-weight: bold;');
console.log('%c Version 1.0.0 | Build Date: February 2026', 'font-size: 12px; color: #666;');
