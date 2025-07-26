import type { VercelRequest, VercelResponse } from "@vercel/node";
import { OpenAI } from "openai";

// Initialiseer OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed", message: "Only POST requests are supported" });
  }

  try {
    // Eenvoudige test prompt
    const prompt = `
    Genereer 1 multiple choice vraag over biologie voor HAVO niveau.
    
    Retourneer de vraag in het volgende JSON-formaat:
    {
      "questions": [
        {
          "text": "Vraag tekst",
          "options": [
            { "id": "1", "text": "Optie 1", "isCorrect": false },
            { "id": "2", "text": "Optie 2", "isCorrect": true },
            { "id": "3", "text": "Optie 3", "isCorrect": false },
            { "id": "4", "text": "Optie 4", "isCorrect": false }
          ],
          "explanation": "Uitleg waarom het juiste antwoord correct is",
          "multipleCorrect": false,
          "difficulty": "gemiddeld"
        }
      ]
    }
    `;
    
    console.log("Test prompt:", prompt);
    
    // Roep OpenAI API aan
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "Je bent een ervaren docent die multiple choice vragen genereert voor het voortgezet onderwijs." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });
    
    // Parse de response
    const responseContent = completion.choices[0].message.content;
    console.log("Raw OpenAI response:", responseContent);
    
    if (!responseContent) {
      return res.status(500).json({ 
        error: "Empty response", 
        message: "Received empty response from OpenAI API",
        statusCode: 500,
      });
    }
    
    // Stuur de ruwe response terug
    return res.status(200).json({
      rawResponse: responseContent,
      parsedResponse: JSON.parse(responseContent),
      model: completion.model,
      usage: completion.usage,
    });
  } catch (error: any) {
    console.error("Error in test-ai:", error);
    
    return res.status(500).json({
      error: "Failed to test AI",
      message: error.message || "An unknown error occurred",
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      statusCode: 500,
    });
  }
}
