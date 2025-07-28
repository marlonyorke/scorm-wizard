# LTI 1.3 Integration Setup Guide

## Overview
This guide explains how to set up LTI 1.3 integration between SCORM Wizard and Moodle.

## Prerequisites

### Required Software
- Node.js 16+ with npm
- Moodle 3.10+ or any LTI 1.3 compliant platform
- HTTPS endpoint (ngrok for local development)

### Required Environment Variables
```bash
# LTI Configuration
LTI_CLIENT_ID=your-lti-client-id
LTI_DEPLOYMENT_ID=your-deployment-id
MOODLE_URL=https://your-moodle-instance.com
BASE_URL=https://your-ngrok-url.ngrok.io
FRONTEND_URL=https://your-ngrok-url.ngrok.io
LTI_DATABASE_PATH=./database.sqlite

# Security
JWT_SECRET=your-jwt-secret-key
CSRF_SECRET=your-csrf-secret

# Database (if using database storage)
DATABASE_URL=your-database-connection-string
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install ltijs express cors helmet express-rate-limit
```

### 2. Configure ngrok (Local Development)
```bash
# Install ngrok
npm install -g ngrok

# Start ngrok for HTTPS tunnel
ngrok http 3002

# Note: The URL will change on restart
# Copy the HTTPS URL for configuration
```

### 3. Configure Moodle

#### In Moodle as Administrator:
1. Go to **Site Administration → Plugins → Activity modules → External tool**
2. Click **"Add external tool"**
3. Fill in the configuration:

**Tool Settings:**
- **Tool name:** SCORM Wizard
- **Tool URL:** `https://your-ngrok-url.ngrok.io/lti/launch`
- **Consumer key:** `scorm-wizard-key`
- **Shared secret:** `scorm-wizard-secret`
- **LTI version:** LTI 1.3

**LTI 1.3 Settings:**
- **Client ID:** `scorm-wizard-client`
- **Initiate login URL:** `https://your-ngrok-url.ngrok.io/lti/auth`
- **Redirection URI(s):**
  - `https://your-ngrok-url.ngrok.io/lti/launch`
  - `https://your-ngrok-url.ngrok.io/lti/auth`
- **Public keyset URL:** `https://your-ngrok-url.ngrok.io/.well-known/jwks.json`

### 4. Environment Configuration

Create or update `.env` file:
```bash
# LTI Configuration
LTI_CLIENT_ID=scorm-wizard-client
LTI_DEPLOYMENT_ID=deployment-1
MOODLE_URL=https://your-moodle-instance.com
BASE_URL=https://your-ngrok-url.ngrok.io
FRONTEND_URL=https://your-ngrok-url.ngrok.io
LTI_DATABASE_PATH=./database.sqlite

# Security
JWT_SECRET=your-super-secret-jwt-key
CSRF_SECRET=your-super-secret-csrf-key

# Server
PORT=3002
NODE_ENV=development
```

### 5. Start the Application

```bash
# Start with LTI support
node server.lti.js

# Or with the main server
npm run dev
```

### 6. Test LTI Launch

#### In Moodle as Instructor:
1. Go to your course
2. Click **"Add activity or resource"**
3. Choose **"External tool"**
4. Select **"SCORM Wizard"** from the list
5. Configure and save

#### As Student:
1. Go to the course
2. Click the **SCORM Wizard** link
3. The application should open with your user data

## Security Best Practices

### 1. Environment Variables
- **Never commit secrets to git**
- Use `.env` files for all sensitive data
- Rotate keys regularly

### 2. HTTPS Requirements
- **LTI 1.3 requires HTTPS**
- Use ngrok for local development
- Use proper SSL certificates for production

### 3. Rate Limiting
- All LTI endpoints have rate limiting enabled
- Monitor and adjust limits as needed

### 4. CORS Configuration
- Configure CORS for your Moodle instance
- Restrict origins to known domains

## Troubleshooting

### Common Issues

#### 1. "Invalid LTI Launch"
- Check HTTPS configuration
- Verify client ID and deployment ID
- Ensure proper CORS settings

#### 2. "Access Denied"
- Check user permissions in Moodle
- Verify LTI tool registration
- Check JWT token validation

#### 3. URL Changes (ngrok)
- **⚠️ WARNING:** Free ngrok URLs change on restart
- Update Moodle configuration after each restart
- Consider stable alternatives for development

#### 4. JWKS Endpoint Issues
- Ensure JWKS URL is accessible
- Verify key rotation is working
- Check keyset format

### Debug Commands
```bash
# Check LTI health
curl https://your-ngrok-url.ngrok.io/lti/health

# Check JWKS endpoint
curl https://your-ngrok-url.ngrok.io/.well-known/jwks.json

# Check LTI configuration
curl https://your-ngrok-url.ngrok.io/lti/config
```

## Production Deployment

### 1. Stable Domain
- Use a stable domain (not ngrok)
- Configure proper SSL certificates
- Set up DNS records

### 2. Environment Variables
```bash
# Production settings
NODE_ENV=production
MOODLE_URL=https://your-production-moodle.com
BASE_URL=https://your-stable-domain.com
FRONTEND_URL=https://your-stable-domain.com
```

### 3. Monitoring
- Set up logging for LTI launches
- Monitor error rates
- Set up alerts for failures

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review logs in `logs/lti.log`
3. Test with the provided debug commands
4. Consult the LTI 1.3 specification documentation

## Next Steps

1. Test the integration thoroughly
2. Document any customizations
3. Train users on the new workflow
4. Monitor performance and usage
