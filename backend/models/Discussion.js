// backend/models/Discussion.js
const mongoose = require('mongoose');

const discussionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    foldId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Forum',
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    authorName: {
        type: String,
        required: true
    },
    tags: [String],
    views: {
        type: Number,
        default: 0
    },
    replyCount: {
        type: Number,
        default: 0
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student'
        }
    ],
    isPinned: {
        type: Boolean,
        default: false
    },
    isLocked: {
        type: Boolean,
        default: false
    },
    lastReplyAt: {
        type: Date,
        default: null
    },
    lastReplyBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Index for queries
discussionSchema.index({ forumId: 1, createdAt: -1 });
discussionSchema.index({ author: 1 });
discussionSchema.index({ isPinned: -1, lastReplyAt: -1 });
discussionSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Discussion', discussionSchema);
