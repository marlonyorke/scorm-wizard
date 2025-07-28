import type { VercelRequest, VercelResponse } from "@vercel/node";
import { OpenAI } from "openai";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  try {
    // Haal de API-sleutel op uit de omgevingsvariabelen
    const apiKey = process.env.OPENAI_API_KEY || "";
    
    if (!apiKey) {
      return res.status(500).json({
        status: "error",
        message: "OpenAI API Key is not configured",
        details: "The OPENAI_API_KEY environment variable is not set",
      });
    }
    
    // Maskeer de API-sleutel voor veiligheid
    const maskedKey = `${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 4)}`;
    
    // Test de API-sleutel met een eenvoudige aanroep
    try {
      const openai = new OpenAI({
        apiKey: apiKey,
      });
      
      // Probeer een eenvoudige chat completion
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: "Say hello" },
        ],
        max_tokens: 5,
      });
      
      return res.status(200).json({
        status: "success",
        message: "API key is valid and working",
        maskedKey,
        testResponse: completion,
      });
    } catch (apiError: any) {
      // Controleer of het een authenticatiefout is
      const isAuthError = 
        apiError.message?.includes("auth") || 
        apiError.message?.includes("API key") ||
        apiError.message?.includes("authentication") ||
        apiError.message?.includes("401");
      
      if (isAuthError) {
        return res.status(401).json({
          status: "error",
          message: "Invalid API key",
          details: apiError.message,
          maskedKey,
        });
      }
      
      // Andere API-fouten
      return res.status(500).json({
        status: "error",
        message: "API key validation failed",
        details: apiError.message,
        maskedKey,
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      status: "error",
      message: "An unexpected error occurred",
      details: error.message,
    });
  }
}
