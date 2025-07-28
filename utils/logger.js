/**
 * Logger utility functies
 * Deze module bevat functies voor het loggen van informatie
 */

/**
 * Logt een API request
 * @param {string} endpoint - Het API endpoint
 * @param {string} method - De HTTP method
 * @param {Object} [body=null] - De request body (optioneel)
 */
function logApiRequest(endpoint, method, body = null) {
  console.log(`API Request received: ${method} ${endpoint}`);
  if (body) {
    console.log('Request body:', JSON.stringify(body, null, 2));
  }
}

/**
 * Logt een API response
 * @param {string} endpoint - Het API endpoint
 * @param {number} statusCode - De HTTP status code
 * @param {Object} [response=null] - De response data (optioneel)
 * @param {boolean} [truncate=true] - Of de response getruncated moet worden
 */
function logApiResponse(endpoint, statusCode, response = null, truncate = true) {
  console.log(`API Response sent: ${statusCode} for ${endpoint}`);
  if (response) {
    if (truncate) {
      const responseStr = JSON.stringify(response);
      console.log('Response (truncated):', responseStr.length > 200 ? 
        responseStr.substring(0, 200) + '...' : responseStr);
    } else {
      console.log('Response:', JSON.stringify(response, null, 2));
    }
  }
}

/**
 * Logt een error
 * @param {string} message - Het error bericht
 * @param {Error} [error=null] - Het error object (optioneel)
 * @param {Object} [context={}] - Extra context informatie (optioneel)
 */
function logError(message, error = null, context = {}) {
  console.error(`ERROR: ${message}`);
  
  if (error) {
    console.error('Error details:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }
  
  if (Object.keys(context).length > 0) {
    console.error('Error context:', JSON.stringify(context, null, 2));
  }
}

/**
 * Logt een waarschuwing
 * @param {string} message - Het waarschuwingsbericht
 * @param {Object} [context={}] - Extra context informatie (optioneel)
 */
function logWarning(message, context = {}) {
  console.warn(`WARNING: ${message}`);
  
  if (Object.keys(context).length > 0) {
    console.warn('Warning context:', JSON.stringify(context, null, 2));
  }
}

/**
 * Logt een OpenAI API call
 * @param {string} model - Het gebruikte model
 * @param {string} endpoint - Het OpenAI endpoint
 * @param {number} [tokens=null] - Het aantal tokens (optioneel)
 * @param {number} [duration=null] - De duur van de call in ms (optioneel)
 */
function logOpenAiCall(model, endpoint, tokens = null, duration = null) {
  console.log(`OpenAI API call: ${endpoint} using model ${model}`);
  
  if (tokens !== null) {
    console.log(`Tokens used: ${tokens}`);
  }
  
  if (duration !== null) {
    console.log(`Call duration: ${duration}ms`);
  }
}

/**
 * Logt een OpenAI API response
 * @param {string} endpoint - Het OpenAI endpoint
 * @param {Object} response - De OpenAI response
 * @param {boolean} [truncate=true] - Of de response getruncated moet worden
 */
function logOpenAiResponse(endpoint, response, truncate = true) {
  console.log(`OpenAI API response received for ${endpoint}`);
  
  if (response.choices && response.choices.length > 0) {
    const content = response.choices[0].message?.content || '';
    if (truncate) {
      console.log('Response content (truncated):', content.length > 100 ? 
        content.substring(0, 100) + '...' : content);
    } else {
      console.log('Response content:', content);
    }
  }
  
  if (response.usage) {
    console.log('Usage:', JSON.stringify(response.usage));
  }
}

module.exports = {
  logApiRequest,
  logApiResponse,
  logError,
  logWarning,
  logOpenAiCall,
  logOpenAiResponse
};
