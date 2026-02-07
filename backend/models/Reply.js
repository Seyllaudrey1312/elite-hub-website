// backend/models/Reply.js
const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    discussionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Discussion',
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
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student'
        }
    ],
    isApproved: {
        type: Boolean,
        default: true
    },
    isMarkedAsAnswer: {
        type: Boolean,
        default: false
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
replySchema.index({ discussionId: 1, createdAt: 1 });
replySchema.index({ author: 1 });
replySchema.index({ isMarkedAsAnswer: -1 });

module.exports = mongoose.model('Reply', replySchema);
