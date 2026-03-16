// models/Student.js - Student Model
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: {
        type: String, required: true, unique: true, lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: { type: String, required: true, minlength: 6, select: false },
    form: {
        type: String,
        enum: ['Form 1', 'Form 2', 'Form 3', 'Form 4', 'Grade 7', 'Grade 8', 'Grade 9',
               'Grade 10', 'Grade 11', 'Grade 12'],
        required: true
    },
    curriculum: { type: String, enum: ['CBC', '8-4-4'], default: 'CBC' },
    enrolledSubjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
    quizResults: [{
        quiz:           { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
        score:          Number,
        totalQuestions: Number,
        percentage:     Number,
        completedAt:    Date
    }],
    mockResults: [{
        quiz:           { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
        examTitle:      String,
        subject:        String,
        paper:          String,
        score:          Number,
        totalQuestions: Number,
        percentage:     Number,
        grade:          String,
        sectionBreakdown: mongoose.Schema.Types.Mixed,
        completedAt:    Date,
        isMock:         { type: Boolean, default: true }
    }],
    personalExamDates: [{
        _id:        String,
        name:       String,
        date:       Date,
        subject:    String,
        reminder:   Boolean,
        isOfficial: { type: Boolean, default: false },
        createdAt:  Date
    }],
    assignments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' }],
    profileImage: String,
    provider:     { type: String, enum: ['local', 'google'], default: 'local' },
    isVerified:   { type: Boolean, default: false },
    verificationToken:    String,
    verificationExpires:  Date,
    resetPasswordToken:   String,
    resetPasswordExpires: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date
});

studentSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) { next(error); }
});

studentSchema.methods.matchPassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Student', studentSchema);
