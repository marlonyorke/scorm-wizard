# Successful SCORM Wizard LTI Deployment Guide

This document serves as a guide for successfully deploying the SCORM Wizard LTI application, documenting the issues encountered and solutions implemented.

## Deployment Issues Encountered

### 1. "Provider is not a constructor" Error

**Problem**: The application was trying to instantiate the LTI Provider as a class, but in ltijs 5.x, Provider is already an instance, not a constructor.

**Error Message**:
```
TypeError: Provider is not a constructor
```

**Solution**:
- Changed the import from `const { Provider } = require('ltijs');` to `const lti = require('ltijs').Provider;`
- Removed the `new Provider()` instantiation since `lti` is already an instance

### 2. "MISSING_DATABASE_CONFIG" Error

**Problem**: The database configuration object passed to `lti.setup()` was not in the expected format. ltijs requires a specific structure with `url` and optional `plugin` fields.

**Error Message**:
```
Error: MISSING_DATABASE_CONFIG
```

**Solution**:
- Restructured the database configuration to include both `url` and `plugin` fields
- Used the correct format: `{ url: 'sqlite://./lti_database.sqlite', plugin: db }`

### 3. Circular JSON Error in Logging

**Problem**: Attempting to log the Sequelize database object directly caused a circular reference error.

**Error Message**:
```
TypeError: Converting circular structure to JSON
```

**Solution**:
- Modified logging to only output specific fields instead of the entire object
- Used: `logInfo(`ltiDatabaseConfig created with url: ${ltiDatabaseConfig.url}`);`

### 4. LTI Error Handler Issue

**Problem**: Using `lti.onError()` resulted in a "not a function" error because the method doesn't exist in the current ltijs version.

**Error Message**:
```
TypeError: lti.onError is not a function
```

**Solution**:
- Replaced with a generic Express error handler middleware
- Used `app.use((error, req, res, next) => { ... });`

## Key Configuration Requirements

### Environment Variables

Ensure these are set in your deployment environment:

```env
LTI_KEY=your-secure-lti-key-here
LTI_DATABASE_URL=sqlite://./lti_database.sqlite
SESSION_SECRET=your-session-secret-here
NODE_ENV=production
```

### Database Configuration

The database configuration must follow this exact structure:

```javascript
const db = new Database(
  'lti_database',
  null, // user
  null, // password
  {
    dialect: 'sqlite',
    storage: process.env.LTI_DATABASE_URL || './lti_database.sqlite',
    logging: false
  }
);

const ltiDatabaseConfig = {
  url: process.env.LTI_DATABASE_URL || 'sqlite://./lti_database.sqlite',
  plugin: db
};
```

## Deployment Steps

1. **Verify Environment Variables**
   - Ensure all required environment variables are set
   - Check that `LTI_KEY` is properly configured for security

2. **Check Import Statements**
   - Use `const lti = require('ltijs').Provider;` (no destructuring)
   - Do not instantiate with `new Provider()`

3. **Validate Database Configuration**
   - Ensure the database config object has both `url` and `plugin` fields
   - Verify the database URL format is correct

4. **Server Startup Sequence**
   ```javascript
   const server = app.listen(PORT, () => {
     // Start LTI deployment after server is listening
     lti.deploy(app).then(() => {
       console.log('LTI server deployed successfully');
     }).catch(error => {
       console.error('Failed to deploy LTI server:', error);
       process.exit(1);
     });
   }).on('error', (error) => {
     console.error('Failed to start server:', error);
     process.exit(1);
   });
   ```

5. **Error Handling**
   - Use generic Express error middleware instead of `lti.onError()`
   - Implement proper logging without circular references

## Common Deployment Checklist

- [ ] Environment variables properly configured
- [ ] Correct ltijs Provider import (no `new` keyword)
- [ ] Database configuration with `url` and `plugin` fields
- [ ] No circular JSON logging
- [ ] Proper error handling middleware
- [ ] Server startup sequence with `lti.deploy()` after `app.listen()`
- [ ] Husky pre-commit hooks properly configured
- [ ] Large binaries and placeholder files removed from repository
- [ ] README.md present with clear deployment instructions

## Troubleshooting Tips

1. **Check Render Logs**: Use Render's log viewer to see detailed error messages
2. **Verify Environment Variables**: Ensure all required variables are set in the Render dashboard
3. **Test Locally First**: Run the application locally to catch configuration issues before deployment
4. **Use Explicit Error Logging**: Add detailed logging to identify exactly where failures occur

## Successful Deployment Configuration

The final working configuration in `server.lti.cjs`:

```javascript
const lti = require('ltijs').Provider; // Provider is already an instance

// Database setup
const db = new Database(
  'lti_database',
  null,
  null,
  {
    dialect: 'sqlite',
    storage: process.env.LTI_DATABASE_URL || './lti_database.sqlite',
    logging: false
  }
);

const ltiDatabaseConfig = {
  url: process.env.LTI_DATABASE_URL || 'sqlite://./lti_database.sqlite',
  plugin: db
};

// LTI setup
lti.setup(
  process.env.LTI_KEY || 'your-lti-key-here',
  ltiDatabaseConfig, // Correct configuration object
  {
    // LTI options
  }
);

// Generic error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Server startup
const server = app.listen(PORT, () => {
  lti.deploy(app).then(() => {
    console.log('LTI server deployed successfully');
  }).catch(error => {
    console.error('Failed to deploy LTI server:', error);
    process.exit(1);
  });
}).on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
```

This configuration has been tested and successfully deploys on Render.
