// Force rebuild on Render - 2025-07-29
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const { Provider } = require('ltijs');
const Database = require('ltijs-sequelize');
const SQLiteStore = require('connect-sqlite3')(session);
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Uitgebreide error logging
const logError = (message, error) => {
  console.error('=== LTI ERROR ===');
  console.error(`Message: ${message}`);
  console.error(`Error: ${error.message}`);
  console.error(`Stack: ${error.stack}`);
  console.error('=== END LTI ERROR ===');
};

const logInfo = (message) => {
  console.log(`[INFO] ${new Date().toISOString()}: ${message}`);
};

const app = express();
const PORT = process.env.PORT || 3002;

// CORS configuratie
app.use(cors({
  origin: ['http://localhost:3000', 'https://scorm-wizard.onrender.com'],
  credentials: true
}));

// Session configuratie met permanente store
app.use(session({
  store: new SQLiteStore({
    db: 'sessions.sqlite',
    dir: '.'
  }),
  secret: process.env.LTI_KEY || 'your-lti-key-here',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Express middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Database configuratie - Volgens ltijs documentatie
logInfo('Initializing database configuration');
logInfo(`Database URL: ${process.env.DATABASE_URL || process.env.LTI_DATABASE_URL || './lti_database.sqlite'}`);
logInfo(`LTI_DATABASE_URL from env: ${process.env.LTI_DATABASE_URL}`);

let db, ltiDatabaseConfig;

try {
  // Eerst proberen we de database aan te maken
  db = new Database(
    'lti_database', // database name
    null, // user (null for SQLite)
    null, // password (null for SQLite)
    {
      dialect: 'sqlite',
      storage: process.env.DATABASE_URL || process.env.LTI_DATABASE_URL || './lti_database.sqlite',
      logging: false,
      retry: {
        max: 3,
        match: [
          /SQLITE_BUSY/,
          /SQLITE_LOCKED/,
        ],
        backoff: 'exponential' // or 'linear'
      }
    }
  );
  
  logInfo('ltijs-sequelize Database created successfully');
  
  // Dan maken we de configuratie object voor lti.setup
  // Volgens ltijs documentatie moet dit een object zijn met url en optioneel plugin
  ltiDatabaseConfig = {
    url: process.env.LTI_DATABASE_URL || 'sqlite://./lti_database.sqlite',
    plugin: db
  };
  
  logInfo(`ltiDatabaseConfig created with url: ${ltiDatabaseConfig.url}`);
  logInfo(`ltiDatabaseConfig plugin type: ${ltiDatabaseConfig.plugin ? typeof ltiDatabaseConfig.plugin : 'undefined'}`);
} catch (error) {
  logError('Failed to initialize database configuration', error);
  process.exit(1);
}

// LTI setup
console.log('[INFO] Starting LTI setup');
console.log('[INFO] LTI Key:', process.env.LTI_KEY);
console.log('[INFO] LTI Database URL:', process.env.LTI_DATABASE_URL);
console.log('[INFO] NODE_ENV:', process.env.NODE_ENV);

const lti = new Provider(
  process.env.LTI_KEY,
  ltiDatabaseConfig,
  {
    staticPath: path.join(__dirname, 'public'),
    cookies: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None'
    },
    dev: process.env.NODE_ENV !== 'production'
  }
);

// Health check endpoint
app.get('/lti/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'LTI server is running',
    timestamp: new Date().toISOString()
  });
});

// DEBUG: Log lti Provider object keys and structure
console.log('lti Provider keys:', Object.keys(lti));
console.log('lti Provider:', lti);

// DEBUG: Log JWKS method detection
console.log('lti.getPlatformJwks:', typeof lti.getPlatformJwks);
console.log('lti.getJwks:', typeof lti.getJwks);

// JWKS endpoint (root) - custom implementation using lti_public.pem
const fs = require('fs');
const jose = require('node-jose');

app.get('/.well-known/jwks.json', async (req, res) => {
  try {
    const pubKeyPem = fs.readFileSync(path.join(__dirname, 'lti_public.pem'), 'utf8');
    const key = await jose.JWK.asKey(pubKeyPem, 'pem');
    const jwks = { keys: [key.toJSON()] };
    res.json(jwks);
  } catch (err) {
    logError('Failed to serve JWKS', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

// JWKS endpoint (onder /lti) - custom implementation using lti_public.pem
app.get('/lti/.well-known/jwks.json', async (req, res) => {
  try {
    const pubKeyPem = fs.readFileSync(path.join(__dirname, 'lti_public.pem'), 'utf8');
    const key = await jose.JWK.asKey(pubKeyPem, 'pem');
    const jwks = { keys: [key.toJSON()] };
    res.json(jwks);
  } catch (err) {
    logError('Failed to serve JWKS', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

// LTI launch endpoint
lti.onConnect((token, req, res) => {
  console.log('LTI launch successful:', {
    user: token.userInfo,
    context: token.context,
    roles: token.roles
  });
  
  const frontendUrl = process.env.NODE_ENV === 'production' 
    ? 'https://scorm-wizard.onrender.com' 
    : 'http://localhost:3000';
  
  res.redirect(`${frontendUrl}/dashboard?lti=success`);
});

// Error handling
// Gebruik algemene error handling in plaats van lti.onError
app.use((error, req, res, next) => {
  logError('Unhandled error', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
});

// Static files
app.use(express.static(path.join(__dirname, 'dist')));

// Catch all voor frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start de server
logInfo(`Attempting to start server on port ${PORT}`);

const server = app.listen(PORT, () => {
  logInfo(`SCORM Wizard LTI server draait op poort ${PORT}`);
  logInfo(`Health check: http://localhost:${PORT}/lti/health`);
  logInfo(`JWKS endpoint: http://localhost:${PORT}/lti/.well-known/jwks.json`);
  
  // Deploy LTI after server start (class-based v5.x)
  lti.deploy(app, { serverless: false }).then(() => {
    logInfo('LTI server deployed successfully');
  }).catch(error => {
    logError('Failed to deploy LTI server', error);
    process.exit(1);
  });
}).on('error', (error) => {
  logError('Failed to start server', error);
  process.exit(1);
});