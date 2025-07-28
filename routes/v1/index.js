const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const scormRoutes = require('./scorm');
const userRoutes = require('./users');

// API v1 routes
router.use('/auth', authRoutes);
router.use('/scorm', scormRoutes);
router.use('/users', userRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'SCORM Wizard API v1',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      scorm: '/api/v1/scorm',
      users: '/api/v1/users',
      health: '/health'
    },
    documentation: 'https://github.com/your-repo/scorm-wizard#api'
  });
});

module.exports = router;
