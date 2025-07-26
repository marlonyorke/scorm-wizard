import { describe, it, expect, vi } from 'vitest';

// Importeer de response functies uit de utils/response.cjs module
const { createErrorResponse, formatQuestionsResponse } = require('../../utils/response.cjs');

describe('createErrorResponse', () => {
  it('should create a basic error response with default status code', () => {
    const title = 'Test Error';
    const message = 'This is a test error message';
    
    const response = createErrorResponse(title, message);
    
    expect(response.error).toBe(title);
    expect(response.message).toBe(message);
    expect(response.statusCode).toBe(500); // Default status code
    expect(response.timestamp).toBeDefined();
    expect(new Date(response.timestamp)).toBeInstanceOf(Date); // Controleer of timestamp een geldige datum is
  });

  it('should create an error response with custom status code', () => {
    const title = 'Bad Request';
    const message = 'Invalid input';
    const statusCode = 400;
    
    const response = createErrorResponse(title, message, statusCode);
    
    expect(response.error).toBe(title);
    expect(response.message).toBe(message);
    expect(response.statusCode).toBe(statusCode);
  });

  it('should include additional details in the error response', () => {
    const title = 'Server Error';
    const message = 'Internal server error';
    const statusCode = 500;
    const details = {
      code: 'ERR_INTERNAL',
      source: 'database',
      requestId: '12345'
    };
    
    const response = createErrorResponse(title, message, statusCode, details);
    
    expect(response.error).toBe(title);
    expect(response.message).toBe(message);
    expect(response.statusCode).toBe(statusCode);
    expect(response.code).toBe(details.code);
    expect(response.source).toBe(details.source);
    expect(response.requestId).toBe(details.requestId);
  });
});

describe('formatQuestionsResponse', () => {
  it('should format a questions response correctly', () => {
    // Mock OpenAI completion
    const completion = {
      model: 'gpt-4-turbo',
      usage: {
        prompt_tokens: 100,
        completion_tokens: 200,
        total_tokens: 300
      }
    };
    
    // Mock parsed response
    const parsedResponse = {
      questions: [
        {
          text: 'Wat is de hoofdstad van Nederland?',
          options: [
            { id: '1', text: 'Rotterdam', isCorrect: false },
            { id: '2', text: 'Amsterdam', isCorrect: true },
            { id: '3', text: 'Den Haag', isCorrect: false },
            { id: '4', text: 'Utrecht', isCorrect: false }
          ],
          explanation: 'Amsterdam is de hoofdstad van Nederland.',
          multipleCorrect: false,
          difficulty: 'makkelijk'
        }
      ]
    };
    
    const response = formatQuestionsResponse(completion, parsedResponse);
    
    expect(response.status).toBe('success');
    expect(response.questions).toEqual(parsedResponse.questions);
    expect(response.metadata.model).toBe(completion.model);
    expect(response.metadata.promptTokens).toBe(completion.usage.prompt_tokens);
    expect(response.metadata.completionTokens).toBe(completion.usage.completion_tokens);
    expect(response.metadata.totalTokens).toBe(completion.usage.total_tokens);
  });

  it('should handle missing usage information gracefully', () => {
    // Mock OpenAI completion zonder usage informatie
    const completion = {
      model: 'gpt-4-turbo'
    };
    
    // Mock parsed response
    const parsedResponse = {
      questions: []
    };
    
    const response = formatQuestionsResponse(completion, parsedResponse);
    
    expect(response.status).toBe('success');
    expect(response.questions).toEqual([]);
    expect(response.metadata.model).toBe(completion.model);
    expect(response.metadata.promptTokens).toBe(0);
    expect(response.metadata.completionTokens).toBe(0);
    expect(response.metadata.totalTokens).toBe(0);
  });
});
