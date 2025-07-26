import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Importeer de logging functies uit de utils/logging.cjs module
const { logApiRequest, logApiResponse, logError, logWarning } = require('../../utils/logging.cjs');

describe('Logging Functions', () => {
  // Setup spies voor console methods
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  // Reset mocks na elke test
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('logApiRequest', () => {
    it('should log API request without body', () => {
      const endpoint = '/api/test';
      const method = 'GET';
      
      logApiRequest(endpoint, method);
      
      expect(console.log).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith(`API Request received: ${method} ${endpoint}`);
    });

    it('should log API request with body', () => {
      const endpoint = '/api/test';
      const method = 'POST';
      const body = { key: 'value' };
      
      logApiRequest(endpoint, method, body);
      
      expect(console.log).toHaveBeenCalledTimes(2);
      expect(console.log).toHaveBeenCalledWith(`API Request received: ${method} ${endpoint}`);
      expect(console.log).toHaveBeenCalledWith('Request body:', JSON.stringify(body, null, 2));
    });
  });

  describe('logApiResponse', () => {
    it('should log API response without response data', () => {
      const endpoint = '/api/test';
      const statusCode = 200;
      
      logApiResponse(endpoint, statusCode);
      
      expect(console.log).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith(`API Response sent: ${statusCode} for ${endpoint}`);
    });

    it('should log API response with truncated response data', () => {
      const endpoint = '/api/test';
      const statusCode = 200;
      const response = { key: 'value'.repeat(100) }; // Lange response
      
      logApiResponse(endpoint, statusCode, response);
      
      expect(console.log).toHaveBeenCalledTimes(2);
      expect(console.log).toHaveBeenCalledWith(`API Response sent: ${statusCode} for ${endpoint}`);
      expect(console.log).toHaveBeenCalledWith('Response (truncated):', expect.stringContaining('...'));
    });

    it('should log API response with full response data when truncate is false', () => {
      const endpoint = '/api/test';
      const statusCode = 200;
      const response = { key: 'value' };
      
      logApiResponse(endpoint, statusCode, response, false);
      
      expect(console.log).toHaveBeenCalledTimes(2);
      expect(console.log).toHaveBeenCalledWith(`API Response sent: ${statusCode} for ${endpoint}`);
      expect(console.log).toHaveBeenCalledWith('Response:', JSON.stringify(response, null, 2));
    });
  });

  describe('logError', () => {
    it('should log error message without error object', () => {
      const message = 'Test error';
      
      logError(message);
      
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith(`ERROR: ${message}`);
    });

    it('should log error message with error object', () => {
      const message = 'Test error';
      const error = new Error('Error details');
      
      logError(message, error);
      
      expect(console.error).toHaveBeenCalledTimes(2);
      expect(console.error).toHaveBeenCalledWith(`ERROR: ${message}`);
      expect(console.error).toHaveBeenCalledWith('Error details:', error.message);
    });

    it('should log error message with error object and stack trace', () => {
      const message = 'Test error';
      const error = new Error('Error details');
      
      logError(message, error);
      
      expect(console.error).toHaveBeenCalledTimes(3);
      expect(console.error).toHaveBeenCalledWith(`ERROR: ${message}`);
      expect(console.error).toHaveBeenCalledWith('Error details:', error.message);
      expect(console.error).toHaveBeenCalledWith('Stack trace:', error.stack);
    });

    it('should log error message with context', () => {
      const message = 'Test error';
      const context = { requestId: '12345' };
      
      logError(message, null, context);
      
      expect(console.error).toHaveBeenCalledTimes(2);
      expect(console.error).toHaveBeenCalledWith(`ERROR: ${message}`);
      expect(console.error).toHaveBeenCalledWith('Error context:', JSON.stringify(context, null, 2));
    });
  });

  describe('logWarning', () => {
    it('should log warning message without context', () => {
      const message = 'Test warning';
      
      logWarning(message);
      
      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledWith(`WARNING: ${message}`);
    });

    it('should log warning message with context', () => {
      const message = 'Test warning';
      const context = { requestId: '12345' };
      
      logWarning(message, context);
      
      expect(console.warn).toHaveBeenCalledTimes(2);
      expect(console.warn).toHaveBeenCalledWith(`WARNING: ${message}`);
      expect(console.warn).toHaveBeenCalledWith('Warning context:', JSON.stringify(context, null, 2));
    });
  });
});
