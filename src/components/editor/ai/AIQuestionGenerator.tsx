import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload, X, AlertTriangle, Eye } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import ApiDiagnostics from "@/api/api-diagnostics";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useQuestions } from "@/contexts/QuestionsContext";
import { aiService } from "@/services";
import type { 
  AIGenerationConfig, 
  AIMultipleChoiceQuestion, 
  GenerationProgress} from "@/types/ai";
import { 
  AIGenerationResponse,
  GenerationStatus, 
} from "@/types/ai";
import type { Question } from "@/types/editor";
import { Progress } from "@/components/ui/progress";

// Schema voor het formulier
const formSchema = z.object({
  educationLevel: z.enum(["mavo", "havo", "vwo"] as const),
  year: z.string().min(1, "Leerjaar is verplicht"),
  subject: z.string().min(1, "Vak is verplicht"),
  theme: z.string().min(1, "Thema is verplicht"),
  chapter: z.string().min(1, "Hoofdstuk is verplicht"),
  batchSize: z.number().min(1).max(5),
  customMaterial: z.string().optional(),
});

interface AIQuestionGeneratorProps {
  onQuestionGenerated: (question: Question) => void;
  onClose: () => void;
}

export function AIQuestionGenerator({ onQuestionGenerated, onClose }: AIQuestionGeneratorProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress>({
    status: "idle",
    progress: 0,
  });
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(0);
  const [rawApiResponse, setRawApiResponse] = useState<string>("");
  const [fullPrompt, setFullPrompt] = useState<string>("");
  const [useMockApi, setUseMockApi] = useState<boolean>(false);
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Tijdschatting variabelen
  const [startTime, setStartTime] = useState<number | null>(null);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<string>("");
  
  // Simulatie van voortgang
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Sarcastische berichten voor de voortgangsbalk
  const sarcasticMessages = [
    "Even geduld, de AI is aan het nadenken...",
    "Wachten is een kunst, en jij bent een kunstenaar!",
    "Bijna klaar, of toch niet? Wie weet...",
    "De AI is druk bezig. Koffie halen?",
    "Vragen genereren is als koken, het duurt even voordat het gaar is...",
    "AI denkt na... of simuleert nadenken. Wie zal het zeggen?",
    "Nog even geduld, Rome is ook niet in één dag gebouwd...",
    "De hamsters in onze servers rennen zo snel als ze kunnen!",
    "Wist je dat wachten goed is voor je geduld? Zie, je leert nu al!",
    "Onze AI zoekt naar kennis in het universum... of op Google.",
    "Geduld is een schone zaak, zeker als je geen keuze hebt.",
  ];
  
  // Huidige sarcastische bericht index
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  
  // Wissel sarcastische berichten elke 3 seconden
  useEffect(() => {
    if (generationProgress.status === "generating" || generationProgress.status === "reviewing") {
      const interval = setInterval(() => {
        setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % sarcasticMessages.length);
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [generationProgress.status, sarcasticMessages.length]);
  
  // Bereken geschatte resterende tijd
  useEffect(() => {
    if (generationProgress.status === "generating" || generationProgress.status === "reviewing") {
      // Als we net beginnen, sla de starttijd op
      if (!startTime && generationProgress.progress > 0) {
        setStartTime(Date.now());
      } 
      // Als we al bezig zijn, bereken de geschatte resterende tijd
      else if (startTime && generationProgress.progress > 0.05) {
        const elapsedTime = Date.now() - startTime;
        const estimatedTotalTime = elapsedTime / generationProgress.progress;
        const remainingTime = estimatedTotalTime - elapsedTime;
        
        // Converteer naar seconden/minuten
        if (remainingTime < 60000) {
          // Minder dan een minuut
          setEstimatedTimeRemaining(`nog ongeveer ${Math.ceil(remainingTime / 1000)} seconden`);
        } else {
          // Meer dan een minuut
          setEstimatedTimeRemaining(`nog ongeveer ${Math.ceil(remainingTime / 60000)} minuten`);
        }
      }
    } else if (generationProgress.status === "complete" || generationProgress.status === "error") {
      // Reset de tijdschatting als we klaar zijn
      setStartTime(null);
      setEstimatedTimeRemaining("");
    }
  }, [generationProgress, startTime]);
  
  // Simuleer voortgang tijdens het genereren
  useEffect(() => {
    // Start de simulatie wanneer we beginnen met genereren
    if (generationProgress.status === "generating") {
      // Zorg ervoor dat we minstens op 1% beginnen
      if (generationProgress.progress < 0.01) {
        setGenerationProgress((prev) => ({
          ...prev,
          progress: 0.01,
        }));
      }
      
      // Reset eventuele bestaande interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      
      // Start een nieuwe interval die de voortgang geleidelijk verhoogt
      progressIntervalRef.current = setInterval(() => {
        setGenerationProgress((prev) => {
          // Bereken de nieuwe voortgang met een niet-lineaire curve
          // Dit zorgt voor een snellere start en een geleidelijke vertraging
          const currentProgress = prev.progress;
          
          // Verschillende snelheden afhankelijk van de huidige voortgang
          let increment = 0.005; // Basis increment
          
          if (currentProgress < 0.3) {
            // Sneller aan het begin (0-30%)
            increment = 0.01;
          } else if (currentProgress < 0.7) {
            // Gemiddelde snelheid in het midden (30-70%)
            increment = 0.007;
          } else if (currentProgress < 0.9) {
            // Langzamer naar het einde (70-90%)
            increment = 0.004;
          } else {
            // Zeer langzaam in de laatste fase (90-95%)
            increment = 0.002;
          }
          
          // Zorg ervoor dat we niet boven 95% komen
          const newProgress = Math.min(currentProgress + increment, 0.95);
          
          return {
            ...prev,
            progress: newProgress,
          };
        });
      }, 200); // Snellere updates voor vloeiendere animatie
      
      return () => {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      };
    }
    
    // Stop de simulatie wanneer we klaar zijn of een fout hebben
    if (generationProgress.status === "complete" || generationProgress.status === "error") {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      
      // Zorg ervoor dat we op 100% eindigen bij voltooiing
      if (generationProgress.status === "complete" && generationProgress.progress < 1) {
        setGenerationProgress((prev) => ({
          ...prev,
          progress: 1,
        }));
      }
    }
  }, [generationProgress.status, generationProgress.progress]);
  
  // Get the questions context to add all generated questions
  const { addQuestion } = useQuestions();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      educationLevel: "havo",
      year: "3",
      subject: "",
      theme: "",
      chapter: "",
      batchSize: 1,
      customMaterial: "",
    },
  });

  // Annuleer de generatie wanneer de component unmount
  useEffect(() => {
    return () => {
      if (isGenerating) {
        aiService.cancelGeneration();
      }
    };
  }, [isGenerating]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    
    // Controleer bestandstype
    const validTypes = ["text/plain", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Ongeldig bestandstype",
        description: "Upload alleen .txt of .docx bestanden",
        variant: "destructive",
      });
      return;
    }
    
    setUploadedFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      // Voeg de inhoud toe aan het customMaterial veld
      form.setValue("customMaterial", 
        (form.getValues("customMaterial") || "") + "\n\n" + content,
      );
    };
    
    reader.readAsText(file);
  };

  const clearUploadedFile = () => {
    setUploadedFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsGenerating(true);
    // Begin met een kleine initiële voortgang om te voorkomen dat we op 0% blijven hangen
    setGenerationProgress({
      status: "generating",
      progress: 0.01,
      message: "Verbinding maken met AI...",
    });
    setStartTime(Date.now()); // Reset de starttijd
    
    try {
      // Gebruik de AIService om vragen te genereren
      const data = await aiService.generateQuestions(
        values as AIGenerationConfig,
        (progress) => {
          // Als we een echte voortgangsupdate krijgen van de API, gebruik die
          // maar alleen als het hoger is dan onze huidige gesimuleerde voortgang
          if (progress.progress > generationProgress.progress) {
            setGenerationProgress(progress);
          }
        },
        useMockApi,
      );
      
      // Sla de ruwe API respons op
      setRawApiResponse(JSON.stringify(data, null, 2));
      
      // Sla de volledige prompt op
      setFullPrompt(aiService.getFullPrompt(values as AIGenerationConfig));
      
      if (data.questions.length > 0) {
        // Log de ontvangen vragen van de API
        console.log("ONTVANGEN AI VRAGEN:", JSON.stringify(data.questions, null, 2));
        
        // Extra debug logging om te controleren of de feedback velden aanwezig zijn
        const firstQuestion = data.questions[0];
        console.log("Eerste vraag feedback velden check:");
        console.log("- Algemene explanation:", firstQuestion.explanation);
        console.log("- Algemene correctFeedback:", firstQuestion.correctFeedback);
        console.log("- Algemene incorrectFeedback:", firstQuestion.incorrectFeedback);
        console.log("- Opties met feedback check:");
        firstQuestion.options.forEach((option) => {
          console.log(`  Optie ${option.id} (${option.isCorrect ? "correct" : "incorrect"}): "${option.text}"`);
          console.log(`  Feedback aanwezig: ${option.feedback ? "JA" : "NEE"}`);
          console.log(`  Feedback: "${option.feedback || "ONTBREEKT"}"`);
        });
        
        // Converteer alle AI-gegenereerde vragen naar het Question formaat
        const newQuestions: Question[] = data.questions.map((aiQuestion) => {
          // Gebruik de volledige titel zonder beperking
          const title = aiQuestion.title || "";

          // Zorg ervoor dat de feedback per optie behouden blijft
          const optionsWithFeedback = aiQuestion.options.map((option) => {
            // Log de ontvangen optie om te controleren of feedback aanwezig is
            console.log(`Optie ${option.id} feedback:`, option.feedback);
            
            // Als er geen specifieke feedback is voor deze optie, genereer dan feedback op basis van de algemene uitleg
            let optionFeedback = option.feedback;
            if (!optionFeedback && aiQuestion.explanation) {
              if (option.isCorrect) {
                optionFeedback = `Dit is het juiste antwoord. ${aiQuestion.explanation}`;
              } else {
                optionFeedback = `Dit antwoord is niet correct. ${aiQuestion.explanation}`;
              }
              console.log(`Gegenereerde feedback voor optie ${option.id}:`, optionFeedback);
            }
            
            return {
              ...option,
              feedback: optionFeedback || "", // Gebruik de gegenereerde feedback of een lege string
            };
          });

          // Log de opties met feedback om te controleren of ze correct zijn verwerkt
          console.log("Opties met feedback:", JSON.stringify(optionsWithFeedback, null, 2));

          return {
            id: crypto.randomUUID(),
            type: "multiple-choice",
            name: title || aiQuestion.text.substring(0, 50),
            text: aiQuestion.text,
            options: optionsWithFeedback, // Gebruik de opties met feedback
            multipleCorrect: aiQuestion.multipleCorrect,
            feedback: {
              correct: aiQuestion.correctFeedback || "Goed gedaan!",
              incorrect: aiQuestion.incorrectFeedback || aiQuestion.explanation || generateFeedback(aiQuestion),
            },
            // Voeg AI-metadata toe
            isAIGenerated: true,
            aiMetadata: {
              isAIGenerated: true,
              generatedAt: data.metadata.generatedAt,
              model: data.metadata.model,
              generationConfig: {
                educationLevel: values.educationLevel,
                subject: values.subject,
                theme: values.theme,
                chapter: values.chapter,
              },
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            difficulty: aiQuestion.difficulty,
          };
        });
        
        // Sla alle gegenereerde vragen op
        setGeneratedQuestions(newQuestions);
        setSelectedQuestionIndex(0);
        
        // Log de geconverteerde vragen
        console.log("GECONVERTEERDE VRAGEN:", JSON.stringify(newQuestions, null, 2));
        
        // Add all generated questions to the questions list
        newQuestions.forEach((question) => {
          addQuestion(question);
        });
        
        toast({
          title: `${newQuestions.length} vragen gegenereerd`,
          description: "AI heeft succesvol nieuwe vragen gegenereerd en opgeslagen",
        });
        
        // Stuur de eerste gegenereerde vraag terug naar de editor
        onQuestionGenerated(newQuestions[0]);
        
        // Sluit de generator
        onClose();
      } else {
        throw new Error("Geen vragen gegenereerd");
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      
      // Alleen toast tonen als we niet al een error status hebben
      if (generationProgress.status !== "error") {
        setGenerationProgress({
          status: "error",
          progress: 0,
          error: error instanceof Error ? error.message : "Er is een onbekende fout opgetreden",
          message: "Fout bij genereren",
        });
        
        toast({
          title: "Fout bij genereren",
          description: error instanceof Error ? error.message : "Er is een onbekende fout opgetreden",
          variant: "destructive",
        });
      }
    } finally {
      // Alleen de isGenerating state resetten als we niet al een error status hebben
      // Dit zorgt ervoor dat de gebruiker de foutmelding kan zien
      if (generationProgress.status !== "error") {
        setGenerationProgress({
          status: "complete",
          progress: 1,
          message: "Generatie voltooid",
        });
      }
      setIsGenerating(false);
    }
  }

  const handleCancel = () => {
    if (isGenerating) {
      aiService.cancelGeneration();
      setIsGenerating(false);
      setGenerationProgress({
        status: "idle",
        progress: 0,
      });
      
      toast({
        title: "Generatie geannuleerd",
        description: "Het genereren van vragen is geannuleerd",
      });
    }
    onClose();
  };

  const inspectApiResponse = () => {
    console.log("RAW API RESPONSE:", rawApiResponse);
  };

  const inspectFullPrompt = () => {
    console.log("FULL PROMPT:", fullPrompt);
  };

  const testApiDirectly = async () => {
    try {
      setIsGenerating(true);
      setGenerationProgress({
        status: "generating",
        progress: 0,
        message: "Test API aanroep...",
      });

      // Eenvoudige test configuratie
      const testConfig: AIGenerationConfig = {
        educationLevel: "havo",
        year: "3",
        subject: "Biologie",
        theme: "Cellen",
        chapter: "Celstructuur",
        batchSize: 1,
      };

      console.log("Test API aanroep met configuratie:", testConfig);
      
      // Gebruik de AIService om vragen te genereren
      const data = await aiService.generateQuestions(
        testConfig,
        (progress) => setGenerationProgress(progress),
        useMockApi,
      );
      
      // Sla de ruwe API respons op
      setRawApiResponse(JSON.stringify(data, null, 2));
      console.log("TEST API RESPONS:", data);
      
      toast({
        title: "API Test Voltooid",
        description: `${data.questions?.length || 0} vragen ontvangen van de API`,
      });
    } catch (error) {
      console.error("Error testing API:", error);
      toast({
        title: "API Test Fout",
        description: error instanceof Error ? error.message : "Er is een onbekende fout opgetreden",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const checkOpenAIConfig = async () => {
    try {
      setIsGenerating(true);
      setGenerationProgress({
        status: "generating",
        progress: 0,
        message: "OpenAI configuratie controleren...",
      });

      const response = await fetch("/api/check-openai");
      const data = await response.json();
      
      setRawApiResponse(JSON.stringify(data, null, 2));
      console.log("OPENAI CONFIG CHECK:", data);
      
      if (data.status === "success") {
        toast({
          title: "OpenAI API Correct Geconfigureerd",
          description: `API-sleutel: ${data.apiKeyMasked}`,
        });
      } else {
        toast({
          title: "OpenAI API Configuratie Probleem",
          description: data.message || "Er is een probleem met de OpenAI API configuratie",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error checking OpenAI config:", error);
      toast({
        title: "OpenAI Configuratie Fout",
        description: error instanceof Error ? error.message : "Er is een onbekende fout opgetreden",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const runSimpleTest = async () => {
    try {
      setIsGenerating(true);
      setGenerationProgress({
        status: "generating",
        progress: 0,
        message: "Eenvoudige OpenAI test uitvoeren...",
      });

      const response = await fetch("/api/simple-test");
      
      // Lees de response als tekst
      const responseText = await response.text();
      console.log("RAW RESPONSE TEXT:", responseText);
      
      try {
        // Probeer de tekst te parsen als JSON
        const data = JSON.parse(responseText);
        setRawApiResponse(JSON.stringify(data, null, 2));
        console.log("SIMPLE TEST RESULT:", data);
        
        if (data.status === "success") {
          toast({
            title: "OpenAI API Werkt",
            description: "Chat completion succesvol uitgevoerd",
          });
        } else {
          toast({
            title: "OpenAI API Probleem",
            description: data.message || "Er is een probleem met de OpenAI API",
            variant: "destructive",
          });
        }
      } catch (parseError) {
        console.error("Error parsing response:", parseError);
        setRawApiResponse(responseText);
        toast({
          title: "Ongeldige JSON Respons",
          description: "De API heeft geen geldige JSON teruggegeven",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error running simple test:", error);
      toast({
        title: "Eenvoudige Test Fout",
        description: error instanceof Error ? error.message : "Er is een onbekende fout opgetreden",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const checkEnvironment = async () => {
    try {
      setIsGenerating(true);
      setGenerationProgress({
        status: "generating",
        progress: 0,
        message: "Omgevingsvariabelen controleren...",
      });

      const response = await fetch("/api/check-env");
      const data = await response.json();
      
      setRawApiResponse(JSON.stringify(data, null, 2));
      console.log("ENVIRONMENT CHECK:", data);
      
      if (data.allRequiredVarsPresent) {
        toast({
          title: "Omgevingsvariabelen OK",
          description: "Alle benodigde omgevingsvariabelen zijn ingesteld",
        });
      } else {
        toast({
          title: "Ontbrekende Omgevingsvariabelen",
          description: `Ontbrekende variabelen: ${data.missingRequiredVars.join(", ")}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error checking environment:", error);
      toast({
        title: "Omgevingscontrole Fout",
        description: error instanceof Error ? error.message : "Er is een onbekende fout opgetreden",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const testApiKey = async () => {
    try {
      setIsGenerating(true);
      setGenerationProgress({
        status: "generating",
        progress: 0,
        message: "API-sleutel testen...",
      });

      const response = await fetch("/api/test-api-key");
      
      // Lees de response als tekst
      const responseText = await response.text();
      console.log("RAW API KEY TEST RESPONSE:", responseText);
      
      try {
        // Probeer de tekst te parsen als JSON
        const data = JSON.parse(responseText);
        setRawApiResponse(JSON.stringify(data, null, 2));
        console.log("API KEY TEST RESULT:", data);
        
        if (data.status === "success") {
          toast({
            title: "API-sleutel is geldig",
            description: `API-sleutel: ${data.maskedKey}`,
          });
        } else {
          toast({
            title: "Ongeldige API-sleutel",
            description: data.message || "De API-sleutel is ongeldig of werkt niet",
            variant: "destructive",
          });
        }
      } catch (parseError) {
        console.error("Error parsing response:", parseError);
        setRawApiResponse(responseText);
        toast({
          title: "Ongeldige JSON Respons",
          description: "De API heeft geen geldige JSON teruggegeven",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error testing API key:", error);
      toast({
        title: "API-sleutel Test Fout",
        description: error instanceof Error ? error.message : "Er is een onbekende fout opgetreden",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const debugOpenAI = async () => {
    try {
      setIsGenerating(true);
      setGenerationProgress({
        status: "generating",
        progress: 0,
        message: "OpenAI API debuggen...",
      });

      const response = await fetch("/api/debug-openai");
      
      // Lees de response als tekst
      const responseText = await response.text();
      console.log("RAW DEBUG OPENAI RESPONSE:", responseText);
      
      try {
        // Probeer de tekst te parsen als JSON
        const data = JSON.parse(responseText);
        setRawApiResponse(JSON.stringify(data, null, 2));
        console.log("DEBUG OPENAI RESULT:", data);
        
        if (data.status === "debug_complete") {
          toast({
            title: "Debug Informatie Verzameld",
            description: "Bekijk de debug informatie in de console en in de debug sectie",
          });
        } else {
          toast({
            title: "OpenAI Debug Probleem",
            description: data.message || "Er is een probleem opgetreden tijdens het debuggen",
            variant: "destructive",
          });
        }
      } catch (parseError) {
        console.error("Error parsing response:", parseError);
        setRawApiResponse(responseText);
        toast({
          title: "Ongeldige JSON Respons",
          description: "De API heeft geen geldige JSON teruggegeven",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error debugging OpenAI:", error);
      toast({
        title: "OpenAI Debug Fout",
        description: error instanceof Error ? error.message : "Er is een onbekende fout opgetreden",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const testAddQuestion = () => {
    // Maak een test vraag aan
    const testQuestion: Question = {
      id: `test-${Date.now()}`,
      type: "multiple-choice",
      name: "Test Vraag",
      text: "Dit is een test vraag?",
      options: [
        { id: "1", text: "Optie 1", isCorrect: false },
        { id: "2", text: "Optie 2", isCorrect: true },
        { id: "3", text: "Optie 3", isCorrect: false },
        { id: "4", text: "Optie 4", isCorrect: false },
      ],
      multipleCorrect: false,
      feedback: {
        correct: "Goed gedaan!",
        incorrect: "Dit is incorrect omdat het niet overeenkomt met de juiste informatie over het onderwerp.",
      },
      // Voeg AI-metadata toe
      isAIGenerated: true,
      aiMetadata: {
        isAIGenerated: true,
        generatedAt: new Date().toISOString(),
        model: "test-model",
        generationConfig: {
          educationLevel: "havo",
          subject: "Biologie",
          theme: "Cellen",
          chapter: "Celstructuur",
        },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      difficulty: "gemiddeld",
    };
    
    console.log("TEST: Handmatig een vraag toevoegen:", JSON.stringify(testQuestion, null, 2));
    
    try {
      // Voeg de vraag toe aan de context
      addQuestion(testQuestion);
      console.log("TEST: addQuestion functie is aangeroepen");
      
      // Controleer of de vraag is toegevoegd
      console.log("TEST: Vraag zou nu moeten zijn toegevoegd aan de context");
      
      // Stuur de vraag terug naar de editor
      console.log("TEST: onQuestionGenerated aanroepen met:", JSON.stringify(testQuestion, null, 2));
      onQuestionGenerated(testQuestion);
      console.log("TEST: onQuestionGenerated is aangeroepen");
      
      // Sluit de generator
      console.log("TEST: onClose aanroepen om de generator te sluiten");
      onClose();
      
      toast({
        title: "Test vraag toegevoegd",
        description: "Een test vraag is handmatig toegevoegd aan de vragenlijst",
      });
    } catch (error) {
      console.error("TEST ERROR:", error);
      toast({
        title: "Fout bij test",
        description: `Er is een fout opgetreden: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    }
  };

  function generateFeedback(aiQuestion: AIMultipleChoiceQuestion) {
    // Genereer feedback op basis van de vraag en antwoorden
    let feedback = "";
    
    // Voeg uitleg toe over de vraag
    feedback += "<p><strong>Uitleg:</strong></p>";
    
    // Als er al een explanation is, gebruik die
    if (aiQuestion.explanation) {
      return aiQuestion.explanation;
    }
    
    // Identificeer correcte antwoorden
    const correctOptions = aiQuestion.options.filter((opt) => opt.isCorrect);
    const incorrectOptions = aiQuestion.options.filter((opt) => !opt.isCorrect);
    
    // Voeg uitleg toe over correcte antwoorden
    if (correctOptions.length > 0) {
      feedback += `<p><strong>Correcte ${correctOptions.length > 1 ? "antwoorden" : "antwoord"}:</strong></p>`;
      feedback += "<ul>";
      correctOptions.forEach((option) => {
        feedback += `<li>${option.text} - Dit is correct omdat het de juiste informatie bevat volgens het onderwerp.</li>`;
      });
      feedback += "</ul>";
    }
    
    // Voeg uitleg toe over incorrecte antwoorden
    if (incorrectOptions.length > 0) {
      feedback += `<p><strong>Incorrecte ${incorrectOptions.length > 1 ? "antwoorden" : "antwoord"}:</strong></p>`;
      feedback += "<ul>";
      incorrectOptions.forEach((option) => {
        feedback += `<li>${option.text} - Dit is incorrect omdat het niet overeenkomt met de juiste informatie over het onderwerp.</li>`;
      });
      feedback += "</ul>";
    }
    
    return feedback;
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-full w-screen h-screen p-0 m-0 overflow-auto" style={{ maxWidth: "100vw" }}>
        <div className="container mx-auto py-6 px-4">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">AI Vraag Generator</DialogTitle>
          </DialogHeader>
          <div className="mt-6">
            {/* Bestaande content */}
            <div className="space-y-6">
              {(generatedQuestions.length > 0 || rawApiResponse) && (
                <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
                  <h3 className="text-sm font-bold mb-2">Debug Informatie</h3>
                  
                  {rawApiResponse && (
                    <>
                      <h4 className="text-xs font-semibold mt-2">Ruwe API Respons:</h4>
                      <pre className="text-xs overflow-auto max-h-40 mb-4">
                        {rawApiResponse}
                      </pre>
                    </>
                  )}
                  
                  {fullPrompt && (
                    <>
                      <h4 className="text-xs font-semibold mt-2">Volledige Prompt:</h4>
                      <pre className="text-xs overflow-auto max-h-40 mb-4">
                        {fullPrompt}
                      </pre>
                    </>
                  )}
                  
                  {generatedQuestions.length > 0 && (
                    <>
                      <h4 className="text-xs font-semibold mt-2">Gegenereerde Vragen:</h4>
                      <pre className="text-xs overflow-auto max-h-40">
                        {JSON.stringify(generatedQuestions, null, 2)}
                      </pre>
                    </>
                  )}
                </div>
              )}
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* Voortgangsindicator */}
                  {generationProgress.status !== "idle" && (
                    <div className="space-y-4 mb-6 p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl border border-primary/20 shadow-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-medium text-primary">
                          {generationProgress.status === "generating" || generationProgress.status === "reviewing" 
                            ? sarcasticMessages[currentMessageIndex]
                            : (generationProgress.status === "complete" ? "Voltooid!" : 
                              generationProgress.status === "error" ? "Oeps, er ging iets mis..." : 
                                generationProgress.message || "Bezig...")}
                        </span>
                        <span className="text-md font-bold text-primary">
                          {Math.round(generationProgress.progress * 100)}%
                        </span>
                      </div>
                      
                      <div className="relative pt-1">
                        <div className="overflow-hidden h-4 text-xs flex rounded-full bg-gray-200 dark:bg-gray-700">
                          <div 
                            style={{ width: `${Math.round(generationProgress.progress * 100)}%` }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-in-out"
                          />
                        </div>
                      </div>
                      
                      {/* Geschatte resterende tijd */}
                      {estimatedTimeRemaining && (generationProgress.status === "generating" || generationProgress.status === "reviewing") && (
                        <div className="text-center text-sm text-primary-foreground/70 italic">
                          {estimatedTimeRemaining}
                        </div>
                      )}
                      
                      {generationProgress.error && (
                        <p className="text-sm text-destructive mt-2">{generationProgress.error}</p>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="educationLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Onderwijsniveau</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={isGenerating}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecteer onderwijsniveau" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="mavo">MAVO</SelectItem>
                              <SelectItem value="havo">HAVO</SelectItem>
                              <SelectItem value="vwo">VWO</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Leerjaar</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={isGenerating}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecteer leerjaar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">Leerjaar 1</SelectItem>
                              <SelectItem value="2">Leerjaar 2</SelectItem>
                              <SelectItem value="3">Leerjaar 3</SelectItem>
                              <SelectItem value="4">Leerjaar 4</SelectItem>
                              <SelectItem value="5">Leerjaar 5</SelectItem>
                              <SelectItem value="6">Leerjaar 6</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vak</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isGenerating}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecteer vak" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Nederlands">Nederlands</SelectItem>
                            <SelectItem value="Engels">Engels</SelectItem>
                            <SelectItem value="Wiskunde">Wiskunde</SelectItem>
                            <SelectItem value="Biologie">Biologie</SelectItem>
                            <SelectItem value="Natuurkunde">Natuurkunde</SelectItem>
                            <SelectItem value="Scheikunde">Scheikunde</SelectItem>
                            <SelectItem value="Geschiedenis">Geschiedenis</SelectItem>
                            <SelectItem value="Aardrijkskunde">Aardrijkskunde</SelectItem>
                            <SelectItem value="Economie">Economie</SelectItem>
                            <SelectItem value="Frans">Frans</SelectItem>
                            <SelectItem value="Duits">Duits</SelectItem>
                            <SelectItem value="Maatschappijleer">Maatschappijleer</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="theme"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Thema</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Bijv. Planten"
                              {...field}
                              disabled={isGenerating}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="chapter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hoofdstuk</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Bijv. Fotosynthese"
                              {...field}
                              disabled={isGenerating}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="batchSize"
                    render={({ field: { value, onChange, ...fieldProps } }) => (
                      <FormItem>
                        <FormLabel>Aantal vragen</FormLabel>
                        <FormControl>
                          <div className="ai-stepper">
                            <button
                              type="button"
                              className="ai-stepper-btn"
                              onClick={() => onChange(Math.max(1, value - 1))}
                              disabled={isGenerating || value <= 1}
                              aria-label="Minder vragen"
                            >
                              –
                            </button>
                            <input
                              type="number"
                              className="ai-stepper-value"
                              value={value}
                              min={1}
                              max={5}
                              readOnly
                              aria-label="Aantal vragen"
                              {...fieldProps}
                            />
                            <button
                              type="button"
                              className="ai-stepper-btn"
                              onClick={() => onChange(Math.min(5, value + 1))}
                              disabled={isGenerating || value >= 5}
                              style={{
                                fontSize: "1.5rem",
                                width: "2.5rem",
                                height: "2.5rem",
                                borderRadius: "50%",
                                border: "1px solid #ccc",
                                background: "#fff",
                                cursor: value >= 5 ? "not-allowed" : "pointer"
                              }}
                              aria-label="Meer vragen"
                            >
                              +
                            </button>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Kies tussen 1 en 5 vragen om te genereren
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customMaterial"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lesmateriaal (optioneel)</FormLabel>
                        <div className="space-y-2">
                          <FormControl>
                            <Textarea
                              placeholder="Plak hier je lesmateriaal om de vragen specifieker te maken"
                              className="min-h-24 resize-y"
                              {...field}
                              disabled={isGenerating}
                            />
                          </FormControl>
                          
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center justify-between">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isGenerating}
                                className="flex items-center gap-2"
                              >
                                <Upload className="h-4 w-4" />
                                <span>Upload bestand (.txt, .docx)</span>
                              </Button>
                              
                              <input 
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                accept=".txt,.docx"
                                className="hidden"
                                disabled={isGenerating}
                              />
                            </div>
                            
                            {uploadedFileName && (
                              <div className="flex items-center justify-between bg-secondary/50 p-2 rounded">
                                <span className="text-sm truncate max-w-[80%]">{uploadedFileName}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={clearUploadedFile}
                                  className="h-6 w-6 p-0"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                          
                          <FormDescription>
                            Voeg specifiek lesmateriaal toe om de AI te helpen relevantere vragen te genereren
                          </FormDescription>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isGenerating}
                    >
                      {isGenerating ? "Annuleren" : "Sluiten"}
                    </Button>
                    <Button type="submit" disabled={isGenerating}>
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Genereren...
                        </>
                      ) : (
                        "Genereer vraag"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
