import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

import { EnhancedMultipleChoiceQuestion } from "@/components/quiz/MultipleChoiceQuestion/EnhancedMultipleChoiceQuestion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Question, QuestionOption } from "@/types/editor";

interface EnhancedMultipleChoicePreviewProps {
  text: string;
  options: QuestionOption[];
  multipleCorrect?: boolean;
  mediaUrl?: string;
  imageSize?: { width: number; height: number };
  questionId?: string; // Optionele questionId voor persistentie
}

export function EnhancedMultipleChoicePreview({
  text,
  options,
  multipleCorrect = false,
  mediaUrl,
  imageSize,
  questionId: propQuestionId,
}: EnhancedMultipleChoicePreviewProps) {
  // Genereer een unieke ID voor deze vraag als er geen is meegegeven
  const [questionId] = useState(propQuestionId || `mc-${uuidv4()}`);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [isQuestionCompleted, setIsQuestionCompleted] = useState(false);

  // Bij initialisatie, controleer of er een opgeslagen status is
  useEffect(() => {
    const savedStatus = localStorage.getItem(`question_${questionId}_status`);
    if (savedStatus) {
      try {
        const status = JSON.parse(savedStatus);
        if (status.selectedOptions) {
          setSelectedOptions(status.selectedOptions);
        }
        if (status.feedbackShown) {
          setShowFeedback(true);
        }
        if (status.isAnswerCorrect !== undefined) {
          setIsAnswerCorrect(status.isAnswerCorrect);
        }
        if (status.feedbackCompleted) {
          setIsQuestionCompleted(true);
        }
      } catch (error) {
        console.error("Fout bij het laden van de vraagstatus:", error);
      }
    }
  }, [questionId]);

  const handleAnswerChange = (answers: string[]) => {
    // Als de vraag al is voltooid, sta geen wijzigingen meer toe
    if (isQuestionCompleted) {
      return;
    }
    
    setSelectedOptions(answers);
    
    // Sla de selectie op in localStorage
    const savedStatus = localStorage.getItem(`question_${questionId}_status`) || "{}";
    const status = JSON.parse(savedStatus);
    
    localStorage.setItem(`question_${questionId}_status`, JSON.stringify({
      ...status,
      selectedOptions: answers,
    }));
  };

  const handleSubmit = () => {
    if (selectedOptions.length === 0 || isQuestionCompleted) {
      return;
    }

    // Check if all selected options are correct and no incorrect options are selected
    const correctOptionIds = options.filter((option) => option.isCorrect).map((option) => option.id);
    
    let isCorrect = false;
    if (multipleCorrect) {
      // For multiple correct answers, check if all selected options are correct and all correct options are selected
      const allSelectedAreCorrect = selectedOptions.every((id) => correctOptionIds.includes(id));
      const allCorrectAreSelected = correctOptionIds.every((id) => selectedOptions.includes(id));
      isCorrect = allSelectedAreCorrect && allCorrectAreSelected;
    } else {
      // For single correct answer, check if the selected option is correct
      isCorrect = correctOptionIds.includes(selectedOptions[0]);
    }
    
    setIsAnswerCorrect(isCorrect);
    setShowFeedback(true);
    
    // Sla de status op in localStorage
    const savedStatus = localStorage.getItem(`question_${questionId}_status`) || "{}";
    const status = JSON.parse(savedStatus);
    
    localStorage.setItem(`question_${questionId}_status`, JSON.stringify({
      ...status,
      isAnswerCorrect: isCorrect,
      feedbackShown: true,
    }));
  };

  // Maak een vraag object voor de EnhancedMultipleChoiceQuestion component
  const questionObject: Question = {
    id: questionId,
    type: "multiple-choice",
    text: text,
    options: options,
    multipleCorrect: multipleCorrect,
  };

  return (
    <div className="space-y-4 p-6 rounded-lg bg-primary-bg text-primary-text">
      {/* Media (if provided) */}
      {mediaUrl && (
        <div className="my-4 rounded-lg overflow-hidden">
          <img 
            src={mediaUrl} 
            alt="Question media" 
            className="max-w-full h-auto object-contain"
            style={imageSize ? { width: imageSize.width, height: imageSize.height } : {}}
          />
        </div>
      )}

      {/* Enhanced Multiple Choice Question */}
      <EnhancedMultipleChoiceQuestion
        question={questionObject}
        answers={selectedOptions}
        onAnswerChange={handleAnswerChange}
        onSubmit={handleSubmit}
        showFeedback={showFeedback}
      />

      {/* Feedback summary */}
      {showFeedback && (
        <div className={cn(
          "mt-4 p-4 rounded-lg border",
          isAnswerCorrect 
            ? "border-success bg-success/10 text-success" 
            : "border-error bg-error/10 text-error",
        )}>
          <h3 className="text-lg font-medium mb-2">
            {isAnswerCorrect ? "Correct!" : "Niet correct"}
          </h3>
          <p>
            {isAnswerCorrect 
              ? "Je hebt het juiste antwoord gekozen." 
              : "Je hebt niet het juiste antwoord gekozen. Probeer het opnieuw."}
          </p>
        </div>
      )}
    </div>
  );
}
