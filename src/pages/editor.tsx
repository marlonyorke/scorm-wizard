import { PlusCircle } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { EditorHeader } from "@/components/editor/EditorHeader";
import { QuestionEditorForm } from "@/components/editor/QuestionEditorForm";
import { QuestionTypeTabs } from "@/components/editor/QuestionTypeTabs";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useQuestions } from "@/contexts/QuestionsContext";
import type { Question } from "@/types/editor";


export default function Editor() {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    selectedQuestionTypes, 
    currentQuestion, 
    setCurrentQuestion,
    createInitialQuestion,
    addQuestion,
    setSelectedQuestionTypes,
  } = useQuestions();
  
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Haal de geselecteerde vraagtypes op uit de location state
  useEffect(() => {
    console.log("Editor component mounted");
    console.log("Location state:", location.state);
    console.log("Current selectedQuestionTypes:", selectedQuestionTypes);
    
    const state = location.state as { questionTypes?: string[] } | null;
    
    if (state && state.questionTypes && state.questionTypes.length > 0) {
      console.log("Setting selected question types from location state:", state.questionTypes);
      setSelectedQuestionTypes(state.questionTypes);
    } else if (!selectedQuestionTypes || selectedQuestionTypes.length === 0) {
      // Als er geen vraagtypes zijn geselecteerd, ga terug naar de selectiepagina
      console.log("No question types selected, redirecting to selection page");
      navigate("/question-types");
      return;
    }
    
    // Forceer een nieuwe vraag bij het laden van de editor
    console.log("Editor mounting - force creating new question");
    try {
      // Reset eventuele eerdere vragen om met een schone lei te beginnen
      localStorage.removeItem("editor_current_question");
      
      // Controleer of er geselecteerde vraagtypes zijn
      if (!selectedQuestionTypes || selectedQuestionTypes.length === 0) {
        console.error("No question types selected, redirecting to question type selection");
        navigate("/question-types");
        return;
      }
      
      console.log("Selected question types:", selectedQuestionTypes);
      const firstType = selectedQuestionTypes[0] as "multiple-choice" | "mark-words" | "matching" | "order" | "drag-drop" | "open" | "video-interactive" | "hotspot";
      console.log("Creating initial question of type:", firstType);
      
      // Maak een nieuwe vraag ongeacht de huidige status
      const newQuestion = createInitialQuestion(firstType);
      console.log("Created new question:", newQuestion);
      
      // Update state en localStorage
      setCurrentQuestion(newQuestion);
      localStorage.setItem("editor_current_question", JSON.stringify(newQuestion));
      
      setIsLoading(false);
    } catch (err) {
      console.error("Error initializing editor:", err);
      setError("Er is een fout opgetreden bij het laden van de editor.");
      setIsLoading(false);
    }
  }, [selectedQuestionTypes, createInitialQuestion, setCurrentQuestion, navigate, setSelectedQuestionTypes, location]);

  const handleSaveQuestion = () => {
    if (!currentQuestion) {
      return;
    }

    const validationErrors = validateQuestion(currentQuestion);

    if (validationErrors.length > 0) {
      toast({
        variant: "destructive",
        title: "Fout bij opslaan",
        description: validationErrors.join(", "),
      });
      return;
    }

    addQuestion(currentQuestion);
    toast({
      title: "Vraag opgeslagen",
      description: "De vraag is succesvol opgeslagen.",
    });

    // Create a new question of the same type
    const newQuestion = createInitialQuestion(currentQuestion.type);
    setCurrentQuestion(newQuestion);
  };

  const validateQuestion = (question: Question): string[] => {
    const errors: string[] = [];

    if (!question.text.trim()) {
      errors.push("Voer een vraag in");
    }

    if (question.type === "multiple-choice") {
      if (!question.options || question.options.length < 2) {
        errors.push("Voeg minimaal twee antwoordopties toe");
      } else {
        const hasValidOptions = question.options.some((option) => option.text.trim());
        if (!hasValidOptions) {
          errors.push("Vul minimaal één antwoordoptie in");
        }

        const hasCorrectAnswer = question.options.some((option) => option.isCorrect);
        if (!hasCorrectAnswer) {
          errors.push("Selecteer minimaal één correct antwoord");
        }
      }
    } else if (question.type === "mark-words") {
      if (!question.words || question.words.length === 0) {
        errors.push("Markeer minimaal één woord in de tekst");
      }
    } else if (question.type === "video-interactive") {
      if (!question.videoUrl) {
        errors.push("Upload een video");
      }
    }

    return errors;
  };

  const handleAddOption = () => {
    if (!currentQuestion) {
      return;
    }
    
    const newQuestion: Question = {
      ...currentQuestion,
      options: [
        ...(currentQuestion.options || []),
        {
          id: crypto.randomUUID(),
          text: "",
          isCorrect: false,
        },
      ],
    };
    setCurrentQuestion(newQuestion);
  };

  const handleOptionChange = (optionId: string, newText: string) => {
    if (!currentQuestion) {
      return;
    }
    
    const newQuestion: Question = {
      ...currentQuestion,
      options: currentQuestion.options?.map((opt) =>
        opt.id === optionId ? { ...opt, text: newText } : opt,
      ),
    };
    setCurrentQuestion(newQuestion);
  };

  const handleRemoveOption = (optionId: string) => {
    if (!currentQuestion) {
      return;
    }
    
    const newQuestion: Question = {
      ...currentQuestion,
      options: currentQuestion.options?.filter((opt) => opt.id !== optionId),
    };
    setCurrentQuestion(newQuestion);
  };

  // Toon niets tijdens het laden
  if (isLoading) {
    return null;
  }

  // Toon foutmelding als er iets mis ging
  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="glass-card rounded-xl p-8 text-center">
          <h2 className="text-xl font-semibold text-red-500 mb-4">Er is een probleem opgetreden</h2>
          <p>{error}</p>
          <button
            className="mt-6 px-4 py-2 bg-primary text-white rounded-md"
            onClick={() => navigate("/question-types")}
          >
            Terug naar vraagtype selectie
          </button>
        </div>
      </div>
    );
  }

  // Toon laadscherm
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-5xl flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Editor wordt geladen...</p>
        </div>
      </div>
    );
  }

  // Forceer een geldige huidige vraag of toon een melding
  if (!currentQuestion) {
    return (
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="glass-card rounded-xl p-8 text-center">
          <h2 className="text-xl font-semibold text-amber-500 mb-4">Er is geen actieve vraag</h2>
          <p>Er is momenteel geen vraag om te bewerken.</p>
          <button
            className="mt-6 px-4 py-2 bg-primary text-white rounded-md"
            onClick={() => {
              if (selectedQuestionTypes && selectedQuestionTypes.length > 0) {
                const firstType = selectedQuestionTypes[0] as "multiple-choice" | "mark-words" | "matching" | "order" | "drag-drop" | "open" | "video-interactive" | "hotspot";
                const newQuestion = createInitialQuestion(firstType);
                setCurrentQuestion(newQuestion);
              } else {
                navigate("/question-types");
              }
            }}
          >
            {selectedQuestionTypes && selectedQuestionTypes.length > 0 
              ? "Nieuwe vraag maken" 
              : "Terug naar vraagtype selectie"}
          </button>
        </div>
      </div>
    );
  }

  // Standaard UI tonen
  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="glass-card rounded-xl p-4 mb-6">
        <EditorHeader onSave={handleSaveQuestion} />
      </div>

      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-primary">
  {(() => {
    switch (currentQuestion?.type) {
      case "open":
        return "Open vraag editor";
      case "multiple-choice":
        return "Multiple Choice Editor";
      case "matching":
        return "Matching Editor";
      case "order":
        return "Order Editor";
      case "drag-drop":
        return "Drag & Drop Editor";
      case "video-interactive":
        return "Video-interactieve Editor";
      case "hotspot":
        return "Hotspot Editor";
      case "mark-words":
        return "Markeer Woorden Editor";
      default:
        return "Quiz Editor";
    }
  })()}
</h2>
            <button 
              onClick={() => {
                const newQuestion: Question = {
                  id: Date.now().toString(),
                  type: "multiple-choice",
                  text: "",
                  options: [
                    { id: "option1", text: "", isCorrect: false, feedback: "" },
                    { id: "option2", text: "", isCorrect: false, feedback: "" },
                  ],
                  showFeedbackImmediately: false,
                  allowMultipleAnswers: false,
                };
                setCurrentQuestion(newQuestion);
              }}
              className="bg-primary text-white py-2 px-4 rounded-md flex items-center justify-center"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Nieuwe Vraag
            </button>
          </div>
          
          <Card className="glass-card mb-6">
            <CardContent className="pt-6 px-6">
              <QuestionTypeTabs />
            </CardContent>
          </Card>

          <Card className="glass-card transition-all duration-300 hover:gold-glow">
            <CardContent className="p-6">
              <QuestionEditorForm
                currentQuestion={currentQuestion}
                onQuestionChange={setCurrentQuestion}
                onAddOption={handleAddOption}
                onOptionChange={handleOptionChange}
                onRemoveOption={handleRemoveOption}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
