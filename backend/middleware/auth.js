// middleware/auth.js - JWT Verification Middleware
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'No token provided. Access denied.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.userId = decoded.id;
        req.userEmail = decoded.email;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token has expired' });
        }
        res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = auth;
