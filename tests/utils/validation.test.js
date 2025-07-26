import { describe, it, expect } from 'vitest';

// Importeer de validateQuestionsRequest functie uit de utils/validation.cjs module
const { validateQuestionsRequest } = require('../../utils/validation.cjs');

// Omdat server.refactored.cjs een CommonJS module is, moeten we de import anders aanpakken
// We zullen dit later oplossen door de functies te exporteren in aparte modules

describe('validateQuestionsRequest', () => {
  it('should return valid: false when body is missing', () => {
    const result = validateQuestionsRequest(null);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Request body is required');
  });

  it('should return valid: false when required fields are missing', () => {
    const result = validateQuestionsRequest({});
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Missing required fields');
  });

  it('should return valid: false when batchSize is less than 1', () => {
    const result = validateQuestionsRequest({
      educationLevel: 'havo',
      year: '3',
      subject: 'Nederlands',
      batchSize: 0
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('batchSize must be between 1 and 50');
  });

  it('should return valid: false when batchSize is greater than 50', () => {
    const result = validateQuestionsRequest({
      educationLevel: 'havo',
      year: '3',
      subject: 'Nederlands',
      batchSize: 51
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('batchSize must be between 1 and 50');
  });

  it('should return valid: false when educationLevel is invalid', () => {
    const result = validateQuestionsRequest({
      educationLevel: 'invalid',
      year: '3',
      subject: 'Nederlands',
      batchSize: 5
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid educationLevel');
  });

  it('should return valid: false when year is invalid', () => {
    const result = validateQuestionsRequest({
      educationLevel: 'havo',
      year: '7',
      subject: 'Nederlands',
      batchSize: 5
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid year');
  });

  it('should return valid: true when all required fields are present and valid', () => {
    const result = validateQuestionsRequest({
      educationLevel: 'havo',
      year: '3',
      subject: 'Nederlands',
      batchSize: 5
    });
    expect(result.valid).toBe(true);
  });
});
