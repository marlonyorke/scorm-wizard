import { describe, it, expect, beforeEach, afterEach } from "vitest";

import openaiClient from "../openai-client";

import mockConfig, { MockableService } from "@/config/mock-config";
import type { AIGenerationConfig } from "@/types/ai";

describe("OpenAI Client", () => {
  // Test configuratie
  const testConfig: AIGenerationConfig = {
    educationLevel: "VMBO",
    year: 3,
    subject: "Biologie",
    theme: "Evolutie",
    chapter: "Natuurlijke selectie",
    batchSize: 2,
  };

  // Zorg ervoor dat mock services zijn ingeschakeld voor deze tests
  beforeEach(() => {
    mockConfig.enable(MockableService.OPENAI, true);
  });

  // Reset mock configuratie na elke test
  afterEach(() => {
    mockConfig.reset();
  });

  it("should generate questions using mock data when mock is enabled", async () => {
    // Controleer of mock is ingeschakeld
    expect(mockConfig.isMocked(MockableService.OPENAI)).toBe(true);
    
    // Genereer vragen (zou mock data moeten gebruiken)
    const questions = await openaiClient.generateQuestions(testConfig);
    
    // Verwachtingen
    expect(questions).toBeDefined();
    expect(Array.isArray(questions)).toBe(true);
    expect(questions.length).toBe(testConfig.batchSize);
    
    // Controleer of de gegenereerde vragen de verwachte structuur hebben
    questions.forEach((question, index) => {
      expect(question.text).toContain(testConfig.theme);
      expect(question.options.length).toBe(4);
      expect(question.explanation).toBeDefined();
      
      // Controleer of er precies één correct antwoord is (voor mock data)
      const correctOptions = question.options.filter((option) => option.isCorrect);
      expect(correctOptions.length).toBe(1);
    });
  });

  it("should use the correct parameters when generating questions", async () => {
    // Genereer vragen met specifieke parameters
    const customConfig: AIGenerationConfig = {
      ...testConfig,
      theme: "Genetica",
      chapter: "DNA",
      batchSize: 3,
    };
    
    const questions = await openaiClient.generateQuestions(customConfig);
    
    // Controleer of de parameters correct zijn gebruikt
    expect(questions.length).toBe(customConfig.batchSize);
    questions.forEach((question) => {
      expect(question.text).toContain(customConfig.theme);
      expect(question.text).toContain(customConfig.chapter);
    });
  });

  it("should not use mock data when mock is disabled", async () => {
    // Schakel mock uit
    mockConfig.disable(MockableService.OPENAI);
    expect(mockConfig.isMocked(MockableService.OPENAI)).toBe(false);
    
    // Mock de fetch functie om een API response te simuleren
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue([
        {
          text: "API gegenereerde vraag",
          options: [
            { id: "1", text: "API optie 1", isCorrect: true },
            { id: "2", text: "API optie 2", isCorrect: false },
          ],
          explanation: "API uitleg",
          multipleCorrect: false,
          difficulty: "gemiddeld",
        },
      ]),
    });
    
    // Genereer vragen (zou de gemockte API moeten gebruiken)
    const questions = await openaiClient.generateQuestions(testConfig);
    
    // Verwachtingen
    expect(questions).toBeDefined();
    expect(Array.isArray(questions)).toBe(true);
    expect(questions[0].text).toBe("API gegenereerde vraag");
    
    // Controleer of fetch is aangeroepen met de juiste parameters
    expect(global.fetch).toHaveBeenCalledWith("/api/generate-questions", expect.any(Object));
  });
});
