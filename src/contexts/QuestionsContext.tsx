import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

import { aiService } from "@/services";
import type { AIGenerationConfig, GenerationProgress } from "@/types/ai";
import { AIGenerationResponse } from "@/types/ai";
import type { Question } from "@/types/editor";
import type { AIQuestion} from "@/types/questions/ai-question";
import { isAIQuestion, convertToAIQuestion, createNewQuestionVersion } from "@/types/questions/ai-question";

interface QuestionsContextType {
  questions: Question[];
  selectedQuestionTypes: string[];
  currentQuestion: Question | null;
  addQuestion: (question: Question) => void;
  updateQuestion: (id: string, question: Question) => void;
  deleteQuestion: (id: string) => void;
  setSelectedQuestionTypes: (types: string[]) => void;
  setCurrentQuestion: (question: Question | null) => void;
  createInitialQuestion: (type: "multiple-choice" | "matching" | "order" | "drag-drop" | "video-interactive" | "open" | "hotspot" | "mark-words") => Question;
  changeQuestionType: (type: "multiple-choice" | "matching" | "order" | "drag-drop" | "video-interactive" | "open" | "hotspot" | "mark-words") => void;
  
  // AI-gerelateerde functies
  generateAIQuestions: (config: AIGenerationConfig, onProgress?: (progress: GenerationProgress) => void) => Promise<Question[]>;
  cancelAIGeneration: () => void;
  getAIQuestions: () => Question[];
  getQuestionsByTags: (tags: string[]) => Question[];
  getQuestionsByDifficulty: (difficulty: string) => Question[];
  createQuestionVersion: (questionId: string) => Question | null;
  getQuestionVersions: (questionId: string) => Question[];
  isGeneratingQuestions: boolean;
}

const QuestionsContext = createContext<QuestionsContextType | undefined>(undefined);

// Keys voor localStorage
const STORAGE_KEYS = {
  QUESTIONS: "editor_questions",
  SELECTED_TYPES: "editor_selected_types",
  CURRENT_QUESTION: "editor_current_question",
};

export function QuestionsProvider({ children }: { children: React.ReactNode }) {
  // Initialize state from localStorage if available
  const [questions, setQuestions] = useState<Question[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    return stored ? JSON.parse(stored) : [];
  });

  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState<string[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.SELECTED_TYPES);
    return stored ? JSON.parse(stored) : [];
  });

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_QUESTION);
    return stored ? JSON.parse(stored) : null;
  });

  // AI-gerelateerde state
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState<boolean>(false);

  // Sync state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_TYPES, JSON.stringify(selectedQuestionTypes));
  }, [selectedQuestionTypes]);

  useEffect(() => {
    if (currentQuestion) {
      console.log("Saving current question to localStorage:", currentQuestion);
      localStorage.setItem(STORAGE_KEYS.CURRENT_QUESTION, JSON.stringify(currentQuestion));
    }
  }, [currentQuestion]);

  const createInitialQuestion = useCallback((type: "multiple-choice" | "matching" | "order" | "drag-drop" | "video-interactive" | "open" | "hotspot" | "mark-words"): Question => {
    console.log("Creating initial question for type:", type);
    
    // Genereer een uniek ID voor de vraag
    const questionId = crypto.randomUUID();
    console.log("Generated question ID:", questionId);
    
    const baseQuestion = {
      id: questionId,
      name: "",
      text: "",
      feedback: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log("Base question created:", baseQuestion);
    let result: Question;

    try {
      switch (type) {
        case "multiple-choice":
          result = {
            ...baseQuestion,
            type: "multiple-choice",
            options: [
              { id: crypto.randomUUID(), text: "", isCorrect: false },
              { id: crypto.randomUUID(), text: "", isCorrect: false },
            ],
            multipleCorrect: false,
          };
          console.log("Created multiple-choice question");
          break;
        case "matching":
          result = {
            ...baseQuestion,
            type: "matching",
            pairs: Array.from({ length: 2 }, (_, i) => ({
              id: crypto.randomUUID(),
              left: `Linker item ${i+1}`,
              right: `Rechter item ${i+1}`,
            })),
          };
          console.log("Created matching question");
          break;
        case "order":
          result = {
            ...baseQuestion,
            type: "order",
            items: Array.from({ length: 3 }, (_, index) => ({
              id: crypto.randomUUID(),
              text: `Item ${index+1}`,
              correctPosition: index + 1,
            })),
          };
          console.log("Created order question");
          break;
        case "drag-drop":
          result = {
            ...baseQuestion,
            type: "drag-drop",
            text: "Sleep de juiste termen naar de beschrijving van DNA-structuur",
            items: [
              { id: crypto.randomUUID(), text: "Nucleotiden" },
              { id: crypto.randomUUID(), text: "Fosfaatgroep" },
              { id: crypto.randomUUID(), text: "Suikergroep" },
              { id: crypto.randomUUID(), text: "Base" },
            ],
            dropZones: [
              { 
                id: crypto.randomUUID(), 
                beforeText: "Een DNA-molecuul bestaat uit twee strengen van", 
                afterText: "", 
                correctItemId: "",  // correctItemId empty is OK for data model
              },
              { 
                id: crypto.randomUUID(), 
                beforeText: "De ruggengraat van DNA bevat een", 
                afterText: "", 
                correctItemId: "",  // correctItemId empty is OK for data model
              },
              { 
                id: crypto.randomUUID(), 
                beforeText: "Verbonden met de ruggengraat zit een", 
                afterText: "", 
                correctItemId: "",  // correctItemId empty is OK for data model
              },
              { 
                id: crypto.randomUUID(), 
                beforeText: "De genetische code wordt bepaald door de volgorde van", 
                afterText: "", 
                correctItemId: "",  // correctItemId empty is OK for data model
              },
            ],
          };
          console.log("Created drag-drop question");
          break;
        case "open":
          result = {
            ...baseQuestion,
            type: "open",
            text: "",
            modelAnswer: "Dit is een voorbeeldantwoord dat de docent kan gebruiken bij het nakijken.",
            keywords: [
              { id: crypto.randomUUID(), text: "belangrijk" },
              { id: crypto.randomUUID(), text: "concept" },
            ],
            caseSensitive: false,
            minWords: 50,
            maxWords: 200,
          };
          console.log("Created open question");
          break;
        case "video-interactive":
          result = {
            ...baseQuestion,
            type: "video-interactive",
            videoUrl: "",
            isYouTubeVideo: false,
            markers: [],
          };
          console.log("Created video-interactive question");
          break;
        case "hotspot":
          result = {
            ...baseQuestion,
            type: "hotspot",
            text: "Klik op de juiste elementen in de afbeelding",
            hotspots: [],
            hotspotSettings: {
              minimumCorrectHotspots: 1,
              showFeedbackImmediately: false,
              highlightColor: "#3b82f6",
              incorrectPenalty: 0,
              allowRetry: true,
            },
          };
          console.log("Created hotspot question");
          break;
        case "mark-words":
          result = {
            ...baseQuestion,
            type: "mark-words",
            text: "",
            instruction: "",
            wordsToMark: [],
            markedText: "",
            niveau: "havo",
            leerjaar: 1,
            vak: "",
            contextDescription: "",
            showFeedbackImmediately: false,
            allowPartialScoring: true,
          };
          console.log("Created mark-words question");
          break;
        default:
          console.error("Unknown question type:", type);
          result = {
            ...baseQuestion,
            type: "multiple-choice",
            options: [
              { id: crypto.randomUUID(), text: "", isCorrect: false },
              { id: crypto.randomUUID(), text: "", isCorrect: false },
            ],
            multipleCorrect: false,
          };
      }

      console.log("Final question object:", result);
      return result;
    } catch (error) {
      console.error("Error creating question:", error);
      // Fallback naar een eenvoudige multiple choice vraag als er iets fout gaat
      return {
        ...baseQuestion,
        type: "multiple-choice",
        options: [
          { id: crypto.randomUUID(), text: "", isCorrect: false },
          { id: crypto.randomUUID(), text: "", isCorrect: false },
        ],
        multipleCorrect: false,
      };
    }
  }, []);

  const changeQuestionType = useCallback((type: "multiple-choice" | "matching" | "order" | "drag-drop" | "video-interactive" | "open" | "hotspot" | "mark-words") => {
    console.log("Changing question type to:", type);
    if (currentQuestion?.type === type) {
      console.log("Already on this question type, no change needed");
      return;
    }

    const newQuestion = createInitialQuestion(type);
    console.log("Created new question for type change:", newQuestion);
    setCurrentQuestion(newQuestion);
  }, [currentQuestion?.type, createInitialQuestion]);

  const addQuestion = useCallback((question: Question) => {
    console.log("QuestionsContext: addQuestion called with:", JSON.stringify(question, null, 2));
    
    // Controleer of de vraag geldig is
    if (!question || !question.type) {
      console.error("QuestionsContext: Poging om ongeldige vraag toe te voegen:", question);
      return;
    }
    
    // Genereer een ID als die nog niet bestaat
    const newQuestion = {
      ...question,
      id: question.id || `q-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      createdAt: question.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    console.log("QuestionsContext: Nieuwe vraag met ID:", newQuestion.id);
    
    setQuestions((prevQuestions) => {
      const updatedQuestions = [...prevQuestions, newQuestion];
      console.log("QuestionsContext: Bijgewerkte vragenlijst bevat nu", updatedQuestions.length, "vragen");
      
      // Sla de bijgewerkte vragen op in localStorage
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(updatedQuestions));
      
      return updatedQuestions;
    });
  }, []);

  const updateQuestion = useCallback((id: string, updatedQuestion: Question) => {
    console.log("Updating question:", id, updatedQuestion);
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...updatedQuestion, updatedAt: new Date().toISOString() } : q)),
    );
  }, []);

  const deleteQuestion = useCallback((id: string) => {
    console.log("Deleting question:", id);
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }, []);

  // AI-gerelateerde functies
  const generateAIQuestions = useCallback(async (
    config: AIGenerationConfig,
    onProgress?: (progress: GenerationProgress) => void,
  ): Promise<Question[]> => {
    console.log("Generating AI questions with config:", config);
    setIsGeneratingQuestions(true);
    
    try {
      const response = await aiService.generateQuestions(config, onProgress);
      console.log("AI generation response:", response);
      
      const newQuestions = response.questions.map((aiQuestion) => {
        const question: Question = {
          id: crypto.randomUUID(),
          type: "multiple-choice",
          name: aiQuestion.title || "",
          text: aiQuestion.text,
          options: aiQuestion.options,
          multipleCorrect: aiQuestion.multipleCorrect,
          feedback: aiQuestion.explanation,
          isAIGenerated: true,
          aiMetadata: {
            isAIGenerated: true,
            generatedAt: response.metadata.generatedAt,
            model: response.metadata.model,
            generationConfig: {
              educationLevel: config.educationLevel,
              subject: config.subject,
              theme: config.theme,
              chapter: config.chapter,
            },
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          difficulty: aiQuestion.difficulty,
          tags: config.tags || [],
        };
        
        return question;
      });
      
      // Voeg de nieuwe vragen toe aan de state
      setQuestions((prev) => [...prev, ...newQuestions]);
      
      return newQuestions;
    } catch (error) {
      console.error("Error generating AI questions:", error);
      throw error;
    } finally {
      setIsGeneratingQuestions(false);
    }
  }, []);

  const cancelAIGeneration = useCallback(() => {
    console.log("Cancelling AI generation");
    aiService.cancelGeneration();
    setIsGeneratingQuestions(false);
  }, []);

  const getAIQuestions = useCallback(() => {
    return questions.filter((q) => q.isAIGenerated);
  }, [questions]);

  const getQuestionsByTags = useCallback((tags: string[]) => {
    if (!tags.length) {
      return questions;
    }
    
    return questions.filter((q) => {
      if (!q.tags) {
        return false;
      }
      return tags.some((tag) => q.tags?.includes(tag));
    });
  }, [questions]);

  const getQuestionsByDifficulty = useCallback((difficulty: string) => {
    return questions.filter((q) => q.difficulty === difficulty);
  }, [questions]);

  const createQuestionVersion = useCallback((questionId: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) {
      return null;
    }
    
    // Als het een AI-vraag is, gebruik dan de specifieke functie
    if (isAIQuestion(question)) {
      const newVersion = createNewQuestionVersion(question as AIQuestion);
      setQuestions((prev) => [...prev, newVersion]);
      return newVersion;
    }
    
    // Anders maak een kopie met een nieuw ID en verhoogde versie
    const newVersion: Question = {
      ...question,
      id: crypto.randomUUID(),
      version: (question.version || 0) + 1,
      createdAt: question.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setQuestions((prev) => [...prev, newVersion]);
    return newVersion;
  }, [questions]);

  const getQuestionVersions = useCallback((questionId: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) {
      return [];
    }
    
    // Als de vraag geen versie heeft, return een lege array
    if (!question.version) {
      return [];
    }
    
    // Zoek alle vragen met dezelfde basis-ID
    return questions.filter((q) => 
      q.id === questionId || 
      (q.aiMetadata?.generationConfig && 
       question.aiMetadata?.generationConfig && 
       q.aiMetadata.generationConfig.subject === question.aiMetadata.generationConfig.subject &&
       q.aiMetadata.generationConfig.theme === question.aiMetadata.generationConfig.theme &&
       q.aiMetadata.generationConfig.chapter === question.aiMetadata.generationConfig.chapter),
    );
  }, [questions]);

  return (
    <QuestionsContext.Provider
      value={{ 
        questions, 
        selectedQuestionTypes,
        currentQuestion,
        addQuestion, 
        updateQuestion, 
        deleteQuestion,
        setSelectedQuestionTypes,
        setCurrentQuestion,
        createInitialQuestion,
        changeQuestionType,
        // AI-gerelateerde functies
        generateAIQuestions,
        cancelAIGeneration,
        getAIQuestions,
        getQuestionsByTags,
        getQuestionsByDifficulty,
        createQuestionVersion,
        getQuestionVersions,
        isGeneratingQuestions,
      }}
    >
      {children}
    </QuestionsContext.Provider>
  );
}

export function useQuestions() {
  const context = useContext(QuestionsContext);
  if (context === undefined) {
    throw new Error("useQuestions must be used within a QuestionsProvider");
  }
  return context;
}
