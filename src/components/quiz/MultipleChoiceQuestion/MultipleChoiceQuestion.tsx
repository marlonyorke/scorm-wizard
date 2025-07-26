import { Check } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Question } from "@/types/editor";


interface MultipleChoiceQuestionProps {
  question: Question;
  answers: string[];
  onAnswerChange: (answers: string[]) => void;
  onSubmit?: () => void;
  showFeedback?: boolean;
}

export function MultipleChoiceQuestion({ 
  question, 
  answers, 
  onAnswerChange,
  onSubmit,
  showFeedback = false,
}: MultipleChoiceQuestionProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(answers || []);
  
  const handleOptionClick = (optionId: string) => {
    let newSelectedOptions: string[];
    
    if (question.multipleCorrect) {
      // Toggle selection for multiple choice
      if (selectedOptions.includes(optionId)) {
        newSelectedOptions = selectedOptions.filter((id) => id !== optionId);
      } else {
        newSelectedOptions = [...selectedOptions, optionId];
      }
    } else {
      // Single selection for single choice
      newSelectedOptions = [optionId];
    }
    
    setSelectedOptions(newSelectedOptions);
    onAnswerChange(newSelectedOptions);
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit();
    }
  };

  if (!question.options) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Question text */}
      <div className="text-lg font-medium mb-4">{question.text}</div>
      
      {/* Options as clickable elements */}
      <div className="space-y-3">
        {question.options.map((option) => (
          <div
            key={option.id}
            onClick={() => handleOptionClick(option.id)}
            className={cn(
              "p-4 rounded-lg border cursor-pointer transition-all duration-300",
              "hover:border-primary hover:shadow-md",
              selectedOptions.includes(option.id) 
                ? "bg-primary/20 border-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.4)] dark:bg-primary/30 dark:border-primary/80" 
                : "bg-card border-border",
              showFeedback && option.isCorrect && "border-success bg-success/10",
              showFeedback && !option.isCorrect && selectedOptions.includes(option.id) && "border-destructive bg-destructive/10",
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center mt-0.5 transition-all duration-300",
                selectedOptions.includes(option.id) 
                  ? "border-primary bg-primary text-primary-foreground ring-2 ring-primary/30" 
                  : "border-muted-foreground",
              )}>
                {selectedOptions.includes(option.id) && <Check className="w-4 h-4" />}
              </div>
              <div className="flex-grow">
                <p className={cn(
                  "transition-all duration-300",
                  selectedOptions.includes(option.id) 
                    ? "font-medium text-foreground dark:text-foreground" 
                    : "text-foreground/80",
                )}>{option.text}</p>
                
                {/* Show feedback when applicable */}
                {showFeedback && selectedOptions.includes(option.id) && option.feedback && (
                  <div className="mt-2 p-2 rounded bg-secondary/20 text-foreground text-sm">
                    {option.feedback}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Submit button */}
      <div className="pt-4">
        <Button
          onClick={handleSubmit}
          disabled={selectedOptions.length === 0}
          variant="default"
          className={cn(
            "w-full transition-all duration-300",
            selectedOptions.length === 0 ? "opacity-50" : "opacity-100",
          )}
        >
          Controleer antwoord
        </Button>
      </div>
    </div>
  );
}
