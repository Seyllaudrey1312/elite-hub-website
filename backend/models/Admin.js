// models/Admin.js - Admin/Tutor Model
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false
    },
    subject: {
        type: String,
        required: true,
        enum: [
            'Mathematics',
            'English',
            'Science',
            'Biology',
            'Chemistry',
            'Physics',
            'History',
            'Geography',
            'Computer Studies',
            'Business Studies',
            'CRE',
            'Kiswahili'
        ]
    },
    tutorCode: {
        type: String,
        default: null
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    createdLiveClasses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LiveClass'
    }],
    createdQuizzes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz'
    }],
    createdResources: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resource'
    }],
    createdVideoLessons: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VideoLesson'
    }],
    createdAnnouncements: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Announcement'
    }],
    profileImage: String,
    bio: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: Date
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
adminSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Admin', adminSchema);
