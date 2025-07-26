/**
 * SCORM Wizard API Server
 * 
 * Deze server biedt API endpoints voor de SCORM Wizard applicatie,
 * waaronder het genereren van vragen en verhalen met behulp van OpenAI.
 * 
 * @author SCORM Wizard Team
 * @version 1.0.0
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const { OpenAI } = require('openai');
const Joi = require('joi');
require('dotenv').config();

// Load LTI integration - now using CommonJS compatible file
let lti;
try {
  const ltiModule = require('./server.lti.cjs');
  lti = ltiModule.lti;
  console.log('✅ LTI module loaded successfully');
  setupLTIRoutes();
} catch (err) {
  console.warn('⚠️ LTI module not loaded:', err.message);
  console.log('💡 Server running without LTI functionality');
}

// Initialiseer Express app
const app = express();

// Sta embedding toe vanuit Moodle (localhost) - CSP fix
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "frame-ancestors 'self' http://localhost http://localhost:8080 http://127.0.0.1:*");
  next();
});

// Setup LTI routes after module loading
function setupLTIRoutes() {
  if (lti) {
    console.log('🚀 Setting up LTI endpoints...');
    
    // LTI launch endpoint
    app.post('/lti/launch', (req, res) => {
      console.log('📡 LTI Launch received');
      res.json({ message: 'LTI Launch endpoint active' });
    });
    
    // LTI auth endpoint
    app.post('/lti/auth', (req, res) => {
      console.log('📡 LTI Auth received');
      res.json({ message: 'LTI Auth endpoint active' });
    });
    
    // JWKS endpoint
    app.get('/.well-known/jwks.json', (req, res) => {
      console.log('📡 JWKS request received');
      res.json({ keys: [] });
    });
    
    // Health check
    app.get('/lti/health', (req, res) => {
      res.json({ status: 'ok', lti: 'enabled' });
    });
    
    console.log('✅ LTI endpoints configured');
  } else {
    console.log('💡 LTI endpoints not configured (module not loaded)');
    
    // Fallback endpoints
    app.get('/lti/health', (req, res) => {
      res.json({ status: 'ok', lti: 'disabled' });
    });
    
    app.get('/.well-known/jwks.json', (req, res) => {
      res.json({ keys: [] });
    });
  }
}

// Setup direct LTI endpoints (bypass LTI module loading issues)
app.get('/.well-known/jwks.json', (req, res) => {
  console.log('📡 JWKS endpoint accessed');
  res.json({
    keys: [
      {
        kty: 'RSA',
        kid: 'scorm-wizard-local-key',
        use: 'sig',
        alg: 'RS256',
        n: '0vx7agoebGcQSuuPiLJXZptN9nndrQmbXEps2aiAFbWhM78LhWx4cbbfAAtVT86zwu1RK7aPFFXuhDR1L6tSoc_BJECPebWKRXjBZCiFV4n3oknjhMstn64tZ_2W-5JsGY4Hc5n9yBXArwl93lqt7_RN5w6Cf0h4QyQ5v-65YGjQR0_FDW2QvzqY368QQMicAtaSqzs8KJZgnYb9c7d0zgdAZHzu6qMQvRL5hajrn1n91CbOpbISD08qNLyrdkt-bFTWhAI4vMQFh6WeZu0fM4lFd2NcRwr3XPksINHaQ-G_xBniIqbw0Ls1jF44-csFCur-kEgU8awapJzKnqDKgw',
        e: 'AQAB'
      }
    ]
  });
});

app.post('/lti/launch', (req, res) => {
  console.log('📡 LTI Launch endpoint accessed');
  res.json({
    message: 'LTI Launch endpoint active',
    endpoint: '/lti/launch',
    method: 'POST',
    timestamp: new Date().toISOString()
  });
});

app.post('/lti/auth', (req, res) => {
  console.log('📡 LTI Auth endpoint accessed');
  res.json({
    message: 'LTI Auth endpoint active',
    endpoint: '/lti/auth',
    method: 'POST',
    timestamp: new Date().toISOString()
  });
});

// Setup LTI routes immediately (fallback)
setupLTIRoutes();
const PORT = process.env.PORT || 3003;

/**
 * Initialiseer OpenAI client
 * De API key wordt uit de omgevingsvariabelen gehaald
 */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Security headers with Helmet
app.use(helmet());

// Enhanced rate limiting with different tiers
const createRateLimiter = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message: {
    error: message,
    retryAfter: Math.ceil(windowMs / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Different rate limiters for different endpoints
const apiLimiter = createRateLimiter(15 * 60 * 1000, 100, 'Too many API requests');
const authLimiter = createRateLimiter(15 * 60 * 1000, 5, 'Too many authentication attempts');
const generalLimiter = createRateLimiter(15 * 60 * 1000, 50, 'Too many requests');

// Apply rate limiting
app.use('/api/v1/auth', authLimiter);
app.use('/api/v1', apiLimiter);
app.use('/', generalLimiter);
app.use(cors());
app.use(express.json());

/**
 * Maskeert een API key voor veilige weergave
 * @param {string} apiKey - De API key die gemaskeerd moet worden
 * @returns {string} - De gemaskeerde API key
 */
function maskApiKey(apiKey) {
  if (!apiKey) return null;
  return `${apiKey.substring(0, 3)}...${apiKey.substring(apiKey.length - 4)}`;
}

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
 * Valideer de request body voor het genereren van vragen met Joi
 * @param {Object} body - De request body
 * @returns {Object} - Resultaat van de validatie { valid: boolean, error?: string }
 */
function validateQuestionsRequest(body) {
  const schema = Joi.object({
    educationLevel: Joi.string().valid('vmbo', 'havo', 'vwo').required(),
    year: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
    subject: Joi.string().min(1).max(100).required(),
    theme: Joi.string().min(1).max(200).optional(),
    chapter: Joi.string().min(1).max(200).optional(),
    batchSize: Joi.number().integer().min(1).max(20).required(),
    customMaterial: Joi.string().max(5000).optional()
  });

  const { error } = schema.validate(body);
  if (error) {
    return { valid: false, error: error.details[0].message };
  }

  return { valid: true };
}

/**
 * Valideer de request body voor het genereren van een verhaal met gemarkeerde woorden
 * @param {Object} body - De request body
 * @returns {Object} - Resultaat van de validatie { valid: boolean, error?: string }
 */
function validateMarkWordsRequest(body) {
  const schema = Joi.object({
    context: Joi.string().min(1).max(500).required(),
    vak: Joi.string().min(1).max(100).required(),
    niveau: Joi.string().valid('vmbo', 'havo', 'vwo').required(),
    leerjaar: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
    words: Joi.array().items(Joi.string().min(1).max(100)).min(1).max(50).required(),
    wordCount: Joi.number().integer().min(10).max(1000).required()
  });

  const { error } = schema.validate(body);
  if (error) {
    return { valid: false, error: error.details[0].message };
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

/**
 * Genereert een chat completion met OpenAI
 * @param {Object} options - Opties voor de chat completion
 * @param {string} options.model - Het model om te gebruiken (bijv. "gpt-4-turbo")
 * @param {Array<Object>} options.messages - De berichten voor de chat completion
 * @param {number} [options.maxTokens] - Maximum aantal tokens (optioneel)
 * @param {number} [options.temperature] - Temperature parameter (optioneel)
 * @param {number} [options.timeout] - Timeout in milliseconden (optioneel)
 * @returns {Promise<Object>} - De OpenAI response
 * @throws {Error} - Als er een fout optreedt bij het aanroepen van de API
 */
async function generateChatCompletion(options) {
  try {
    const { model, messages, maxTokens, temperature, timeout } = options;
    
    // Controleer of OpenAI API key is geconfigureerd
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }
    
    // Configureer request opties
    const requestOptions = {
      model,
      messages,
    };
    
    // Voeg optionele parameters toe indien aanwezig
    if (maxTokens) requestOptions.max_tokens = maxTokens;
    if (temperature) requestOptions.temperature = temperature;
    
    // Configureer timeout indien aanwezig
    const apiOptions = {};
    if (timeout) {
      apiOptions.timeout = timeout;
    }
    
    // Roep OpenAI API aan
    const startTime = Date.now();
    const completion = await openai.chat.completions.create(requestOptions, apiOptions);
    const duration = Date.now() - startTime;
    
    // Log API gebruik
    console.log(`OpenAI API call completed in ${duration}ms`);
    if (completion.usage) {
      console.log(`Tokens used: ${completion.usage.total_tokens} (prompt: ${completion.usage.prompt_tokens}, completion: ${completion.usage.completion_tokens})`);
    }
    
    return completion;
  } catch (error) {
    // Verbeterde error handling
    console.error('Error calling OpenAI API:', error.message);
    
    // Voeg extra context toe aan de error
    const enhancedError = new Error(`OpenAI API error: ${error.message}`);
    enhancedError.originalError = error;
    enhancedError.statusCode = error.status || 500;
    enhancedError.type = error.type || 'unknown';
    enhancedError.code = error.code || 'unknown';
    
    throw enhancedError;
  }
}

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

/**
 * Genereert een prompt voor het maken van multiple choice vragen
 * @param {Object} config - Configuratie voor de prompt
 * @param {string} config.educationLevel - Onderwijsniveau (vmbo, havo, vwo)
 * @param {string|number} config.year - Leerjaar
 * @param {string} config.subject - Vak
 * @param {string} [config.theme] - Thema (optioneel)
 * @param {string} [config.chapter] - Hoofdstuk (optioneel)
 * @param {number} config.batchSize - Aantal te genereren vragen
 * @param {string} [config.customMaterial] - Aangepast lesmateriaal (optioneel)
 * @returns {string} - De gegenereerde prompt
 */
function generateQuestionsPrompt(config) {
  const { educationLevel, year, subject, theme, chapter, batchSize, customMaterial } = config;

  // Bouw de prompt op uit verschillende onderdelen
  const introduction = generateIntroduction(educationLevel, year, subject, theme, chapter, batchSize);
  const qualityCriteria = generateQualityCriteria(subject, educationLevel, year);
  const importance = generateImportanceSection(theme, chapter);
  const customMaterialSection = generateCustomMaterialSection(customMaterial);
  const outputFormat = generateOutputFormat(theme, chapter);
  const requirements = generateRequirements(batchSize, theme, chapter);

  // Combineer alle secties tot één prompt
  return `
${introduction}

${qualityCriteria}

${importance}

${customMaterialSection}

${outputFormat}

${requirements}
`;
}

/**
 * Genereert de introductie voor de prompt
 * @private
 * @param {string} educationLevel - Onderwijsniveau
 * @param {string|number} year - Leerjaar
 * @param {string} subject - Vak
 * @param {string} [theme] - Thema
 * @param {string} [chapter] - Hoofdstuk
 * @param {number} batchSize - Aantal vragen
 * @returns {string} - De introductie tekst
 */
function generateIntroduction(educationLevel, year, subject, theme, chapter, batchSize) {
  return `Je bent een ervaren docent in het voortgezet onderwijs. Genereer ${batchSize} specifieke multiple choice vragen voor ${subject} op ${educationLevel} niveau, leerjaar ${year}.
${theme ? `Het thema is: "${theme}".` : ''}
${chapter ? `Het hoofdstuk is: "${chapter}".` : ''}`;
}

/**
 * Genereert de kwaliteitscriteria sectie voor de prompt
 * @private
 * @param {string} subject - Vak
 * @param {string} educationLevel - Onderwijsniveau
 * @param {string|number} year - Leerjaar
 * @returns {string} - De kwaliteitscriteria tekst
 */
function generateQualityCriteria(subject, educationLevel, year) {
  return `Houd rekening met de volgende kwaliteitscriteria:
1. Feitelijke juistheid (20%): Alle informatie moet correct zijn.
2. Curriculum-conformiteit (20%): Vragen moeten passen bij het curriculum voor ${subject} op ${educationLevel} niveau, leerjaar ${year}.
3. Helderheid van vraagstelling (15%): Vragen moeten duidelijk en ondubbelzinnig zijn.
4. Taalgebruik passend bij leeftijd (10%): Gebruik taal die past bij leerlingen in leerjaar ${year}.
5. Complexiteit en cognitief niveau (10%): Zorg voor een passend cognitief niveau.
6. Kwaliteit van afleiders (10%): Afleiders moeten plausibel zijn maar duidelijk onjuist.
7. Didactische waarde (10%): Vragen moeten bijdragen aan het leerproces.
8. Relevantie (5%): Vragen moeten relevant zijn voor het onderwerp.`;
}

/**
 * Genereert de sectie over het belang van specificiteit
 * @private
 * @param {string} theme - Thema
 * @param {string} chapter - Hoofdstuk
 * @returns {string} - De tekst over het belang van specificiteit
 */
function generateImportanceSection(theme, chapter) {
  return `BELANGRIJK: Genereer SPECIFIEKE vragen die direct gerelateerd zijn aan het opgegeven thema "${theme}" en hoofdstuk "${chapter}". 
Vermijd algemene voorbeeldvragen of placeholders. Elke vraag moet inhoudelijk correct en relevant zijn voor het specifieke onderwerp.`;
}

/**
 * Genereert de sectie over aangepast lesmateriaal
 * @private
 * @param {string} [customMaterial] - Aangepast lesmateriaal
 * @returns {string} - De tekst over aangepast lesmateriaal
 */
function generateCustomMaterialSection(customMaterial) {
  return customMaterial ? `Gebruik het volgende lesmateriaal als basis voor de vragen:\n${customMaterial}` : '';
}

/**
 * Genereert de sectie over het gewenste outputformaat
 * @private
 * @param {string} theme - Thema
 * @param {string} chapter - Hoofdstuk
 * @returns {string} - De tekst over het outputformaat
 */
function generateOutputFormat(theme, chapter) {
  return `Retourneer de vragen in het volgende JSON-formaat:
{
  "questions": [
    {
      "text": "Vraag tekst die specifiek is voor ${theme} en ${chapter}",
      "options": [
        { "id": "1", "text": "Optie 1", "isCorrect": false },
        { "id": "2", "text": "Optie 2", "isCorrect": true },
        { "id": "3", "text": "Optie 3", "isCorrect": false },
        { "id": "4", "text": "Optie 4", "isCorrect": false }
      ],
      "explanation": "Uitgebreide uitleg waarom het juiste antwoord correct is, met relevante informatie over ${theme} en ${chapter}",
      "multipleCorrect": false,
      "difficulty": "gemiddeld"
    }
  ]
}`;
}

/**
 * Genereert de sectie over de vereisten voor de vragen
 * @private
 * @param {number} batchSize - Aantal vragen
 * @param {string} theme - Thema
 * @param {string} chapter - Hoofdstuk
 * @returns {string} - De tekst over de vereisten
 */
function generateRequirements(batchSize, theme, chapter) {
  return `Zorg ervoor dat:
- Elke vraag 4 antwoordopties heeft
- Elke vraag minstens 1 correct antwoord heeft
- Sommige vragen kunnen meerdere juiste antwoorden hebben (multipleCorrect: true)
- Elke optie een unieke id heeft (1, 2, 3, 4)
- Elke vraag een duidelijke uitleg bevat waarom het juiste antwoord correct is
- De output valide JSON is
- Elke vraag een moeilijkheidsgraad heeft (makkelijk, gemiddeld, moeilijk)

Genereer nu ${batchSize} hoogwaardige, specifieke multiple choice vragen over ${theme} en ${chapter}.`;
}

/**
 * Genereert een prompt voor het maken van een verhaal met gemarkeerde woorden
 * @param {Object} config - Configuratie voor de prompt
 * @param {string} config.context - Context voor het verhaal
 * @param {string} config.vak - Vak
 * @param {string} config.niveau - Onderwijsniveau
 * @param {string|number} config.leerjaar - Leerjaar
 * @param {string[]} config.words - Woorden die gemarkeerd moeten worden
 * @param {number} config.wordCount - Gewenst aantal woorden in het verhaal
 * @returns {string} - De gegenereerde prompt
 */
function generateMarkWordsPrompt(config) {
  const { context, vak, niveau, leerjaar, words, wordCount } = config;
  const wordsList = words.map(word => `"${word}"`).join(', ');

  return `
Je bent een ervaren docent die educatieve verhalen schrijft voor het voortgezet onderwijs.

Het verhaal moet de volgende woorden of woordgroepen bevatten, die later door leerlingen gemarkeerd moeten worden: ${wordsList}.

BELANGRIJK: De woorden of woordgroepen die tussen komma's staan moeten als ÉÉN EENHEID gemarkeerd worden. Dus bijvoorbeeld "witte bloedcellen" moet als ^witte bloedcellen^ gemarkeerd worden, niet als ^witte^ ^bloedcellen^.

Context voor het verhaal: "${context}"

INSTRUCTIES:
1. Schrijf een samenhangend verhaal van ongeveer ${wordCount} woorden.
2. ZEER BELANGRIJK: Markeer ALLE opgegeven woorden of woordgroepen in het verhaal met een dakje (^) aan het begin en einde, bijvoorbeeld: ^woordgroep^.
3. Als een woordgroep meerdere woorden bevat (zoals "rode bloedcellen"), markeer dan de VOLLEDIGE woordgroep als één eenheid: ^rode bloedcellen^.
4. Gebruik ALLE opgegeven woorden of woordgroepen in een natuurlijke, educatieve context.
5. Zorg ervoor dat het verhaal geschikt is voor ${niveau} niveau, leerjaar ${leerjaar}.
6. Het verhaal moet educatief zijn en passen bij het vak ${vak}.
7. Gebruik correct Nederlands en zorg voor een goede structuur.
8. Maak het verhaal boeiend en relevant voor de doelgroep.

Genereer nu een educatief verhaal over "${context}" voor ${vak} op ${niveau} niveau, leerjaar ${leerjaar}, met de woorden of woordgroepen ${wordsList} gemarkeerd met dakjes (^). Het verhaal moet ongeveer ${wordCount} woorden bevatten. Zorg ervoor dat woordgroepen als één eenheid gemarkeerd worden.
`;
}

/**
 * Genereert een prompt voor het corrigeren van een verhaal met ontbrekende gemarkeerde woorden
 * @param {string[]} missingWords - Woorden die ontbreken in het verhaal
 * @param {string} story - Het originele verhaal
 * @returns {string} - De gegenereerde prompt
 */
function generateFixMissingWordsPrompt(missingWords, story) {
  return `
Je hebt een verhaal geschreven, maar de volgende woorden zijn niet correct gemarkeerd met dakjes (^woord^): ${missingWords.map(word => `"${word}"`).join(', ')}.

Origineel verhaal:
${story}

Herschrijf het verhaal zodat ALLE woorden, inclusief de hierboven genoemde ontbrekende woorden, correct gemarkeerd zijn met dakjes (^woord^).
Behoud de stijl, lengte en educatieve waarde van het originele verhaal, maar zorg ervoor dat alle woorden correct zijn gemarkeerd.
`;
}

// Endpoints
// =========

/**
 * Test endpoint
 * Eenvoudige test om te controleren of de API werkt
 * @route GET /api/test
 */
app.get('/api/test', (req, res) => {
  logApiRequest('/api/test', req.method);
  
  const response = {
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    query: req.query,
    body: req.body || null
  };
  
  logApiResponse('/api/test', 200, response);
  res.status(200).json(response);
});

/**
 * Generate Questions endpoint
 * Genereert multiple choice vragen met behulp van OpenAI
 * @route POST /api/generate-questions
 */
app.post('/api/generate-questions', async (req, res) => {
  logApiRequest('/api/generate-questions', req.method, req.body);
  
  try {
    // Valideer de request
    const validation = validateQuestionsRequest(req.body);
    if (!validation.valid) {
      logWarning('Validation failed', { error: validation.error });
      return res.status(400).json(createErrorResponse(
        'Invalid request', 
        validation.error, 
        400
      ));
    }
    
    // Genereer de prompt
    const prompt = generateQuestionsPrompt(req.body);
    
    // Roep OpenAI API aan
    console.log('Calling OpenAI API for questions generation...');
    
    const completion = await generateChatCompletion({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "Je bent een ervaren docent die multiple choice vragen genereert voor het onderwijs." },
        { role: "user", content: prompt }
      ]
    });
    
    // Verwerk de response
    const responseContent = completion.choices[0].message.content.trim();
    
    if (!responseContent) {
      logError('Empty response from OpenAI');
      return res.status(500).json(createErrorResponse(
        'Empty response', 
        'Received empty response from OpenAI API'
      ));
    }
    
    // Parse de JSON response
    let parsedResponse;
    try {
      // Verwijder eventuele markdown code block formatting (```json en ```) uit de respons
      let cleanedContent = responseContent;
      
      // Verwijder markdown code block backticks als die aanwezig zijn
      const codeBlockRegex = /^```(?:json)?\n([\s\S]*?)\n```$/;
      const match = cleanedContent.match(codeBlockRegex);
      if (match) {
        cleanedContent = match[1].trim();
        console.log('Removed markdown code block formatting from response');
      }
      
      parsedResponse = JSON.parse(cleanedContent);
      
      // Controleer of de response het verwachte formaat heeft
      if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
        throw new Error('Invalid response format: questions array is missing');
      }
    } catch (parseError) {
      logError('Failed to parse JSON response', parseError, { responseContent });
      
      return res.status(500).json(createErrorResponse(
        'Failed to parse response', 
        parseError.message,
        500,
        { responseContent }
      ));
    }
    
    // Formatteer de response
    const response = formatQuestionsResponse(completion, parsedResponse);
    
    // Stuur de response terug
    logApiResponse('/api/generate-questions', 200, { questionCount: response.questions.length });
    return res.status(200).json(response);
    
  } catch (error) {
    logError('Error generating questions', error);
    
    return res.status(500).json(createErrorResponse(
      'Failed to generate questions', 
      error.message,
      500,
      { stack: error.stack }
    ));
  }
});

// --- ROUTE HANDLER: Mark Words Story Generation ---
app.post('/api/generate-mark-words', async (req, res) => {
  logApiRequest('/api/generate-mark-words', req.method, req.body);

  try {
    // Valideer de request
    const validation = validateMarkWordsRequest(req.body);
    if (!validation.valid) {
      logWarning('Validation failed', { error: validation.error });
      return res.status(400).json(createErrorResponse(
        'Invalid request',
        validation.error,
        400
      ));
    }

    // Genereer de prompt
    const prompt = generateMarkWordsPrompt(req.body);

    // Roep OpenAI API aan
    console.log('Calling OpenAI API for mark words story...');
    const completion = await generateChatCompletion({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "Je bent een ervaren docent die educatieve verhalen schrijft voor het onderwijs." },
        { role: "user", content: prompt }
      ]
    });

    const responseContent = completion.choices[0].message.content.trim();
    if (!responseContent) {
      logError('Empty response from OpenAI');
      return res.status(500).json(createErrorResponse(
        'Empty response',
        'Received empty response from OpenAI API'
      ));
    }

    // Optioneel: verwijder markdown code block
    let cleanedContent = responseContent;
    const codeBlockRegex = /^```(?:json)?\n([\s\S]*?)\n```$/;
    const match = cleanedContent.match(codeBlockRegex);
    if (match) {
      cleanedContent = match[1].trim();
      console.log('Removed markdown code block formatting from response');
    }

    // Probeer te parsen als JSON, anders stuur gewoon string terug
    let story;
    try {
      const parsed = JSON.parse(cleanedContent);
      story = parsed.story || cleanedContent;
    } catch {
      story = cleanedContent;
    }

    logApiResponse('/api/generate-mark-words', 200, { story: story?.slice(0, 100) + '...' });
    return res.status(200).json({ story });

  } catch (error) {
    logError('Error generating mark words story', error);
    return res.status(500).json(createErrorResponse(
      'Failed to generate mark words story',
      error.message,
      500,
      { stack: error.stack }
    ));
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`Generate questions endpoint: http://localhost:${PORT}/api/generate-questions`);
});
