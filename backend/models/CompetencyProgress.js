// models/CompetencyProgress.js
const mongoose = require('mongoose');

const CBC_COMPETENCIES = [
    'Communication and Collaboration',
    'Critical Thinking and Problem Solving',
    'Creativity and Imagination',
    'Citizenship',
    'Digital Literacy',
    'Learning to Learn',
    'Self-Efficacy'
];

const competencyProgressSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    competency: { type: String, enum: CBC_COMPETENCIES, required: true },
    progressPercent: { type: Number, min: 0, max: 100, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
});

competencyProgressSchema.index({ studentId: 1, competency: 1 }, { unique: true });

module.exports = mongoose.model('CompetencyProgress', competencyProgressSchema);
module.exports.CBC_COMPETENCIES = CBC_COMPETENCIES;
