/**
 * Dit is een eenvoudig testscript om de AIService te testen.
 * Je kunt dit script uitvoeren met: npx ts-node src/services/testAIService.ts
 */

import { aiService } from "./index";

import type { GenerationProgress } from "@/types/ai";

// Test functie
async function testAIService() {
  console.log("🧪 Testing AIService...");
  
  try {
    // Test de connectie
    console.log("Testing connection...");
    const isConnected = await aiService.testConnection();
    console.log(`Connection test result: ${isConnected ? "✅ Connected" : "❌ Not connected"}`);
    
    if (!isConnected) {
      console.log("Skipping question generation test since connection failed");
      return;
    }
    
    // Test vraag generatie
    console.log("\nTesting question generation...");
    
    const progressCallback = (progress: GenerationProgress) => {
      console.log(`Progress: ${progress.status} - ${Math.round(progress.progress * 100)}% - ${progress.message || ""}`);
    };
    
    const result = await aiService.generateQuestions({
      educationLevel: "HAVO",
      year: "3",
      subject: "Biologie",
      theme: "Planten",
      chapter: "Fotosynthese",
      batchSize: 1,
    }, progressCallback);
    
    console.log("\nGenerated questions:");
    console.log(JSON.stringify(result, null, 2));
    
    console.log("\n✅ AIService test completed successfully!");
  } catch (error) {
    console.error("\n❌ AIService test failed:");
    console.error(error);
  }
}

// Voer de test uit
testAIService();
