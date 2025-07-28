
import { BaseQuestionData } from "./base";
import type { DragDropQuestionData } from "./drag-drop";
import { DragDropDefinition } from "./drag-drop";
import type { MarkWordsQuestionData } from "./mark-words";
import { MarkWordsDefinition } from "./mark-words";
import type { MatchingQuestionData } from "./matching";
import { MatchingDefinition } from "./matching";
import { MultipleChoiceDefinition } from "./multiple-choice";
import type { MultipleChoiceQuestionData } from "./multiple-choice";
import type { OrderQuestionData } from "./order";
import { OrderingDefinition } from "./order";

import type { ValidationError } from "@/components/editor/question-editors/base/BaseQuestionEditor";

export type SupportedQuestionData = 
  | MultipleChoiceQuestionData 
  | MarkWordsQuestionData
  | MatchingQuestionData
  | OrderQuestionData
  | DragDropQuestionData;

export interface QuestionTypeDefinition<T extends SupportedQuestionData> {
  type: string;
  createInitialState: () => T;
  validate: (question: T) => ValidationError[];
  isComplete: (question: T) => boolean;
}

class QuestionTypeRegistry {
  private definitions = new Map<string, QuestionTypeDefinition<SupportedQuestionData>>();

  constructor() {
    this.register(MultipleChoiceDefinition);
    this.register(MarkWordsDefinition);
    this.register(MatchingDefinition);
    this.register(OrderingDefinition);
    this.register(DragDropDefinition);
  }

  register<T extends SupportedQuestionData>(definition: QuestionTypeDefinition<T>) {
    this.definitions.set(definition.type, definition as QuestionTypeDefinition<SupportedQuestionData>);
  }

  getDefinition<T extends SupportedQuestionData>(type: string): QuestionTypeDefinition<T> | undefined {
    return this.definitions.get(type) as QuestionTypeDefinition<T> | undefined;
  }

  createInitialState(type: string): SupportedQuestionData {
    const definition = this.getDefinition(type);
    if (!definition) {
      throw new Error(`No definition found for question type: ${type}`);
    }
    return definition.createInitialState();
  }

  validate(question: SupportedQuestionData): ValidationError[] {
    const definition = this.getDefinition(question.type);
    if (!definition) {
      throw new Error(`No definition found for question type: ${question.type}`);
    }
    return definition.validate(question);
  }

  isComplete(question: SupportedQuestionData): boolean {
    const definition = this.getDefinition(question.type);
    if (!definition) {
      throw new Error(`No definition found for question type: ${question.type}`);
    }
    return definition.isComplete(question);
  }
}

export const questionTypeRegistry = new QuestionTypeRegistry();

