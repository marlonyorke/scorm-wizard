import { EnhancedDragDropQuestionEditor } from "../question-types/EnhancedDragDropQuestionEditor";
import { HotspotQuestionEditor } from "../question-types/HotspotQuestionEditor";
import { InteractiveVideoQuestionEditor } from "../question-types/InteractiveVideoQuestionEditor";
import { MarkWordsQuestionEditor } from "../question-types/MarkWordsQuestionEditor";
import { MatchingQuestionEditor } from "../question-types/MatchingQuestionEditor";
import { MultipleChoiceQuestionEditor } from "../question-types/MultipleChoiceQuestionEditor";
import { OpenQuestionEditor } from "../question-types/OpenQuestionEditor";
import { OrderQuestionEditor } from "../question-types/OrderQuestionEditor";

import type { ValidationError } from "./base/BaseQuestionEditor";
import { BaseQuestionEditor } from "./base/BaseQuestionEditor";

import type { Question } from "@/types/editor";

interface QuestionEditorFactoryProps {
  currentQuestion: Question;
  onQuestionChange: (question: Question) => void;
  onAddOption?: () => void;
  onOptionChange?: (optionId: string, newText: string) => void;
  onRemoveOption?: (optionId: string) => void;
  showNameField?: boolean;
}

export function QuestionEditorFactory({ 
  currentQuestion, 
  onQuestionChange,
  onAddOption,
  onOptionChange,
  onRemoveOption,
  showNameField = true,
}: QuestionEditorFactoryProps) {
  console.log("🔄 Rendering QuestionEditorFactory...");
  console.log("👉 Huidig vraagtype:", currentQuestion.type);
  console.log("📦 Complete vraag object:", currentQuestion);

  // Type-specifieke validatie functies
  const validateMultipleChoiceQuestion = (question: Question): ValidationError[] => {
    console.log("🔍 Validating multiple-choice question:", question);
    const baseErrors = BaseQuestionEditor.validateQuestion(question);
    const typeErrors: ValidationError[] = [];

    if (question.type === "multiple-choice") {
      if (!question.options || question.options.length < 2) {
        typeErrors.push({
          field: "options",
          message: "Voeg minimaal twee antwoordopties toe",
        });
      } else {
        const hasCorrectAnswer = question.options.some((opt) => opt.isCorrect);
        if (!hasCorrectAnswer) {
          typeErrors.push({
            field: "options",
            message: "Selecteer minimaal één correct antwoord",
          });
        }
      }
    }

    const allErrors = [...baseErrors, ...typeErrors];
    console.log("❌ Multiple choice validation errors:", allErrors);
    return allErrors;
  };

  const validateMatchingQuestion = (question: Question): ValidationError[] => {
    console.log("🔍 Validating matching question:", question);
    const baseErrors = BaseQuestionEditor.validateQuestion(question);
    const typeErrors: ValidationError[] = [];

    if (question.type === "matching") {
      if (!question.pairs || question.pairs.length < 2) {
        typeErrors.push({
          field: "pairs",
          message: "Voeg minimaal twee paren toe",
        });
      } else {
        const invalidPairs = question.pairs.some(
          (pair) => !pair.left.trim() || !pair.right.trim(),
        );
        if (invalidPairs) {
          typeErrors.push({
            field: "pairs",
            message: "Vul beide delen van elk paar in",
          });
        }
      }
    }

    const allErrors = [...baseErrors, ...typeErrors];
    console.log("❌ Matching validation errors:", allErrors);
    return allErrors;
  };

  // Selecteer de juiste editor op basis van het vraagtype
  console.log("🎯 Selecting editor for question type:", currentQuestion.type);
  
  switch (currentQuestion.type) {
    case "multiple-choice":
      console.log("✅ Rendering MultipleChoiceQuestionEditor");
      return (
        <MultipleChoiceQuestionEditor
          currentQuestion={currentQuestion}
          onQuestionChange={onQuestionChange}
          validateQuestion={validateMultipleChoiceQuestion}
          onAddOption={onAddOption}
          onOptionChange={onOptionChange}
          onRemoveOption={onRemoveOption}
          showNameField={showNameField}
        />
      );
    
    case "matching":
      console.log("✅ Rendering MatchingQuestionEditor");
      return (
        <MatchingQuestionEditor
          currentQuestion={currentQuestion}
          onQuestionChange={onQuestionChange}
          validateQuestion={validateMatchingQuestion}
          showNameField={showNameField}
        />
      );

    case "order":
      console.log("✅ Rendering OrderQuestionEditor");
      return (
        <OrderQuestionEditor
          currentQuestion={currentQuestion}
          onQuestionChange={onQuestionChange}
          showNameField={showNameField}
        />
      );

    case "drag-drop":
      console.log("✅ Rendering EnhancedDragDropQuestionEditor");
      return (
        <EnhancedDragDropQuestionEditor
          currentQuestion={currentQuestion}
          onQuestionChange={onQuestionChange}
          showNameField={showNameField}
        />
      );
      
    case "open":
      console.log("✅ Rendering OpenQuestionEditor");
      return (
        <OpenQuestionEditor
          currentQuestion={currentQuestion}
          onQuestionChange={onQuestionChange}
          showNameField={showNameField}
        />
      );
      
    case "hotspot":
      console.log("✅ Rendering HotspotQuestionEditor");
      return (
        <HotspotQuestionEditor
          currentQuestion={currentQuestion}
          onQuestionChange={onQuestionChange}
          showNameField={showNameField}
        />
      );
    
    case "video-interactive":
      console.log("✅ Rendering InteractiveVideoQuestionEditor");
      return (
        <InteractiveVideoQuestionEditor
          currentQuestion={currentQuestion}
          onQuestionChange={onQuestionChange}
          showNameField={showNameField}
        />
      );
    
    case "mark-words":
      console.log("✅ Rendering MarkWordsQuestionEditor");
      return (
        <MarkWordsQuestionEditor
          currentQuestion={currentQuestion}
          onQuestionChange={onQuestionChange}
          showNameField={showNameField}
        />
      );
    
    default:
      console.error("🚨 ERROR: Onbekend vraagtype!", currentQuestion.type);
      return null;
  }
}
