// routes/auth.js - Authentication Routes
const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');

const googleClient = process.env.GOOGLE_CLIENT_ID ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID) : null;

const FRONTEND_BASE = process.env.FRONTEND_URL || 'http://localhost:3000';
const FROM_EMAIL = process.env.FROM_EMAIL || 'no-reply@elitehub.local';

async function sendEmail({ to, subject, html }) {
    try {
        if (!process.env.SMTP_HOST) {
            console.log('[MAIL:DRYRUN]', subject, '->', to);
            console.log(html);
            return;
        }
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
        await transporter.sendMail({ from: FROM_EMAIL, to, subject, html });
    } catch (err) {
        console.error('Email send failed', err);
    }
}

function signToken(payload, expiresIn = '1d') {
    return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', { expiresIn });
}

function setVerification(student) {
    const token = crypto.randomBytes(32).toString('hex');
    student.verificationToken = token;
    student.verificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    return token;
}

function setReset(student) {
    const token = crypto.randomBytes(32).toString('hex');
    student.resetPasswordToken = token;
    student.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1h
    return token;
}

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, form } = req.body;

        // Validate input
        if (!name || !email || !password || !form) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Validate email format
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if student already exists
        const existingStudent = await Student.findOne({ email });
        if (existingStudent) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Create new student
        const student = new Student({
            name,
            email,
            password,
            form,
            isVerified: false
        });

        const verificationToken = setVerification(student);
        await student.save();

        const verificationLink = `${FRONTEND_BASE}/pages/verify-email.html?token=${verificationToken}`;
        sendEmail({
            to: student.email,
            subject: 'Verify your Elite Hub account',
            html: `<p>Hello ${student.name},</p><p>Click to verify your account:</p><p><a href="${verificationLink}">${verificationLink}</a></p><p>This link expires in 24 hours.</p>`
        });

        res.status(201).json({
            message: 'Student registered. Please verify your email to continue.',
            verificationLink
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Register Admin/Tutor
router.post('/register-admin', async (req, res) => {
    try {
        const { name, email, password, subject, tutorCode } = req.body;

        // Validate input
        if (!name || !email || !password || !subject) {
            return res.status(400).json({ error: 'Name, email, password, and subject are required' });
        }

        // Validate email format
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if email already exists in Student or Admin collection
        const existingStudent = await Student.findOne({ email });
        if (existingStudent) {
            return res.status(400).json({ error: 'Email already registered as student' });
        }

        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ error: 'Email already registered as admin' });
        }

        // Create new admin
        const admin = new Admin({
            name,
            email,
            password,
            subject,
            tutorCode: tutorCode || null
        });

        await admin.save();

        // Create JWT token
        const token = jwt.sign(
            { id: admin._id, email: admin.email, isAdmin: true },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '30d' }
        );

        res.status(201).json({
            message: 'Admin registered successfully',
            token,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                subject: admin.subject,
                isVerified: admin.isVerified
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password, remember } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Try to find student by email
        let user = await Student.findOne({ email }).select('+password');
        let userType = 'student';

        // If not a student, try to find admin
        if (!user) {
            user = await Admin.findOne({ email }).select('+password');
            userType = 'admin';
        }

        // If neither found
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Require verification for students
        if (userType === 'student' && !user.isVerified) {
            // Allow legacy accounts without verification tokens to pass
            if (user.verificationToken) {
                const token = user.verificationToken || setVerification(user);
                await user.save();
                const verificationLink = `${FRONTEND_BASE}/pages/verify-email.html?token=${token}`;
                sendEmail({
                    to: user.email,
                    subject: 'Verify your Elite Hub account',
                    html: `<p>Hello ${user.name},</p><p>Please verify to continue:</p><p><a href="${verificationLink}">${verificationLink}</a></p>`
                });
                return res.status(401).json({ error: 'Email not verified. Check your inbox.', verificationNeeded: true, verificationLink });
            } else {
                user.isVerified = true;
                await user.save();
            }
        }

        // Create JWT token
        const tokenPayload = { 
            id: user._id, 
            email: user.email,
            isAdmin: userType === 'admin'
        };
        
        const token = signToken(
            tokenPayload,
            remember ? '30d' : '1d'
        );

        // Prepare response based on user type
        const responseData = {
            message: 'Login successful',
            token,
            expiresIn: remember ? 30 * 24 * 3600 : 24 * 3600,
            userType: userType
        };

        if (userType === 'student') {
            responseData.student = {
                id: user._id,
                name: user.name,
                email: user.email,
                form: user.form
            };
        } else {
            responseData.admin = {
                id: user._id,
                name: user.name,
                email: user.email,
                subject: user.subject
            };
        }

        res.json(responseData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get current user (protected)
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const student = await Student.findById(decoded.id);

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json(student);
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

// Verify email
router.post('/verify-email', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ error: 'Token required' });

        const student = await Student.findOne({
            verificationToken: token,
            verificationExpires: { $gt: Date.now() }
        });
        if (!student) return res.status(400).json({ error: 'Invalid or expired token' });

        student.isVerified = true;
        student.verificationToken = undefined;
        student.verificationExpires = undefined;
        await student.save();

        res.json({ message: 'Email verified successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Resend verification
router.post('/resend-verification', async (req, res) => {
    try {
        const { email } = req.body;
        const student = await Student.findOne({ email });
        if (!student) return res.status(404).json({ error: 'Student not found' });
        if (student.isVerified) return res.json({ message: 'Already verified' });

        const token = setVerification(student);
        await student.save();
        const verificationLink = `${FRONTEND_BASE}/pages/verify-email.html?token=${token}`;
        sendEmail({
            to: student.email,
            subject: 'Verify your Elite Hub account',
            html: `<p>Hello ${student.name},</p><p>Click to verify:</p><p><a href="${verificationLink}">${verificationLink}</a></p>`
        });
        res.json({ message: 'Verification email sent', verificationLink });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const student = await Student.findOne({ email });
        if (!student) {
            return res.json({ message: 'If that account exists, a reset email was sent.' });
        }
        const token = setReset(student);
        await student.save();
        const resetLink = `${FRONTEND_BASE}/pages/reset-password.html?token=${token}`;
        sendEmail({
            to: student.email,
            subject: 'Reset your Elite Hub password',
            html: `<p>Hello ${student.name},</p><p>Reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p><p>This link expires in 60 minutes.</p>`
        });
        res.json({ message: 'Reset link sent', resetLink });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) return res.status(400).json({ error: 'Token and password required' });
        const student = await Student.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        }).select('+password');

        if (!student) return res.status(400).json({ error: 'Invalid or expired token' });
        if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

        student.password = password;
        student.resetPasswordToken = undefined;
        student.resetPasswordExpires = undefined;
        await student.save();
        res.json({ message: 'Password reset successful' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Change password (authenticated)
router.post('/change-password', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'No token provided' });
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Current and new password required' });

        const student = await Student.findById(decoded.id).select('+password');
        if (!student) return res.status(404).json({ error: 'User not found' });

        const ok = await student.matchPassword(currentPassword);
        if (!ok) return res.status(401).json({ error: 'Current password is incorrect' });
        if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

        student.password = newPassword;
        await student.save();
        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Google Sign-In
router.post('/google', async (req, res) => {
    try {
        const { idToken } = req.body;
        if (!googleClient) return res.status(500).json({ error: 'Google auth not configured' });
        if (!idToken) return res.status(400).json({ error: 'idToken required' });

        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        const email = payload.email;
        const name = payload.name || email.split('@')[0];

        let student = await Student.findOne({ email });
        if (!student) {
            student = new Student({
                name,
                email,
                password: crypto.randomBytes(16).toString('hex'),
                form: 'Form 1',
                provider: 'google',
                isVerified: true
            });
            await student.save();
        } else if (!student.isVerified) {
            student.isVerified = true;
            await student.save();
        }

        const token = signToken({ id: student._id, email: student.email }, '30d');
        res.json({
            message: 'Google sign-in successful',
            token,
            expiresIn: 30 * 24 * 3600,
            student: {
                id: student._id,
                name: student.name,
                email: student.email,
                form: student.form
            }
        });
    } catch (err) {
        console.error('Google auth failed', err);
        res.status(401).json({ error: 'Google authentication failed' });
    }
});

module.exports = router;
