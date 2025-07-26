import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Question } from "@/types/editor";

interface EnhancedMultipleChoiceQuestionProps {
  question: Question;
  answers: string[];
  onAnswerChange: (answers: string[]) => void;
  onSubmit?: () => void;
  showFeedback?: boolean;
}

export function EnhancedMultipleChoiceQuestion({ 
  question, 
  answers, 
  onAnswerChange,
  onSubmit,
  showFeedback = false,
}: EnhancedMultipleChoiceQuestionProps) {
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
    <div className="fixed inset-0 bg-background overflow-auto">
      {/* Question text */}
      <div className="text-lg font-medium mb-4">{question.text}</div>
      
      {/* Options as clickable elements */}
      <div className="space-y-3">
        {question.options.map((option) => (
          <div
            key={option.id}
            onClick={() => handleOptionClick(option.id)}
            className={cn(
              "p-4 rounded-lg border border-border-color cursor-pointer transition-all duration-300",
              "hover:border-primary-accent hover:shadow-md",
              selectedOptions.includes(option.id) 
                ? "bg-secondary-bg border-primary-accent shadow-[0_0_10px_rgba(var(--primary-accent-rgb),0.3)]" 
                : "bg-primary-bg",
              showFeedback && option.isCorrect && "border-success bg-success/10",
              showFeedback && !option.isCorrect && selectedOptions.includes(option.id) && "border-error bg-error/10",
            )}
          >
            <div className="flex items-start">
              <div className="flex-grow">
                <p className="text-primary-text">{option.text}</p>
                
                {/* Show feedback when applicable */}
                {showFeedback && selectedOptions.includes(option.id) && option.feedback && (
                  <div className="mt-2 p-2 rounded bg-secondary-bg/50 text-secondary-text text-sm">
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
          className={cn(
            "w-full bg-primary-accent hover:bg-primary-accent/90 text-primary-text",
            "transition-all duration-300",
            selectedOptions.length === 0 ? "opacity-50" : "opacity-100",
          )}
        >
          Controleer antwoord
        </Button>
      </div>
    </div>
  );
}
