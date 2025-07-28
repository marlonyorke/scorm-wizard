import type { AIQuestionMetadata, AIQuestionQualityScore } from "../ai";
import type { Question } from "../editor";

/**
 * Interface voor een door AI gegenereerde vraag
 * Breidt de standaard Question interface uit met AI-specifieke eigenschappen
 */
export interface AIQuestion extends Question {
  /**
   * Metadata voor de AI-gegenereerde vraag
   * Bevat informatie over het generatieproces
   */
  aiMetadata: AIQuestionMetadata;
  
  /**
   * Geeft expliciet aan dat deze vraag door AI is gegenereerd
   */
  isAIGenerated: true;
  
  /**
   * Kwaliteitsscore van de vraag
   */
  qualityScore?: AIQuestionQualityScore;
  
  /**
   * Tijdstip waarop de vraag is gegenereerd
   */
  generatedAt: string;
  
  /**
   * Versie van de vraag (voor het bijhouden van revisies)
   */
  version: number;
}

/**
 * Interface voor een door AI gegenereerde multiple choice vraag
 */
export interface AIMultipleChoiceQuestion extends AIQuestion {
  /**
   * Type is altijd 'multiple-choice'
   */
  type: "multiple-choice";
  
  /**
   * Tekst van de vraag
   */
  text: string;
  
  /**
   * Antwoordopties voor de vraag
   */
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
  
  /**
   * Geeft aan of meerdere antwoorden correct kunnen zijn
   */
  multipleCorrect: boolean;
  
  /**
   * Uitleg over het juiste antwoord (wordt gebruikt als feedback)
   */
  explanation?: string;
}

/**
 * Type guard functie om te controleren of een vraag een AI-gegenereerde vraag is
 * @param question De vraag om te controleren
 * @returns True als de vraag een AI-gegenereerde vraag is
 */
export function isAIQuestion(question: Question): question is AIQuestion {
  return !!question.isAIGenerated;
}

/**
 * Type guard functie om te controleren of een vraag een AI-gegenereerde multiple choice vraag is
 * @param question De vraag om te controleren
 * @returns True als de vraag een AI-gegenereerde multiple choice vraag is
 */
export function isAIMultipleChoiceQuestion(question: Question): question is AIMultipleChoiceQuestion {
  return isAIQuestion(question) && question.type === "multiple-choice";
}

/**
 * Converteert een standaard Question naar een AIQuestion
 * @param question De vraag om te converteren
 * @param metadata Metadata voor de AI-gegenereerde vraag
 * @returns Een AIQuestion object
 */
export function convertToAIQuestion(question: Question, metadata: AIQuestionMetadata): AIQuestion {
  return {
    ...question,
    aiMetadata: metadata,
    isAIGenerated: true,
    generatedAt: metadata.generatedAt,
    version: metadata.version || 1,
  };
}

/**
 * Genereert een nieuwe versie van een bestaande AI-vraag
 * @param question De vraag om een nieuwe versie van te maken
 * @param changes Wijzigingen voor de nieuwe versie
 * @returns Een nieuwe versie van de vraag
 */
export function createNewQuestionVersion(
  question: AIQuestion, 
  changes: Partial<AIQuestion>,
): AIQuestion {
  return {
    ...question,
    ...changes,
    version: (question.version || 1) + 1,
    aiMetadata: {
      ...question.aiMetadata,
      version: (question.aiMetadata.version || 1) + 1,
      originalQuestionId: question.aiMetadata.originalQuestionId || question.id,
    },
  };
}
