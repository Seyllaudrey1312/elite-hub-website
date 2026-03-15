// routes/students.js
const express = require('express');
const router  = express.Router();
const Student = require('../models/Student');
const CompetencyProgress = require('../models/CompetencyProgress');
const { CBC_COMPETENCIES } = require('../models/CompetencyProgress');
const auth    = require('../middleware/auth');

// GET /api/students
router.get('/', async (req, res) => {
    try {
        const students = await Student.find().populate('enrolledSubjects');
        res.json(students);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/students/me/quiz-results
router.get('/me/quiz-results', auth, async (req, res) => {
    try {
        const student = await Student.findById(req.userId).populate('quizResults.quiz');
        if (!student) return res.status(404).json({ error: 'Student not found' });
        res.json(student.quizResults || []);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/students/me/competencies
router.get('/me/competencies', auth, async (req, res) => {
    try {
        const records = await CompetencyProgress.find({ studentId: req.userId });
        // Return all 7 competencies, defaulting missing ones to 0
        const result = CBC_COMPETENCIES.map(c => {
            const found = records.find(r => r.competency === c);
            return { competency: c, progressPercent: found ? found.progressPercent : 0, lastUpdated: found?.lastUpdated };
        });
        res.json(result);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/students/me/competencies/:competency
router.put('/me/competencies/:competency', auth, async (req, res) => {
    try {
        const competency = decodeURIComponent(req.params.competency);
        if (!CBC_COMPETENCIES.includes(competency)) {
            return res.status(400).json({ error: 'Invalid competency name' });
        }
        const { progressPercent } = req.body;
        if (progressPercent === undefined || progressPercent < 0 || progressPercent > 100) {
            return res.status(400).json({ error: 'progressPercent must be 0–100' });
        }
        const record = await CompetencyProgress.findOneAndUpdate(
            { studentId: req.userId, competency },
            { progressPercent, lastUpdated: new Date() },
            { upsert: true, new: true }
        );
        res.json(record);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin: PUT /api/students/:id/competencies/:competency
router.put('/:id/competencies/:competency', auth, async (req, res) => {
    try {
        const competency = decodeURIComponent(req.params.competency);
        if (!CBC_COMPETENCIES.includes(competency)) {
            return res.status(400).json({ error: 'Invalid competency name' });
        }
        const { progressPercent } = req.body;
        const record = await CompetencyProgress.findOneAndUpdate(
            { studentId: req.params.id, competency },
            { progressPercent, lastUpdated: new Date() },
            { upsert: true, new: true }
        );
        res.json(record);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/students/:id
router.get('/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).populate('enrolledSubjects');
        if (!student) return res.status(404).json({ error: 'Student not found' });
        res.json(student);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/students/:id
router.put('/:id', async (req, res) => {
    try {
        const { name, form, curriculum, enrolledSubjects, profileImage } = req.body;
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            { name, form, curriculum, enrolledSubjects, profileImage, updatedAt: new Date() },
            { new: true }
        ).populate('enrolledSubjects');
        if (!student) return res.status(404).json({ error: 'Student not found' });
        res.json({ message: 'Student updated successfully', student });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/students/:id
router.delete('/:id', async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);
        if (!student) return res.status(404).json({ error: 'Student not found' });
        res.json({ message: 'Student deleted successfully' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
