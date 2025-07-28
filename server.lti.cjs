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
  secret: process.env.LTI_KEY || 'default-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 uur
  }
}));

// Express middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Database configuratie
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'scormwizard',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 3306,
  dialect: process.env.DB_DIALECT || 'sqlite',
  storage: process.env.DB_STORAGE || './database.sqlite'
};

// LTI configuratie
const ltiConfig = {
  plugin: new Database('database.sqlite'),
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
};

// LTI setup
const lti = Provider;

// Singleton pattern
if (!global.ltiProvider) {
  global.ltiProvider = lti;
}

// Setup LTI routes
lti.setup(
  process.env.LTI_KEY || 'your-lti-key-here',
  ltiConfig.plugin,
  ltiConfig
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
  
  // Redirect naar frontend
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

// Static files voor frontend
app.use(express.static(path.join(__dirname, 'dist')));

// Catch all voor frontend routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// LTI deploy
lti.deploy(app).then(() => {
  console.log('LTI server deployed successfully');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/lti/health`);
    console.log(`JWKS endpoint: http://localhost:${PORT}/.well-known/jwks.json`);
  });
}).catch(error => {
  console.error('Failed to deploy LTI server:', error);
  process.exit(1);
});
