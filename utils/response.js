/**
 * Response utility functies
 * Deze module bevat functies voor het formatteren van API responses
 */

/**
 * Creëert een success response
 * @param {Object} data - De data om terug te sturen
 * @param {number} [statusCode=200] - De HTTP status code
 * @returns {Object} - Geformatteerde success response
 */
function createSuccessResponse(data, statusCode = 200) {
  return {
    status: 'success',
    statusCode,
    timestamp: new Date().toISOString(),
    data
  };
}

/**
 * Creëert een error response
 * @param {string} message - De error message
 * @param {string} [error=null] - De error details
 * @param {number} [statusCode=500] - De HTTP status code
 * @param {Object} [additionalInfo={}] - Extra informatie over de error
 * @returns {Object} - Geformatteerde error response
 */
function createErrorResponse(message, error = null, statusCode = 500, additionalInfo = {}) {
  const response = {
    status: 'error',
    statusCode,
    message,
    timestamp: new Date().toISOString()
  };

  if (error) {
    response.error = error;
  }

  if (process.env.NODE_ENV === 'development' && additionalInfo.stack) {
    response.stack = additionalInfo.stack;
  }

  // Voeg eventuele extra informatie toe
  Object.keys(additionalInfo).forEach(key => {
    if (key !== 'stack' || process.env.NODE_ENV === 'development') {
      response[key] = additionalInfo[key];
    }
  });

  return response;
}

/**
 * Formatteert een OpenAI completion response voor vragen
 * @param {Object} completion - De OpenAI completion response
 * @param {Object} parsedResponse - De geparseerde JSON response
 * @returns {Object} - Geformatteerde vragen response
 */
function formatQuestionsResponse(completion, parsedResponse) {
  return {
    questions: parsedResponse.questions,
    metadata: {
      generatedAt: new Date().toISOString(),
      model: completion.model,
      promptTokens: completion.usage?.prompt_tokens || 0,
      completionTokens: completion.usage?.completion_tokens || 0,
      totalTokens: completion.usage?.total_tokens || 0,
    }
  };
}

/**
 * Formatteert een mock vragen response
 * @param {Object} config - Configuratie voor de mock vragen
 * @param {number} config.batchSize - Aantal te genereren vragen
 * @param {string} config.theme - Thema van de vragen
 * @param {string} config.chapter - Hoofdstuk van de vragen
 * @param {string} config.subject - Vak
 * @param {string} config.educationLevel - Onderwijsniveau
 * @param {string} config.year - Leerjaar
 * @returns {Object} - Geformatteerde mock vragen response
 */
function createMockQuestionsResponse(config) {
  const { batchSize, theme, chapter, subject, educationLevel, year } = config;
  
  const mockQuestions = [];
  
  for (let i = 0; i < batchSize; i++) {
    mockQuestions.push({
      text: `Specifieke vraag ${i + 1} over ${theme || 'algemeen thema'}, hoofdstuk ${chapter || 'onbekend'} voor ${subject} op ${educationLevel} niveau, leerjaar ${year}`,
      options: [
        { id: "1", text: `Antwoordoptie 1 voor vraag over ${theme || 'algemeen thema'}`, isCorrect: i % 4 === 0 },
        { id: "2", text: `Antwoordoptie 2 voor vraag over ${theme || 'algemeen thema'}`, isCorrect: i % 4 === 1 },
        { id: "3", text: `Antwoordoptie 3 voor vraag over ${theme || 'algemeen thema'}`, isCorrect: i % 4 === 2 },
        { id: "4", text: `Antwoordoptie 4 voor vraag over ${theme || 'algemeen thema'}`, isCorrect: i % 4 === 3 }
      ],
      explanation: `Dit is een gedetailleerde uitleg voor de vraag over ${theme || 'algemeen thema'}, hoofdstuk ${chapter || 'onbekend'}.`,
      multipleCorrect: false,
      difficulty: ["makkelijk", "gemiddeld", "moeilijk"][Math.floor(Math.random() * 3)]
    });
  }
  
  return {
    questions: mockQuestions,
    metadata: {
      generatedAt: new Date().toISOString(),
      model: "mock-model",
      promptTokens: 100,
      completionTokens: 200,
      totalTokens: 300
    }
  };
}

/**
 * Formatteert een health check response
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

module.exports = {
  createSuccessResponse,
  createErrorResponse,
  formatQuestionsResponse,
  createMockQuestionsResponse,
  createHealthCheckResponse
};
