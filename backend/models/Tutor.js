// models/Tutor.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const tutorSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: {
        type: String, required: true, unique: true, lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email']
    },
    password: { type: String, required: true, minlength: 6, select: false },
    phone: { type: String, required: true },
    county: { type: String, required: true },
    subjects: [{ type: String }],
    forms: [{ type: String }],
    tscNumber: { type: String, required: true, trim: true },
    status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    rejectionReason: { type: String },
    activationCode: { type: String, select: false },
    activationCodeExpiry: { type: Date, select: false },
    activationCodeUsed: { type: Boolean, default: false, select: false },
    role: { type: String, default: 'tutor' },
    uploadCount: { type: Number, default: 0 },
    suspended: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

tutorSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

tutorSchema.methods.matchPassword = async function (entered) {
    return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('Tutor', tutorSchema);
