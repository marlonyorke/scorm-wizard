/**
 * Logging utility functies
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

module.exports = {
  logApiRequest,
  logApiResponse,
  logError,
  logWarning
};
