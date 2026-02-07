// api.js - Elite Hub API Integration Layer
// This file handles all backend API calls

const API_BASE_URL = 'http://localhost:5000/api';

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
