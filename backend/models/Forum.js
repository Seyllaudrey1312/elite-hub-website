// backend/models/Forum.js
const mongoose = require('mongoose');

const forumSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    subject: {
        type: String,
        required: true
    },
    form: {
        type: String, // Form level (1, 2, 3, 4) or 'general'
        default: 'general'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student'
        }
    ],
    discussionCount: {
        type: Number,
        default: 0
    },
    lastActivity: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for queries
forumSchema.index({ subject: 1, form: 1 });
forumSchema.index({ createdAt: -1 });
forumSchema.index({ lastActivity: -1 });

module.exports = mongoose.model('Forum', forumSchema);
