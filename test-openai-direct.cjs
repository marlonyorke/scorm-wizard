// Test script to verify OpenAI API connection without using dotenv
const { OpenAI } = require('openai');
const fs = require('fs');

// Read API key directly from .env file
function getApiKey() {
  try {
    const envContent = fs.readFileSync('.env', 'utf8');
    const match = envContent.match(/OPENAI_API_KEY=(.+)/);
    if (match && match[1]) {
      return match[1].trim();
    }
    return null;
  } catch (error) {
    console.error('Error reading .env file:', error.message);
    return null;
  }
}

async function testOpenAI() {
  console.log('Testing OpenAI API connection...');
  
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      console.error('Error: Could not find OPENAI_API_KEY in the .env file');
      console.log('Please make sure your .env file contains:');
      console.log('OPENAI_API_KEY=your_api_key_here');
      return;
    }

    console.log('API key found in .env file');
    
    // Initialize OpenAI client with the API key
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // Simple test request
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Hello, are you working?" }
      ],
      max_tokens: 50
    });

    console.log('OpenAI API connection successful!');
    console.log('Response:', completion.choices[0].message.content);
    console.log('Model used:', completion.model);
    console.log('Usage:', completion.usage);
  } catch (error) {
    console.error('Error connecting to OpenAI API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testOpenAI();
