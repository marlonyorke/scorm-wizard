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

// Route rewrite middleware voor LTI login
// Herschrijft /lti/login naar /login zodat ltijs het kan verwerken
app.use((req, res, next) => {
  if (req.path === '/lti/login' && req.method === 'POST') {
    console.log('Route rewrite: /lti/login -> /login');
    req.originalUrl = req.originalUrl.replace('/lti/login', '/login');
    req.url = req.url.replace('/lti/login', '/login');
  }
  next();
});

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
// *** DEBUG ROUTES - HIGHEST PRIORITY ***
app.get('/lti-debug', (req, res) => {
  // Respond with text instead of JSON to avoid middleware interference
  res.setHeader('Content-Type', 'text/plain');
  
  try {
    // Generate route info
    const routes = app._router.stack
      .filter(layer => layer.route)
      .map(layer => ({
        path: layer.route.path,
        methods: Object.keys(layer.route.methods)
      }));
      
    res.send(`LTI Debug Response: ${JSON.stringify({
      status: 'ok',
      message: 'LTI debug endpoint accessible',
      routes: routes,
      middleware: app._router.stack.length,
      timestamp: new Date().toISOString()
    }, null, 2)}`);
  } catch (err) {
    res.send(`Error generating debug info: ${err.message}\n${err.stack}`);
  }
});

// Direct file serving route with highest priority
app.get('/lti-test.html', (req, res) => {
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>LTI Debug Test</title>
    <style>body { font-family: Arial; }</style>
  </head>
  <body>
    <h1>LTI Debug Test Page</h1>
    <p>If you can see this page, direct routes are working.</p>
    <p>Server time: ${new Date().toISOString()}</p>
  </body>
  </html>
  `;
  res.send(html);
});

// *** END DEBUG ROUTES ***

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
    dev: process.env.NODE_ENV !== 'production',
    // Routes met /lti prefix voor Moodle compatibiliteit
    appRoute: '/lti',
    loginRoute: '/lti/login',
    keysetRoute: '/lti/keys', 
    // Routes met /lti prefix voor Moodle compatibiliteit
    sessionTimeoutRoute: '/lti/sessionTimeout',
    invalidTokenRoute: '/lti/invalidToken'
  }
);

// Custom debug route voor LTI login - voor diagnostiek
app.get('/lti/debug', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'LTI debug endpoint is accessible',
    routes: app._router.stack.filter(r => r.route).map(r => ({ 
      path: r.route.path, 
      methods: Object.keys(r.route.methods) 
    })),
    timestamp: new Date().toISOString()
  });
});

// Handmatige LTI login route is nu verwijderd om ltijs handler te laten werken
// De LTI login route wordt nu afgehandeld door ltijs op '/lti/login'

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
  
  // Create URL parameters with LTI data
  const params = new URLSearchParams({
    lti: 'success',
    user: token.userInfo?.name || 'unknown',
    email: token.userInfo?.email || '',
    context: token.context?.title || 'unknown',
    contextId: token.context?.id || '',
    roles: token.roles?.join(',') || ''
  });
  
  const frontendUrl = process.env.NODE_ENV === 'production' 
    ? 'https://scorm-wizard.onrender.com' 
    : 'http://localhost:3000';
  
  res.redirect(`${frontendUrl}/dashboard?${params.toString()}`);
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

// DIRECTE TOEGANG TOT APP/DASHBOARD
app.all('/lti/login', (req, res) => {
  // URL voor directe toegang tot frontend
  const frontendUrl = process.env.NODE_ENV === 'production' 
    ? 'https://scorm-wizard.onrender.com' 
    : 'http://localhost:3000';
  
  // Dummy test data voor de frontend
  const params = new URLSearchParams({
    bypass: 'true',
    directAccess: 'true',
    user: 'Test User',
    context: 'Test Course',
    roles: 'Instructor'
  });
  
  console.log('Directe toegang tot dashboard/app');
  // Direct naar de frontend/dashboard
  res.redirect(`${frontendUrl}/dashboard?${params.toString()}`);
});

// Directe route naar dashboard zonder LTI (voor testen)
app.get('/dashboard-direct', (req, res) => {
  // URL voor directe toegang tot frontend
  const frontendUrl = process.env.NODE_ENV === 'production' 
    ? 'https://scorm-wizard.onrender.com' 
    : 'http://localhost:3000';
  
  console.log('Direct naar dashboard zonder LTI');
  res.redirect(`${frontendUrl}/dashboard?bypass=true&test=true`);
});

// Start de server na LTI deploy
lti.deploy(app, { serverless: true })
  .then(() => {
    logInfo('LTI server deployed successfully');
    logInfo('LTI routes geregistreerd met prefixes. login: /lti/login -> /login');
    
    // EXPLICIETE LTI LOGIN HANDLER
    // Deze handler wordt aangeroepen na route rewrite van /lti/login naar /login
    app.post('/login', async (req, res, next) => {
      console.log('=== LTI LOGIN HANDLER AANGEROEPEN ===');
      console.log('Request headers:', req.headers);
      console.log('Request body keys:', Object.keys(req.body || {}));
      console.log('Request URL:', req.url);
      console.log('Original URL:', req.originalUrl);
      
      try {
        console.log('Probeer lti.login aan te roepen...');
        // Gebruik ltijs login methode direct
        if (typeof lti.login === 'function') {
          console.log('lti.login is beschikbaar, aanroepen...');
          await lti.login(req, res, next);
          console.log('lti.login succesvol aangeroepen');
        } else {
          console.error('lti.login is GEEN functie! Type:', typeof lti.login);
          console.error('Beschikbare lti methoden:', Object.keys(lti));
          throw new Error('lti.login methode niet beschikbaar');
        }
      } catch (err) {
        console.error('=== LTI LOGIN ERROR ===');
        console.error('Fout in LTI login handler:', err.message);
        console.error('Fout stack:', err.stack);
        console.error('Request details:', {
          method: req.method,
          url: req.url,
          headers: req.headers,
          bodyKeys: req.body ? Object.keys(req.body) : 'no body'
        });
        console.error('=== EINDE LTI LOGIN ERROR ===');
        next(err);
      }
    });
    
    // Static files (after LTI routes)
    app.use(express.static(path.join(__dirname, 'dist')));
    
    // Catch all voor frontend (after LTI routes)
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
    
    const server = app.listen(PORT, () => {
      logInfo(`SCORM Wizard LTI server draait op poort ${PORT}`);
      logInfo(`Health check: http://localhost:${PORT}/lti/health`);
      logInfo(`JWKS endpoint: http://localhost:${PORT}/lti/.well-known/jwks.json`);
    });
    server.on('error', (error) => {
      logError('Failed to start server', error);
      process.exit(1);
    });
  })
  .catch(error => {
    logError('Failed to deploy LTI server', error);
    process.exit(1);
  });

// ALGEMENE EXPRESS ERROR HANDLER
// Vangt alle onafgehandelde fouten op
app.use((err, req, res, next) => {
  console.error('=== UNHANDLED EXPRESS ERROR ===');
  console.error('Error message:', err.message);
  console.error('Error stack:', err.stack);
  console.error('Request details:', {
    method: req.method,
    url: req.url,
    originalUrl: req.originalUrl,
    headers: req.headers,
    bodyKeys: req.body ? Object.keys(req.body) : 'no body',
    params: req.params,
    query: req.query
  });
  console.error('Response details:', {
    statusCode: res.statusCode,
    headersSent: res.headersSent
  });
  console.error('=== EINDE UNHANDLED EXPRESS ERROR ===');
  
  // Stuur alleen een generieke foutmelding naar de client
  if (!res.headersSent) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Er is een fout opgetreden bij het verwerken van uw verzoek',
      timestamp: new Date().toISOString()
    });
  }
});