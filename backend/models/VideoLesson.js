const mongoose = require('mongoose');

const VideoLessonSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subject: { type: String },
    url: { type: String, required: true },
    description: { type: String },
    uploadedBy: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('VideoLesson', VideoLessonSchema);
