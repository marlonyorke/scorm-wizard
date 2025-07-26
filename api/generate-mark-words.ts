import type { VercelRequest, VercelResponse } from "@vercel/node";
import { OpenAI } from "openai";

// Initialiseer OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Interface voor de request body
interface MarkWordsRequest {
  words: string[];
  context: string;
  niveau: string;
  leerjaar: number;
  vak: string;
  wordCount?: number;
}

// Valideer de request body
function validateRequest(body: any): { valid: boolean; error?: string } {
  if (!body) {
    return { valid: false, error: "Request body is required" };
  }

  const requiredFields = ["words", "context", "niveau", "leerjaar", "vak"];
  const missingFields = requiredFields.filter((field) => !body[field]);

  if (missingFields.length > 0) {
    return { 
      valid: false, 
      error: `Missing required fields: ${missingFields.join(", ")}`, 
    };
  }

  if (!Array.isArray(body.words) || body.words.length === 0) {
    return {
      valid: false,
      error: "words must be a non-empty array of strings",
    };
  }

  return { valid: true };
}

// Genereer de prompt voor OpenAI
function generatePrompt(config: MarkWordsRequest): string {
  const { words, context, niveau, leerjaar, vak, wordCount = 250 } = config;

  // Converteer woorden naar een geformatteerde lijst
  const wordsList = words.map((word) => `"${word}"`).join(", ");

  const prompt = `
Je bent een ervaren docent in het voortgezet onderwijs. Genereer een educatief verhaal voor ${vak} op ${niveau} niveau, leerjaar ${leerjaar}.

Het verhaal moet de volgende woorden bevatten, die later door leerlingen gemarkeerd moeten worden: ${wordsList}.

Context voor het verhaal: "${context}"

INSTRUCTIES:
1. Schrijf een samenhangend verhaal van ongeveer ${wordCount} woorden.
2. ZEER BELANGRIJK: Markeer ALLE opgegeven woorden in het verhaal met een dakje (^) aan het begin en einde, bijvoorbeeld: ^woord^.
3. Gebruik ALLE opgegeven woorden in een natuurlijke, educatieve context.
4. Elk woord MOET exact één keer voorkomen en MOET gemarkeerd zijn met dakjes (^woord^).
5. Zorg dat het taalniveau past bij leerlingen in leerjaar ${leerjaar} op ${niveau} niveau.
6. Het verhaal moet educatief zijn en relevante concepten uit het vak ${vak} bevatten.
7. Zorg ervoor dat de gemarkeerde woorden goed verspreid zijn door het verhaal.
8. Gebruik geen opsommingen of lijsten, maar een doorlopend verhaal.
9. Controleer na het schrijven of ALLE opgegeven woorden precies één keer voorkomen en correct zijn gemarkeerd met dakjes.

Voorbeeld van de gewenste output:
"Stel je voor dat je een klein stukje brood bent, beginnend bij de ^mond^. Terwijl je daar bent, mengen ^speekselklieren^ speeksel met je om te helpen bij de afbraak van koolhydraten. Je volgende grote stop is de ^maag^, waar maagsappen je verder afbreken."

Genereer nu een educatief verhaal over "${context}" voor ${vak} op ${niveau} niveau, leerjaar ${leerjaar}, met de woorden ${wordsList} gemarkeerd met dakjes (^). Het verhaal moet ongeveer ${wordCount} woorden bevatten.
`;

  return prompt;
}

// Hoofdfunctie voor de API endpoint
export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  console.log("Mark Words API Request received:", req.method);
  
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

    const config: MarkWordsRequest = req.body;
    
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
          content: "Je bent een ervaren docent die educatieve verhalen schrijft voor leerlingen in het voortgezet onderwijs. Je markeert specifieke woorden in je verhalen met dakjes (^) zodat leerlingen deze kunnen identificeren als onderdeel van een leesoefening.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });
    
    const endTime = Date.now();
    console.log(`OpenAI API call completed in ${endTime - startTime}ms`);
    
    // Haal het verhaal uit de response
    const responseContent = completion.choices[0].message.content || "";
    console.log("OpenAI response content:", responseContent);
    
    // Verwijder eventuele aanhalingstekens aan het begin en einde als die er zijn
    let story = responseContent.trim();
    if (story.startsWith('"') && story.endsWith('"')) {
      story = story.substring(1, story.length - 1);
    }
    
    // Controleer of alle woorden in het verhaal voorkomen
    const missingWords = config.words.filter((word) => {
      const pattern = new RegExp(`\\^${word}\\^`, "i");
      return !pattern.test(story);
    });
    
    if (missingWords.length > 0) {
      console.warn(`Warning: Some words are missing in the generated story: ${missingWords.join(", ")}`);
      
      // Als er woorden ontbreken, probeer het opnieuw met een strengere prompt
      if (missingWords.length <= config.words.length / 2) {  // Als minder dan de helft van de woorden ontbreekt
        console.log("Attempting to fix missing words in the story...");
        
        // Maak een nieuwe prompt die specifiek vraagt om de ontbrekende woorden toe te voegen
        const fixPrompt = `
Je hebt een verhaal geschreven, maar de volgende woorden zijn niet correct gemarkeerd met dakjes (^woord^): ${missingWords.map((word) => `"${word}"`).join(", ")}.

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
              { role: "user", content: fixPrompt },
            ],
            temperature: 0.7,
          });
          
          // Haal het verbeterde verhaal uit de response
          const fixedContent = fixCompletion.choices[0].message.content || "";
          const fixedStory = fixedContent.trim();
          
          // Controleer of alle woorden nu in het verhaal voorkomen
          const stillMissingWords = config.words.filter((word) => {
            const pattern = new RegExp(`\\^${word}\\^`, "i");
            return !pattern.test(fixedStory);
          });
          
          if (stillMissingWords.length === 0) {
            console.log("Successfully fixed all missing words in the story!");
            story = fixedStory;
          } else {
            console.warn(`Still missing words after fix attempt: ${stillMissingWords.join(", ")}`);
          }
        } catch (fixError) {
          console.error("Error fixing missing words:", fixError);
        }
      }
    }
    
    // Stuur het resultaat terug
    return res.status(200).json({
      story,
      metadata: {
        generatedAt: new Date().toISOString(),
        model: completion.model,
        processingTimeMs: endTime - startTime,
        wordCount: story.split(" ").length,
        markedWords: (story.match(/\^([^^]+)\^/g) || []).map((match) => match.replace(/^\^|\^$/g, "")),
        missingWords: missingWords.length > 0 ? missingWords : undefined,
      },
    });
    
  } catch (error) {
    console.error("Error generating mark words story:", error);
    
    // Bepaal het juiste foutbericht
    let errorMessage = "Er is een onbekende fout opgetreden bij het genereren van het verhaal.";
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Check voor specifieke OpenAI API fouten
      if ("status" in error && typeof error.status === "number") {
        statusCode = error.status;
      }
    }
    
    return res.status(statusCode).json({ 
      error: "Generation failed", 
      message: errorMessage, 
    });
  }
}
