// OpenAI client voor frontend gebruik
import mockConfig, { MockableService } from "../config/mock-config";
import type { AIGenerationConfig, AIMultipleChoiceQuestion } from "../types/ai";

// Mock data generator
function generateMockQuestions(config: AIGenerationConfig): AIMultipleChoiceQuestion[] {
  const { educationLevel, year, subject, theme, chapter, batchSize } = config;
  const questions: AIMultipleChoiceQuestion[] = [];
  
  for (let i = 0; i < batchSize; i++) {
    questions.push({
      text: `Specifieke vraag ${i + 1} over ${theme || "algemeen thema"}, hoofdstuk ${chapter || "onbekend"} voor ${subject} op ${educationLevel} niveau, leerjaar ${year}`,
      options: [
        { id: "1", text: `Antwoordoptie 1 voor vraag over ${theme || "algemeen thema"}`, isCorrect: i % 4 === 0 },
        { id: "2", text: `Antwoordoptie 2 voor vraag over ${theme || "algemeen thema"}`, isCorrect: i % 4 === 1 },
        { id: "3", text: `Antwoordoptie 3 voor vraag over ${theme || "algemeen thema"}`, isCorrect: i % 4 === 2 },
        { id: "4", text: `Antwoordoptie 4 voor vraag over ${theme || "algemeen thema"}`, isCorrect: i % 4 === 3 },
      ],
      explanation: `Dit is een gedetailleerde uitleg voor de vraag over ${theme || "algemeen thema"}, hoofdstuk ${chapter || "onbekend"}.`,
      multipleCorrect: false,
      difficulty: ["makkelijk", "gemiddeld", "moeilijk"][Math.floor(Math.random() * 3)],
    });
  }
  
  return questions;
}

// OpenAI API client
export const openaiClient = {
  // Genereer vragen via de API of mock data
  async generateQuestions(config: AIGenerationConfig, useMock: boolean = false): Promise<AIMultipleChoiceQuestion[]> {
    console.log("Generating questions with config:", config);
    
    // Bepaal of mock data moet worden gebruikt
    const shouldUseMock = useMock || mockConfig.isMocked(MockableService.OPENAI);
    console.log("Using mock API:", shouldUseMock);
    
    if (shouldUseMock) {
      console.log("Using mock data for question generation");
      // Simuleer een API vertraging
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return generateMockQuestions(config);
    }
    
    try {
      // Gebruik de echte API
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      });
      
      if (!response.ok) {
        // Als de API een fout teruggeeft, val terug op mock data
        console.error("API error:", response.status, response.statusText);
        console.log("Falling back to mock data");
        return generateMockQuestions(config);
      }
      
      const data = await response.json();
      return data.questions;
    } catch (error) {
      console.error("Error generating questions:", error);
      // Als er een fout optreedt, val terug op mock data
      console.log("Falling back to mock data due to error");
      return generateMockQuestions(config);
    }
  },
  
  // Test de OpenAI API configuratie
  async testApiConfiguration(): Promise<{ 
    status: "success" | "error"; 
    message: string; 
    details?: any;
  }> {
    try {
      // Probeer een eenvoudige API aanroep te doen
      const response = await fetch("/api/simple-test", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        return {
          status: "error",
          message: `API test failed with status: ${response.status} ${response.statusText}`,
          details: await response.text(),
        };
      }
      
      const data = await response.json();
      return {
        status: "success",
        message: "API configuration is working",
        details: data,
      };
    } catch (error) {
      return {
        status: "error",
        message: `Error testing API: ${error instanceof Error ? error.message : String(error)}`,
        details: error,
      };
    }
  },
  
  // Debug OpenAI configuratie
  async debugOpenAI(): Promise<any> {
    try {
      // Verzamel debug informatie
      const response = await fetch("/api/debug-openai", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        return {
          status: "error",
          message: `Debug failed with status: ${response.status} ${response.statusText}`,
          error: await response.text(),
        };
      }
      
      return await response.json();
    } catch (error) {
      return {
        status: "error",
        message: `Error debugging OpenAI: ${error instanceof Error ? error.message : String(error)}`,
        error,
      };
    }
  },
};

export default openaiClient;
