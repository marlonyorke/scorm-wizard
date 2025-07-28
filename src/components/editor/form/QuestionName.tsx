import { Input } from "@/components/ui/input";
import type { Question } from "@/types/editor";

interface QuestionNameProps {
  currentQuestion: Question;
  onQuestionChange: (question: Question) => void;
  showNameField?: boolean;
}

export function QuestionName({ currentQuestion, onQuestionChange, showNameField = true }: QuestionNameProps) {
  if (!showNameField) {
    return null;
  }
  
  return (
    <div className="space-y-2">
      <Input
        value={currentQuestion.name || ""}
        onChange={(e) => onQuestionChange({
          ...currentQuestion,
          name: e.target.value,
        })}
        placeholder="Geef deze vraag een naam"
      />
    </div>
  );
}