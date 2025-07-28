# API Service Setup for SCORM Wizard

## Overview
This document provides instructions for setting up and testing the AI question generation API for SCORM Wizard.

## API Endpoints

### 1. Test Endpoint
- **URL**: `/api/test`
- **Method**: GET
- **Description**: Simple endpoint to test if the API is working
- **Response**: JSON with message, timestamp, and request details

### 2. Generate Questions Endpoint
- **URL**: `/api/generate-questions`
- **Method**: POST
- **Description**: Generates multiple choice questions using OpenAI
- **Request Body**:
  ```json
  {
    "educationLevel": "secondary",
    "year": "3",
    "subject": "Wiskunde",
    "theme": "Algebra",
    "chapter": "Vergelijkingen",
    "batchSize": 5,
    "customMaterial": "Optional lesson material text"
  }
  ```
- **Required Fields**: `educationLevel`, `year`, `subject`, `batchSize`
- **Optional Fields**: `theme`, `chapter`, `customMaterial`
- **Response**: JSON with generated questions and metadata

## Setup Instructions

### 1. Environment Variables
Create a `.env` file in the root directory with the following variables:
```
OPENAI_API_KEY=your_openai_api_key_here
PORT=3002
```

### 2. Local Development
Start the local development server:
```
node server.cjs
```

The server will run on port 3002 by default.

### 3. Testing
Test the API endpoints:

**Test Endpoint**:
```
curl http://localhost:3002/api/test
```

**Generate Questions Endpoint**:
```
curl -X POST http://localhost:3002/api/generate-questions \
  -H "Content-Type: application/json" \
  -d '{"educationLevel":"secondary","year":"3","subject":"Wiskunde","batchSize":1}'
```

### 4. Vercel Deployment
To deploy to Vercel:
1. Login to Vercel: `vercel login`
2. Deploy: `vercel deploy`

## Configuration
The API is configured with:
- 60-second timeout for question generation
- Memory limit of 1024MB
- Error handling for invalid requests
- OpenAI GPT-4 Turbo model for question generation

## Troubleshooting
- If you encounter CORS issues, check the CORS configuration in `server.cjs`
- If the OpenAI API fails, verify your API key is correct
- For timeout errors, consider reducing the batch size of questions
