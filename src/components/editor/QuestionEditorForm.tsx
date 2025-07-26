import { useCallback } from "react";

import { QuestionEditorFactory } from "./question-editors/QuestionEditorFactory";

import type { Question } from "@/types/editor";

interface QuestionEditorFormProps {
  currentQuestion: Question;
  onQuestionChange: (question: Question) => void;
  onAddOption: () => void;
  onOptionChange: (optionId: string, newText: string) => void;
  onRemoveOption: (optionId: string) => void;
  showNameField?: boolean;
}

export function QuestionEditorForm({
  currentQuestion,
  onQuestionChange,
  onAddOption,
  onOptionChange,
  onRemoveOption,
  showNameField = true,
}: QuestionEditorFormProps) {
  if (!currentQuestion) {
    console.log("QuestionEditorForm: No current question provided");
    return null;
  }

  // Zorg ervoor dat de optionChange handler de standaard "Antwoordoptie X" tekst gebruikt als de tekst leeg is
  const handleOptionChange = useCallback((optionId: string, newText: string) => {
    // Vind de index van de optie
    const optionIndex = currentQuestion.options?.findIndex((opt) => opt.id === optionId);
    
    if (optionIndex !== undefined && optionIndex >= 0) {
      // Als de tekst leeg is, gebruik de standaard "Antwoordoptie X" tekst
      const finalText = newText.trim() === "" ? `Antwoordoptie ${optionIndex + 1}` : newText;
      onOptionChange(optionId, finalText);
    } else {
      onOptionChange(optionId, newText);
    }
  }, [currentQuestion.options, onOptionChange]);

  console.log("QuestionEditorForm rendering with question:", {
    id: currentQuestion.id,
    type: currentQuestion.type,
    name: currentQuestion.name,
    text: currentQuestion.text,
  });
  
  return (
    <QuestionEditorFactory
      currentQuestion={currentQuestion}
      onQuestionChange={onQuestionChange}
      onAddOption={onAddOption}
      onOptionChange={handleOptionChange}
      onRemoveOption={onRemoveOption}
      showNameField={showNameField}
    />
  );
}