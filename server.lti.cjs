const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const { Provider } = require('ltijs');
const Database = require('ltijs-sequelize');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Debug logging
console.log('=== LTI SERVER STARTUP DEBUG ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', PORT);
console.log('LTI_KEY exists:', !!process.env.LTI_KEY);
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('LTI_DATABASE_URL:', process.env.LTI_DATABASE_URL);

// Environment variable validation
if (!process.env.LTI_KEY) {
  console.warn('WARNING: LTI_KEY not set, using default');
}

if (!process.env.DATABASE_URL && !process.env.LTI_DATABASE_URL) {
  console.warn('WARNING: No database URL found, using default sqlite file');
}

console.log('=== END DEBUG ===');

// CORS configuratie
app.use(cors({
  origin: ['http://localhost:3000', 'https://scorm-wizard.onrender.com'],
  credentials: true
}));

// Session configuratie
app.use(session({
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

// Database configuratie - Verbeterd voor Render
console.log('=== DATABASE CONFIG DEBUG ===');
console.log('Process env keys:', Object.keys(process.env).filter(key => key.includes('DATABASE') || key.includes('DB')));

// Render-specifieke database configuratie
const dbConfig = {
  dialect: 'sqlite',
  storage: process.env.DATABASE_URL || process.env.LTI_DATABASE_URL || './database.sqlite',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  // Add explicit dialect configuration to prevent Sequelize errors
  dialectOptions: {
    // SQLite specific options
  }
};

console.log('Database config:', dbConfig);

let db;
try {
  db = new Database(dbConfig);
  console.log('Database initialized successfully');
} catch (dbError) {
  console.error('Database initialization failed:', dbError);
  process.exit(1);
}

// LTI setup
const lti = Provider;

// Setup LTI routes
lti.setup(
  process.env.LTI_KEY || 'your-lti-key-here',
  db,
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
lti.onError((req, res, error) => {
  console.error('LTI Error:', error);
  res.status(500).json({ 
    error: 'LTI launch failed',
    message: error.message 
  });
});

// Static files
app.use(express.static(path.join(__dirname, 'dist')));

// Catch all voor frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
lti.deploy(app).then(() => {
  console.log('LTI server deployed successfully');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(error => {
  console.error('Failed to deploy LTI server:', error);
  process.exit(1);
});