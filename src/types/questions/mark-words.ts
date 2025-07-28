import type { BaseQuestionData } from "./base";

import type { ValidationError } from "@/components/editor/question-editors/base/BaseQuestionEditor";

export interface MarkedWord {
  id: string;
  word: string;
  isCorrect: boolean;
}

export interface MarkWordsQuestionData extends BaseQuestionData {
  type: "mark-words";
  question: string;
  words: MarkedWord[];
}

export const MarkWordsDefinition = {
  type: "mark-words" as const,
  
  createInitialState: (): MarkWordsQuestionData => ({
    id: crypto.randomUUID(),
    type: "mark-words",
    name: "",
    text: "",
    question: "",
    feedback: "",
    words: [],
  }),

  validate: (question: MarkWordsQuestionData): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (!question.text?.trim()) {
      errors.push({
        field: "text",
        message: "Voer een tekst in",
      });
    }

    if (!question.words || question.words.length === 0) {
      errors.push({
        field: "words",
        message: "Markeer minimaal één woord in de tekst",
      });
    }

    return errors;
  },

  isComplete: (question: MarkWordsQuestionData): boolean => {
    return !!(
      question.text?.trim() &&
      question.words?.length > 0
    );
  },
};