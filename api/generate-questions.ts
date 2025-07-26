import type { VercelRequest, VercelResponse } from "@vercel/node";
import { OpenAI } from "openai";

import type { AIGenerationConfig, AIGenerationResponse, AIMultipleChoiceQuestion } from "../src/types/ai";

// Initialiseer OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Valideer de request body
function validateRequest(body: any): { valid: boolean; error?: string } {
  if (!body) {
    return { valid: false, error: "Request body is required" };
  }

  const requiredFields = ["educationLevel", "year", "subject", "batchSize"];
  const missingFields = requiredFields.filter((field) => !body[field]);

  if (missingFields.length > 0) {
    return { 
      valid: false, 
      error: `Missing required fields: ${missingFields.join(", ")}`, 
    };
  }

  if (body.batchSize < 1 || body.batchSize > 50) {
    return { 
      valid: false, 
      error: "batchSize must be between 1 and 50", 
    };
  }

  return { valid: true };
}

// Genereer de prompt voor OpenAI
function generatePrompt(config: AIGenerationConfig): string {
  const { educationLevel, year, subject, theme, chapter, batchSize, customMaterial } = config;

  const prompt = `
Je bent een ervaren docent in het voortgezet onderwijs. Genereer ${batchSize} specifieke multiple choice vragen voor ${subject} op ${educationLevel} niveau, leerjaar ${year}.
${theme ? `Het thema is: "${theme}".` : ""}
${chapter ? `Het hoofdstuk is: "${chapter}".` : ""}

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

${customMaterial ? `Gebruik het volgende lesmateriaal als basis voor de vragen:\n${customMaterial}\n` : ""}

VRAAGNAMEN:
- Elke vraag moet een duidelijke, beschrijvende titel hebben
- De titel moet specifiek zijn voor de inhoud van de vraag
- Gebruik een unieke titel voor elke vraag, zelfs als ze over hetzelfde onderwerp gaan
- Voeg een volgnummer toe als er meerdere vragen over hetzelfde concept gaan (bijv. "Fotosynthese 1", "Fotosynthese 2")
- De titel moet direct duidelijk maken waar de vraag over gaat

FEEDBACK PER ANTWOORDOPTIE:
- Voor ELKE antwoordoptie moet je specifieke feedback geven die uitlegt WAAROM dat antwoord correct of incorrect is
- Voor correcte antwoorden: leg uit waarom dit antwoord juist is, verwijs naar relevante concepten en feiten
- Voor incorrecte antwoorden: 
  * Begin met uitleg waarom dit antwoord onjuist is
  * Leg uit wat de misvatting is
  * Eindig met een subtiele verwijzing naar het juiste concept/antwoord ZONDER expliciet te zeggen "het juiste antwoord is X"
  * Verwerk het juiste antwoord op een natuurlijke manier in de laatste zin van de feedback
- De feedback moet educatief zijn en de student helpen het onderwerp beter te begrijpen
- Houd de feedback bondig maar informatief, ongeveer 1-3 zinnen per optie
- BELANGRIJK: Zorg ervoor dat je voor elke optie het "feedback" veld invult met specifieke feedback

Retourneer de vragen in het volgende JSON-formaat:
{
  "questions": [
    {
      "title": "Een duidelijke, beschrijvende titel voor deze vraag",
      "text": "Vraag tekst die specifiek is voor ${theme} en ${chapter}",
      "options": [
        { 
          "id": "1", 
          "text": "Optie 1", 
          "isCorrect": false,
          "feedback": "Specifieke uitleg waarom deze optie incorrect is, met een subtiele verwijzing naar het juiste concept aan het einde."
        },
        { 
          "id": "2", 
          "text": "Optie 2", 
          "isCorrect": true,
          "feedback": "Gedetailleerde uitleg waarom deze optie correct is, met relevante informatie over ${theme} en ${chapter}"
        },
        { 
          "id": "3", 
          "text": "Optie 3", 
          "isCorrect": false,
          "feedback": "Specifieke uitleg waarom deze optie incorrect is, eindigend met een zin die het juiste concept/antwoord op natuurlijke wijze verwerkt."
        },
        { 
          "id": "4", 
          "text": "Optie 4", 
          "isCorrect": false,
          "feedback": "Specifieke uitleg waarom deze optie incorrect is, met een subtiele hint naar het juiste antwoord in de laatste zin."
        }
      ],
      "correctFeedback": "Algemene uitleg over het correcte antwoord",
      "incorrectFeedback": "Algemene uitleg over waarom de andere opties incorrect zijn",
      "multipleCorrect": false,
      "difficulty": "gemiddeld"
    }
  ]
}

Zorg ervoor dat:
- Elke vraag een duidelijke, beschrijvende titel heeft die de inhoud van de vraag samenvat
- De titels uniek zijn en duidelijk aangeven waar de vraag over gaat
- Elke vraag 4 antwoordopties heeft
- Elke vraag minstens 1 correct antwoord heeft
- Sommige vragen kunnen meerdere juiste antwoorden hebben (multipleCorrect: true)
- Elke optie een unieke id heeft (1, 2, 3, 4)
- ELKE antwoordoptie een specifieke feedback heeft die uitlegt waarom die optie correct of incorrect is
- Bij incorrecte antwoorden, de feedback eindigt met een subtiele verwijzing naar het juiste antwoord
- De output valide JSON is
- Elke vraag een moeilijkheidsgraad heeft (makkelijk, gemiddeld, moeilijk)

Genereer nu ${batchSize} hoogwaardige, specifieke multiple choice vragen over ${theme} en ${chapter}.
`;

  return prompt;
}

// Hoofdfunctie voor de API endpoint
export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  console.log("API Request received:", req.method);
  
  // Controleer of het een POST request is
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed", message: "Only POST requests are supported" });
  }

  try {
    console.log("Request body:", JSON.stringify(req.body));
    
    // Valideer de request
    const validation = validateRequest(req.body);
    if (!validation.valid) {
      console.log("Validation failed:", validation.error);
      return res.status(400).json({ error: "Invalid request", message: validation.error });
    }

    const config: AIGenerationConfig = req.body;
    
    // Genereer de prompt
    const prompt = generatePrompt(config);
    console.log("Generated prompt (truncated):", prompt.substring(0, 100) + "...");
    
    // Log de volledige prompt
    console.log("VOLLEDIGE PROMPT NAAR OPENAI:", prompt);
    
    // Roep OpenAI API aan
    console.log("Calling OpenAI API...");
    const startTime = Date.now();
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { 
          role: "system", 
          content: `Je bent een ervaren docent die multiple choice vragen genereert voor het voortgezet onderwijs. 
          
BELANGRIJKE INSTRUCTIE: Voor ELKE antwoordoptie MOET je specifieke feedback geven die uitlegt WAAROM dat antwoord correct of incorrect is.

Voor incorrecte antwoorden:
1. Begin met uitleg waarom dit antwoord onjuist is
2. Leg uit wat de misvatting is
3. Eindig met een subtiele verwijzing naar het juiste concept/antwoord ZONDER expliciet te zeggen "het juiste antwoord is X"
4. Verwerk het juiste antwoord op een natuurlijke manier in de laatste zin van de feedback

Voorbeeld van het gewenste JSON-formaat:
{
  "questions": [
    {
      "title": "Fotosynthese proces",
      "text": "Welke stof is essentieel voor fotosynthese?",
      "options": [
        { 
          "id": "1", 
          "text": "Zuurstof", 
          "isCorrect": false,
          "feedback": "Zuurstof is niet essentieel voor fotosynthese, maar is juist een bijproduct van het proces. Planten hebben een andere gasvormige stof nodig die ze uit de lucht opnemen en omzetten in voedingsstoffen - dit is koolstofdioxide."
        },
        { 
          "id": "2", 
          "text": "Koolstofdioxide", 
          "isCorrect": true,
          "feedback": "Koolstofdioxide is inderdaad essentieel voor fotosynthese. Planten nemen CO2 op uit de lucht en gebruiken het om glucose te produceren met behulp van lichtenergie."
        },
        { 
          "id": "3", 
          "text": "Stikstof", 
          "isCorrect": false,
          "feedback": "Stikstof is belangrijk voor plantengroei als voedingsstof, maar is niet direct betrokken bij het fotosynthese proces zelf. Het proces draait om de opname van koolstofdioxide, dat wordt omgezet in glucose."
        },
        { 
          "id": "4", 
          "text": "Waterstof", 
          "isCorrect": false,
          "feedback": "Waterstof als apart element is niet essentieel voor fotosynthese. Het fotosynthese proces vereist een gasvormige verbinding die koolstof bevat, namelijk koolstofdioxide, als belangrijkste grondstof."
        }
      ],
      "explanation": "Koolstofdioxide is essentieel voor fotosynthese omdat planten het gebruiken om glucose te produceren.",
      "multipleCorrect": false,
      "difficulty": "gemiddeld"
    }
  ]
}

Zorg ervoor dat je dit formaat EXACT volgt, met specifieke feedback voor ELKE optie.`, 
        },
        { role: "user", content: prompt },
      ],
      temperature: 1.0, // Verhoogd naar 1.0 voor maximale creativiteit
      response_format: { type: "json_object" },
    });
    const endTime = Date.now();
    console.log("OpenAI API response received");

    // Parse de response
    const responseContent = completion.choices[0].message.content;
    if (!responseContent) {
      console.error("Empty response from OpenAI");
      return res.status(500).json({ 
        error: "Empty response", 
        message: "Received empty response from OpenAI API",
        statusCode: 500,
      });
    }
    
    console.log("Response content (truncated):", responseContent.substring(0, 100) + "...");

    let parsedResponse: { questions: AIMultipleChoiceQuestion[] };
    try {
      parsedResponse = JSON.parse(responseContent);
      console.log("Successfully parsed JSON response");
      
      // Extra logging om te controleren of de feedback per optie correct wordt ontvangen
      if (parsedResponse.questions && parsedResponse.questions.length > 0) {
        const firstQuestion = parsedResponse.questions[0];
        console.log("Eerste vraag titel:", firstQuestion.title);
        console.log("Eerste vraag opties met feedback:");
        firstQuestion.options.forEach((option) => {
          console.log(`Optie ${option.id} (${option.isCorrect ? "correct" : "incorrect"}): "${option.text}" - Feedback: "${option.feedback}"`);
        });
      }
    } catch (error) {
      console.error("Failed to parse JSON response:", responseContent);
      console.error("Parse error:", error);
      return res.status(500).json({ 
        error: "JSON parse error", 
        message: "Failed to parse response from OpenAI API",
        statusCode: 500,
      });
    }

    // Controleer of alle vragen feedback hebben voor elke optie
    let hasMissingFeedback = false;
    parsedResponse.questions.forEach((question, qIndex) => {
      question.options.forEach((option, oIndex) => {
        if (!option.feedback) {
          console.warn(`Vraag ${qIndex + 1}, optie ${oIndex + 1} heeft geen feedback!`);
          hasMissingFeedback = true;
        }
      });
    });

    if (hasMissingFeedback) {
      console.warn("Sommige opties missen feedback. Dit kan problemen veroorzaken bij het tonen van de vragen.");
    }

    // Bereken metadata voor de response
    const metadata = {
      generatedAt: new Date().toISOString(),
      model: "gpt-4-turbo",
      promptTokens: completion.usage?.prompt_tokens || 0,
      completionTokens: completion.usage?.completion_tokens || 0,
      totalTokens: completion.usage?.total_tokens || 0,
      generationTime: endTime - startTime,
    };

    // Stuur de response terug met metadata
    console.log("Sending response to client");
    return res.status(200).json({
      questions: parsedResponse.questions,
      metadata: metadata,
      statusCode: 200,
    } as AIGenerationResponse);

  } catch (error) {
    console.error("Error in API handler:", error);
    return res.status(500).json({ 
      error: "Internal server error", 
      message: error instanceof Error ? error.message : "Unknown error",
      statusCode: 500,
    });
  }
}
