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
        points:        { type: Number, default: 1 },
        section:       String  // For mock exams section breakdown
    }],
    totalPoints: Number,
    timeLimit:   Number,
    autoScore:   { type: Boolean, default: true },
    published:   { type: Boolean, default: false },
    isPremium:   { type: Boolean, default: false },
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },

    // ── Mock Exam Fields ──────────────────────────────────────────────────────
    isMock:              { type: Boolean, default: false },
    duration:            { type: Number }, // Duration in minutes for mock exams
    paper:               { type: String, enum: ['Paper 1', 'Paper 2', 'Paper 3'] },
    scheduledStartTime:  { type: Date }, // For platform-wide scheduled mocks
    targetForms:         [{ type: String }], // Forms that can take this mock
    difficulty:          { type: String, enum: ['Easy', 'Medium', 'Hard'] },

    // ── Curriculum alignment ──────────────────────────────────────────────────
    curriculum:   { type: String, enum: ['CBC', '8-4-4', 'both'], default: 'both' },
    cbcStrand:    { type: String, default: '' },
    cbcSubStrand: { type: String, default: '' },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quiz', quizSchema);
