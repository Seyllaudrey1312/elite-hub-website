// routes/auth.js - Authentication Routes
const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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
            form
        });

        await student.save();

        // Create JWT token
        const token = jwt.sign(
            { id: student._id, email: student.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '30d' }
        );

        res.status(201).json({
            message: 'Student registered successfully',
            token,
            student: {
                id: student._id,
                name: student.name,
                email: student.email,
                form: student.form
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find student by email
        const student = await Student.findOne({ email });
        if (!student) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Check password
        const isMatch = await student.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Create JWT token
        const token = jwt.sign(
            { id: student._id, email: student.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '30d' }
        );

        res.json({
            message: 'Login successful',
            token,
            student: {
                id: student._id,
                name: student.name,
                email: student.email,
                form: student.form
            }
        });
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

module.exports = router;
