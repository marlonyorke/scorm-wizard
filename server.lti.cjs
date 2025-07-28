const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const { Provider } = require('ltijs');
const Database = require('ltijs-sequelize');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

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

// Database configuratie
const dbUrl = process.env.LTI_DATABASE_URL || 'sqlite://./database.sqlite';
const db = new Database(dbUrl, {
  dialect: 'sqlite',
  logging: false,
});

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
