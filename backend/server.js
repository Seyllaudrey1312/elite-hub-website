// server.js - Elite Hub Backend Server
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://ascendlife38_db_user:CsevQagYwpZo3cRs@cluster0.jandejn.mongodb.net/?appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connected successfully');
}).catch(err => {
    console.log('MongoDB connection error:', err);
});

// Routes
app.get('/api', (req, res) => {
    res.json({ message: 'Elite Hub API Server', version: '1.0.0' });
});

// Auth Routes
app.use('/api/auth', require('./routes/auth'));

// Student Routes
app.use('/api/students', require('./routes/students'));

// Subject Routes
app.use('/api/subjects', require('./routes/subjects'));

// Quiz Routes
app.use('/api/quizzes', require('./routes/quizzes'));

// Assignment Routes
app.use('/api/assignments', require('./routes/assignments'));

// Resource Routes
app.use('/api/resources', require('./routes/resources'));

// Announcement Routes
app.use('/api/announcements', require('./routes/announcements'));

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Elite Hub server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
