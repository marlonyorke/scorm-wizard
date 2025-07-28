/**
 * Response utility functies
 * Deze module bevat functies voor het formatteren van API responses
 */

/**
 * Maakt een geformatteerde error response
 * @param {string} title - Titel van de error
 * @param {string} message - Error bericht
 * @param {number} [statusCode=500] - HTTP status code
 * @param {Object} [details={}] - Extra details over de error
 * @returns {Object} - Geformatteerde error response
 */
function createErrorResponse(title, message, statusCode = 500, details = {}) {
  return {
    error: title,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
    ...details
  };
}

/**
 * Maakt een geformatteerde success response voor vragen
 * @param {Object} completion - De OpenAI completion
 * @param {Object} parsedResponse - De geparseerde JSON response
 * @returns {Object} - Geformatteerde success response
 */
function formatQuestionsResponse(completion, parsedResponse) {
  return {
    status: 'success',
    questions: parsedResponse.questions,
    metadata: {
      model: completion.model,
      promptTokens: completion.usage?.prompt_tokens || 0,
      completionTokens: completion.usage?.completion_tokens || 0,
      totalTokens: completion.usage?.total_tokens || 0,
    }
  };
}

/**
 * Maakt een geformatteerde success response voor de health check
 * @returns {Object} - Geformatteerde health check response
 */
function createHealthCheckResponse() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    server: 'SCORM Wizard API Server',
    version: '1.0.0'
  };
}

/**
 * Maakt een geformatteerde mock questions response
 * @param {Object} config - Configuratie voor de mock vragen
 * @returns {Object} - Geformatteerde mock questions response
 */
function createMockQuestionsResponse(config) {
  const { batchSize = 5 } = config;
  
  // Genereer mock vragen
  const questions = Array.from({ length: batchSize }, (_, i) => ({
    id: `q${i + 1}`,
    text: `Dit is een voorbeeld vraag ${i + 1}?`,
    options: [
      { id: '1', text: `Optie A voor vraag ${i + 1}`, isCorrect: i % 2 === 0 },
      { id: '2', text: `Optie B voor vraag ${i + 1}`, isCorrect: i % 3 === 0 },
      { id: '3', text: `Optie C voor vraag ${i + 1}`, isCorrect: i % 5 === 0 },
      { id: '4', text: `Optie D voor vraag ${i + 1}`, isCorrect: false }
    ],
    explanation: `Dit is de uitleg voor voorbeeld vraag ${i + 1}.`,
    multipleCorrect: i % 3 === 0,
    difficulty: ['makkelijk', 'gemiddeld', 'moeilijk'][i % 3]
  }));
  
  return {
    status: 'success',
    questions,
    metadata: {
      mock: true,
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = {
  createErrorResponse,
  formatQuestionsResponse,
  createHealthCheckResponse,
  createMockQuestionsResponse
};
