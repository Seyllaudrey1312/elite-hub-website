const express = require('express');
const router = express.Router();
const LiveClass = require('../models/LiveClass');
const zoom = require('../utils/zoom');

// Create a live class (public for now). If `createOnProvider: 'zoom'` is set, attempt to create a Zoom meeting.
router.post('/', async (req, res) => {
    try {
        const { title, subject, scheduledAt, durationMinutes, joinLink, createdBy, createOnProvider } = req.body;

        let finalJoinLink = joinLink || null;

        if (createOnProvider && String(createOnProvider).toLowerCase() === 'zoom') {
            try {
                const meeting = await zoom.createMeeting({
                    topic: title,
                    start_time: scheduledAt,
                    duration: durationMinutes
                });
                // Zoom returns join_url and start_url
                finalJoinLink = meeting.join_url || meeting.start_url || finalJoinLink;
                // Optionally persist provider meeting id
                req.body.providerMeetingId = meeting.id;
            } catch (zmErr) {
                console.error('Zoom create meeting error:', zmErr.message || zmErr);
                // continue and save local record but include warning
            }
        }

        const lc = new LiveClass({
            title,
            subject,
            scheduledAt,
            durationMinutes,
            joinLink: finalJoinLink,
            createdBy,
            provider: createOnProvider || undefined,
            providerMeetingId: req.body.providerMeetingId
        });

        await lc.save();
        res.json({ message: 'Live class scheduled', class: lc });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// List live classes
router.get('/', async (req, res) => {
    try {
        const classes = await LiveClass.find().sort({ scheduledAt: -1 }).limit(100);
        res.json({ classes });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
