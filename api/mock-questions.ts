import type { VercelRequest, VercelResponse } from "@vercel/node";

import type { AIGenerationConfig, AIGenerationResponse, AIMultipleChoiceQuestion } from "../src/types/ai";

// Functie om een mock vraag te genereren op basis van de configuratie
function generateMockQuestion(config: AIGenerationConfig, index: number): AIMultipleChoiceQuestion {
  const { educationLevel, year, subject, theme, chapter } = config;
  
  // Genereer een specifieke vraag op basis van het thema en hoofdstuk
  let questionText = "";
  let options = [];
  let explanation = "";
  
  // Voorgedefinieerde vragen voor biologie
  if (subject.toLowerCase() === "biologie") {
    if (theme && theme.toLowerCase().includes("plant")) {
      if (chapter && chapter.toLowerCase().includes("fotosynthese")) {
        // Vragen over fotosynthese
        const fotosynthesisQuestions = [
          {
            text: "Welk gas is een belangrijk bijproduct van fotosynthese?",
            options: [
              { id: "1", text: "Zuurstof", isCorrect: true },
              { id: "2", text: "Koolstofdioxide", isCorrect: false },
              { id: "3", text: "Stikstof", isCorrect: false },
              { id: "4", text: "Waterstof", isCorrect: false },
            ],
            explanation: "Tijdens fotosynthese zetten planten koolstofdioxide en water om in glucose en zuurstof. Zuurstof is dus een bijproduct van dit proces.",
          },
          {
            text: "Welke stof is GEEN onderdeel van het fotosyntheseproces?",
            options: [
              { id: "1", text: "Koolstofdioxide", isCorrect: false },
              { id: "2", text: "Water", isCorrect: false },
              { id: "3", text: "Methaan", isCorrect: true },
              { id: "4", text: "Zonlicht", isCorrect: false },
            ],
            explanation: "Fotosynthese gebruikt koolstofdioxide, water en zonlicht om glucose te produceren. Methaan is geen onderdeel van dit proces.",
          },
          {
            text: "Waar in de plantencel vindt fotosynthese plaats?",
            options: [
              { id: "1", text: "Celkern", isCorrect: false },
              { id: "2", text: "Mitochondriën", isCorrect: false },
              { id: "3", text: "Chloroplasten", isCorrect: true },
              { id: "4", text: "Ribosomen", isCorrect: false },
            ],
            explanation: "Fotosynthese vindt plaats in de chloroplasten, speciale organellen in plantencellen die het groene pigment chlorofyl bevatten.",
          },
        ];
        
        // Kies een willekeurige vraag uit de lijst
        const randomQuestion = fotosynthesisQuestions[index % fotosynthesisQuestions.length];
        questionText = randomQuestion.text;
        options = randomQuestion.options;
        explanation = randomQuestion.explanation;
      } else {
        // Algemene vragen over planten
        const plantQuestions = [
          {
            text: "Welk deel van de plant is verantwoordelijk voor het opnemen van water en mineralen?",
            options: [
              { id: "1", text: "Bladeren", isCorrect: false },
              { id: "2", text: "Stengel", isCorrect: false },
              { id: "3", text: "Wortels", isCorrect: true },
              { id: "4", text: "Bloemen", isCorrect: false },
            ],
            explanation: "De wortels van een plant zijn gespecialiseerd in het opnemen van water en mineralen uit de bodem.",
          },
          {
            text: "Welk proces is uniek voor planten en niet voor dieren?",
            options: [
              { id: "1", text: "Celademhaling", isCorrect: false },
              { id: "2", text: "Fotosynthese", isCorrect: true },
              { id: "3", text: "Celdeling", isCorrect: false },
              { id: "4", text: "Eiwitproductie", isCorrect: false },
            ],
            explanation: "Fotosynthese is een uniek proces voor planten en andere organismen die chlorofyl bevatten, zoals algen en sommige bacteriën. Dieren kunnen geen fotosynthese uitvoeren.",
          },
        ];
        
        // Kies een willekeurige vraag uit de lijst
        const randomQuestion = plantQuestions[index % plantQuestions.length];
        questionText = randomQuestion.text;
        options = randomQuestion.options;
        explanation = randomQuestion.explanation;
      }
    } else if (theme && theme.toLowerCase().includes("cel")) {
      // Vragen over cellen
      const cellQuestions = [
        {
          text: "Welk organel wordt beschouwd als de 'energiecentrale' van de cel?",
          options: [
            { id: "1", text: "Ribosoom", isCorrect: false },
            { id: "2", text: "Mitochondrion", isCorrect: true },
            { id: "3", text: "Golgi-apparaat", isCorrect: false },
            { id: "4", text: "Endoplasmatisch reticulum", isCorrect: false },
          ],
          explanation: "Mitochondriën worden beschouwd als de 'energiecentrales' van de cel omdat ze verantwoordelijk zijn voor de productie van ATP, de energiedrager in cellen.",
        },
        {
          text: "Welke van de volgende organellen bevat DNA?",
          options: [
            { id: "1", text: "Ribosoom", isCorrect: false },
            { id: "2", text: "Golgi-apparaat", isCorrect: false },
            { id: "3", text: "Mitochondrion", isCorrect: true },
            { id: "4", text: "Lysosoom", isCorrect: false },
          ],
          explanation: "Mitochondriën bevatten hun eigen DNA, bekend als mitochondriaal DNA (mtDNA). Dit is een overblijfsel van hun evolutionaire oorsprong als onafhankelijke organismen.",
        },
      ];
      
      // Kies een willekeurige vraag uit de lijst
      const randomQuestion = cellQuestions[index % cellQuestions.length];
      questionText = randomQuestion.text;
      options = randomQuestion.options;
      explanation = randomQuestion.explanation;
    } else {
      // Algemene biologievragen
      questionText = `Algemene biologievraag ${index + 1} voor ${educationLevel} niveau, leerjaar ${year}`;
      options = [
        { id: "1", text: `Correct antwoord voor vraag ${index + 1}`, isCorrect: true },
        { id: "2", text: `Incorrect antwoord 1 voor vraag ${index + 1}`, isCorrect: false },
        { id: "3", text: `Incorrect antwoord 2 voor vraag ${index + 1}`, isCorrect: false },
        { id: "4", text: `Incorrect antwoord 3 voor vraag ${index + 1}`, isCorrect: false },
      ];
      explanation = `Dit is een uitleg voor algemene biologievraag ${index + 1}`;
    }
  } else {
    // Voor andere vakken
    questionText = `${theme ? `${theme}: ` : ""}${chapter ? `${chapter}: ` : ""}Specifieke vraag ${index + 1} voor ${subject} op ${educationLevel} niveau, leerjaar ${year}`;
    options = [
      { id: "1", text: `Correct antwoord voor vraag ${index + 1}`, isCorrect: true },
      { id: "2", text: `Incorrect antwoord 1 voor vraag ${index + 1}`, isCorrect: false },
      { id: "3", text: `Incorrect antwoord 2 voor vraag ${index + 1}`, isCorrect: false },
      { id: "4", text: `Incorrect antwoord 3 voor vraag ${index + 1}`, isCorrect: false },
    ];
    explanation = `Dit is een uitleg voor vraag ${index + 1} over ${theme || subject} ${chapter ? `(${chapter})` : ""}`;
  }
  
  return {
    text: questionText,
    options,
    explanation,
    multipleCorrect: false,
    difficulty: "gemiddeld",
  };
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  console.log("Mock API Request received:", req.method);
  
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed", message: "Only POST requests are supported" });
  }

  try {
    console.log("Request body:", JSON.stringify(req.body));
    
    const config: AIGenerationConfig = req.body;
    const batchSize = config.batchSize || 1;
    
    // Genereer mock vragen
    const questions: AIMultipleChoiceQuestion[] = [];
    for (let i = 0; i < batchSize; i++) {
      questions.push(generateMockQuestion(config, i));
    }
    
    // Bereid de response voor
    const response: AIGenerationResponse = {
      questions,
      metadata: {
        generatedAt: new Date().toISOString(),
        model: "mock-model",
        promptTokens: 100,
        completionTokens: 200,
        totalTokens: 300,
      },
    };
    
    console.log("Sending mock response with", response.questions.length, "questions");
    
    // Wacht even om een echte API-aanroep te simuleren
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Stuur de response terug
    return res.status(200).json(response);
  } catch (error: any) {
    console.error("Error generating mock questions:", error);
    
    return res.status(500).json({
      error: "Failed to generate mock questions",
      message: error.message || "An unknown error occurred",
      statusCode: 500,
    });
  }
}
