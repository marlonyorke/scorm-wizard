
import type { BaseQuestionData } from "./base";

import type { ValidationError } from "@/components/editor/question-editors/base/BaseQuestionEditor";

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface MatchingQuestionData extends BaseQuestionData {
  type: "matching";
  pairs: MatchingPair[];
}

export const MatchingDefinition = {
  type: "matching" as const,
  
  createInitialState: (): MatchingQuestionData => ({
    id: crypto.randomUUID(),
    type: "matching",
    name: "",
    text: "",
    feedback: "",
    pairs: [
      { id: crypto.randomUUID(), left: "", right: "" },
    ],
  }),

  validate: (question: MatchingQuestionData): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (!question.text?.trim()) {
      errors.push({
        field: "text",
        message: "Voer een vraag in",
      });
    }

    if (!question.pairs || question.pairs.length < 2) {
      errors.push({
        field: "pairs",
        message: "Voeg minimaal twee paren toe",
      });
    } else {
      const invalidPairs = question.pairs.some(
        (pair) => !pair.left.trim() || !pair.right.trim(),
      );
      
      if (invalidPairs) {
        errors.push({
          field: "pairs",
          message: "Vul beide delen van elk paar in",
        });
      }
    }

    return errors;
  },

  isComplete: (question: MatchingQuestionData): boolean => {
    return !!(
      question.text?.trim() &&
      question.pairs?.length >= 2 &&
      question.pairs.every((pair) => pair.left.trim() && pair.right.trim())
    );
  },
};
