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
const path = require('path');
const { OpenAI } = require('openai');
require('dotenv').config();

// Initialiseer Express app
const app = express();
const PORT = process.env.PORT || 3002;

/**
 * Initialiseer OpenAI client
 * De API key wordt uit de omgevingsvariabelen gehaald
 */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware configuratie
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
 * Valideer de request body voor het genereren van vragen
 * @param {Object} body - De request body
 * @returns {Object} - Resultaat van de validatie { valid: boolean, error?: string }
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

  // Valideer batchSize
  if (body.batchSize < 1 || body.batchSize > 50) {
    return { 
      valid: false, 
      error: 'batchSize must be between 1 and 50' 
    };
  }
  
  // Valideer educationLevel
  const validEducationLevels = ['vmbo', 'havo', 'vwo'];
  if (body.educationLevel && !validEducationLevels.includes(body.educationLevel.toLowerCase())) {
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

Het verhaal moet de volgende woorden bevatten, die later door leerlingen gemarkeerd moeten worden: ${wordsList}.

Context voor het verhaal: "${context}"

INSTRUCTIES:
1. Schrijf een samenhangend verhaal van ongeveer ${wordCount} woorden.
2. ZEER BELANGRIJK: Markeer ALLE opgegeven woorden in het verhaal met een dakje (^) aan het begin en einde, bijvoorbeeld: ^woord^.
3. Gebruik ALLE opgegeven woorden in een natuurlijke, educatieve context.
4. Zorg ervoor dat het verhaal geschikt is voor ${niveau} niveau, leerjaar ${leerjaar}.
5. Het verhaal moet educatief zijn en passen bij het vak ${vak}.
6. Gebruik correct Nederlands en zorg voor een goede structuur.
7. Maak het verhaal boeiend en relevant voor de doelgroep.

Genereer nu een educatief verhaal over "${context}" voor ${vak} op ${niveau} niveau, leerjaar ${leerjaar}, met de woorden ${wordsList} gemarkeerd met dakjes (^). Het verhaal moet ongeveer ${wordCount} woorden bevatten.
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
      parsedResponse = JSON.parse(responseContent);
      
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

/**
7. Zorg ervoor dat de gemarkeerde woorden goed verspreid zijn door het verhaal.
8. Gebruik geen opsommingen of lijsten, maar een doorlopend verhaal.
9. Controleer na het schrijven of ALLE opgegeven woorden precies één keer voorkomen en correct zijn gemarkeerd met dakjes.

Voorbeeld van de gewenste output:
"Stel je voor dat je een klein stukje brood bent, beginnend bij de ^mond^. Terwijl je daar bent, mengen ^speekselklieren^ speeksel met je om te helpen bij de afbraak van koolhydraten. Je volgende grote stop is de ^maag^, waar maagsappen je verder afbreken."

Genereer nu een educatief verhaal over "${context}" voor ${vak} op ${niveau} niveau, leerjaar ${leerjaar}, met de woorden ${wordsList} gemarkeerd met dakjes (^). Het verhaal moet ongeveer ${wordCount} woorden bevatten.
`;
    
    console.log('Generated prompt (truncated):', prompt.substring(0, 100) + '...');
    
    // Roep OpenAI API aan
    console.log('Calling OpenAI API for mark words story...');
    const startTime = Date.now();
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "Je bent een ervaren docent die educatieve verhalen schrijft voor het voortgezet onderwijs." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });
    
    const endTime = Date.now();
    console.log(`OpenAI API call completed in ${endTime - startTime}ms`);
    
    // Haal het verhaal uit de response
    const responseContent = completion.choices[0].message.content || '';
    console.log('OpenAI response content (truncated):', responseContent.substring(0, 100) + '...');
    
    // Verwijder eventuele aanhalingstekens aan het begin en einde als die er zijn
    let story = responseContent.trim();
    if (story.startsWith('"') && story.endsWith('"')) {
      story = story.substring(1, story.length - 1);
    }
    
    // Controleer of alle woorden in het verhaal voorkomen
    const missingWords = words.filter(word => {
      const pattern = new RegExp(`\\^${word}\\^`, 'i');
      return !pattern.test(story);
    });
    
    if (missingWords.length > 0) {
      console.warn(`Warning: Some words are missing in the generated story: ${missingWords.join(', ')}`);
      
      // Als er woorden ontbreken, probeer het opnieuw met een strengere prompt
      if (missingWords.length <= words.length / 2) {  // Als minder dan de helft van de woorden ontbreekt
        console.log('Attempting to fix missing words in the story...');
        
        // Maak een nieuwe prompt die specifiek vraagt om de ontbrekende woorden toe te voegen
        const fixPrompt = `
Je hebt een verhaal geschreven, maar de volgende woorden zijn niet correct gemarkeerd met dakjes (^woord^): ${missingWords.map(word => `"${word}"`).join(', ')}.

Origineel verhaal:
${story}

Herschrijf het verhaal zodat ALLE woorden, inclusief de hierboven genoemde ontbrekende woorden, correct gemarkeerd zijn met dakjes (^woord^).
Behoud de stijl, lengte en educatieve waarde van het originele verhaal, maar zorg ervoor dat alle woorden correct zijn gemarkeerd.
`;
        
        try {
          // Roep OpenAI opnieuw aan om het verhaal te verbeteren
          const fixCompletion = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [
              { role: "system", content: "Je bent een ervaren docent die educatieve verhalen schrijft voor het voortgezet onderwijs." },
              { role: "user", content: fixPrompt }
            ],
            temperature: 0.7,
          });
          
          // Haal het verbeterde verhaal uit de response
          const fixedContent = fixCompletion.choices[0].message.content || '';
          const fixedStory = fixedContent.trim();
          
          // Controleer of alle woorden nu in het verhaal voorkomen
          const stillMissingWords = words.filter(word => {
            const pattern = new RegExp(`\\^${word}\\^`, 'i');
            return !pattern.test(fixedStory);
          });
          
          if (stillMissingWords.length === 0) {
            console.log('Successfully fixed all missing words in the story!');
            story = fixedStory;
          } else {
            console.warn(`Still missing words after fix attempt: ${stillMissingWords.join(', ')}`);
          }
        } catch (fixError) {
          console.error('Error fixing missing words:', fixError);
        }
      }
    }
    
    // Stuur het verhaal terug
    res.status(200).json({ story });
    
  } catch (error) {
    console.error('Error generating mark words story:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message || 'An unexpected error occurred',
      statusCode: 500
    });
  }
});

// Mock questions endpoint
app.post('/api/mock-questions', (req, res) => {
  const { educationLevel, year, subject, theme, chapter, batchSize } = req.body;
  
  // Validate request
  if (!educationLevel || !year || !subject || !batchSize) {
    return res.status(400).json({
      error: 'Invalid request',
      message: 'Missing required fields',
      statusCode: 400
    });
  }
  
  // Mock response
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
  
  const response = {
    questions: mockQuestions,
    metadata: {
      generatedAt: new Date().toISOString(),
      model: "mock-model",
      promptTokens: 100,
      completionTokens: 200,
      totalTokens: 300
    }
  };
  
  // Simulate API delay
  setTimeout(() => {
    res.status(200).json(response);
  }, 1000);
});

// Simple test endpoint voor OpenAI API
app.get('/api/simple-test', async (req, res) => {
  try {
    console.log('Simple OpenAI test requested');
    
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        status: 'error',
        message: 'OpenAI API Key is not configured',
        details: 'The OPENAI_API_KEY environment variable is not set'
      });
    }
    
    // Eenvoudige test met OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: "Say hello" }
      ],
      max_tokens: 5
    });
    
    return res.status(200).json({
      status: 'success',
      message: 'OpenAI API is working',
      response: completion.choices[0].message.content,
      model: completion.model,
      usage: completion.usage
    });
  } catch (error) {
    console.error('Error in simple test:', error);
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to test OpenAI API',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Debug OpenAI endpoint
app.get('/api/debug-openai', async (req, res) => {
  try {
    // Verzamel alle debug informatie
    const debugInfo = {
      status: 'debug_complete',
      timestamp: new Date().toISOString(),
      environment: {
        node_version: process.version,
        openai_api_key_exists: !!process.env.OPENAI_API_KEY,
        openai_api_key_length: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0,
        openai_api_key_masked: process.env.OPENAI_API_KEY ? 
          `${process.env.OPENAI_API_KEY.substring(0, 3)}...${process.env.OPENAI_API_KEY.substring(process.env.OPENAI_API_KEY.length - 4)}` : 
          'niet gevonden',
        openai_organization: process.env.OPENAI_ORGANIZATION || 'niet ingesteld',
      },
      request_info: {
        headers: req.headers,
        method: req.method,
      }
    };

    // Test OpenAI client
    let clientTest = { success: false, error: null, models: [] };
    try {
      if (process.env.OPENAI_API_KEY) {
        // Probeer een lijst van modellen op te halen
        const modelResponse = await openai.models.list();
        clientTest = {
          success: true,
          error: null,
          models: modelResponse.data.slice(0, 5).map(model => model.id) // Beperk tot 5 modellen
        };
      } else {
        clientTest = {
          success: false,
          error: "OpenAI API-sleutel niet gevonden in omgevingsvariabelen",
          models: []
        };
      }
    } catch (error) {
      clientTest = {
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
    debugInfo.client_test = clientTest;

    // Test fetch API direct
    let fetchTest = { success: false, error: null, response: null };
    try {
      if (process.env.OPENAI_API_KEY) {
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
        
        fetchTest = {
          success: response.ok,
          error: response.ok ? null : `Fout: ${response.status} ${response.statusText}`,
          response: {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            data: responseData
          }
        };
      } else {
        fetchTest = {
          success: false,
          error: "OpenAI API-sleutel niet gevonden in omgevingsvariabelen",
          response: null
        };
      }
    } catch (error) {
      fetchTest = {
        success: false,
        error: error.message || "Onbekende fout bij het direct aanroepen van de OpenAI API",
        stack: error.stack,
        code: error.code,
        type: error.type,
        response: null
      };
    }
    debugInfo.fetch_test = fetchTest;

    // Voeg aanbevelingen toe op basis van de testresultaten
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
    
    debugInfo.recommendations = recommendations;

    // Stuur de debug informatie terug
    res.status(200).json(debugInfo);
  } catch (error) {
    console.error('Error in debug-openai endpoint:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Er is een onbekende fout opgetreden bij het debuggen van de OpenAI configuratie',
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code,
        type: error.type
      }
    });
  }
});

// Check environment variables
app.get('/api/check-env', (req, res) => {
  try {
    const envVars = {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 
        `${process.env.OPENAI_API_KEY.substring(0, 3)}...${process.env.OPENAI_API_KEY.substring(process.env.OPENAI_API_KEY.length - 4)}` : 
        undefined,
      OPENAI_ORGANIZATION: process.env.OPENAI_ORGANIZATION || undefined,
      NODE_ENV: process.env.NODE_ENV || undefined
    };
    
    const missingVars = [];
    if (!process.env.OPENAI_API_KEY) missingVars.push('OPENAI_API_KEY');
    
    res.status(200).json({
      status: 'success',
      environment: envVars,
      missing: missingVars,
      complete: missingVars.length === 0
    });
  } catch (error) {
    console.error('Error checking environment:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to check environment variables',
      error: error.message
    });
  }
});

// Test API key
app.get('/api/test-api-key', async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(400).json({
        status: 'error',
        message: 'API key is not configured',
        maskedKey: null
      });
    }
    
    const maskedKey = `${process.env.OPENAI_API_KEY.substring(0, 3)}...${process.env.OPENAI_API_KEY.substring(process.env.OPENAI_API_KEY.length - 4)}`;
    
    try {
      // Test de API key door een eenvoudige request te doen
      const response = await openai.models.list();
      
      return res.status(200).json({
        status: 'success',
        message: 'API key is valid',
        maskedKey,
        models: response.data.slice(0, 5).map(model => model.id) // Beperk tot 5 modellen
      });
    } catch (apiError) {
      console.error('API key test failed:', apiError);
      
      return res.status(400).json({
        status: 'error',
        message: `API key test failed: ${apiError.message}`,
        maskedKey,
        error: apiError.message
      });
    }
  } catch (error) {
    console.error('Error testing API key:', error);
    
    return res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred while testing the API key',
      error: error.message
    });
  }
});

// Check OpenAI configuration
app.get('/api/check-openai', async (req, res) => {
  try {
    const config = {
      apiKey: process.env.OPENAI_API_KEY ? 
        `${process.env.OPENAI_API_KEY.substring(0, 3)}...${process.env.OPENAI_API_KEY.substring(process.env.OPENAI_API_KEY.length - 4)}` : 
        null,
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
    
    res.status(200).json({
      status: 'success',
      config,
      test: testResult
    });
  } catch (error) {
    console.error('Error checking OpenAI config:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to check OpenAI configuration',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    server: 'SCORM Wizard API Server',
    version: '1.0.0'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`Generate questions endpoint: http://localhost:${PORT}/api/generate-questions`);
  console.log(`Mock questions endpoint: http://localhost:${PORT}/api/mock-questions`);
  console.log(`Simple test endpoint: http://localhost:${PORT}/api/simple-test`);
  console.log(`Debug OpenAI endpoint: http://localhost:${PORT}/api/debug-openai`);
  console.log(`Check environment variables endpoint: http://localhost:${PORT}/api/check-env`);
  console.log(`Test API key endpoint: http://localhost:${PORT}/api/test-api-key`);
  console.log(`Check OpenAI configuration endpoint: http://localhost:${PORT}/api/check-openai`);
  console.log(`Health check endpoint: http://localhost:${PORT}/api/health`);
});
