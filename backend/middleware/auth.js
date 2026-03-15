// middleware/auth.js - JWT Verification Middleware
const jwt = require('jsonwebtoken');

// General auth — attaches userId, userEmail, userRole to req
const auth = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'No token provided. Access denied.' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.userId    = decoded.id;
        req.userEmail = decoded.email;
        req.userRole  = decoded.role || 'student';
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') return res.status(401).json({ error: 'Token has expired' });
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Tutor or admin only
const tutorAuth = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'No token provided.' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.userId    = decoded.id;
        req.userEmail = decoded.email;
        req.userRole  = decoded.role || 'student';

        if (!['tutor', 'admin', 'superadmin'].includes(req.userRole)) {
            return res.status(403).json({ error: 'Tutor or admin access required' });
        }
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') return res.status(401).json({ error: 'Token has expired' });
        res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = auth;
module.exports.tutorAuth = tutorAuth;
