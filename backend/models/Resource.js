// models/Resource.js - Resource Model
const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    type: {
        type: String,
        enum: ['notes', 'past-paper', 'worked-example', 'revision-guide', 'video'],
        required: true
    },
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
    fileUrl: String,
    fileSize: Number,
    downloadCount: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: Date
});

module.exports = mongoose.model('Resource', resourceSchema);
