// backend/models/Parent.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const parentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false // Don't return password by default
    },
    phone: {
        type: String,
        default: ''
    },
    childrenIds: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student'
        }
    ],
    linkedStudents: [
        {
            studentId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Student'
            },
            linkedAt: {
                type: Date,
                default: Date.now
            },
            linkCode: {
                type: String, // For linking requests
                default: null
            },
            verified: {
                type: Boolean,
                default: false
            }
        }
    ],
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date,
        default: null
    }
});

// Hash password before saving
parentSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
parentSchema.methods.comparePassword = async function (passwordAttempt) {
    return await bcrypt.compare(passwordAttempt, this.password);
};

// Index for quick queries
parentSchema.index({ email: 1 });
parentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Parent', parentSchema);
