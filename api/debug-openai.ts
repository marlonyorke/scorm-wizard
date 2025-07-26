import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import { Configuration, OpenAIApi } from "openai-edge";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Verzamel alle debug informatie
    const debugInfo: any = {
      status: "debug_complete",
      timestamp: new Date().toISOString(),
      environment: {
        node_version: process.version,
        openai_api_key_exists: !!process.env.OPENAI_API_KEY,
        openai_api_key_length: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0,
        openai_api_key_masked: process.env.OPENAI_API_KEY ? 
          `${process.env.OPENAI_API_KEY.substring(0, 3)}...${process.env.OPENAI_API_KEY.substring(process.env.OPENAI_API_KEY.length - 4)}` : 
          "niet gevonden",
        openai_organization: process.env.OPENAI_ORGANIZATION || "niet ingesteld",
      },
      request_info: {
        headers: req.headers,
        method: req.method,
      },
    };

    // Test OpenAI client (nieuwe client)
    let newClientTest = { success: false, error: null, models: [] };
    try {
      if (process.env.OPENAI_API_KEY) {
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
        
        // Probeer een lijst van modellen op te halen
        const modelResponse = await openai.models.list();
        newClientTest = {
          success: true,
          error: null,
          models: modelResponse.data.slice(0, 5).map((model) => model.id), // Beperk tot 5 modellen
        };
      } else {
        newClientTest = {
          success: false,
          error: "OpenAI API-sleutel niet gevonden in omgevingsvariabelen",
          models: [],
        };
      }
    } catch (error: any) {
      newClientTest = {
        success: false,
        error: error.message || "Onbekende fout bij het testen van de nieuwe OpenAI client",
        models: [],
        stack: error.stack,
        code: error.code,
        type: error.type,
        param: error.param,
        statusCode: error.statusCode,
      };
    }
    debugInfo.new_client_test = newClientTest;

    // Test OpenAI Edge client
    let edgeClientTest = { success: false, error: null };
    try {
      if (process.env.OPENAI_API_KEY) {
        const configuration = new Configuration({
          apiKey: process.env.OPENAI_API_KEY,
        });
        const openaiEdge = new OpenAIApi(configuration);
        
        // Probeer een eenvoudige chat completion uit te voeren
        const chatResponse = await openaiEdge.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: "Hello, this is a test" }],
          max_tokens: 5,
        });
        
        if (chatResponse.status === 200) {
          edgeClientTest = {
            success: true,
            error: null,
            status: chatResponse.status,
            statusText: chatResponse.statusText,
          };
        } else {
          edgeClientTest = {
            success: false,
            error: `Onverwachte status: ${chatResponse.status} ${chatResponse.statusText}`,
            status: chatResponse.status,
            statusText: chatResponse.statusText,
          };
        }
      } else {
        edgeClientTest = {
          success: false,
          error: "OpenAI API-sleutel niet gevonden in omgevingsvariabelen",
        };
      }
    } catch (error: any) {
      edgeClientTest = {
        success: false,
        error: error.message || "Onbekende fout bij het testen van de OpenAI Edge client",
        stack: error.stack,
        code: error.code,
        type: error.type,
        param: error.param,
        statusCode: error.statusCode,
      };
    }
    debugInfo.edge_client_test = edgeClientTest;

    // Test fetch API direct
    let fetchTest = { success: false, error: null, response: null };
    try {
      if (process.env.OPENAI_API_KEY) {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: "Hello, this is a direct fetch test" }],
            max_tokens: 5,
          }),
        });
        
        const responseData = await response.json();
        
        fetchTest = {
          success: response.ok,
          error: response.ok ? null : `Fout: ${response.status} ${response.statusText}`,
          response: {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            data: responseData,
          },
        };
      } else {
        fetchTest = {
          success: false,
          error: "OpenAI API-sleutel niet gevonden in omgevingsvariabelen",
          response: null,
        };
      }
    } catch (error: any) {
      fetchTest = {
        success: false,
        error: error.message || "Onbekende fout bij het direct aanroepen van de OpenAI API",
        stack: error.stack,
        code: error.code,
        type: error.type,
        response: null,
      };
    }
    debugInfo.fetch_test = fetchTest;

    // Voeg aanbevelingen toe op basis van de testresultaten
    const recommendations = [];
    
    if (!process.env.OPENAI_API_KEY) {
      recommendations.push("Stel de OPENAI_API_KEY omgevingsvariabele in.");
    } else if (process.env.OPENAI_API_KEY.length < 30) {
      recommendations.push("De OPENAI_API_KEY lijkt ongeldig (te kort). Controleer of de sleutel correct is.");
    }
    
    if (!newClientTest.success && !edgeClientTest.success && !fetchTest.success) {
      recommendations.push("Alle API-tests zijn mislukt. Controleer je internetverbinding en API-sleutel.");
      
      if (fetchTest.error && fetchTest.error.includes("401")) {
        recommendations.push("401 Unauthorized: Je API-sleutel is ongeldig of verlopen. Genereer een nieuwe sleutel in je OpenAI account.");
      }
      
      if (fetchTest.error && fetchTest.error.includes("429")) {
        recommendations.push("429 Too Many Requests: Je hebt je API-limiet bereikt of je account heeft onvoldoende krediet.");
      }
    }
    
    debugInfo.recommendations = recommendations;

    // Stuur de debug informatie terug
    res.status(200).json(debugInfo);
  } catch (error: any) {
    console.error("Error in debug-openai endpoint:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Er is een onbekende fout opgetreden bij het debuggen van de OpenAI configuratie",
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code,
        type: error.type,
      },
    });
  }
}
