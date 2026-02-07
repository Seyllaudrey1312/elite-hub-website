// routes/quizzes.js - Quiz Routes with Auto-Grading
const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const Student = require('../models/Student');
const auth = require('../middleware/auth');

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
        const { title, subject, questions, timeLimit, description, forms, autoGrade, totalPoints } = req.body;

        if (!title || !subject || !questions || questions.length === 0) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const quiz = new Quiz({
            title,
            subject,
            questions,
            timeLimit: timeLimit || 30,
            description,
            forms: forms || [1, 2, 3, 4],
            autoGrade: autoGrade !== false,
            totalPoints: totalPoints || questions.reduce((sum, q) => sum + (q.points || 1), 0),
            createdBy: req.userId || 'admin',
            submissions: []
        });

        await quiz.save();

        res.status(201).json({
            message: 'Quiz created successfully with auto-grading enabled',
            quiz
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Submit quiz answers and auto-grade
router.post('/:id/submit', auth, async (req, res) => {
    try {
        const { answers } = req.body; // answers = { questionIndex: answer, ... }

        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        const student = await Student.findById(req.userId);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Auto-grade the quiz
        const gradingResult = gradeQuiz(quiz, answers);

        // Create submission record
        const submission = {
            studentId: req.userId,
            studentName: student.name,
            answers,
            score: gradingResult.score,
            totalPoints: quiz.totalPoints,
            percentage: Math.round((gradingResult.score / quiz.totalPoints) * 100),
            submittedAt: new Date(),
            passed: Math.round((gradingResult.score / quiz.totalPoints) * 100) >= 70
        };

        // Save submission to quiz
        quiz.submissions.push(submission);
        await quiz.save();

        // Save to student's quiz results
        student.quizResults.push({
            quizId: quiz._id,
            quizTitle: quiz.title,
            score: submission.score,
            totalPoints: quiz.totalPoints,
            percentage: submission.percentage,
            date: new Date(),
            passed: submission.passed
        });
        await student.save();

        res.json({
            message: 'Quiz submitted and auto-graded',
            submission,
            feedback: {
                score: submission.score,
                totalPoints: quiz.totalPoints,
                percentage: submission.percentage,
                passed: submission.passed,
                itemAnalysis: gradingResult.itemAnalysis
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Auto-grading function
function gradeQuiz(quiz, studentAnswers) {
    let score = 0;
    const itemAnalysis = [];

    quiz.questions.forEach((question, index) => {
        const studentAnswer = studentAnswers[index];
        let isCorrect = false;
        let points = question.points || 1;

        // Auto-grade only if autoGrade is enabled for this question
        if (question.autoGrade) {
            if (question.type === 'multiple' || question.type === 'truefalse') {
                // Exact match for MCQ and T/F
                isCorrect = studentAnswer === question.correctAnswer;
            } else if (question.type === 'shortanswer') {
                // Case-insensitive comparison for short answers
                isCorrect = studentAnswer?.toLowerCase().trim() === question.correctAnswer?.toLowerCase().trim();
            }

            if (isCorrect) {
                score += points;
            }

            itemAnalysis.push({
                questionIndex: index,
                questionText: question.questionText,
                type: question.type,
                studentAnswer,
                correctAnswer: question.correctAnswer,
                isCorrect,
                points: isCorrect ? points : 0,
                feedback: isCorrect ? '✅ Correct!' : `❌ Incorrect. ${question.feedback || ''}`
            });
        } else {
            // Manual grading required (essays, etc.)
            itemAnalysis.push({
                questionIndex: index,
                questionText: question.questionText,
                type: question.type,
                studentAnswer,
                isCorrect: null,
                points: 0,
                feedback: '📝 Pending manual grading by instructor'
            });
        }
    });

    return {
        score,
        itemAnalysis
    };
}

// Update quiz
router.put('/:id', async (req, res) => {
    try {
        const { title, description, questions, timeLimit } = req.body;

        const quiz = await Quiz.findByIdAndUpdate(
            req.params.id,
            { title, description, questions, timeLimit },
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

// Delete quiz
router.delete('/:id', async (req, res) => {
    try {
        const quiz = await Quiz.findByIdAndDelete(req.params.id);
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        res.json({ message: 'Quiz deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get quiz results for admin (statistics)
router.get('/:id/results', async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        // Calculate statistics
        const submissions = quiz.submissions || [];
        const stats = {
            quizTitle: quiz.title,
            totalSubmissions: submissions.length,
            averageScore: submissions.length > 0 ? 
                Math.round(submissions.reduce((sum, s) => sum + s.percentage, 0) / submissions.length) : 0,
            passedCount: submissions.filter(s => s.passed).length,
            failedCount: submissions.filter(s => !s.passed).length,
            passRate: submissions.length > 0 ?
                Math.round((submissions.filter(s => s.passed).length / submissions.length) * 100) : 0,
            submissions: submissions.map(s => ({
                studentName: s.studentName,
                score: s.score,
                percentage: s.percentage,
                passed: s.passed,
                submittedAt: s.submittedAt
            }))
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
