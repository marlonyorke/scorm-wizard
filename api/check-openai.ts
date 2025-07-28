import type { VercelRequest, VercelResponse } from "@vercel/node";
import { OpenAI } from "openai";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  try {
    // Log de API-sleutel (alleen de eerste 5 en laatste 4 tekens voor veiligheid)
    const apiKey = process.env.OPENAI_API_KEY || "";
    const maskedKey = apiKey ? 
      `${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 4)}` : 
      "niet gevonden";
    
    console.log("OpenAI API Key (gemaskeerd):", maskedKey);
    
    if (!apiKey) {
      return res.status(500).json({
        error: "Missing API Key",
        message: "OpenAI API Key is not configured",
        statusCode: 500,
      });
    }
    
    // Initialiseer OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey,
    });
    
    // Eenvoudige test aanroep
    try {
      const modelsList = await openai.models.list();
      
      // Stuur de response terug
      return res.status(200).json({
        status: "success",
        message: "OpenAI API is correctly configured",
        models: modelsList.data.map((model) => model.id).slice(0, 10), // Alleen de eerste 10 modellen
        apiKeyConfigured: !!apiKey,
        apiKeyMasked: maskedKey,
      });
    } catch (apiError: any) {
      console.error("OpenAI API error:", apiError);
      
      // Probeer een eenvoudige chat completion te maken
      try {
        console.log("Trying a simple chat completion...");
        
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: "Hello, are you working?" },
          ],
          max_tokens: 10,
        });
        
        return res.status(200).json({
          status: "partial_success",
          message: "OpenAI Chat API is working, but models.list failed",
          completion: completion,
          apiError: apiError.message,
          apiKeyConfigured: !!apiKey,
          apiKeyMasked: maskedKey,
        });
      } catch (chatError: any) {
        console.error("OpenAI Chat API error:", chatError);
        
        return res.status(500).json({
          error: "OpenAI API Error",
          message: "Failed to connect to OpenAI API",
          modelListError: apiError.message,
          chatError: chatError.message,
          apiKeyConfigured: !!apiKey,
          apiKeyMasked: maskedKey,
          statusCode: 500,
        });
      }
    }
  } catch (error: any) {
    console.error("Error checking OpenAI configuration:", error);
    
    return res.status(500).json({
      error: "Failed to check OpenAI configuration",
      message: error.message || "An unknown error occurred",
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      statusCode: 500,
    });
  }
}
