const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const lti = require('ltijs').Provider; // Provider is al een instantie, geen constructor
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
  
  // Log alleen de relevante velden van ltiDatabaseConfig om circulaire referenties te vermijden
  logInfo(`ltiDatabaseConfig created with url: ${ltiDatabaseConfig.url}`);
  logInfo(`ltiDatabaseConfig plugin type: ${ltiDatabaseConfig.plugin ? typeof ltiDatabaseConfig.plugin : 'undefined'}`);
} catch (error) {
  logError('Failed to initialize database configuration', error);
  process.exit(1);
}

// LTI setup
// Gebruik de geïmporteerde lti (Provider class) direct
logInfo('Starting LTI setup');

// Check environment variables
if (!process.env.LTI_KEY) {
  logInfo('WARNING: LTI_KEY not set, using default - this is insecure for production');
}
logInfo(`LTI Key: ${process.env.LTI_KEY || 'your-lti-key-here'}`);
logInfo(`LTI Database URL: ${process.env.LTI_DATABASE_URL || 'sqlite://./lti_database.sqlite'}`);
logInfo(`NODE_ENV: ${process.env.NODE_ENV}`);

try {
  lti.setup(
    process.env.LTI_KEY || 'your-lti-key-here',
    ltiDatabaseConfig, // Gebruik correcte database configuratie
    {
      cors: {
        enabled: true,
        methods: ['GET', 'POST'],
        origin: ['http://localhost:3000', 'https://scorm-wizard.onrender.com'],
        credentials: true
      },
      cookies: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
      }
    }
  );
  logInfo('LTI setup completed successfully');
} catch (error) {
  logError('Failed to setup LTI', error);
  process.exit(1);
}

// Health check endpoint
app.get('/lti/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'LTI server is running',
    timestamp: new Date().toISOString()
  });
});

// JWKS endpoint
app.get('/.well-known/jwks.json', (req, res) => {
  const jwks = lti.getJWKS();
  res.json(jwks);
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
  
  // Deploy LTI after server start
  lti.deploy(app).then(() => {
    logInfo('LTI server deployed successfully');
  }).catch(error => {
    logError('Failed to deploy LTI server', error);
    process.exit(1);
  });
}).on('error', (error) => {
  logError('Failed to start server', error);
  process.exit(1);
});