// backend/routes/notifications.js - Notification Management
const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const Student = require('../models/Student');
const auth = require('../middleware/auth');

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
