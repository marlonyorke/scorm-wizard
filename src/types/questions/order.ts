
import { BaseQuestionData } from "./base";

import type { ValidationError } from "@/components/editor/question-editors/base/BaseQuestionEditor";
import type { Question } from "@/types/editor";

export interface OrderItem {
  id: string;
  text: string;
  correctPosition: number;
}

export interface OrderQuestionData extends Question {
  type: "order";
  items: OrderItem[];
}

export const OrderingDefinition = {
  type: "order" as const,
  createInitialState: (): OrderQuestionData => ({
    id: crypto.randomUUID(),
    type: "order",
    name: "",
    text: "",
    feedback: "",
    items: [],
  }),
  validate: (question: OrderQuestionData): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (!question.text?.trim()) {
      errors.push({
        field: "text",
        message: "Voer een vraag in",
      });
    }

    if (!question.items || question.items.length < 2) {
      errors.push({
        field: "items",
        message: "Voeg minimaal twee items toe",
      });
    }

    return errors;
  },
  isComplete: (question: OrderQuestionData): boolean => {
    return question.text.trim() !== "" && question.items.length >= 2;
  },
};

