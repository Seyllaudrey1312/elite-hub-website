// routes/subjects.js - Subject Routes
const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');

// Get all subjects
router.get('/', async (req, res) => {
    try {
        const subjects = await Subject.find().populate('teacher', 'name');
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get subject by ID
router.get('/:id', async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id).populate('teacher', 'name');
        if (!subject) {
            return res.status(404).json({ error: 'Subject not found' });
        }
        res.json(subject);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create subject (admin only)
router.post('/', async (req, res) => {
    try {
        const { name, description, forms } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Subject name is required' });
        }

        const subject = new Subject({
            name,
            description,
            forms
        });

        await subject.save();

        res.status(201).json({
            message: 'Subject created successfully',
            subject
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
