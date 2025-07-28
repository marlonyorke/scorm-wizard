// API hulpprogramma's voor het afhandelen van API-verzoeken

/**
 * Controleert of de API bereikbaar is
 * @returns Een object met informatie over de API-status
 */
export async function checkApiStatus(): Promise<{
  isAvailable: boolean;
  message: string;
  details?: any;
}> {
  try {
    const response = await fetch("/api/check-env", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      return {
        isAvailable: false,
        message: `API niet beschikbaar. Status: ${response.status} ${response.statusText}`,
        details: { status: response.status, statusText: response.statusText },
      };
    }
    
    const data = await response.json();
    return {
      isAvailable: true,
      message: "API is beschikbaar",
      details: data,
    };
  } catch (error) {
    console.error("Error checking API status:", error);
    return {
      isAvailable: false,
      message: `API niet bereikbaar: ${error instanceof Error ? error.message : String(error)}`,
      details: { error: String(error) },
    };
  }
}

/**
 * Test de API-sleutel
 * @returns Een object met informatie over de API-sleutel status
 */
export async function testApiKey(): Promise<{
  isValid: boolean;
  message: string;
  details?: any;
}> {
  try {
    const response = await fetch("/api/test-api-key", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      return {
        isValid: false,
        message: `API-sleutel test mislukt. Status: ${response.status} ${response.statusText}`,
        details: { status: response.status, statusText: response.statusText },
      };
    }
    
    const data = await response.json();
    return {
      isValid: data.valid,
      message: data.message || "API-sleutel test voltooid",
      details: data,
    };
  } catch (error) {
    console.error("Error testing API key:", error);
    return {
      isValid: false,
      message: `API-sleutel test mislukt: ${error instanceof Error ? error.message : String(error)}`,
      details: { error: String(error) },
    };
  }
}

/**
 * Controleert de OpenAI configuratie
 * @returns Een object met informatie over de OpenAI configuratie
 */
export async function checkOpenAIConfig(): Promise<{
  isConfigured: boolean;
  message: string;
  details?: any;
}> {
  try {
    const response = await fetch("/api/check-openai", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      return {
        isConfigured: false,
        message: `OpenAI configuratie controle mislukt. Status: ${response.status} ${response.statusText}`,
        details: { status: response.status, statusText: response.statusText },
      };
    }
    
    const data = await response.json();
    return {
      isConfigured: data.configured,
      message: data.message || "OpenAI configuratie controle voltooid",
      details: data,
    };
  } catch (error) {
    console.error("Error checking OpenAI configuration:", error);
    return {
      isConfigured: false,
      message: `OpenAI configuratie controle mislukt: ${error instanceof Error ? error.message : String(error)}`,
      details: { error: String(error) },
    };
  }
}

/**
 * Verzamelt diagnostische informatie over de API en OpenAI configuratie
 * @returns Een object met diagnostische informatie
 */
export async function collectDiagnostics(): Promise<{
  apiStatus: { isAvailable: boolean; message: string; details?: any };
  apiKey: { isValid: boolean; message: string; details?: any };
  openaiConfig: { isConfigured: boolean; message: string; details?: any };
  environment: { [key: string]: string | undefined };
  timestamp: string;
}> {
  const apiStatus = await checkApiStatus();
  const apiKey = await testApiKey();
  const openaiConfig = await checkOpenAIConfig();
  
  // Verzamel veilige omgevingsinformatie (zonder gevoelige gegevens)
  const environment = {
    nodeEnv: process.env.NODE_ENV,
    browser: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    // Geen API sleutels of andere gevoelige informatie hier
  };
  
  return {
    apiStatus,
    apiKey,
    openaiConfig,
    environment,
    timestamp: new Date().toISOString(),
  };
}

export default {
  checkApiStatus,
  testApiKey,
  checkOpenAIConfig,
  collectDiagnostics,
};
