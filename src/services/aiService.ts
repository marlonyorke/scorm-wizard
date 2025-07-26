import type { 
  AIGenerationConfig, 
  AIGenerationResponse,
  GenerationProgress, 
} from "@/types/ai";
import { 
  AIGenerationError, 
} from "@/types/ai";

/**
 * Maximum aantal retry pogingen voor API-aanroepen
 */
const MAX_RETRIES = 3;

/**
 * Basis wachttijd tussen retries in milliseconden
 */
const BASE_RETRY_DELAY = 1000;

/**
 * Configuratie voor de AI generatie service
 */
export interface AIServiceConfig {
  /**
   * API endpoint voor vraag generatie
   */
  endpoint: string;
  
  /**
   * Timeout in milliseconden
   */
  timeout?: number;
  
  /**
   * Maximum aantal retry pogingen
   */
  maxRetries?: number;

  /**
   * Gebruik mock service in plaats van echte OpenAI API
   */
  useMock?: boolean;
}

/**
 * Standaard configuratie voor de AI service
 */
const DEFAULT_CONFIG: AIServiceConfig = {
  endpoint: "/api/generate-questions",
  timeout: 120000, // Verhoogd naar 120 seconden (2 minuten)
  maxRetries: MAX_RETRIES,
  useMock: false,
};

/**
 * Service voor het genereren van AI-vragen
 */
export class AIService {
  private config: AIServiceConfig;
  private abortController: AbortController | null = null;
  
  /**
   * Maakt een nieuwe instantie van de AIService
   * @param config Optionele configuratie voor de service
   */
  constructor(config: Partial<AIServiceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }
  
  /**
   * Annuleert een lopende generatie
   */
  public cancelGeneration(): void {
    if (this.abortController) {
      console.log("Cancelling generation...");
      this.abortController.abort();
      this.abortController = null;
    }
  }

  /**
   * Genereert vragen op basis van de gegeven configuratie
   * @param generationConfig Configuratie voor het genereren van vragen
   * @param progressCallback Optionele callback voor voortgangsupdates
   * @param useMock Optioneel, gebruik mock service in plaats van echte OpenAI API
   * @returns Een promise met de gegenereerde vragen
   */
  async generateQuestions(
    generationConfig: AIGenerationConfig,
    progressCallback?: (progress: GenerationProgress) => void,
    useMock?: boolean,
  ): Promise<AIGenerationResponse> {
    console.log("Generating questions with config:", generationConfig);
    
    // Initialiseer de voortgang
    if (progressCallback) {
      progressCallback({
        status: "starting",
        progress: 0,
        message: "Verbinding maken met AI-service...",
      });
    }
    
    // Maak een nieuwe AbortController voor deze request
    this.abortController = new AbortController();
    
    // Gebruik de mock optie uit de config als er geen expliciete parameter is meegegeven
    const shouldUseMock = useMock !== undefined ? useMock : this.config.useMock;
    console.log("Using mock API:", shouldUseMock);
    
    // Bereid de API-aanvraag voor
    const endpoint = shouldUseMock ? "/api/mock-questions" : this.config.endpoint;
    const options: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(generationConfig),
      signal: this.abortController.signal,
    };
    
    try {
      // Voer de fetch uit met retry-logica
      if (progressCallback) {
        progressCallback({
          status: "generating",
          progress: 0.1,
          message: "Vragen genereren...",
        });
      }
      
      const response = await this.fetchWithRetry(endpoint, options, progressCallback);
      
      return response;
    } catch (error) {
      console.error("Error generating questions:", error);
      
      // Stuur een foutmelding naar de voortgangscallback
      if (progressCallback) {
        progressCallback({
          status: "error",
          progress: 0,
          message: error instanceof Error ? error.message : "Er is een onbekende fout opgetreden",
        });
      }
      
      throw error;
    } finally {
      // Reset de AbortController
      this.abortController = null;
    }
  }
  
  /**
   * Genereert een mark-words verhaal met gemarkeerde woorden
   * @param config Configuratie voor het genereren van het verhaal
   * @param useMock Optioneel, gebruik mock service in plaats van echte OpenAI API
   * @returns Een promise met het gegenereerde verhaal
   */
  async generateMarkWordsStory(
    config: {
      words: string[];
      context: string;
      niveau: string;
      leerjaar: number;
      vak: string;
      wordCount?: number;
    },
    useMock?: boolean,
  ): Promise<{ story: string }> {
    console.log("Generating mark words story with config:", config);
    console.log("Using mock API:", useMock);
    
    // Initialiseer een nieuwe AbortController voor deze request
    this.abortController = new AbortController();
    const signal = this.abortController.signal;
    
    try {
      if (useMock) {
        console.log("Using mock API for mark words story generation");
        // Genereer een eenvoudig mock verhaal
        const mockStory = `Stel je voor dat je een klein stukje brood bent, beginnend bij de ^${config.words[0] || "mond"}^. 
          Terwijl je daar bent, mengen ^${config.words[1] || "speekselklieren"}^ speeksel met je om te helpen bij de afbraak van koolhydraten. 
          Vervolgens glijd je door de slokdarm, een pad dat geen spijsverteringsenzymen toevoegt. 
          Je volgende grote stop is de ^${config.words[2] || "maag"}^, waar maagsappen met krachtige enzymen je verder afbreken. 
          Na de maag reis je naar de dunne darm. Hier komt de ^${config.words[3] || "alvleesklier"}^ in actie door enzymen af te geven. 
          Je reis gaat door naar de dikke darm, waar water wordt geabsorbeerd. 
          Uiteindelijk bereik je het rectum, waar het afvalproduct wordt opgeslagen voordat het lichaam verlaat via de anus.`;
        
        // Simuleer een vertraging om een echte API-aanroep na te bootsen
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        return { story: mockStory };
      } else {
        console.log("Using real API for mark words story generation");
        // Gebruik de echte API
        const response = await fetch("/api/generate-mark-words", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(config),
          signal: signal,
        });
        
        // Lees de response als tekst
        const responseText = await response.text();
        console.log("API raw response:", responseText);
        
        if (!response.ok) {
          console.error("API error status:", response.status, response.statusText);
          console.error("API error response:", responseText);
          
          // Probeer de foutmelding te parsen als JSON
          try {
            const errorData = JSON.parse(responseText);
            throw new Error(errorData.message || `API error: ${response.status} ${response.statusText}`);
          } catch (parseError) {
            // Als parsen mislukt, gebruik de ruwe tekst
            throw new Error(`API error: ${response.status} ${response.statusText}. Response: ${responseText}`);
          }
        }
        
        try {
          // Probeer de tekst te parsen als JSON
          const data = JSON.parse(responseText);
          console.log("API parsed response:", data);
          
          if (!data.story || typeof data.story !== "string") {
            console.error("Invalid response format, no story found:", data);
            throw new Error("Ongeldig antwoord van de API: geen verhaal gevonden");
          }
          
          return data;
        } catch (parseError) {
          console.error("Error parsing API response:", parseError);
          throw new Error(`Kon de API response niet parsen: ${parseError.message}`);
        }
      }
    } catch (error) {
      console.error("Error generating mark words story:", error);
      
      // Als er een fout optreedt met de echte API en we gebruikten die, probeer dan de mock API als fallback
      if (!useMock) {
        console.log("Falling back to mock API after real API failure");
        try {
          return await this.generateMarkWordsStory(config, true);
        } catch (fallbackError) {
          console.error("Even fallback to mock API failed:", fallbackError);
          throw error; // Gooi de originele fout
        }
      }
      
      throw error;
    }
  }
  
  /**
   * Voert een test request uit om te controleren of de API bereikbaar is
   * @returns Een promise die resolvet naar true als de API bereikbaar is
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(this.config.endpoint || "/api/generate-questions", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      return response.ok;
    } catch (error) {
      console.error("Test connection failed:", error);
      return false;
    }
  }
  
  /**
   * Voert een fetch uit met automatische retries bij fouten
   * @param url URL om te fetchen
   * @param options Fetch opties
   * @param progressCallback Optionele callback voor voortgangsupdates
   * @returns Een promise met de response data
   */
  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    progressCallback?: (progress: GenerationProgress) => void,
  ): Promise<AIGenerationResponse> {
    const maxRetries = this.config.maxRetries || MAX_RETRIES;
    let retries = 0;
    let lastError: Error | null = null;

    while (retries <= maxRetries) {
      try {
        if (retries > 0 && progressCallback) {
          progressCallback({
            status: "retrying",
            progress: 0,
            message: `Poging ${retries} van ${maxRetries}...`,
          });
        }

        // Controleer of de request is geannuleerd
        if (options.signal && (options.signal as AbortSignal).aborted) {
          throw new Error("Generation cancelled");
        }

        // Voer de fetch uit
        const response = await fetch(url, options);
        
        // Lees de response als tekst
        const responseText = await response.text();
        console.log(`API raw response (${url}):`, responseText);
        
        if (!response.ok) {
          console.error("API error status:", response.status, response.statusText);
          console.error("API error response:", responseText);
          
          // Probeer de foutmelding te parsen als JSON
          try {
            const errorData = JSON.parse(responseText);
            throw new Error(errorData.error || errorData.message || `API error: ${response.status} ${response.statusText}`);
          } catch (parseError) {
            // Als parsen mislukt, gebruik de ruwe tekst
            throw new Error(`API error: ${response.status} ${response.statusText}. Response: ${responseText}`);
          }
        }
        
        let data: AIGenerationResponse;
        try {
          data = JSON.parse(responseText);
          console.log("API parsed response:", data);
        } catch (parseError) {
          console.error("Error parsing API response:", parseError);
          throw new Error(`Kon de API response niet parsen: ${parseError instanceof Error ? parseError.message : "Onbekende fout"}`);
        }
          
        // Controleer of de response een questions array bevat
        if (!data.questions) {
          console.error("Invalid response format, no questions array:", data);
          throw new Error("Geen vragen gegenereerd");
        }
        
        // Controleer of de questions array leeg is
        if (!Array.isArray(data.questions) || data.questions.length === 0) {
          console.error("Invalid response format or empty questions array:", data);
          throw new Error("Geen vragen gegenereerd");
        }
        
        // Stuur een voltooiingsbericht naar de voortgangscallback
        if (progressCallback) {
          progressCallback({
            status: "complete",
            progress: 1,
            message: "Vragen succesvol gegenereerd",
          });
        }
        
        return data;
      } catch (error) {
        console.error(`Fetch attempt ${retries + 1} failed:`, error);
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Controleer of de request is geannuleerd
        if (options.signal && (options.signal as AbortSignal).aborted) {
          throw new Error("Generation cancelled");
        }
        
        // Als we nog niet het maximale aantal retries hebben bereikt, probeer opnieuw
        if (retries < maxRetries) {
          const delay = this.getRetryDelay(retries);
          console.log(`Retrying in ${delay}ms...`);
          
          // Wacht voordat we opnieuw proberen
          await new Promise((resolve) => setTimeout(resolve, delay));
          retries++;
        } else {
          // We hebben het maximale aantal retries bereikt, gooi de laatste fout
          throw lastError;
        }
      }
    }
    
    // Dit punt zou nooit bereikt moeten worden, maar TypeScript vereist een return
    throw new Error("Unexpected end of fetchWithRetry");
  }
  
  /**
   * Berekent de wachttijd voor een retry met exponentiële backoff
   * @param retryCount Huidige retry teller (0-based)
   * @returns Wachttijd in milliseconden
   */
  private getRetryDelay(retryCount: number): number {
    // Exponentiële backoff met jitter
    const baseDelay = BASE_RETRY_DELAY;
    const exponentialDelay = baseDelay * Math.pow(2, retryCount);
    const jitter = Math.random() * 0.5 * exponentialDelay; // 0-50% jitter
    
    return Math.min(exponentialDelay + jitter, 10000); // Max 10 seconden
  }
  
  /**
   * Genereert de volledige prompt die naar OpenAI wordt gestuurd
   * @param config Configuratie voor het genereren van vragen
   * @returns De volledige prompt als string
   */
  getFullPrompt(config: AIGenerationConfig): string {
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

FEEDBACK PER ANTWOORDOPTIE:
- Voor ELKE antwoordoptie moet je specifieke feedback geven die uitlegt WAAROM dat antwoord correct of incorrect is
- Voor correcte antwoorden: leg uit waarom dit antwoord juist is, verwijs naar relevante concepten en feiten
- Voor incorrecte antwoorden: leg uit waarom dit antwoord onjuist is, wat de misvatting is, en verwijs naar het correcte concept
- De feedback moet educatief zijn en de student helpen het onderwerp beter te begrijpen
- Houd de feedback bondig maar informatief, ongeveer 1-3 zinnen per optie

Retourneer de vragen in het volgende JSON-formaat:
{
  "questions": [
    {
      "text": "Vraag tekst die specifiek is voor ${theme} en ${chapter}",
      "options": [
        { 
          "id": "1", 
          "text": "Optie 1", 
          "isCorrect": false,
          "feedback": "Specifieke uitleg waarom deze optie incorrect is, met verwijzing naar het juiste concept"
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
          "feedback": "Specifieke uitleg waarom deze optie incorrect is, met verwijzing naar het juiste concept"
        },
        { 
          "id": "4", 
          "text": "Optie 4", 
          "isCorrect": false,
          "feedback": "Specifieke uitleg waarom deze optie incorrect is, met verwijzing naar het juiste concept"
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
- Elke vraag 4 antwoordopties heeft
- Elke vraag minstens 1 correct antwoord heeft
- Sommige vragen kunnen meerdere juiste antwoorden hebben (multipleCorrect: true)
- Elke optie een unieke id heeft (1, 2, 3, 4)
- ELKE antwoordoptie een specifieke feedback heeft die uitlegt waarom die optie correct of incorrect is
- De output valide JSON is
- Elke vraag een moeilijkheidsgraad heeft (makkelijk, gemiddeld, moeilijk)

Genereer nu ${batchSize} hoogwaardige, specifieke multiple choice vragen over ${theme} en ${chapter}.
`;
  
    return prompt;
  }
}

// Singleton instantie van de AIService
export const aiService = new AIService();

// Exporteer een functie om een aangepaste AIService te maken
export function createAIService(config: Partial<AIServiceConfig> = {}): AIService {
  return new AIService(config);
}
