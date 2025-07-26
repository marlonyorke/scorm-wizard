import { describe, it, expect } from 'vitest';

// Importeer de maskApiKey functie uit de utils/security.cjs module
const { maskApiKey } = require('../../utils/security.cjs');

describe('maskApiKey', () => {
  it('should return null when apiKey is null or undefined', () => {
    expect(maskApiKey(null)).toBe(null);
    expect(maskApiKey(undefined)).toBe(null);
  });

  it('should mask the API key correctly', () => {
    const apiKey = 'sk-1234567890abcdefghijklmnopqrstuvwxyz';
    const maskedKey = maskApiKey(apiKey);
    
    // Controleer of alleen de eerste 3 en laatste 4 tekens zichtbaar zijn
    expect(maskedKey).toBe('sk-...wxyz');
    
    // Controleer of de lengte correct is
    expect(maskedKey.length).toBe(9); // 3 + 3 (voor '...') + 4
    
    // Controleer of de eerste 3 tekens behouden blijven
    expect(maskedKey.substring(0, 3)).toBe(apiKey.substring(0, 3));
    
    // Controleer of de laatste 4 tekens behouden blijven
    expect(maskedKey.substring(maskedKey.length - 4)).toBe(apiKey.substring(apiKey.length - 4));
    
    // Controleer of het middelste deel is vervangen door '...'
    expect(maskedKey.substring(3, 6)).toBe('...');
  });

  it('should handle short API keys correctly', () => {
    const shortApiKey = 'short';
    const maskedKey = maskApiKey(shortApiKey);
    
    // Voor korte API keys zou het masking nog steeds moeten werken
    expect(maskedKey).toBe('sho...rt');
  });
});
