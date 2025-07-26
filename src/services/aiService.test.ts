import { vi, describe, it, expect, beforeEach } from "vitest";

import type { AIService} from "./aiService";
import { createAIService } from "./aiService";

import type { AIGenerationConfig } from "@/types/ai";


// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock AbortController
class MockAbortController {
  signal = { aborted: false };
  abort() {
    this.signal.aborted = true;
  }
}
global.AbortController = MockAbortController as any;

describe("AIService", () => {
  let aiService: AIService;

  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
    
    // Create a new AIService instance with a shorter timeout for testing
    aiService = createAIService({
      timeout: 1000,
      maxRetries: 1,
    });
  });

  describe("generateQuestions", () => {
    const mockConfig: AIGenerationConfig = {
      educationLevel: "HAVO",
      year: "3",
      subject: "Biologie",
      theme: "Planten",
      chapter: "Fotosynthese",
      batchSize: 1,
    };

    const mockResponse = {
      questions: [
        {
          text: "Wat is fotosynthese?",
          options: [
            { id: "1", text: "Een proces waarbij planten zuurstof produceren", correct: true },
            { id: "2", text: "Een proces waarbij planten zuurstof verbruiken", correct: false },
          ],
          explanation: "Fotosynthese is het proces waarbij planten zonlicht omzetten in energie.",
          multipleCorrect: false,
        },
      ],
      metadata: {
        generatedAt: new Date().toISOString(),
        model: "gpt-4",
        promptTokens: 100,
        completionTokens: 200,
        totalTokens: 300,
      },
    };

    const mockResponseJson = JSON.stringify(mockResponse);
    const mockEmptyResponse = JSON.stringify({ 
      questions: [], 
      metadata: mockResponse.metadata, 
    });
    const mockErrorResponse = JSON.stringify({ error: "Something went wrong" });

    it("should successfully generate questions", async () => {
      // Mock successful response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => mockResponseJson,
      });

      // Mock progress callback
      const progressCallback = vi.fn();

      // Call the method
      const result = await aiService.generateQuestions(mockConfig, progressCallback);

      // Verify fetch was called with correct parameters
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/generate-questions"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({ "Content-Type": "application/json" }),
          body: expect.any(String),
        }),
      );

      // Verify progress callback was called
      expect(progressCallback).toHaveBeenCalledWith(expect.objectContaining({
        status: expect.any(String),
        progress: expect.any(Number),
      }));

      // Verify result
      expect(result).toEqual(mockResponse);
    });

    it("should retry on network error", async () => {
      // First call fails with network error, second succeeds
      mockFetch.mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce({
          ok: true,
          text: async () => mockResponseJson,
        });

      // Call the method
      const result = await aiService.generateQuestions(mockConfig);

      // Verify fetch was called twice (initial + 1 retry)
      expect(mockFetch).toHaveBeenCalledTimes(2);

      // Verify result
      expect(result).toEqual(mockResponse);
    });

    it("should throw error when API returns non-OK response", async () => {
      // Mock failed response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        text: async () => mockErrorResponse,
      });

      // Call the method and expect it to throw
      await expect(aiService.generateQuestions(mockConfig))
        .rejects.toThrow();
    });

    it("should handle empty questions array", async () => {
      // Mock response with empty questions array
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => mockEmptyResponse,
      });

      // Tweede poging moet ook een lege array teruggeven
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => mockEmptyResponse,
      });

      // Call the method and expect it to throw
      await expect(aiService.generateQuestions(mockConfig))
        .rejects.toThrow("Geen vragen gegenereerd");
    });

    it("should handle cancellation", async () => {
      // Create a mock AbortController that we can trigger
      const mockController = new MockAbortController();
      vi.spyOn(global, "AbortController").mockImplementationOnce(() => mockController as any);

      // Start the request
      const promise = aiService.generateQuestions(mockConfig);
      
      // Immediately cancel it
      aiService.cancelGeneration();
      
      // Verify the abort was called
      expect(mockController.signal.aborted).toBe(true);
      
      // Expect the promise to reject
      await expect(promise).rejects.toThrow("Generation cancelled");
    });
  });

  describe("testConnection", () => {
    it("should return true for successful connection", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ status: "ok" }),
      });

      const result = await aiService.testConnection();
      expect(result).toBe(true);
    });

    it("should return false for failed connection", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        text: async () => JSON.stringify({ error: "Server error" }),
      });

      const result = await aiService.testConnection();
      expect(result).toBe(false);
    });

    it("should return false for network error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const result = await aiService.testConnection();
      expect(result).toBe(false);
    });
  });
});
