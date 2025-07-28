import type { BaseQuestionData } from "./base";

import type { ValidationError } from "@/components/editor/question-editors/base/BaseQuestionEditor";

export interface MultipleChoiceOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface MultipleChoiceQuestionData extends BaseQuestionData {
  type: "multiple-choice";
  options: MultipleChoiceOption[];
  multipleCorrect: boolean;
}

export const MultipleChoiceDefinition = {
  type: "multiple-choice" as const,
  
  createInitialState: (): MultipleChoiceQuestionData => ({
    id: crypto.randomUUID(),
    type: "multiple-choice",
    name: "",
    text: "",
    feedback: "",
    options: [
      { id: crypto.randomUUID(), text: "", isCorrect: false },
      { id: crypto.randomUUID(), text: "", isCorrect: false },
    ],
    multipleCorrect: false,
  }),

  validate: (question: MultipleChoiceQuestionData): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (!question.text?.trim()) {
      errors.push({
        field: "text",
        message: "Voer een vraag in",
      });
    }

    if (!question.options || question.options.length < 2) {
      errors.push({
        field: "options",
        message: "Voeg minimaal twee antwoordopties toe",
      });
    } else {
      const hasCorrectAnswer = question.options.some((opt) => opt.isCorrect);
      if (!hasCorrectAnswer) {
        errors.push({
          field: "options",
          message: "Selecteer minimaal één correct antwoord",
        });
      }
    }

    return errors;
  },

  isComplete: (question: MultipleChoiceQuestionData): boolean => {
    return !!(
      question.text?.trim() &&
      question.options?.length >= 2 &&
      question.options.some((opt) => opt.isCorrect)
    );
  },
};