// models/Quiz.js - Quiz Model
const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    form: {
        type: String,
        enum: ['Form 1', 'Form 2', 'Form 3', 'Form 4'],
        required: true
    },
    topic: String,
    questions: [{
        questionText: String,
        type: String, // 'multiple-choice' or 'short-answer'
        options: [String], // for multiple choice
        correctAnswer: String,
        points: {
            type: Number,
            default: 1
        }
    }],
    totalPoints: Number,
    timeLimit: Number, // in minutes
    autoScore: {
        type: Boolean,
        default: true
    },
    published: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Quiz', quizSchema);
