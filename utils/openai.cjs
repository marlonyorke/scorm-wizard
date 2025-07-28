/**
 * OpenAI API utility functions
 * Deze module bevat functies voor interactie met de OpenAI API
 */

const { OpenAI } = require('openai');

// Initialiseer OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Genereert een chat completion met OpenAI
 * @param {Object} options - Opties voor de chat completion
 * @param {string} options.model - Het te gebruiken model (bijv. "gpt-4-turbo")
 * @param {Array<Object>} options.messages - De berichten voor de chat completion
 * @param {number} [options.temperature=0.7] - De temperature parameter (0-1)
 * @param {number} [options.maxTokens] - Het maximum aantal tokens in de response
 * @returns {Promise<Object>} - De OpenAI response
 */
async function generateChatCompletion(options) {
  const { model, messages, temperature = 0.7, maxTokens } = options;
  
  const requestOptions = {
    model,
    messages,
    temperature,
  };
  
  if (maxTokens) {
    requestOptions.max_tokens = maxTokens;
  }
  
  return await openai.chat.completions.create(requestOptions);
}

/**
 * Genereert een prompt voor multiple choice vragen
 * @param {Object} config - Configuratie voor de prompt
 * @param {string} config.educationLevel - Onderwijsniveau (bijv. "havo")
 * @param {string} config.year - Leerjaar (bijv. "3")
 * @param {string} config.subject - Vak (bijv. "biologie")
 * @param {string} [config.theme] - Thema (optioneel)
 * @param {string} [config.chapter] - Hoofdstuk (optioneel)
 * @param {number} config.batchSize - Aantal te genereren vragen
 * @param {string} [config.customMaterial] - Aangepast lesmateriaal (optioneel)
 * @returns {string} - De gegenereerde prompt
 */
function generateQuestionsPrompt(config) {
  const { educationLevel, year, subject, theme, chapter, batchSize, customMaterial } = config;

  let prompt = `
Je bent een ervaren docent in het voortgezet onderwijs. Genereer ${batchSize} specifieke multiple choice vragen voor ${subject} op ${educationLevel} niveau, leerjaar ${year}.
${theme ? `Het thema is: "${theme}".` : ''}
${chapter ? `Het hoofdstuk is: "${chapter}".` : ''}

Houd rekening met de volgende kwaliteitscriteria:
1. Feitelijke juistheid (20%): Alle informatie moet correct zijn.
2. Curriculum-conformiteit (20%): Vragen moeten passen bij het curriculum voor ${subject} op ${educationLevel} niveau, leerjaar ${year}.
3. Helderheid van vraagstelling (15%): Vragen moeten duidelijk en ondubbelzinnig zijn.
4. Taalgebruik passend bij leeftijd (10%): Gebruik taal die past bij leerlingen in leerjaar ${year}.
5. Complexiteit en cognitief niveau (10%): Zorg voor een passend cognitief niveau.
6. Kwaliteit van afleiders (10%): Afleiders moeten plausibel zijn maar duidelijk onjuist.
7. Didactische waarde (10%): Vragen moeten bijdragen aan het leerproces.
8. Relevantie (5%): Vragen moeten relevant zijn voor het onderwerp.

BELANGRIJK: Genereer SPECIFIEKE vragen die direct gerelateerd zijn aan het opgegeven thema "${theme}" en hoofdstuk "${chapter}". 
Vermijd algemene voorbeeldvragen of placeholders. Elke vraag moet inhoudelijk correct en relevant zijn voor het specifieke onderwerp.

${customMaterial ? `Gebruik het volgende lesmateriaal als basis voor de vragen:\n${customMaterial}\n` : ''}

Retourneer de vragen in het volgende JSON-formaat:
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
}

Zorg ervoor dat:
- Elke vraag 4 antwoordopties heeft
- Elke vraag minstens 1 correct antwoord heeft
- Sommige vragen kunnen meerdere juiste antwoorden hebben (multipleCorrect: true)
- Elke optie een unieke id heeft (1, 2, 3, 4)
- Elke vraag een duidelijke uitleg bevat waarom het juiste antwoord correct is
- De output valide JSON is
- Elke vraag een moeilijkheidsgraad heeft (makkelijk, gemiddeld, moeilijk)

Genereer nu ${batchSize} hoogwaardige, specifieke multiple choice vragen over ${theme} en ${chapter}.
`;

  return prompt;
}

/**
 * Genereert een prompt voor een Mark Words verhaal
 * @param {Object} config - Configuratie voor de prompt
 * @param {string} config.context - Context voor het verhaal
 * @param {string} config.vak - Vak (bijv. "Nederlands")
 * @param {string} config.niveau - Onderwijsniveau (bijv. "havo")
 * @param {string} config.leerjaar - Leerjaar (bijv. "3")
 * @param {Array<string>} config.words - Woorden die in het verhaal moeten voorkomen
 * @param {number} config.wordCount - Gewenst aantal woorden in het verhaal
 * @returns {string} - De gegenereerde prompt
 */
function generateMarkWordsPrompt(config) {
  const { context, vak, niveau, leerjaar, words, wordCount } = config;
  const wordsList = words.join(", ");

  const prompt = `
Je bent een ervaren docent Nederlands die educatieve verhalen schrijft voor het voortgezet onderwijs.

Het verhaal moet de volgende woorden bevatten, die later door leerlingen gemarkeerd moeten worden: ${wordsList}.

Context voor het verhaal: "${context}"

INSTRUCTIES:
1. Schrijf een samenhangend verhaal van ongeveer ${wordCount} woorden.
2. ZEER BELANGRIJK: Markeer ALLE opgegeven woorden in het verhaal met een dakje (^) aan het begin en einde, bijvoorbeeld: ^woord^.
3. Gebruik ALLE opgegeven woorden in een natuurlijke, educatieve context.
4. Het verhaal moet passen bij het niveau (${niveau}) en leerjaar (${leerjaar}).
5. Maak het verhaal interessant en relevant voor de doelgroep.
6. Zorg dat de gemarkeerde woorden goed verspreid zijn door het verhaal.
7. Gebruik correcte grammatica en spelling.

Genereer nu een educatief verhaal over "${context}" voor ${vak} op ${niveau} niveau, leerjaar ${leerjaar}, met de woorden ${wordsList} gemarkeerd met dakjes (^). Het verhaal moet ongeveer ${wordCount} woorden bevatten.
`;

  return prompt;
}

/**
 * Genereert een prompt om ontbrekende woorden in een verhaal te fixen
 * @param {Array<string>} missingWords - Woorden die ontbreken in het verhaal
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
 * Maskeert een API sleutel voor veilige weergave
 * @param {string} apiKey - De API sleutel
 * @returns {string} - De gemaskeerde API sleutel
 */
function maskApiKey(apiKey) {
  if (!apiKey) return null;
  return `${apiKey.substring(0, 3)}...${apiKey.substring(apiKey.length - 4)}`;
}

/**
 * Test de OpenAI API door een lijst van modellen op te halen
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
  openai,
  generateChatCompletion,
  generateQuestionsPrompt,
  generateMarkWordsPrompt,
  generateFixMissingWordsPrompt,
  maskApiKey,
  testOpenAiApi
};
