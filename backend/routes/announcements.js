// routes/announcements.js - Announcement Routes
const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const auth = require("../middleware/auth")

// Get all Announcements (protected)

router.get("/" , auth, async (req, res) => {
    try {
        const assignments = await Announcement.find();
        res.json(announcements);
    } catch (error) {
        res.status(500).json({ message: "Server Error"})
    }
});


// Get all announcements
router.get('/', async (req, res) => {
    try {
        const { category, form, subject } = req.query;
        
        const filter = {};
        if (category) filter.category = category;
        if (form) filter.targetForms = form;
        if (subject) filter.targetSubjects = subject;

        const announcements = await Announcement.find(filter)
            .populate('author', 'name')
            .populate('targetSubjects', 'name')
            .sort({ createdAt: -1 });
        
        res.json(announcements);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get announcement by ID
router.get('/:id', async (req, res) => {
    try {
        const announcement = await Announcement.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { new: true }
        )
            .populate('author', 'name')
            .populate('targetSubjects', 'name');
        
        if (!announcement) {
            return res.status(404).json({ error: 'Announcement not found' });
        }
        
        res.json(announcement);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create announcement (admin only)
router.post('/', async (req, res) => {
    try {
        const { title, content, category, targetForms, targetSubjects } = req.body;

        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }

        const announcement = new Announcement({
            title,
            content,
            category,
            targetForms,
            targetSubjects,
            author: req.body.authorId // Should be set from auth middleware
        });

        await announcement.save();

        res.status(201).json({
            message: 'Announcement created successfully',
            announcement
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
