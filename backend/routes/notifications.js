// backend/routes/notifications.js - Notification Management
const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const Student = require('../models/Student');
const auth = require('../middleware/auth');
const nodemailer = require('nodemailer');

// Get all notifications for a user
router.get('/', auth, async (req, res) => {
    try {
        const { unreadOnly = false, limit = 20, page = 1 } = req.query;

        const filter = { userId: req.userId };
        if (unreadOnly === 'true') {
            filter.read = false;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const notifications = await Notification.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Notification.countDocuments(filter);
        const unreadCount = await Notification.countDocuments({ userId: req.userId, read: false });

        res.json({
            notifications,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            },
            unreadCount
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get unread count
router.get('/unread/count', auth, async (req, res) => {
    try {
        const unreadCount = await Notification.countDocuments({
            userId: req.userId,
            read: false
        });

        res.json({ unreadCount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            {
                read: true,
                readAt: new Date()
            },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        // Verify ownership
        if (notification.userId.toString() !== req.userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(notification);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mark all notifications as read
router.put('/mark-all/read', auth, async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.userId, read: false },
            {
                read: true,
                readAt: new Date()
            }
        );

        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete notification
router.delete('/:id', auth, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        // Verify ownership
        if (notification.userId.toString() !== req.userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        await Notification.findByIdAndDelete(req.params.id);

        res.json({ message: 'Notification deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Clear all notifications
router.delete('/all/clear', auth, async (req, res) => {
    try {
        await Notification.deleteMany({ userId: req.userId });

        res.json({ message: 'All notifications cleared' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create notification (internal helper - called by other routes)
async function createNotification(userId, title, message, type = 'system', relatedId = null) {
    try {
        const notification = new Notification({
            userId,
            title,
            message,
            type,
            relatedId
        });

        await notification.save();
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
    }
}

module.exports = router;
module.exports.createNotification = createNotification;

// Public endpoint to send email notifications (admin UI will call this)
router.post('/send-email', async (req, res) => {
    try {
        const { subject, message, targetForm, recipients } = req.body;

        // Determine recipients: explicit list > targetForm > all students
        let emails = [];
        if (Array.isArray(recipients) && recipients.length > 0) {
            emails = recipients;
        } else if (targetForm) {
            const formLabel = String(targetForm).toLowerCase().startsWith('form') ? targetForm : `Form ${targetForm}`;
            const students = await Student.find({ form: formLabel }).select('email _id');
            emails = students.map(s => s.email);
        } else {
            const students = await Student.find({}).select('email _id');
            emails = students.map(s => s.email);
        }

        if (!emails || emails.length === 0) {
            return res.status(400).json({ error: 'No recipient emails found' });
        }

        // Check mail configuration
        if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
            // Still create notifications for users (in-app) but return a warning
            // Create in-app notifications for users found in DB
            const students = await Student.find({ email: { $in: emails } }).select('_id');
            for (const s of students) {
                await createNotification(s._id, subject, message, 'email');
            }
            return res.status(200).json({ message: 'In-app notifications created. SMTP not configured for email sending.' });
        }

        // Create transporter
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_FROM || process.env.SMTP_USER,
            to: emails.join(','),
            subject: subject || 'Elite Hub Notification',
            html: message || ''
        };

        const info = await transporter.sendMail(mailOptions);

        // Create in-app notifications as well
        const students = await Student.find({ email: { $in: emails } }).select('_id');
        for (const s of students) {
            await createNotification(s._id, subject, message, 'email');
        }

        res.json({ message: 'Emails sent', info });
    } catch (error) {
        console.error('Send email error:', error);
        res.status(500).json({ error: error.message });
    }
});
