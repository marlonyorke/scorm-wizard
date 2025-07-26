const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');

// Rate limiting configuratie
const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => rateLimit({
  windowMs,
  max,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(windowMs / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Specifieke rate limiters voor verschillende endpoints
const apiLimiter = createRateLimiter(15 * 60 * 1000, 100); // 100 requests per 15 min
const authLimiter = createRateLimiter(15 * 60 * 1000, 5);   // 5 login attempts per 15 min
const generalLimiter = createRateLimiter(15 * 60 * 1000, 50); // 50 requests per 15 min

// CORS configuratie met CSRF bescherming
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:8082',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining'],
};

// Security middleware setup
const setupSecurity = (app) => {
  // Helmet voor beveiligingsheaders
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:8082'],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // CORS met CSRF bescherming
  app.use(cors(corsOptions));

  // Rate limiting per endpoint type
  app.use('/api/auth', authLimiter);
  app.use('/api', apiLimiter);
  app.use('/', generalLimiter);

  // CSRF token middleware
  app.use((req, res, next) => {
    // Genereer CSRF token voor niet-GET requests
    if (req.method !== 'GET') {
      const csrfToken = req.headers['x-csrf-token'] || req.body._csrf;
      const sessionToken = req.session?.csrfToken;
      
      if (!csrfToken || csrfToken !== sessionToken) {
        return res.status(403).json({ error: 'CSRF token invalid or missing' });
      }
    }
    next();
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0',
    });
  });

  // API versioning
  app.use('/api/v1', require('./routes/v1'));
  
  // Fallback voor niet-gevonden endpoints
  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
  });

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error('Security error:', err);
    res.status(500).json({ error: 'Internal server error' });
  });
};

module.exports = { setupSecurity, createRateLimiter };
