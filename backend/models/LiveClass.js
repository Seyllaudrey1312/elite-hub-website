const mongoose = require('mongoose');

const LiveClassSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subject: { type: String },
    scheduledAt: { type: Date, required: true },
    durationMinutes: { type: Number, default: 60 },
    joinLink: { type: String },
    createdBy: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LiveClass', LiveClassSchema);
