/**
 * LTI 1.3 Tool Provider Implementation
 * Integrates SCORM Wizard with Moodle via LTI 1.3
 */

const express = require('express');
const LTI = require('ltijs');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const logger = {
  info: (msg, data) => console.log('[LTI]', msg, data || ''),
  warn: (msg, data) => console.warn('[LTI]', msg, data || ''),
  error: (msg, data) => console.error('[LTI]', msg, data || '')
};

const ltiConfig = {
  appRoute: '/lti',
  loginRoute: '/lti/auth',
  keysetRoute: '/.well-known/jwks.json',
  dynRegRoute: '/register',
  tokenRoute: '/token',
  sessionTimeout: 60000,
  devMode: process.env.NODE_ENV === 'development'
};

// Debug logging
console.log('=== LTI DEBUG INFO ===');
console.log('LTI_DATABASE_URL:', process.env.LTI_DATABASE_URL);
console.log('LTI_CLIENT_ID:', process.env.LTI_CLIENT_ID);
console.log('MOODLE_URL:', process.env.MOODLE_URL);
console.log('BASE_URL:', process.env.BASE_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('=== END DEBUG ===');

// Initialize Express app
const app = express();

// Initialize LTI provider
const dbConfig = { url: process.env.LTI_DATABASE_URL || ':memory:' };
const encryptionKey = process.env.LTI_ENCRYPTION_KEY || 'supersecret';
const lti = LTI.Provider.setup(encryptionKey, dbConfig, ltiConfig);

// Apply middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      frameAncestors: ["'self'", process.env.MOODLE_URL || 'https://localhost']
    }
  }
}));

const corsOptions = {
  origin: [
    process.env.MOODLE_URL || 'https://localhost',
    process.env.FRONTEND_URL || 'http://localhost:8082'
  ],
  credentials: true
};

app.use(cors(corsOptions));

const ltiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many LTI requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/lti', ltiRateLimit);

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error('LTI middleware error', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method
  });
  
  if (req.path.startsWith('/lti')) {
    res.status(500).json({
      error: 'LTI processing failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  } else {
    next(error);
  }
});

// LTI Launch Handler
lti.onConnect((token, req, res) => {
  try {
    // Extract user data from LTI launch
    const userData = {
      id: token.user,
      name: token.userInfo?.name || 'Anonymous',
      email: token.userInfo?.email || '',
      role: token.roles?.[0] || 'Learner',
      context: {
        id: token.context?.id || '',
        title: token.context?.title || '',
        label: token.context?.label || ''
      },
      course: {
        id: token.context?.id || '',
        title: token.context?.title || ''
      },
      resource: {
        id: token.resource?.id || '',
        title: token.resource?.title || ''
      }
    };

    logger.info('LTI launch successful', {
      user: userData.id,
      context: userData.context.id,
      resource: userData.resource.id
    });

    // Store user data in session
    req.session.userData = userData;
    req.session.ltiToken = token;

    // Redirect to frontend with user data
    const frontendUrl = `${process.env.FRONTEND_URL || 'http://localhost:8082'}/lti?` + 
      `user=${encodeURIComponent(JSON.stringify(userData))}`;
    
    res.redirect(frontendUrl);

  } catch (error) {
    logger.error('LTI launch failed', { error: error.message });
    res.redirect('/lti-error?reason=launch_failed');
  }
});

// JWKS endpoint
lti.app.get('/.well-known/jwks.json', (req, res) => {
  lti.keyset((err, keyset) => {
    if (err) {
      logger.error('JWKS endpoint error', { error: err.message });
      res.status(500).json({ error: 'JWKS generation failed' });
    } else {
      console.log(' JWKS endpoint accessed:', keyset);
      res.json(keyset);
    }
  });
});

// Health check for LTI service
lti.app.get('/lti/health', (req, res) => {
  logger.info('LTI health check initiated', {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    referer: req.get('Referer')
  });
  res.json({ 
    status: 'healthy', 
    service: 'lti',
    timestamp: new Date().toISOString()
  });
});

// LTI launch endpoint
lti.app.post('/lti/launch', (req, res) => {
  logger.info('LTI launch initiated', {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    referer: req.get('Referer')
  });
});

// LTI configuration endpoint
lti.app.get('/lti/config', (req, res) => {
  res.json({
    version: '1.3.0',
    endpoints: {
      launch: `${process.env.BASE_URL}/lti/launch`,
      auth: `${process.env.BASE_URL}/lti/auth`,
      jwks: `${process.env.BASE_URL}/.well-known/jwks.json`,
      health: `${process.env.BASE_URL}/lti/health`
    },
    configuration: {
      clientId: process.env.LTI_CLIENT_ID,
      deploymentId: process.env.LTI_DEPLOYMENT_ID,
      platform: process.env.MOODLE_URL
    }
  });
});

module.exports = { lti, ltiConfig };
