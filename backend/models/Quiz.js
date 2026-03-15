// models/Quiz.js
const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    title:       { type: String, required: true },
    description: String,
    subject:     { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    form:        { type: String },
    topic:       String,
    questions: [{
        questionText:  String,
        type:          String,
        options:       [String],
        correctAnswer: String,
        points:        { type: Number, default: 1 }
    }],
    totalPoints: Number,
    timeLimit:   Number,
    autoScore:   { type: Boolean, default: true },
    published:   { type: Boolean, default: false },
    isPremium:   { type: Boolean, default: false },
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },

    // ── Curriculum alignment ──────────────────────────────────────────────────
    curriculum:   { type: String, enum: ['CBC', '8-4-4', 'both'], default: 'both' },
    cbcStrand:    { type: String, default: '' },
    cbcSubStrand: { type: String, default: '' },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quiz', quizSchema);
