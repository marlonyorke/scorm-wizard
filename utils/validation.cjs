/**
 * Validatie utility functies
 * Deze module bevat functies voor het valideren van request data
 */

/**
 * Valideer de request body voor het genereren van vragen
 * @param {Object} body - De request body
 * @returns {Object} - Resultaat van de validatie { valid: boolean, error?: string }
 */
function validateQuestionsRequest(body) {
  if (!body) {
    return { valid: false, error: 'Request body is required' };
  }

  // Controleer of alle vereiste velden aanwezig zijn
  const requiredFields = ['educationLevel', 'year', 'subject', 'batchSize'];
  const missingFields = requiredFields.filter(field => body[field] === undefined || body[field] === null);

  if (missingFields.length > 0) {
    return { 
      valid: false, 
      error: `Missing required fields: ${missingFields.join(', ')}` 
    };
  }

  // Valideer batchSize
  const batchSize = parseInt(body.batchSize);
  if (isNaN(batchSize) || batchSize < 1 || batchSize > 50) {
    return { 
      valid: false, 
      error: 'batchSize must be between 1 and 50' 
    };
  }
  
  // Valideer educationLevel
  const validEducationLevels = ['vmbo', 'havo', 'vwo'];
  if (!validEducationLevels.includes(body.educationLevel.toLowerCase())) {
    return {
      valid: false,
      error: `Invalid educationLevel: ${body.educationLevel}. Must be one of: ${validEducationLevels.join(', ')}`
    };
  }
  
  // Valideer year
  const year = parseInt(body.year);
  if (isNaN(year) || year < 1 || year > 6) {
    return {
      valid: false,
      error: `Invalid year: ${body.year}. Must be a number between 1 and 6`
    };
  }

  return { valid: true };
}

/**
 * Valideer de request body voor het genereren van een verhaal met gemarkeerde woorden
 * @param {Object} body - De request body
 * @returns {Object} - Resultaat van de validatie { valid: boolean, error?: string }
 */
function validateMarkWordsRequest(body) {
  if (!body) {
    return { valid: false, error: 'Request body is required' };
  }

  const requiredFields = ['context', 'vak', 'niveau', 'leerjaar', 'words', 'wordCount'];
  const missingFields = requiredFields.filter(field => !body[field]);

  if (missingFields.length > 0) {
    return { 
      valid: false, 
      error: `Missing required fields: ${missingFields.join(', ')}` 
    };
  }

  // Valideer words array
  if (!Array.isArray(body.words) || body.words.length === 0) {
    return {
      valid: false,
      error: 'words must be a non-empty array'
    };
  }
  
  // Valideer wordCount
  const wordCount = parseInt(body.wordCount);
  if (isNaN(wordCount) || wordCount < 50 || wordCount > 1000) {
    return {
      valid: false,
      error: `Invalid wordCount: ${body.wordCount}. Must be a number between 50 and 1000`
    };
  }

  return { valid: true };
}

/**
 * Valideer de request body voor het genereren van mock vragen
 * @param {Object} body - De request body
 * @returns {Object} - Resultaat van de validatie { valid: boolean, error?: string }
 */
function validateMockQuestionsRequest(body) {
  if (!body) {
    return { valid: false, error: 'Request body is required' };
  }

  const requiredFields = ['batchSize'];
  const missingFields = requiredFields.filter(field => !body[field]);

  if (missingFields.length > 0) {
    return { 
      valid: false, 
      error: `Missing required fields: ${missingFields.join(', ')}` 
    };
  }

  // Valideer batchSize
  if (body.batchSize < 1 || body.batchSize > 50) {
    return { 
      valid: false, 
      error: 'batchSize must be between 1 and 50' 
    };
  }

  return { valid: true };
}

module.exports = {
  validateQuestionsRequest,
  validateMarkWordsRequest,
  validateMockQuestionsRequest
};
