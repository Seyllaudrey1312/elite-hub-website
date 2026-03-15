// models/Resource.js
const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    title:       { type: String, required: true },
    description: String,
    type: {
        type: String,
        enum: ['notes', 'past-paper', 'worked-example', 'revision-guide', 'video'],
        required: true
    },
    subject:     { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    form:        { type: String },
    topic:       String,
    fileUrl:     String,
    markingSchemeUrl: String,
    fileSize:    Number,
    downloadCount: { type: Number, default: 0 },
    rating:      { type: Number, min: 0, max: 5, default: 0 },
    isPremium:   { type: Boolean, default: false },
    uploadedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },

    // ── Curriculum alignment ──────────────────────────────────────────────────
    curriculum:    { type: String, enum: ['CBC', '8-4-4', 'both'], default: 'both' },
    cbcStrand:     { type: String, default: '' },
    cbcSubStrand:  { type: String, default: '' },

    // ── Past-paper specific ───────────────────────────────────────────────────
    year:            { type: Number },
    paperNumber:     { type: String },   // e.g. "Paper 1", "Paper 2"
    examBody:        { type: String, enum: ['KCSE', 'KCPE', ''] },
    hasMarkingScheme:{ type: Boolean, default: false },

    createdAt: { type: Date, default: Date.now },
    updatedAt: Date
});

module.exports = mongoose.model('Resource', resourceSchema);
