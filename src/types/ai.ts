import type { QuestionOption} from "./editor";
import { Question } from "./editor";
import type { EducationLevel } from "./education";

/**
 * Configuratie voor het genereren van AI-vragen
 */
export interface AIGenerationConfig {
  /**
   * Onderwijsniveau (MAVO, HAVO, VWO)
   */
  educationLevel: EducationLevel;
  
  /**
   * Leerjaar (bijv. "3")
   */
  year: string;
  
  /**
   * Vak (bijv. "Biologie", "Nederlands")
   */
  subject: string;
  
  /**
   * Thema van de vragen (bijv. "Planten")
   */
  theme: string;
  
  /**
   * Hoofdstuk binnen het thema (bijv. "Fotosynthese")
   */
  chapter: string;
  
  /**
   * Aantal te genereren vragen
   */
  batchSize: number;
  
  /**
   * Optioneel lesmateriaal om de AI te helpen betere vragen te genereren
   */
  customMaterial?: string;
  
  /**
   * Moeilijkheidsgraad van de vragen (1-5)
   * 1 = Zeer eenvoudig, 5 = Zeer uitdagend
   */
  difficulty?: number;
  
  /**
   * Specifieke instructies voor de AI
   */
  instructions?: string;
}

/**
 * Representatie van een door AI gegenereerde multiple choice vraag
 */
export interface AIMultipleChoiceQuestion {
  /**
   * Titel van de vraag
   */
  title?: string;
  
  /**
   * De tekst van de vraag
   */
  text: string;
  
  /**
   * Antwoordopties voor de vraag
   */
  options: QuestionOption[];
  
  /**
   * Uitleg over het juiste antwoord
   */
  explanation: string;
  
  /**
   * Geeft aan of meerdere opties correct kunnen zijn
   */
  multipleCorrect: boolean;
  
  /**
   * Moeilijkheidsgraad van de vraag (1-5) of als string (makkelijk, gemiddeld, moeilijk)
   */
  difficulty?: number | string;
  
  /**
   * Sleutelwoorden gerelateerd aan de vraag
   */
  keywords?: string[];
  
  /**
   * Bronnen of referenties voor de vraag
   */
  sources?: string[];
  
  /**
   * Feedback voor de vraag (alternatief voor explanation)
   */
  feedback?: string;

  /**
   * Specifieke feedback voor een correct antwoord
   */
  correctFeedback?: string;
  
  /**
   * Specifieke feedback voor een incorrect antwoord
   */
  incorrectFeedback?: string;
}

/**
 * Metadata over het AI-generatieproces
 */
export interface AIGenerationMetadata {
  /**
   * Tijdstip waarop de vragen zijn gegenereerd
   */
  generatedAt: string;
  
  /**
   * Gebruikt AI-model (bijv. "gpt-4")
   */
  model: string;
  
  /**
   * Aantal tokens in de prompt
   */
  promptTokens: number;
  
  /**
   * Aantal tokens in het antwoord
   */
  completionTokens: number;
  
  /**
   * Totaal aantal tokens
   */
  totalTokens: number;
  
  /**
   * Geschatte kosten van de generatie in USD
   */
  estimatedCost?: number;
  
  /**
   * Duur van het generatieproces in milliseconden
   */
  generationTime?: number;
}

/**
 * Antwoord van de AI-generatie API
 */
export interface AIGenerationResponse {
  /**
   * Lijst met gegenereerde vragen
   */
  questions: AIMultipleChoiceQuestion[];
  
  /**
   * Metadata over het generatieproces
   */
  metadata: AIGenerationMetadata;
}

/**
 * Foutinformatie bij AI-generatie
 */
export interface AIGenerationError {
  /**
   * Type fout
   */
  error: string;
  
  /**
   * Foutmelding
   */
  message: string;
  
  /**
   * HTTP-statuscode
   */
  statusCode: number;
  
  /**
   * Tijdstip van de fout
   */
  timestamp?: string;
  
  /**
   * Stack trace (alleen in development)
   */
  stack?: string;
  
  /**
   * Extra details over de fout (bijv. originele response)
   */
  details?: string;
}

/**
 * Status van het generatieproces
 */
export type GenerationStatus = "idle" | "starting" | "generating" | "retrying" | "complete" | "error";

/**
 * Voortgangsinformatie tijdens AI-generatie
 */
export interface GenerationProgress {
  /**
   * Huidige status van het generatieproces
   */
  status: GenerationStatus;
  
  /**
   * Voortgang als percentage (0-1)
   */
  progress: number;
  
  /**
   * Optioneel bericht over de huidige status
   */
  message?: string;
  
  /**
   * Foutmelding bij status 'error'
   */
  error?: string;
  
  /**
   * Aantal gegenereerde vragen tot nu toe
   */
  generatedCount?: number;
  
  /**
   * Totaal aantal te genereren vragen
   */
  totalCount?: number;
}

/**
 * Geschiedenis van een AI-generatiesessie
 */
export interface AIGenerationHistory {
  /**
   * Unieke ID van de generatiesessie
   */
  id: string;
  
  /**
   * Tijdstip van de generatie
   */
  timestamp: string;
  
  /**
   * Gebruikte configuratie
   */
  config: AIGenerationConfig;
  
  /**
   * Metadata over het generatieproces
   */
  metadata: AIGenerationMetadata;
  
  /**
   * Aantal gegenereerde vragen
   */
  questionCount: number;
  
  /**
   * Aantal geaccepteerde vragen
   */
  acceptedCount: number;
  
  /**
   * Hash van de generatie-inhoud voor duplicaatdetectie
   */
  contentHash?: string;
}

/**
 * Kwaliteitsscore voor een AI-gegenereerde vraag
 */
export interface AIQuestionQualityScore {
  /**
   * Algemene kwaliteitsscore (0-100)
   */
  overall: number;
  
  /**
   * Score voor relevantie t.o.v. het onderwerp (0-100)
   */
  relevance: number;
  
  /**
   * Score voor duidelijkheid van de vraag (0-100)
   */
  clarity: number;
  
  /**
   * Score voor correctheid van de informatie (0-100)
   */
  accuracy: number;
  
  /**
   * Score voor moeilijkheidsgraad passend bij het niveau (0-100)
   */
  difficultyMatch: number;
  
  /**
   * Feedback over de kwaliteit
   */
  feedback?: string;
}

/**
 * Uitgebreide informatie over een AI-gegenereerde vraag
 */
export interface AIQuestionMetadata {
  /**
   * Geeft aan dat deze vraag door AI is gegenereerd
   */
  isAIGenerated: boolean;
  
  /**
   * Tijdstip van generatie
   */
  generatedAt: string;
  
  /**
   * Gebruikt AI-model
   */
  model: string;
  
  /**
   * Configuratie gebruikt voor het genereren
   */
  generationConfig?: Partial<AIGenerationConfig>;
  
  /**
   * Kwaliteitsscore van de vraag
   */
  qualityScore?: AIQuestionQualityScore;
  
  /**
   * Versie van de vraag (voor het bijhouden van revisies)
   */
  version?: number;
  
  /**
   * ID van de originele vraag als dit een revisie is
   */
  originalQuestionId?: string;
}
