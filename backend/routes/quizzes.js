// routes/quizzes.js - Quiz Routes
const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const auth = require("../middleware/auth")


// Get all quizzes (protected)

router.get("/" , auth, async (req, res) => {
    try {
        const assignments = await quizzes.find();
        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ message: "Server Error"})
    }
});

// Get all quizzes
router.get('/', async (req, res) => {
    try {
        const { subject, form, published } = req.query;
        
        const filter = {};
        if (subject) filter.subject = subject;
        if (form) filter.form = form;
        if (published !== undefined) filter.published = published === 'true';

        const quizzes = await Quiz.find(filter)
            .populate('subject', 'name')
            .populate('createdBy', 'name');
        
        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get quiz by ID
router.get('/:id', async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id)
            .populate('subject', 'name')
            .populate('createdBy', 'name');
        
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        
        res.json(quiz);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create quiz (admin only)
router.post('/', async (req, res) => {
    try {
        const { title, subject, form, topic, questions, timeLimit } = req.body;

        if (!title || !subject || !form) {
            return res.status(400).json({ error: 'Title, subject, and form are required' });
        }

        const quiz = new Quiz({
            title,
            subject,
            form,
            topic,
            questions,
            totalPoints: questions ? questions.length : 0,
            timeLimit
        });

        await quiz.save();

        res.status(201).json({
            message: 'Quiz created successfully',
            quiz
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update quiz
router.put('/:id', async (req, res) => {
    try {
        const quiz = await Quiz.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        ).populate('subject').populate('createdBy');

        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        res.json({
            message: 'Quiz updated successfully',
            quiz
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
