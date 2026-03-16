const mongoose = require('mongoose');

const examDateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        required: true
    },
    targetForms: [{
        type: String,
        enum: ['Form 1', 'Form 2', 'Form 3', 'Form 4', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12']
    }],
    isOfficial: {
        type: Boolean,
        default: true
    },
    subject: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    reminderSent: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
}, {
    timestamps: true
});

// Index for efficient queries
examDateSchema.index({ date: 1, isOfficial: 1 });
examDateSchema.index({ targetForms: 1 });

module.exports = mongoose.model('ExamDate', examDateSchema);