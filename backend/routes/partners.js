// routes/partners.js
const express  = require('express');
const router   = express.Router();
const mongoose = require('mongoose');
const auth     = require('../middleware/auth');

// ── Inline Partner schema (no separate file needed) ───────────────────────────
const partnerSchema = new mongoose.Schema({
    name:            { type: String, required: true },
    logo:            { type: String },
    description:     { type: String },
    county:          { type: String },
    website:         { type: String },
    partnershipType: { type: String, enum: ['School','NGO','Corporate','Government','Community'], default: 'School' },
    visible:         { type: Boolean, default: true },
    createdAt:       { type: Date, default: Date.now }
});

const applicationSchema = new mongoose.Schema({
    organisationName: { type: String, required: true },
    contactPerson:    { type: String, required: true },
    email:            { type: String, required: true },
    phone:            { type: String, required: true },
    county:           { type: String, required: true },
    partnershipType:  { type: String },
    description:      { type: String },
    status:           { type: String, enum: ['pending','approved','declined'], default: 'pending' },
    createdAt:        { type: Date, default: Date.now }
});

const Partner     = mongoose.models.Partner     || mongoose.model('Partner', partnerSchema);
const PartnerApp  = mongoose.models.PartnerApp  || mongoose.model('PartnerApp', applicationSchema);

function requireAdmin(req, res, next) {
    if (!['admin','superadmin'].includes(req.userRole)) return res.status(403).json({ error: 'Admin access required' });
    next();
}

// GET /api/partners — public
router.get('/', async (req, res) => {
    try {
        const partners = await Partner.find({ visible: true }).sort({ name: 1 });
        res.json(partners);
    } catch { res.status(500).json({ error: 'Server error' }); }
});

// POST /api/partners — admin: add partner
router.post('/', auth, requireAdmin, async (req, res) => {
    try {
        const partner = await Partner.create(req.body);
        res.status(201).json(partner);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// PUT /api/partners/:id — admin
router.put('/:id', auth, requireAdmin, async (req, res) => {
    try {
        const partner = await Partner.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!partner) return res.status(404).json({ error: 'Not found' });
        res.json(partner);
    } catch { res.status(500).json({ error: 'Server error' }); }
});

// DELETE /api/partners/:id — admin
router.delete('/:id', auth, requireAdmin, async (req, res) => {
    try {
        await Partner.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch { res.status(500).json({ error: 'Server error' }); }
});

// POST /api/partners/apply — public
router.post('/apply', async (req, res) => {
    try {
        const { organisationName, contactPerson, email, phone, county } = req.body;
        if (!organisationName || !contactPerson || !email || !phone || !county) {
            return res.status(400).json({ error: 'Required fields missing' });
        }
        const app = await PartnerApp.create(req.body);
        res.status(201).json({ message: 'Application received', id: app._id });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// GET /api/partners/applications — admin
router.get('/applications', auth, requireAdmin, async (req, res) => {
    try {
        const apps = await PartnerApp.find().sort({ createdAt: -1 });
        res.json(apps);
    } catch { res.status(500).json({ error: 'Server error' }); }
});

// PUT /api/partners/applications/:id — admin: approve/decline
router.put('/applications/:id', auth, requireAdmin, async (req, res) => {
    try {
        const app = await PartnerApp.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        if (!app) return res.status(404).json({ error: 'Not found' });
        // If approved, create a Partner record
        if (req.body.status === 'approved') {
            await Partner.create({
                name: app.organisationName,
                county: app.county,
                partnershipType: app.partnershipType || 'School',
                visible: true
            });
        }
        res.json(app);
    } catch { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
