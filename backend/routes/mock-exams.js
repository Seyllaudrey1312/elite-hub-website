// Mock Exam and KCSE Prediction API Endpoints
const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const Student = require('../models/Student');
const Resource = require('../models/Resource');
const ExamDate = require('../models/ExamDate');
const auth = require('../middleware/auth');

// KNEC Grading Scale
function getKNECGrade(percentage) {
    if (percentage >= 80) return 'A';
    if (percentage >= 75) return 'A-';
    if (percentage >= 70) return 'B+';
    if (percentage >= 65) return 'B';
    if (percentage >= 60) return 'B-';
    if (percentage >= 55) return 'C+';
    if (percentage >= 50) return 'C';
    if (percentage >= 45) return 'C-';
    if (percentage >= 40) return 'D+';
    if (percentage >= 35) return 'D';
    if (percentage >= 30) return 'D-';
    return 'E';
}

// ─── MOCK EXAMS ──────────────────────────────────────────────────────────────

// Get scheduled mock exams
router.get('/mock-exams/scheduled', auth, async (req, res) => {
    try {
        const student = await Student.findById(req.user.id);
        const now = new Date();
        
        const scheduledExams = await Quiz.find({
            isMock: true,
            scheduledStartTime: { $exists: true, $gte: now },
            $or: [
                { targetForms: { $in: [student.form] } },
                { targetForms: { $size: 0 } }
            ]
        }).sort({ scheduledStartTime: 1 });
        
        res.json(scheduledExams);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Submit mock exam
router.post('/quizzes/:id/submit', auth, async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        const { answers } = req.body;
        let score = 0;
        let sectionBreakdown = {};

        // Calculate score and section breakdown
        quiz.questions.forEach((question, index) => {
            const userAnswer = answers[index];
            const isCorrect = userAnswer === question.correctAnswer;
            
            if (isCorrect) score++;
            
            // Track section performance for mock exams
            if (quiz.isMock && question.section) {
                if (!sectionBreakdown[question.section]) {
                    sectionBreakdown[question.section] = { score: 0, total: 0 };
                }
                sectionBreakdown[question.section].total++;
                if (isCorrect) sectionBreakdown[question.section].score++;
            }
        });

        // Calculate section percentages
        Object.keys(sectionBreakdown).forEach(section => {
            const data = sectionBreakdown[section];
            data.percentage = Math.round((data.score / data.total) * 100);
        });

        const percentage = Math.round((score / quiz.questions.length) * 100);
        const grade = getKNECGrade(percentage);

        // Save result to student
        const student = await Student.findById(req.user.id);
        const result = {
            quiz: quiz._id,
            examTitle: quiz.title,
            subject: quiz.subject,
            paper: quiz.paper,
            score,
            totalQuestions: quiz.questions.length,
            percentage,
            grade,
            sectionBreakdown: Object.keys(sectionBreakdown).length ? sectionBreakdown : null,
            completedAt: new Date(),
            isMock: quiz.isMock
        };

        if (quiz.isMock) {
            if (!student.mockResults) student.mockResults = [];
            student.mockResults.push(result);
        } else {
            if (!student.quizResults) student.quizResults = [];
            student.quizResults.push(result);
        }

        await student.save();

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get student's mock results
router.get('/students/me/mock-results', auth, async (req, res) => {
    try {
        const student = await Student.findById(req.user.id);
        const mockResults = student.mockResults || [];
        
        res.json(mockResults.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt)));
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ─── KCSE PREDICTIONS ────────────────────────────────────────────────────────

// Get KCSE predictions for student
router.get('/students/me/predictions', auth, async (req, res) => {
    try {
        const student = await Student.findById(req.user.id);
        const quizResults = student.quizResults || [];
        
        if (quizResults.length === 0) {
            return res.json({
                subjectPredictions: {},
                weakTopics: {},
                recommendedResources: []
            });
        }

        // Group results by subject
        const subjectData = {};
        const topicData = {};

        quizResults.forEach(result => {
            const subject = result.subject || result.quiz?.subject;
            const topic = result.topic || result.quiz?.topic;
            
            if (!subject) return;

            // Subject-level data
            if (!subjectData[subject]) {
                subjectData[subject] = { scores: [], totalAttempts: 0 };
            }
            subjectData[subject].scores.push(result.percentage || 0);
            subjectData[subject].totalAttempts++;

            // Topic-level data
            if (topic) {
                const key = `${subject}:${topic}`;
                if (!topicData[key]) {
                    topicData[key] = { subject, topic, scores: [] };
                }
                topicData[key].scores.push(result.percentage || 0);
            }
        });

        // Calculate subject predictions
        const subjectPredictions = {};
        Object.keys(subjectData).forEach(subject => {
            const data = subjectData[subject];
            const averageScore = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
            const predictedGrade = getKNECGrade(averageScore);
            
            // Calculate confidence based on number of attempts and score consistency
            const scoreVariance = data.scores.reduce((acc, score) => acc + Math.pow(score - averageScore, 2), 0) / data.scores.length;
            const consistency = Math.max(0, 1 - (scoreVariance / 1000)); // Normalize variance
            const attemptsFactor = Math.min(1, data.totalAttempts / 10); // More attempts = higher confidence
            const confidence = (consistency * 0.6) + (attemptsFactor * 0.4);

            subjectPredictions[subject] = {
                averageScore: Math.round(averageScore),
                predictedGrade,
                confidence: Math.round(confidence * 100) / 100,
                totalAttempts: data.totalAttempts
            };
        });

        // Identify weak topics (average < 50%)
        const weakTopics = {};
        Object.keys(topicData).forEach(key => {
            const data = topicData[key];
            const averageScore = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
            
            if (averageScore < 50) {
                if (!weakTopics[data.subject]) {
                    weakTopics[data.subject] = [];
                }
                weakTopics[data.subject].push({
                    topicName: data.topic,
                    averageScore: Math.round(averageScore),
                    attempts: data.scores.length
                });
            }
        });

        // Get recommended resources for weak topics
        const allWeakTopics = [];
        Object.values(weakTopics).forEach(topics => {
            topics.forEach(topic => allWeakTopics.push(topic.topicName));
        });

        const recommendedResources = await Resource.find({
            $or: [
                { topic: { $in: allWeakTopics } },
                { subject: { $in: Object.keys(weakTopics) } }
            ]
        }).limit(10).select('title subject topic type _id');

        res.json({
            subjectPredictions,
            weakTopics,
            recommendedResources
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ─── EXAM DATES ──────────────────────────────────────────────────────────────

// Get official exam dates
router.get('/exam-dates/official', auth, async (req, res) => {
    try {
        const student = await Student.findById(req.user.id);
        const now = new Date();
        
        const officialExams = await ExamDate.find({
            isOfficial: true,
            date: { $gte: now },
            $or: [
                { targetForms: { $in: [student.form] } },
                { targetForms: { $size: 0 } }
            ]
        }).sort({ date: 1 });
        
        res.json(officialExams);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get student's personal exam dates
router.get('/students/me/exam-dates', auth, async (req, res) => {
    try {
        const student = await Student.findById(req.user.id);
        const personalExams = student.personalExamDates || [];
        const now = new Date();
        
        // Filter out past exams
        const upcomingExams = personalExams.filter(exam => new Date(exam.date) > now);
        
        res.json(upcomingExams);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Add personal exam date
router.post('/students/me/exam-dates', auth, async (req, res) => {
    try {
        const { name, date, subject, reminder } = req.body;
        
        if (!name || !date) {
            return res.status(400).json({ message: 'Name and date are required' });
        }

        const student = await Student.findById(req.user.id);
        if (!student.personalExamDates) {
            student.personalExamDates = [];
        }

        const examDate = {
            _id: new Date().getTime().toString(), // Simple ID generation
            name,
            date: new Date(date),
            subject: subject || null,
            reminder: reminder || false,
            isOfficial: false,
            createdAt: new Date()
        };

        student.personalExamDates.push(examDate);
        await student.save();

        res.status(201).json(examDate);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete personal exam date
router.delete('/students/me/exam-dates/:id', auth, async (req, res) => {
    try {
        const student = await Student.findById(req.user.id);
        
        if (!student.personalExamDates) {
            return res.status(404).json({ message: 'Exam date not found' });
        }

        const initialLength = student.personalExamDates.length;
        student.personalExamDates = student.personalExamDates.filter(
            exam => exam._id !== req.params.id
        );

        if (student.personalExamDates.length === initialLength) {
            return res.status(404).json({ message: 'Exam date not found' });
        }

        await student.save();
        res.json({ message: 'Exam date deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;