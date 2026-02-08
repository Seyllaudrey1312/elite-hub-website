// routes/students.js - Student Routes
const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const auth = require("../middleware/auth");


// Get all students
router.get('/', async (req, res) => {
    try {
        const students = await Student.find().populate('enrolledSubjects');
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get student by ID
router.get('/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).populate('enrolledSubjects');
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.json(student);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update student
router.put('/:id', async (req, res) => {
    try {
        const { name, form, enrolledSubjects } = req.body;
        
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            { 
                name, 
                form, 
                enrolledSubjects,
                updatedAt: new Date()
            },
            { new: true }
        ).populate('enrolledSubjects');

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json({
            message: 'Student updated successfully',
            student
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete student
router.delete('/:id', async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
