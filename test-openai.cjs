// Test script to verify OpenAI API connection
require('dotenv').config();
const { OpenAI } = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testOpenAI() {
  console.log('Testing OpenAI API connection...');
  
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error('Error: OPENAI_API_KEY is not set in the .env file');
      console.log('Please create a .env file with your OpenAI API key:');
      console.log('OPENAI_API_KEY=your_api_key_here');
      return;
    }

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
