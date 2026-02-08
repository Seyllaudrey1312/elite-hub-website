// routes/assignments.js - Assignment Routes
const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const auth = require("../middleware/auth")


// Get all assignments
router.get('/', async (req, res) => {
    try {
        const { subject, form, status } = req.query;
        
        const filter = {};
        if (subject) filter.subject = subject;
        if (form) filter.form = form;

        const assignments = await Assignment.find(filter)
            .populate('subject', 'name')
            .populate('createdBy', 'name')
            .sort({ dueDate: 1 });
        
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get assignment by ID
router.get('/:id', async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id)
            .populate('subject', 'name')
            .populate('createdBy', 'name')
            .populate('submissions.student', 'name email');
        
        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found' });
        }
        
        res.json(assignment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create assignment (admin only)
router.post('/', async (req, res) => {
    try {
        const { title, subject, form, dueDate, instructions } = req.body;

        if (!title || !subject || !form || !dueDate) {
            return res.status(400).json({ error: 'Required fields missing' });
        }

        const assignment = new Assignment({
            title,
            subject,
            form,
            dueDate,
            instructions,
            totalPoints: 100
        });

        await assignment.save();

        res.status(201).json({
            message: 'Assignment created successfully',
            assignment
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
