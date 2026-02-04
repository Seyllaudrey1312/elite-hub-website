// routes/resources.js - Resource Routes
const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');

// Get all resources
router.get('/', async (req, res) => {
    try {
        const { subject, form, type } = req.query;
        
        const filter = {};
        if (subject) filter.subject = subject;
        if (form) filter.form = form;
        if (type) filter.type = type;

        const resources = await Resource.find(filter)
            .populate('subject', 'name')
            .populate('uploadedBy', 'name')
            .sort({ createdAt: -1 });
        
        res.json(resources);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get resource by ID
router.get('/:id', async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id)
            .populate('subject', 'name')
            .populate('uploadedBy', 'name');
        
        if (!resource) {
            return res.status(404).json({ error: 'Resource not found' });
        }

        // Increment download count
        resource.downloadCount += 1;
        await resource.save();
        
        res.json(resource);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create resource (admin only)
router.post('/', async (req, res) => {
    try {
        const { title, type, subject, form, topic, fileUrl } = req.body;

        if (!title || !type || !subject || !form) {
            return res.status(400).json({ error: 'Required fields missing' });
        }

        const resource = new Resource({
            title,
            type,
            subject,
            form,
            topic,
            fileUrl
        });

        await resource.save();

        res.status(201).json({
            message: 'Resource created successfully',
            resource
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
