import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  // Verzamel alle omgevingsvariabelen (zonder gevoelige informatie)
  const env: Record<string, string> = {};
  
  // Controleer specifieke omgevingsvariabelen die we nodig hebben
  const requiredVars = ["OPENAI_API_KEY"];
  const missingVars: string[] = [];
  
  for (const key of requiredVars) {
    const value = process.env[key];
    if (!value) {
      missingVars.push(key);
      env[key] = "MISSING";
    } else {
      // Maskeer gevoelige informatie
      if (key === "OPENAI_API_KEY") {
        const maskedKey = `${value.substring(0, 5)}...${value.substring(value.length - 4)}`;
        env[key] = maskedKey;
      } else {
        env[key] = value;
      }
    }
  }
  
  // Voeg algemene omgevingsinformatie toe
  env["NODE_ENV"] = process.env.NODE_ENV || "unknown";
  env["VERCEL_ENV"] = process.env.VERCEL_ENV || "unknown";
  
  return res.status(200).json({
    message: "Environment variables check",
    env,
    missingRequiredVars: missingVars,
    allRequiredVarsPresent: missingVars.length === 0,
    timestamp: new Date().toISOString(),
  });
}
