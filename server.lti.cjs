/**
 * LTI 1.3 Tool Provider Implementation
 * Integrates SCORM Wizard with Moodle via LTI 1.3
 */

const LTI = require('ltijs');
const helmet = require('helmet');
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

// Singleton pattern - ensure single initialization
let lti;
if (!global.__ltiProvider) {
  try {
    const dbConfig = { url: process.env.LTI_DATABASE_URL || ':memory:' };
    const encryptionKey = process.env.LTI_ENCRYPTION_KEY || 'supersecret';
    global.__ltiProvider = LTI.Provider.setup(encryptionKey, dbConfig, ltiConfig);
    console.log('✅ LTI Provider initialized successfully');
    lti = global.__ltiProvider;
  } catch (error) {
    logger.error('LTI Provider initialization failed', { error: error.message });
    throw error;
  }
} else {
  console.log('ℹ️ Reusing existing LTI Provider instance');
  lti = global.__ltiProvider;
}

if (!lti) {
  throw new Error('LTI provider is not available');
}

// Apply helmet middleware
lti.app.use(helmet());

// Error handling (version-agnostic)
const errorHandler = (req, res, error) => {
  logger.error('LTI Error', { error: error.message, stack: error.stack });
  let errorPage = '/lti-error';
  if (error.message.includes('invalid')) {
    errorPage += '?reason=invalid_launch';
  } else if (error.message.includes('unauthorized')) {
    errorPage += '?reason=unauthorized';
  } else if (error.message.includes('expired')) {
    errorPage += '?reason=expired_token';
  } else {
    errorPage += '?reason=generic_error';
  }
  res.redirect(errorPage);
};

if (typeof lti.onError === 'function') {
  lti.onError(errorHandler);
} else if (typeof lti.on === 'function') {
  lti.on('error', errorHandler);
}

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
  try {
    const keyset = lti.keyset();
    console.log('📡 JWKS endpoint accessed:', keyset);
    res.json(keyset);
  } catch (error) {
    logger.error('JWKS endpoint error', { error: error.message });
    res.status(500).json({ error: 'JWKS generation failed' });
  }
});

// Health check for LTI service
lti.app.get('/lti/health', (req, res) => {
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

// Security middleware
lti.app.use(helmet({
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

lti.app.use(cors({
  origin: [
    process.env.MOODLE_URL || 'https://localhost',
    process.env.FRONTEND_URL || 'http://localhost:8082'
  ],
  credentials: true
}));

// Rate limiting for LTI endpoints
const ltiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many LTI requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

lti.app.use('/lti', ltiRateLimit);

// Error handling middleware
lti.app.use((error, req, res, next) => {
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

module.exports = { lti, ltiConfig };
