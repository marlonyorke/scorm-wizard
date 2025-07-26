import type { Question } from "@/types/editor";

export interface BaseScormQuestion {
  id: string;
  type: string;
  text: string;
  feedback?: string;
}

export interface ScormMultipleChoiceQuestion extends BaseScormQuestion {
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
}

export type ScormQuestion = ScormMultipleChoiceQuestion;

export interface ScormQuestionRenderer {
  render: (question: Question) => string;
  validateAnswer: (question: Question, answer: any) => boolean;
  calculateScore: (question: Question, answer: any) => number;
}