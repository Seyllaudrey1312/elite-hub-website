// models/Announcement.js - Announcement Model
const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['important', 'resource', 'event', 'update', 'notice'],
        default: 'update'
    },
    targetForms: [{
        type: String,
        enum: ['Form 1', 'Form 2', 'Form 3', 'Form 4']
    }],
    targetSubjects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject'
    }],
    attachments: [String],
    isStarred: {
        type: Boolean,
        default: false
    },
    views: {
        type: Number,
        default: 0
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: Date
});

module.exports = mongoose.model('Announcement', announcementSchema);
