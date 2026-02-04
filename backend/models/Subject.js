// models/Subject.js - Subject Model
const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        enum: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Kiswahili', 'History', 'Geography']
    },
    description: String,
    icon: String,
    forms: [{
        type: String,
        enum: ['Form 1', 'Form 2', 'Form 3', 'Form 4']
    }],
    topics: [{
        name: String,
        description: String,
        form: String,
        resources: [String] // Resource IDs
    }],
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Subject', subjectSchema);
