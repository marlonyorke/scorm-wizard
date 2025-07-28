/**
 * Validatie utility functies
 * Deze module bevat functies voor het valideren van request data
 */

/**
 * Valideert de request body voor het genereren van vragen
 * @param {Object} body - De request body
 * @returns {Object} - Validatie resultaat met valid (boolean) en error (string)
 */
function validateQuestionsRequest(body) {
  if (!body) {
    return { valid: false, error: 'Request body is required' };
  }

  const requiredFields = ['educationLevel', 'year', 'subject', 'batchSize'];
  const missingFields = requiredFields.filter(field => !body[field]);

  if (missingFields.length > 0) {
    return { 
      valid: false, 
      error: `Missing required fields: ${missingFields.join(', ')}` 
    };
  }

  if (body.batchSize < 1 || body.batchSize > 50) {
    return { 
      valid: false, 
      error: 'batchSize must be between 1 and 50' 
    };
  }

  return { valid: true };
}

/**
 * Valideert de request body voor het genereren van een Mark Words verhaal
 * @param {Object} body - De request body
 * @returns {Object} - Validatie resultaat met valid (boolean) en error (string)
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

  if (!Array.isArray(body.words) || body.words.length === 0) {
    return {
      valid: false,
      error: 'words must be a non-empty array'
    };
  }

  if (body.wordCount < 100 || body.wordCount > 1000) {
    return {
      valid: false,
      error: 'wordCount must be between 100 and 1000'
    };
  }

  return { valid: true };
}

/**
 * Valideert de request body voor het genereren van mock vragen
 * @param {Object} body - De request body
 * @returns {Object} - Validatie resultaat met valid (boolean) en error (string)
 */
function validateMockQuestionsRequest(body) {
  if (!body) {
    return { valid: false, error: 'Request body is required' };
  }

  const requiredFields = ['educationLevel', 'year', 'subject', 'batchSize'];
  const missingFields = requiredFields.filter(field => !body[field]);

  if (missingFields.length > 0) {
    return { 
      valid: false, 
      error: `Missing required fields: ${missingFields.join(', ')}` 
    };
  }

  return { valid: true };
}

module.exports = {
  validateQuestionsRequest,
  validateMarkWordsRequest,
  validateMockQuestionsRequest
};
