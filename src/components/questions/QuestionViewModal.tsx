import { useState } from "react";

import { QuestionEditorForm } from "../editor/QuestionEditorForm";
import { Button } from "../ui/button";

import { PreviewMode } from "./preview/PreviewMode";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuestions } from "@/contexts/QuestionsContext";
import type { Question } from "@/types/editor";




interface QuestionViewModalProps {
  question: Question | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuestionViewModal({ question, isOpen, onClose }: QuestionViewModalProps) {
  const { updateQuestion } = useQuestions();
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(question);

  if (question?.id !== currentQuestion?.id) {
    setCurrentQuestion(question);
  }

  const handleQuestionChange = (updatedQuestion: Question) => {
    setCurrentQuestion(updatedQuestion);
  };

  const handleSave = () => {
    if (currentQuestion) {
      updateQuestion(currentQuestion.id, currentQuestion);
      onClose();
    }
  };

  const handleAddOption = () => {
    if (currentQuestion) {
      const newOption = {
        id: `option-${(currentQuestion.options?.length || 0) + 1}`,
        text: "",
        isCorrect: false,
      };
      setCurrentQuestion({
        ...currentQuestion,
        options: [...(currentQuestion.options || []), newOption],
      });
    }
  };

  const handleOptionChange = (optionId: string, newText: string) => {
    if (currentQuestion) {
      const updatedOptions = currentQuestion.options?.map((opt) =>
        opt.id === optionId ? { ...opt, text: newText } : opt,
      );
      setCurrentQuestion({ ...currentQuestion, options: updatedOptions });
    }
  };

  const handleRemoveOption = (optionId: string) => {
    if (currentQuestion) {
      const updatedOptions = currentQuestion.options?.filter(
        (opt) => opt.id !== optionId,
      );
      setCurrentQuestion({ ...currentQuestion, options: updatedOptions });
    }
  };

  if (!currentQuestion) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bekijken en bewerken</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="edit" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="edit">Bewerken</TabsTrigger>
            <TabsTrigger value="preview">Bekijken</TabsTrigger>
          </TabsList>
          
          <TabsContent value="edit">
            <QuestionEditorForm
              currentQuestion={currentQuestion}
              onQuestionChange={handleQuestionChange}
              onAddOption={handleAddOption}
              onOptionChange={handleOptionChange}
              onRemoveOption={handleRemoveOption}
              showNameField={false}
            />
          </TabsContent>
          
          <TabsContent value="preview">
            <PreviewMode 
              question={currentQuestion} 
              onQuestionChange={handleQuestionChange}
            />
          </TabsContent>
        </Tabs>

        <div className="mt-4 flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Annuleren
          </Button>
          <Button onClick={handleSave}>Opslaan</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}