// api.js - Elite Hub API Integration Layer
// This file handles all backend API calls

// Detect environment and set API URL
let API_BASE_URL;
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Local development
    API_BASE_URL = 'http://localhost:5000/api';
} else {
    // Production - replace with your deployed backend service URL (must include /api)
    // Example: 'https://elite-hub-backend-xxxxx.onrender.com/api'
    API_BASE_URL = 'https://elite-hub-website.onrender.com/api'; // <-- ensure this is your backend API URL
}

// ==================== AUTH ENDPOINTS ====================

// Register a new student
async function registerStudent(name, email, password, form) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password, form })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
        }

        // Store token in localStorage
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('student', JSON.stringify(data.student));

        return data;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}

// Register a new admin/tutor
async function registerAdmin(name, email, password, subject, tutorCode = '') {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register-admin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password, subject, tutorCode })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Admin registration failed');
        }

        // Store token in localStorage
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('admin', JSON.stringify(data.admin));
        localStorage.setItem('isAdmin', 'true');

        return data;
    } catch (error) {
        console.error('Admin registration error:', error);
        throw error;
    }
}

// Login student
async function loginStudent(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }

        // Store token and student info in localStorage
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('student', JSON.stringify(data.student));

        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

// Get current user
async function getCurrentUser() {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('No token found');
        }

        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch user');
        }

        return data;
    } catch (error) {
        console.error('Get user error:', error);
        throw error;
    }
}

// Logout student
function logoutStudent() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('student');
    window.location.href = 'pages/login.html';
}

// ==================== SUBJECT ENDPOINTS ====================

// Get all subjects
async function getAllSubjects() {
    try {
        const response = await fetch(`${API_BASE_URL}/subjects`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch subjects');
        }

        return data;
    } catch (error) {
        console.error('Get subjects error:', error);
        throw error;
    }
}

// Get subject by ID
async function getSubjectById(subjectId) {
    try {
        const response = await fetch(`${API_BASE_URL}/subjects/${subjectId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch subject');
        }

        return data;
    } catch (error) {
        console.error('Get subject error:', error);
        throw error;
    }
}

// ==================== QUIZ ENDPOINTS ====================

// Get all quizzes
async function getAllQuizzes() {
    try {
        const response = await fetch(`${API_BASE_URL}/quizzes`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch quizzes');
        }

        return data;
    } catch (error) {
        console.error('Get quizzes error:', error);
        throw error;
    }
}

// Get quiz by ID
async function getQuizById(quizId) {
    try {
        const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch quiz');
        }

        return data;
    } catch (error) {
        console.error('Get quiz error:', error);
        throw error;
    }
}

// ==================== ASSIGNMENT ENDPOINTS ====================

// Get all assignments
async function getAllAssignments() {
    try {
        const response = await fetch(`${API_BASE_URL}/assignments`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch assignments');
        }

        return data;
    } catch (error) {
        console.error('Get assignments error:', error);
        throw error;
    }
}

// Get assignment by ID
async function getAssignmentById(assignmentId) {
    try {
        const response = await fetch(`${API_BASE_URL}/assignments/${assignmentId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch assignment');
        }

        return data;
    } catch (error) {
        console.error('Get assignment error:', error);
        throw error;
    }
}

// ==================== RESOURCE ENDPOINTS ====================

// Get all resources
async function getAllResources(filters = {}) {
    try {
        const query = new URLSearchParams(filters).toString();
        const response = await fetch(`${API_BASE_URL}/resources?${query}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch resources');
        }

        return data;
    } catch (error) {
        console.error('Get resources error:', error);
        throw error;
    }
}

// Get resource by ID
async function getResourceById(resourceId) {
    try {
        const response = await fetch(`${API_BASE_URL}/resources/${resourceId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch resource');
        }

        return data;
    } catch (error) {
        console.error('Get resource error:', error);
        throw error;
    }
}

// ==================== ANNOUNCEMENT ENDPOINTS ====================

// Get all announcements
async function getAllAnnouncements(filters = {}) {
    try {
        const query = new URLSearchParams(filters).toString();
        const response = await fetch(`${API_BASE_URL}/announcements?${query}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch announcements');
        }

        return data;
    } catch (error) {
        console.error('Get announcements error:', error);
        throw error;
    }
}

// Get announcement by ID
async function getAnnouncementById(announcementId) {
    try {
        const response = await fetch(`${API_BASE_URL}/announcements/${announcementId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch announcement');
        }

        return data;
    } catch (error) {
        console.error('Get announcement error:', error);
        throw error;
    }
}

// ==================== STUDENT ENDPOINTS ====================

// Update student profile
async function updateStudentProfile(studentId, updates) {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('No token found');
        }

        const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updates)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to update profile');
        }

        // Update localStorage
        localStorage.setItem('student', JSON.stringify(data));

        return data;
    } catch (error) {
        console.error('Update profile error:', error);
        throw error;
    }
}

// Get student by ID
async function getStudentById(studentId) {
    try {
        const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch student');
        }

        return data;
    } catch (error) {
        console.error('Get student error:', error);
        throw error;
    }
}

// ==================== UTILITY FUNCTIONS ====================

// Check if user is authenticated
function isAuthenticated() {
    return localStorage.getItem('authToken') !== null;
}

// Get stored student info
function getStoredStudent() {
    const student = localStorage.getItem('student');
    return student ? JSON.parse(student) : null;
}

// Search across multiple resources
async function searchResources(query) {
    try {
        const subjects = await getAllSubjects();
        const quizzes = await getAllQuizzes();
        const resources = await getAllResources();
        const announcements = await getAllAnnouncements();

        const queryLower = query.toLowerCase();

        const results = {
            subjects: subjects.filter(s => s.name.toLowerCase().includes(queryLower)),
            quizzes: quizzes.filter(q => q.title.toLowerCase().includes(queryLower)),
            resources: resources.filter(r => r.title.toLowerCase().includes(queryLower)),
            announcements: announcements.filter(a => a.title.toLowerCase().includes(queryLower))
        };

        return results;
    } catch (error) {
        console.error('Search error:', error);
        throw error;
    }
}
// ==================== NOTIFICATION ENDPOINTS ====================

// Get all notifications
async function getAllNotifications(unreadOnly = false, limit = 20, page = 1) {
    try {
        const token = localStorage.getItem('studentToken') || localStorage.getItem('parentToken');
        const params = new URLSearchParams({
            unreadOnly,
            limit,
            page
        });

        const response = await fetch(`${API_BASE_URL}/notifications?${params}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fetch notifications error:', error);
        throw error;
    }
}

// Get unread notification count
async function getUnreadNotificationCount() {
    try {
        const token = localStorage.getItem('studentToken') || localStorage.getItem('parentToken');

        const response = await fetch(`${API_BASE_URL}/notifications/unread/count`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        return data.unreadCount || 0;
    } catch (error) {
        console.error('Fetch unread count error:', error);
        return 0;
    }
}

// Mark notification as read
async function markNotificationAsRead(notificationId) {
    try {
        const token = localStorage.getItem('studentToken') || localStorage.getItem('parentToken');

        const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        return await response.json();
    } catch (error) {
        console.error('Mark as read error:', error);
        throw error;
    }
}

// Mark all notifications as read
async function markAllNotificationsAsRead() {
    try {
        const token = localStorage.getItem('studentToken') || localStorage.getItem('parentToken');

        const response = await fetch(`${API_BASE_URL}/notifications/mark-all/read`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        return await response.json();
    } catch (error) {
        console.error('Mark all as read error:', error);
        throw error;
    }
}

// Delete notification
async function deleteNotification(notificationId) {
    try {
        const token = localStorage.getItem('studentToken') || localStorage.getItem('parentToken');

        const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        return await response.json();
    } catch (error) {
        console.error('Delete notification error:', error);
        throw error;
    }
}

// Clear all notifications
async function clearAllNotifications() {
    try {
        const token = localStorage.getItem('studentToken') || localStorage.getItem('parentToken');

        const response = await fetch(`${API_BASE_URL}/notifications/all/clear`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        return await response.json();
    } catch (error) {
        console.error('Clear notifications error:', error);
        throw error;
    }
}

// ==================== REAL-TIME NOTIFICATION POLLING ====================

let notificationPollingInterval = null;

// Start polling for notifications
function startNotificationPolling(callback, intervalSeconds = 30) {
    if (notificationPollingInterval) {
        clearInterval(notificationPollingInterval);
    }

    // Poll immediately
    pollNotifications(callback);

    // Then poll every X seconds
    notificationPollingInterval = setInterval(() => {
        pollNotifications(callback);
    }, intervalSeconds * 1000);
}

// Stop polling for notifications
function stopNotificationPolling() {
    if (notificationPollingInterval) {
        clearInterval(notificationPollingInterval);
        notificationPollingInterval = null;
    }
}

// Internal polling function
async function pollNotifications(callback) {
    try {
        const data = await getAllNotifications(true, 50);
        if (callback && typeof callback === 'function') {
            callback(data);
        }
    } catch (error) {
        console.error('Polling error:', error);
    }
}

// ==================== UI NOTIFICATION SYSTEM ====================

// Show toast notification (UI feedback)
function showNotification(message, type = 'info', duration = 3000) {
    // Remove existing notification
    const existing = document.getElementById('notification-toast');
    if (existing) {
        existing.remove();
    }

    const notifications = {
        success: { icon: '✅', color: 'bg-green-600', border: 'border-green-700' },
        error: { icon: '❌', color: 'bg-red-600', border: 'border-red-700' },
        warning: { icon: '⚠️', color: 'bg-yellow-600', border: 'border-yellow-700' },
        info: { icon: 'ℹ️', color: 'bg-blue-600', border: 'border-blue-700' }
    };

    const config = notifications[type] || notifications.info;

    const toast = document.createElement('div');
    toast.id = 'notification-toast';
    toast.className = `fixed bottom-4 right-4 ${config.color} ${config.border} border-l-4 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-pulse flex items-center gap-3`;
    toast.innerHTML = `
        <span class="text-lg">${config.icon}</span>
        <span>${message}</span>
    `;

    document.body.appendChild(toast);

    if (duration > 0) {
        setTimeout(() => {
            toast.remove();
        }, duration);
    }

    return toast;
}