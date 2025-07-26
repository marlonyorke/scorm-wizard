import { ChevronLeft, Trash2, CheckSquare, Plus, Sparkles, Download, Save, PlusCircle } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { MultipleChoicePreview } from "../../questions/preview/MultipleChoicePreview";
import { AIQuestionGenerator } from "../ai/AIQuestionGenerator";
import { MediaUpload } from "../form/MediaUpload";
import { withBaseQuestionEditor } from "../question-editors/base/BaseQuestionEditor";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useQuestions } from "@/contexts/QuestionsContext";
// We importeren alleen de benodigde modules
import { cn } from "@/lib/utils";
import type { Question } from "@/types/editor";

interface MultipleChoiceQuestionEditorProps {
  currentQuestion: Question;
  onQuestionChange: (question: Question) => void;
  // Deze props worden niet gebruikt in deze component maar zijn vereist door de interface
  onAddOption?: (questionId: string) => void;
  onOptionChange?: (questionId: string, optionId: string, text: string) => void;
  onRemoveOption?: (questionId: string, optionId: string) => void;
  showNameField?: boolean;
}

function MultipleChoiceQuestionEditorBase({
  currentQuestion,
  onQuestionChange,
}: MultipleChoiceQuestionEditorProps) {
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const { questions, setCurrentQuestion } = useQuestions();
  const navigate = useNavigate();

  // Functie om een nieuwe vraag aan te maken
  const handleNewQuestion = () => {
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
  };

  // State voor de antwoordopties
  const [options, setOptions] = useState<Array<{ id: string; text: string; isCorrect: boolean }>>(
    currentQuestion.options || [],
  );

  // Effect om de options state te updaten wanneer currentQuestion verandert
  useEffect(() => {
    if (currentQuestion.options) {
      setOptions(currentQuestion.options);
    }
  }, [currentQuestion.options]);

  // Voeg standaard 2 antwoordopties toe als er nog geen opties zijn
  useEffect(() => {
    if (!currentQuestion.options || currentQuestion.options.length === 0) {
      const defaultOptions = [
        { id: crypto.randomUUID(), text: "Antwoordoptie 1", isCorrect: false },
        { id: crypto.randomUUID(), text: "Antwoordoptie 2", isCorrect: false },
      ];
      
      onQuestionChange({
        ...currentQuestion,
        options: defaultOptions,
      });
    }
  }, [currentQuestion, onQuestionChange]);

  const handleMediaChange = (mediaUrl: string | undefined, imageSize?: { width: number; height: number }) => {
    onQuestionChange({
      ...currentQuestion,
      imageUrl: mediaUrl,
      imageSize,
    });
  };

  const handleQuestionTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onQuestionChange({
      ...currentQuestion,
      text: e.target.value,
    });
  };

  const handleAIQuestionGenerated = (generatedQuestion: Question) => {
    // Behoud het huidige ID en type
    onQuestionChange({
      ...generatedQuestion,
      id: currentQuestion.id,
      type: currentQuestion.type,
    });
  };

  const handleMultipleCorrectToggle = (checked: boolean) => {
    onQuestionChange({
      ...currentQuestion,
      multipleCorrect: checked,
    });
  };

  const handleOptionTextChange = (id: string, text: string) => {
    const updatedOptions = options.map((option) => 
      option.id === id ? { ...option, text } : option,
    );
    
    onQuestionChange({
      ...currentQuestion,
      options: updatedOptions,
    });
  };

  const toggleCorrect = (id: string) => {
    const updatedOptions = options.map((option) => {
      if (currentQuestion.multipleCorrect) {
        // Voor meerkeuze: toggle de isCorrect waarde van de aangeklikte optie
        if (option.id === id) {
          return { ...option, isCorrect: !option.isCorrect };
        }
        return option;
      } else {
        // Voor enkelvoudige keuze: alleen de aangeklikte optie is correct
        return { ...option, isCorrect: option.id === id };
      }
    });
    
    onQuestionChange({
      ...currentQuestion,
      options: updatedOptions,
    });
  };

  const addOption = () => {
    if (options.length < 6) {
      const newOption = {
        id: crypto.randomUUID(),
        text: `Antwoordoptie ${options.length + 1}`,
        isCorrect: false,
      };
      
      const updatedOptions = [...options, newOption];
      
      onQuestionChange({
        ...currentQuestion,
        options: updatedOptions,
      });
    }
  };

  const removeOption = (id: string) => {
    if (options.length > 2) {
      const updatedOptions = options.filter((option) => option.id !== id);
      
      // Zorg ervoor dat er altijd minstens één correct antwoord is
      const hasCorrectOption = updatedOptions.some((opt) => opt.isCorrect);
      if (!hasCorrectOption && updatedOptions.length > 0) {
        updatedOptions[0].isCorrect = true;
      }
      
      onQuestionChange({
        ...currentQuestion,
        options: updatedOptions,
      });
    }
  };

  const handleBackToList = () => {
    navigate("/");
  };

  return (
    <div className={cn("flex flex-col h-screen max-w-6xl mx-auto", "bg-background")}>
      {/* Header */}
      <header className={cn("border-b sticky top-0 z-10", "bg-card border-border")}>
        <div className="flex justify-between items-center p-4">
          <Button 
            variant="ghost"
            className="flex items-center font-medium"
            onClick={handleBackToList}
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span>Terug naar vragenlijst</span>
          </Button>
          <h1 className="text-xl font-bold text-center flex-1 text-foreground">Quiz Editor</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex items-center"
            >
              <Download className="w-5 h-5 mr-2" />
              Exporteren
            </Button>
            <Button 
              variant="default" 
              className="flex items-center"
            >
              <Save className="w-5 h-5 mr-2" />
              Opslaan
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className={cn("w-64 border-r p-4 flex flex-col", "bg-card border-border")}>
          <Button 
            onClick={handleNewQuestion}
            variant="default"
            className="w-full mb-4 flex items-center justify-center"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Nieuwe Vraag
          </Button>
          
          <h2 className="font-semibold mb-2 text-foreground/80">Vragenlijst</h2>
          
          <div className="flex-1 overflow-y-auto">
            {questions
              .filter((q) => q.type === "multiple-choice")
              .map((question, index) => (
                <div 
                  key={question.id} 
                  className={cn(
                    "rounded-lg p-3 mb-2 cursor-pointer transition-colors duration-200",
                    currentQuestion.id === question.id ? "bg-primary/10 border border-primary" : "bg-card hover:bg-card/80",
                  )}
                  onClick={() => setCurrentQuestion(question)}
                >
                  <p className="font-medium text-primary">Vraag {index + 1}</p>
                  <p className="text-xs text-muted-foreground truncate">{question.text || "Geen tekst"}</p>
                </div>
              ))}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className={cn("rounded-xl shadow-sm p-6 mb-6", "bg-card")}>
            {/* Question Type Indicator */}
            <div className="flex mb-6">
              <div className={cn("px-4 py-2 rounded-lg flex items-center", "bg-primary/10 text-primary border-2 border-primary/30")}>
                <CheckSquare className="w-4 h-4 mr-2" />
                Multiple Choice
              </div>
            </div>

            {/* Question Field */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Vraag</label>
              <div className="flex flex-col gap-2">
                <textarea 
                  placeholder="Voer je vraag in..." 
                  className="flex-1 p-3 border border-secondary/50 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent outline-none min-h-[100px] resize-y"
                  value={currentQuestion.text || ""}
                  onChange={(e) => handleQuestionTextChange(e as unknown as React.ChangeEvent<HTMLInputElement>)}
                />
                <Button 
                  variant="ghost"
                  className="flex items-center gap-1"
                  onClick={() => setShowAIGenerator(true)}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>AI Generator</span>
                </Button>
              </div>
            </div>

            {/* Answer Options */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-secondary">Antwoordopties</label>
                <div className="flex items-center">
                  <span className="text-sm text-secondary/50 mr-2">Meerdere correcte antwoorden</span>
                  <Switch
                    checked={currentQuestion.multipleCorrect || false}
                    onCheckedChange={handleMultipleCorrectToggle}
                  />
                </div>
              </div>

              <div className="space-y-3">
                {options.map((option) => (
                  <div key={option.id} className="flex items-center gap-3">
                    <Button 
                      variant="outline"
                      size="icon"
                      className={cn(
                        option.isCorrect ? "bg-success/20 text-success hover:bg-success/30" : "hover:bg-secondary/50",
                      )}
                      onClick={() => toggleCorrect(option.id)}
                    >
                      <CheckSquare className="w-5 h-5" />
                    </Button>
                    <Input 
                      type="text" 
                      value={option.text}
                      placeholder="Antwoordoptie"
                      onChange={(e) => handleOptionTextChange(option.id, e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOption(option.id)}
                      disabled={options.length <= 2}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button 
                onClick={addOption}
                disabled={options.length >= 6}
                variant="outline"
                className="mt-3 w-full border-dashed flex items-center justify-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Voeg optie toe
              </Button>
            </div>

            {/* Image Upload */}
            <div className="mb-6">
              <Label className="mb-2">Afbeelding</Label>
              <div>
                <MediaUpload 
                  media={currentQuestion.imageUrl}
                  imageSize={currentQuestion.imageSize}
                  onMediaChange={handleMediaChange}
                />
              </div>
              {currentQuestion.imageUrl && (
                <div className={cn(
                  "mt-3 p-3 border rounded-lg",
                  "bg-secondary/10",
                )}>
                  <img 
                    src={currentQuestion.imageUrl} 
                    alt="Vraag afbeelding" 
                    className="max-h-40 mx-auto"
                  />
                </div>
              )}
            </div>

            {/* Preview Section */}
            <div className="mb-6 border-t pt-6">
              <Label className="mb-3">Voorvertoning</Label>
              <div className={cn(
                "rounded-lg border p-4",
                "bg-secondary/20 backdrop-blur-sm",
              )}>
                <MultipleChoicePreview
                  text={currentQuestion.text}
                  options={currentQuestion.options || []}
                  multipleCorrect={currentQuestion.multipleCorrect}
                  mediaUrl={currentQuestion.imageUrl}
                  imageSize={currentQuestion.imageSize}
                />
              </div>
            </div>

            {/* Feedback Section */}
            <div>
              <Label className="mb-3">Feedback</Label>
              <div className="space-y-3">
                <textarea 
                  placeholder="Feedback bij correct antwoord..."
                  className={cn(
                    "w-full p-3 border rounded-lg min-h-24",
                    "focus:ring-2 focus:ring-primary-accent focus:border-transparent outline-none",
                  )}
                  value={typeof currentQuestion.feedback === "string" ? currentQuestion.feedback : ""}
                  onChange={(e) => onQuestionChange({
                    ...currentQuestion,
                    feedback: e.target.value,
                  })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAIGenerator && (
        <AIQuestionGenerator 
          onQuestionGenerated={handleAIQuestionGenerated}
          onClose={() => setShowAIGenerator(false)}
        />
      )}
    </div>
  );
}

export const MultipleChoiceQuestionEditor = withBaseQuestionEditor(MultipleChoiceQuestionEditorBase);
