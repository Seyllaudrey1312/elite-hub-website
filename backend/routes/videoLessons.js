const express = require('express');
const router = express.Router();
const VideoLesson = require('../models/VideoLesson');

// Add a video lesson
router.post('/', async (req, res) => {
    try {
        const { title, subject, url, description, uploadedBy } = req.body;
        const v = new VideoLesson({ title, subject, url, description, uploadedBy });
        await v.save();
        res.json({ message: 'Video lesson added', video: v });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// List video lessons
router.get('/', async (req, res) => {
    try {
        const videos = await VideoLesson.find().sort({ createdAt: -1 }).limit(200);
        res.json({ videos });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
