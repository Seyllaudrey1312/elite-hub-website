// backend/routes/forums.js - Forum and Discussion Management
const express = require('express');
const router = express.Router();
const Forum = require('../models/Forum');
const Discussion = require('../models/Discussion');
const Reply = require('../models/Reply');
const Student = require('../models/Student');
const auth = require('../middleware/auth');

// Get all forums
router.get('/', async (req, res) => {
    try {
        const { subject, form, search } = req.query;

        const filter = {};
        if (subject) filter.subject = subject;
        if (form) filter.form = form;

        let forums = await Forum.find(filter)
            .populate('createdBy', 'name')
            .populate('members', 'name')
            .sort({ lastActivity: -1 });

        // Filter by search if provided
        if (search) {
            forums = forums.filter(f =>
                f.title.toLowerCase().includes(search.toLowerCase()) ||
                f.description.toLowerCase().includes(search.toLowerCase())
            );
        }

        res.json(forums);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get forum by ID with discussions
router.get('/:id', async (req, res) => {
    try {
        const forum = await Forum.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('members', 'name');

        if (!forum) {
            return res.status(404).json({ error: 'Forum not found' });
        }

        // Get recent discussions
        const discussions = await Discussion.find({ forumId: req.params.id })
            .populate('author', 'name')
            .populate('lastReplyBy', 'name')
            .sort({ isPinned: -1, lastReplyAt: -1 })
            .limit(20);

        res.json({
            forum,
            discussions
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create forum (admin/teacher only)
router.post('/', auth, async (req, res) => {
    try {
        const { title, description, subject, form } = req.body;

        if (!title || !subject) {
            return res.status(400).json({ error: 'Title and subject are required' });
        }

        const forum = new Forum({
            title,
            description,
            subject,
            form: form || 'general',
            createdBy: req.userId,
            members: [req.userId]
        });

        await forum.save();

        res.status(201).json({
            message: 'Forum created successfully',
            forum
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Join forum
router.post('/:id/join', auth, async (req, res) => {
    try {
        const forum = await Forum.findById(req.params.id);

        if (!forum) {
            return res.status(404).json({ error: 'Forum not found' });
        }

        if (forum.members.includes(req.userId)) {
            return res.status(400).json({ error: 'Already a member' });
        }

        forum.members.push(req.userId);
        await forum.save();

        res.json({ message: 'Joined forum successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Leave forum
router.post('/:id/leave', auth, async (req, res) => {
    try {
        const forum = await Forum.findById(req.params.id);

        if (!forum) {
            return res.status(404).json({ error: 'Forum not found' });
        }

        forum.members = forum.members.filter(m => m.toString() !== req.userId);
        await forum.save();

        res.json({ message: 'Left forum successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create discussion
router.post('/:forumId/discussions', auth, async (req, res) => {
    try {
        const { title, content, tags } = req.body;

        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }

        const forum = await Forum.findById(req.params.forumId);
        if (!forum) {
            return res.status(404).json({ error: 'Forum not found' });
        }

        const student = await Student.findById(req.userId);

        const discussion = new Discussion({
            title,
            content,
            forumId: req.params.forumId,
            author: req.userId,
            authorName: student.name,
            tags: tags || []
        });

        await discussion.save();

        // Update forum discussion count
        forum.discussionCount = (forum.discussionCount || 0) + 1;
        forum.lastActivity = new Date();
        await forum.save();

        res.status(201).json({
            message: 'Discussion created successfully',
            discussion
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get discussion with replies
router.get('/:forumId/discussions/:discussionId', async (req, res) => {
    try {
        const discussion = await Discussion.findById(req.params.discussionId)
            .populate('author', 'name email')
            .populate('lastReplyBy', 'name');

        if (!discussion) {
            return res.status(404).json({ error: 'Discussion not found' });
        }

        // Increment view count
        discussion.views = (discussion.views || 0) + 1;
        await discussion.save();

        // Get replies
        const replies = await Reply.find({ discussionId: req.params.discussionId })
            .populate('author', 'name email')
            .sort({ isMarkedAsAnswer: -1, createdAt: 1 });

        res.json({
            discussion,
            replies
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update discussion
router.put('/:forumId/discussions/:discussionId', auth, async (req, res) => {
    try {
        const { title, content, tags } = req.body;

        const discussion = await Discussion.findById(req.params.discussionId);

        if (!discussion) {
            return res.status(404).json({ error: 'Discussion not found' });
        }

        // Only author can edit
        if (discussion.author.toString() !== req.userId) {
            return res.status(403).json({ error: 'Permission denied' });
        }

        if (title) discussion.title = title;
        if (content) discussion.content = content;
        if (tags) discussion.tags = tags;
        discussion.updatedAt = new Date();

        await discussion.save();

        res.json({
            message: 'Discussion updated successfully',
            discussion
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Reply to discussion
router.post('/:forumId/discussions/:discussionId/reply', auth, async (req, res) => {
    try {
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }

        const discussion = await Discussion.findById(req.params.discussionId);
        if (!discussion) {
            return res.status(404).json({ error: 'Discussion not found' });
        }

        if (discussion.isLocked) {
            return res.status(400).json({ error: 'Discussion is locked' });
        }

        const student = await Student.findById(req.userId);

        const reply = new Reply({
            content,
            discussionId: req.params.discussionId,
            author: req.userId,
            authorName: student.name
        });

        await reply.save();

        // Update discussion
        discussion.replyCount = (discussion.replyCount || 0) + 1;
        discussion.lastReplyAt = new Date();
        discussion.lastReplyBy = req.userId;
        await discussion.save();

        res.status(201).json({
            message: 'Reply posted successfully',
            reply
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Like discussion
router.post('/:forumId/discussions/:discussionId/like', auth, async (req, res) => {
    try {
        const discussion = await Discussion.findById(req.params.discussionId);

        if (!discussion) {
            return res.status(404).json({ error: 'Discussion not found' });
        }

        if (discussion.likes.includes(req.userId)) {
            return res.status(400).json({ error: 'Already liked' });
        }

        discussion.likes.push(req.userId);
        await discussion.save();

        res.json({ message: 'Liked successfully', likes: discussion.likes.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Like reply
router.post('/:forumId/discussions/:discussionId/replies/:replyId/like', auth, async (req, res) => {
    try {
        const reply = await Reply.findById(req.params.replyId);

        if (!reply) {
            return res.status(404).json({ error: 'Reply not found' });
        }

        if (reply.likes.includes(req.userId)) {
            return res.status(400).json({ error: 'Already liked' });
        }

        reply.likes.push(req.userId);
        await reply.save();

        res.json({ message: 'Liked successfully', likes: reply.likes.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mark reply as answer
router.post('/:forumId/discussions/:discussionId/replies/:replyId/mark-answer', auth, async (req, res) => {
    try {
        const discussion = await Discussion.findById(req.params.discussionId);

        if (!discussion) {
            return res.status(404).json({ error: 'Discussion not found' });
        }

        // Only discussion author can mark answer
        if (discussion.author.toString() !== req.userId) {
            return res.status(403).json({ error: 'Permission denied' });
        }

        // Unmark previous answer
        await Reply.updateMany(
            { discussionId: req.params.discussionId, isMarkedAsAnswer: true },
            { isMarkedAsAnswer: false }
        );

        // Mark new answer
        const reply = await Reply.findByIdAndUpdate(
            req.params.replyId,
            { isMarkedAsAnswer: true },
            { new: true }
        );

        res.json({ message: 'Marked as answer', reply });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete discussion
router.delete('/:forumId/discussions/:discussionId', auth, async (req, res) => {
    try {
        const discussion = await Discussion.findById(req.params.discussionId);

        if (!discussion) {
            return res.status(404).json({ error: 'Discussion not found' });
        }

        // Only author or admin can delete
        if (discussion.author.toString() !== req.userId) {
            return res.status(403).json({ error: 'Permission denied' });
        }

        // Delete all replies
        await Reply.deleteMany({ discussionId: req.params.discussionId });

        // Delete discussion
        await Discussion.findByIdAndDelete(req.params.discussionId);

        // Update forum
        const forum = await Forum.findById(req.params.forumId);
        if (forum) {
            forum.discussionCount = Math.max(0, forum.discussionCount - 1);
            await forum.save();
        }

        res.json({ message: 'Discussion deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
