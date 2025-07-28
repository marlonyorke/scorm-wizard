/**
 * Environment utility functies
 * Deze module bevat functies voor het controleren van de omgeving
 */

const { openai, maskApiKey } = require('./openai');

/**
 * Controleert de omgevingsvariabelen
 * @returns {Object} - Resultaat van de controle
 */
function checkEnvironmentVariables() {
  const envVars = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? maskApiKey(process.env.OPENAI_API_KEY) : undefined,
    OPENAI_ORGANIZATION: process.env.OPENAI_ORGANIZATION || undefined,
    NODE_ENV: process.env.NODE_ENV || undefined
  };
  
  const missingVars = [];
  if (!process.env.OPENAI_API_KEY) missingVars.push('OPENAI_API_KEY');
  
  return {
    status: 'success',
    environment: envVars,
    missing: missingVars,
    complete: missingVars.length === 0
  };
}

/**
 * Test de OpenAI API key
 * @returns {Promise<Object>} - Resultaat van de test
 */
async function testApiKey() {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return {
        status: 'error',
        message: 'API key is not configured',
        maskedKey: null
      };
    }
    
    const maskedKey = maskApiKey(process.env.OPENAI_API_KEY);
    
    try {
      // Test de API key door een eenvoudige request te doen
      const response = await openai.models.list();
      
      return {
        status: 'success',
        message: 'API key is valid',
        maskedKey,
        models: response.data.slice(0, 5).map(model => model.id) // Beperk tot 5 modellen
      };
    } catch (apiError) {
      return {
        status: 'error',
        message: `API key test failed: ${apiError.message}`,
        maskedKey,
        error: apiError.message
      };
    }
  } catch (error) {
    return {
      status: 'error',
      message: 'An unexpected error occurred while testing the API key',
      error: error.message
    };
  }
}

/**
 * Controleert de OpenAI configuratie
 * @returns {Promise<Object>} - Resultaat van de controle
 */
async function checkOpenAiConfig() {
  try {
    const config = {
      apiKey: process.env.OPENAI_API_KEY ? maskApiKey(process.env.OPENAI_API_KEY) : null,
      organization: process.env.OPENAI_ORGANIZATION || null,
      hasKey: !!process.env.OPENAI_API_KEY,
      keyLength: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0
    };
    
    // Test de configuratie als er een API key is
    let testResult = null;
    if (config.hasKey) {
      try {
        const response = await openai.models.list();
        testResult = {
          success: true,
          models: response.data.slice(0, 5).map(model => model.id), // Beperk tot 5 modellen
          error: null
        };
      } catch (apiError) {
        testResult = {
          success: false,
          models: [],
          error: apiError.message
        };
      }
    }
    
    return {
      status: 'success',
      config,
      test: testResult
    };
  } catch (error) {
    return {
      status: 'error',
      message: 'Failed to check OpenAI configuration',
      error: error.message
    };
  }
}

/**
 * Genereert aanbevelingen op basis van testresultaten
 * @param {Object} testResults - De testresultaten
 * @returns {Array<string>} - Aanbevelingen
 */
function generateRecommendations(testResults) {
  const { clientTest, fetchTest } = testResults;
  const recommendations = [];
  
  if (!process.env.OPENAI_API_KEY) {
    recommendations.push("Stel de OPENAI_API_KEY omgevingsvariabele in.");
  } else if (process.env.OPENAI_API_KEY.length < 30) {
    recommendations.push("De OPENAI_API_KEY lijkt ongeldig (te kort). Controleer of de sleutel correct is.");
  }
  
  if (!clientTest.success && !fetchTest.success) {
    recommendations.push("Alle API-tests zijn mislukt. Controleer je internetverbinding en API-sleutel.");
    
    if (fetchTest.error && fetchTest.error.includes("401")) {
      recommendations.push("401 Unauthorized: Je API-sleutel is ongeldig of verlopen. Genereer een nieuwe sleutel in je OpenAI account.");
    }
    
    if (fetchTest.error && fetchTest.error.includes("429")) {
      recommendations.push("429 Too Many Requests: Je hebt je API-limiet bereikt of je account heeft onvoldoende krediet.");
    }
  }
  
  return recommendations;
}

/**
 * Voert een directe fetch test uit naar de OpenAI API
 * @returns {Promise<Object>} - Resultaat van de test
 */
async function testDirectFetch() {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return {
        success: false,
        error: "OpenAI API-sleutel niet gevonden in omgevingsvariabelen",
        response: null
      };
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "Hello, this is a direct fetch test" }],
        max_tokens: 5
      })
    });
    
    const responseData = await response.json();
    
    return {
      success: response.ok,
      error: response.ok ? null : `Fout: ${response.status} ${response.statusText}`,
      response: {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Onbekende fout bij het direct aanroepen van de OpenAI API",
      stack: error.stack,
      code: error.code,
      type: error.type,
      response: null
    };
  }
}

/**
 * Verzamelt debug informatie over de OpenAI configuratie
 * @param {Object} req - Express request object
 * @returns {Promise<Object>} - Debug informatie
 */
async function collectOpenAiDebugInfo(req) {
  // Verzamel alle debug informatie
  const debugInfo = {
    status: 'debug_complete',
    timestamp: new Date().toISOString(),
    environment: {
      node_version: process.version,
      openai_api_key_exists: !!process.env.OPENAI_API_KEY,
      openai_api_key_length: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0,
      openai_api_key_masked: process.env.OPENAI_API_KEY ? maskApiKey(process.env.OPENAI_API_KEY) : 'niet gevonden',
      openai_organization: process.env.OPENAI_ORGANIZATION || 'niet ingesteld',
    },
    request_info: {
      headers: req.headers,
      method: req.method,
    }
  };

  // Test OpenAI client
  const clientTest = await testOpenAiApi();
  debugInfo.client_test = clientTest;

  // Test fetch API direct
  const fetchTest = await testDirectFetch();
  debugInfo.fetch_test = fetchTest;

  // Voeg aanbevelingen toe op basis van de testresultaten
  debugInfo.recommendations = generateRecommendations({ clientTest, fetchTest });

  return debugInfo;
}

/**
 * Test de OpenAI API door een eenvoudige chat completion te doen
 * @returns {Promise<Object>} - Resultaat van de test
 */
async function testOpenAiApi() {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return {
        success: false,
        error: "OpenAI API-sleutel niet gevonden in omgevingsvariabelen",
        models: []
      };
    }
    
    const response = await openai.models.list();
    return {
      success: true,
      error: null,
      models: response.data.slice(0, 5).map(model => model.id) // Beperk tot 5 modellen
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Onbekende fout bij het testen van de OpenAI client",
      models: [],
      stack: error.stack,
      code: error.code,
      type: error.type,
      param: error.param,
      statusCode: error.statusCode
    };
  }
}

module.exports = {
  checkEnvironmentVariables,
  testApiKey,
  checkOpenAiConfig,
  generateRecommendations,
  testDirectFetch,
  collectOpenAiDebugInfo,
  testOpenAiApi
};
