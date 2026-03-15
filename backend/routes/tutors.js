// routes/tutors.js
const express = require('express');
const router  = express.Router();
const crypto  = require('crypto');
const jwt     = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const Tutor   = require('../models/Tutor');
const auth    = require('../middleware/auth');

// ── Email helper ──────────────────────────────────────────────────────────────
function getMailer() {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });
}

async function sendMail(to, subject, html) {
    try {
        const mailer = getMailer();
        await mailer.sendMail({ from: `"Elite Hub" <${process.env.EMAIL_USER}>`, to, subject, html });
    } catch (err) {
        console.error('Email send error:', err.message);
    }
}

// ── Generate EH-XXXX-XXXX activation code ────────────────────────────────────
function generateActivationCode() {
    const part = () => crypto.randomBytes(2).toString('hex').toUpperCase();
    return `EH-${part()}-${part()}`;
}

// ── POST /api/tutors/apply — public ──────────────────────────────────────────
router.post('/apply', async (req, res) => {
    try {
        const { name, email, password, phone, county, subjects, forms, tscNumber } = req.body;
        if (!name || !email || !password || !phone || !county || !tscNumber) {
            return res.status(400).json({ error: 'All required fields must be provided' });
        }
        const existing = await Tutor.findOne({ email });
        if (existing) return res.status(400).json({ error: 'An application with this email already exists' });

        const tutor = await Tutor.create({ name, email, password, phone, county, subjects, forms, tscNumber });
        res.status(201).json({ message: 'Application received. You will be notified within 2 business days.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── GET /api/tutors/applications — admin only ─────────────────────────────────
router.get('/applications', auth, requireAdmin, async (req, res) => {
    try {
        const tutors = await Tutor.find().sort({ createdAt: -1 });
        res.json(tutors);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ── GET /api/tutors/applications/count — admin only ───────────────────────────
router.get('/applications/count', auth, requireAdmin, async (req, res) => {
    try {
        const count = await Tutor.countDocuments({ status: 'pending' });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ── PUT /api/tutors/:id/approve — admin only ──────────────────────────────────
router.put('/:id/approve', auth, requireAdmin, async (req, res) => {
    try {
        const tutor = await Tutor.findById(req.params.id).select('+activationCode +activationCodeExpiry +activationCodeUsed');
        if (!tutor) return res.status(404).json({ error: 'Tutor not found' });

        const code   = generateActivationCode();
        const expiry = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

        tutor.status              = 'verified';
        tutor.activationCode      = code;
        tutor.activationCodeExpiry = expiry;
        tutor.activationCodeUsed  = false;
        await tutor.save();

        await sendMail(tutor.email, 'Elite Hub — Your Tutor Application is Approved!', `
            <h2>Congratulations, ${tutor.name}!</h2>
            <p>Your tutor application for Elite Hub has been approved.</p>
            <p>Use the activation code below to activate your tutor account:</p>
            <h1 style="letter-spacing:4px;color:#1e3a5f;">${code}</h1>
            <p>This code expires in <strong>48 hours</strong>.</p>
            <p>Visit <a href="${process.env.FRONTEND_URL || 'https://elite-hub-website.onrender.com'}/pages/tutor-activate.html">Activate your account</a></p>
        `);

        res.json({ message: 'Tutor approved. Activation code sent to email.', tutor: { _id: tutor._id, status: tutor.status } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── PUT /api/tutors/:id/reject — admin only ───────────────────────────────────
router.put('/:id/reject', auth, requireAdmin, async (req, res) => {
    try {
        const { reason } = req.body;
        const tutor = await Tutor.findByIdAndUpdate(
            req.params.id,
            { status: 'rejected', rejectionReason: reason || '' },
            { new: true }
        );
        if (!tutor) return res.status(404).json({ error: 'Tutor not found' });

        await sendMail(tutor.email, 'Elite Hub — Tutor Application Update', `
            <h2>Dear ${tutor.name},</h2>
            <p>After reviewing your application, we are unable to approve your tutor registration at this time.</p>
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
            <p>You are welcome to reapply in the future. Contact us at ${process.env.EMAIL_USER} for more information.</p>
        `);

        res.json({ message: 'Tutor rejected.', tutor: { _id: tutor._id, status: tutor.status } });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ── POST /api/tutors/activate — public ───────────────────────────────────────
router.post('/activate', async (req, res) => {
    try {
        const { email, activationCode } = req.body;
        if (!email || !activationCode) return res.status(400).json({ error: 'Email and activation code are required' });

        const tutor = await Tutor.findOne({ email }).select('+activationCode +activationCodeExpiry +activationCodeUsed');
        if (!tutor) return res.status(404).json({ error: 'No account found with this email' });
        if (tutor.status !== 'verified') return res.status(400).json({ error: 'This account has not been approved yet' });
        if (tutor.activationCodeUsed) return res.status(400).json({ error: 'This activation code has already been used' });
        if (!tutor.activationCode || tutor.activationCode !== activationCode) return res.status(400).json({ error: 'Invalid activation code' });
        if (tutor.activationCodeExpiry < new Date()) return res.status(400).json({ error: 'Activation code has expired. Please contact admin for a new one.' });

        tutor.activationCodeUsed = true;
        await tutor.save();

        const token = jwt.sign(
            { id: tutor._id, email: tutor.email, role: 'tutor' },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        res.json({ token, tutor: { _id: tutor._id, name: tutor.name, email: tutor.email, role: 'tutor', subjects: tutor.subjects } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── GET /api/tutors/public — public ──────────────────────────────────────────
router.get('/public', async (req, res) => {
    try {
        const tutors = await Tutor.find({ status: 'verified', suspended: { $ne: true } })
            .select('name subjects county')
            .sort({ name: 1 });
        res.json(tutors);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ── Middleware: require admin role ────────────────────────────────────────────
function requireAdmin(req, res, next) {
    if (req.userRole !== 'admin' && req.userRole !== 'superadmin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
}

module.exports = router;
