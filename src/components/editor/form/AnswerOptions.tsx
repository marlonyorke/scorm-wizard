import { Plus } from "lucide-react";

import { MultipleChoiceOption } from "./answer-options/MultipleChoiceOption";
import { SingleChoiceOption } from "./answer-options/SingleChoiceOption";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup } from "@/components/ui/radio-group";
import { Toggle } from "@/components/ui/toggle";
import type { Question } from "@/types/editor";

interface AnswerOptionsProps {
  currentQuestion: Question;
  onQuestionChange: (question: Question) => void;
  onAddOption: () => void;
  onOptionChange: (optionId: string, newText: string) => void;
  onRemoveOption: (optionId: string) => void;
}

export function AnswerOptions({
  currentQuestion,
  onQuestionChange,
  onAddOption,
  onOptionChange,
  onRemoveOption,
}: AnswerOptionsProps) {
  if (!currentQuestion.options) {
    return null;
  }

  // Vind het geselecteerde optie ID voor single choice vragen
  const selectedOptionId = currentQuestion.options.find((opt) => opt.isCorrect)?.id;

  const handleMultipleCorrectToggle = (pressed: boolean) => {
    // Update de multipleCorrect eigenschap
    onQuestionChange({
      ...currentQuestion,
      multipleCorrect: pressed,
    });

    // Als we overschakelen van meerdere naar één correct antwoord,
    // zorg ervoor dat slechts één optie als correct is gemarkeerd
    if (!pressed && currentQuestion.options) {
      const correctOptions = currentQuestion.options.filter((opt) => opt.isCorrect);
      if (correctOptions.length > 1) {
        const updatedOptions = currentQuestion.options.map((opt, index) => ({
          ...opt,
          isCorrect: index === 0, // Alleen de eerste optie is correct
        }));
        
        onQuestionChange({
          ...currentQuestion,
          multipleCorrect: pressed,
          options: updatedOptions,
        });
      }
    }
  };

  const handleCorrectAnswerChange = (optionId: string) => {
    const updatedOptions = currentQuestion.options?.map((opt) => {
      if (currentQuestion.multipleCorrect) {
        // Voor meerkeuze: toggle de isCorrect waarde van de aangeklikte optie
        if (opt.id === optionId) {
          return { ...opt, isCorrect: !opt.isCorrect };
        }
        return opt;
      } else {
        // Voor enkelvoudige keuze: alleen de aangeklikte optie is correct
        return { ...opt, isCorrect: opt.id === optionId };
      }
    });
    
    onQuestionChange({ ...currentQuestion, options: updatedOptions });
  };

  const handleRemoveOption = (optionId: string) => {
    // Verwijder de optie met het opgegeven ID
    const updatedOptions = currentQuestion.options?.filter((opt) => opt.id !== optionId);
    
    // Zorg ervoor dat er altijd minstens één correct antwoord is
    const hasCorrectOption = updatedOptions?.some((opt) => opt.isCorrect);
    if (!hasCorrectOption && updatedOptions?.length > 0) {
      updatedOptions[0].isCorrect = true;
    }
    
    onQuestionChange({ ...currentQuestion, options: updatedOptions });
  };

  const handleMediaChange = (optionId: string, mediaUrl: string | undefined, imageSize?: { width: number; height: number }) => {
    const updatedOptions = currentQuestion.options?.map((opt) => {
      if (opt.id === optionId) {
        return { ...opt, mediaUrl, imageSize };
      }
      return opt;
    });
    
    onQuestionChange({ ...currentQuestion, options: updatedOptions });
  };

  const handleFeedbackChange = (optionId: string, feedback: string) => {
    const updatedOptions = currentQuestion.options?.map((opt) => {
      if (opt.id === optionId) {
        return { ...opt, feedback };
      }
      return opt;
    });
    
    onQuestionChange({ ...currentQuestion, options: updatedOptions });
  };

  const handleAddOption = () => {
    // Voeg een nieuwe optie toe met de juiste index
    const newIndex = (currentQuestion.options?.length || 0) + 1;
    const newOption = {
      id: crypto.randomUUID(),
      text: "", 
      isCorrect: false,
      feedback: "",
    };
    
    onAddOption();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Antwoordopties</Label>
        <Toggle
          pressed={currentQuestion.multipleCorrect}
          onPressedChange={handleMultipleCorrectToggle}
          className="ml-2"
        >
          Meerdere correcte antwoorden
        </Toggle>
      </div>

      <div className="space-y-3">
        {currentQuestion.options?.map((option, index) => {
          if (currentQuestion.multipleCorrect) {
            return (
              <MultipleChoiceOption
                key={option.id}
                option={option}
                optionIndex={index + 1}
                onOptionChange={onOptionChange}
                onCorrectAnswerChange={handleCorrectAnswerChange}
                onRemoveOption={handleRemoveOption}
                onMediaChange={handleMediaChange}
                onFeedbackChange={handleFeedbackChange}
              />
            );
          } else {
            return (
              <SingleChoiceOption
                key={option.id}
                option={option}
                optionIndex={index + 1}
                selectedOptionId={selectedOptionId}
                onOptionChange={onOptionChange}
                onCorrectAnswerChange={handleCorrectAnswerChange}
                onRemoveOption={handleRemoveOption}
                onMediaChange={handleMediaChange}
                onFeedbackChange={handleFeedbackChange}
              />
            );
          }
        })}
      </div>

      <Button variant="outline" onClick={handleAddOption} className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Voeg optie toe
      </Button>
    </div>
  );
}
