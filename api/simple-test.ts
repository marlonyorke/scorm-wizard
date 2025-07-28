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
    
    console.log("Trying a simple chat completion...");
    
    // Eenvoudige test aanroep
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Hello, are you working?" },
      ],
      max_tokens: 10,
    });
    
    console.log("Chat completion response:", completion);
    
    // Stuur de response terug
    return res.status(200).json({
      status: "success",
      message: "OpenAI Chat API is working",
      completion: completion,
      apiKeyConfigured: !!apiKey,
      apiKeyMasked: maskedKey,
    });
  } catch (error: any) {
    console.error("Error in simple test:", error);
    
    return res.status(500).json({
      error: "Failed to test OpenAI",
      message: error.message || "An unknown error occurred",
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      statusCode: 500,
      timestamp: new Date().toISOString(),
    });
  }
}
