// backend/routes/parent.js - Parent Authentication and Account Management
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Parent = require('../models/Parent');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Register parent
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, confirmPassword, phone } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if parent already exists
        const existingParent = await Parent.findOne({ email: email.toLowerCase() });
        if (existingParent) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Create new parent
        const parent = new Parent({
            name,
            email: email.toLowerCase(),
            password,
            phone
        });

        await parent.save();

        // Generate token
        const token = jwt.sign(
            { parentId: parent._id, email: parent.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Parent registered successfully',
            token,
            parent: {
                id: parent._id,
                name: parent.name,
                email: parent.email
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login parent
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find parent and include password
        const parent = await Parent.findOne({ email: email.toLowerCase() }).select('+password');

        if (!parent) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Compare passwords
        const isMatchPassword = await parent.comparePassword(password);
        if (!isMatchPassword) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Update last login
        parent.lastLogin = new Date();
        await parent.save();

        // Generate token
        const token = jwt.sign(
            { parentId: parent._id, email: parent.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            parent: {
                id: parent._id,
                name: parent.name,
                email: parent.email,
                childrenIds: parent.linkedStudents
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get current parent
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const parent = await Parent.findById(decoded.parentId).populate('linkedStudents.studentId');

        if (!parent) {
            return res.status(404).json({ error: 'Parent not found' });
        }

        res.json({
            id: parent._id,
            name: parent.name,
            email: parent.email,
            phone: parent.phone,
            linkedStudents: parent.linkedStudents
        });
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

// Link child - request linking code
router.post('/link-child-request', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const { studentEmail } = req.body;

        if (!studentEmail) {
            return res.status(400).json({ error: 'Student email is required' });
        }

        // Find student
        const student = await Student.findOne({ email: studentEmail.toLowerCase() });
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Generate linking code (6 digits)
        const linkCode = Math.random().toString().substring(2, 8);

        // Add to student's pendingParentRequests
        if (!student.pendingParentRequests) {
            student.pendingParentRequests = [];
        }

        student.pendingParentRequests.push({
            parentEmail: decoded.email,
            linkCode: linkCode,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        });

        await student.save();

        res.json({
            message: 'Link request sent. Share this code with your child.',
            linkCode, // In production, this should be sent via email
            studentName: student.name
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Link child - student confirms linking
router.post('/confirm-link', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const { linkCode } = req.body;

        if (!linkCode) {
            return res.status(400).json({ error: 'Link code is required' });
        }

        // Find student (assuming this is called by student)
        const student = await Student.findById(decoded.userId);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Verify link code
        const request = student.pendingParentRequests?.find(r => r.linkCode === linkCode);
        if (!request) {
            return res.status(400).json({ error: 'Invalid link code' });
        }

        if (new Date() > request.expiresAt) {
            return res.status(400).json({ error: 'Link code expired' });
        }

        // Find parent
        const parent = await Parent.findOne({ email: request.parentEmail });
        if (!parent) {
            return res.status(404).json({ error: 'Parent not found' });
        }

        // Add student to parent's linkedStudents
        parent.linkedStudents.push({
            studentId: student._id,
            verified: true,
            linkCode: null
        });

        // Add parent link to student (if not already there)
        if (!student.linkedParents) {
            student.linkedParents = [];
        }
        if (!student.linkedParents.find(p => p.toString() === parent._id.toString())) {
            student.linkedParents.push(parent._id);
        }

        // Remove from pending requests
        student.pendingParentRequests = student.pendingParentRequests.filter(r => r.linkCode !== linkCode);

        await parent.save();
        await student.save();

        res.json({
            message: 'Child account linked successfully',
            parent: parent.name
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get child progress
router.get('/child/:childId/progress', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const { childId } = req.params;

        // Verify parent has access to this child
        const parent = await Parent.findById(decoded.parentId);
        const hasAccess = parent.linkedStudents.some(ls => ls.studentId.toString() === childId);

        if (!hasAccess) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Get child's progress
        const student = await Student.findById(childId).select('name form email quizResults attendance');

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Calculate statistics
        const quizStats = student.quizResults || [];
        const avgScore = quizStats.length > 0 ?
            Math.round(quizStats.reduce((sum, q) => sum + q.percentage, 0) / quizStats.length) : 0;

        const passedQuizzes = quizStats.filter(q => q.percentage >= 70).length;
        const totalQuizzes = quizStats.length;
        const callPercentage = student.attendance ? Math.round((student.attendance.present / student.attendance.total) * 100) : 0;

        res.json({
            student: {
                name: student.name,
                form: student.form,
                email: student.email
            },
            performance: {
                averageScore: avgScore,
                passedQuizzes,
                totalQuizzes,
                passRate: totalQuizzes > 0 ? Math.round((passedQuizzes / totalQuizzes) * 100) : 0
            },
            attendance: {
                percentage: callPercentage,
                present: student.attendance?.present || 0,
                total: student.attendance?.total || 0
            },
            recentQuizzes: quizStats.slice(-5).map(q => ({
                title: q.quizTitle,
                score: q.score,
                percentage: q.percentage,
                date: q.date,
                passed: q.passed
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get child's announcements and important updates
router.get('/child/:childId/updates', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const { childId } = req.params;

        // Verify access
        const parent = await Parent.findById(decoded.parentId);
        const hasAccess = parent.linkedStudents.some(ls => ls.studentId.toString() === childId);

        if (!hasAccess) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Get recent announcements and notifications for the child
        const updates = await Notification.find({
            userId: childId,
            type: { $in: ['announcement', 'quiz_graded', 'assignment'] }
        })
            .sort({ createdAt: -1 })
            .limit(10);

        res.json(updates);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
