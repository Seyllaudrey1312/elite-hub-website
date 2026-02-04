// models/Assignment.js - Assignment Model
const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
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
    dueDate: {
        type: Date,
        required: true
    },
    totalPoints: {
        type: Number,
        default: 100
    },
    instructions: String,
    attachments: [String], // file URLs
    submissions: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student'
        },
        submittedAt: Date,
        file: String,
        score: Number,
        feedback: String,
        gradedAt: Date,
        gradedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Teacher'
        }
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Assignment', assignmentSchema);
