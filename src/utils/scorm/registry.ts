
import { MarkWordsRenderer } from "./renderers/mark-words";
import { MatchingRenderer } from "./renderers/matching";
import { MultipleChoiceRenderer } from "./renderers/multiple-choice";
import { OrderRenderer } from "./renderers/order";
import type { ScormQuestionRenderer } from "./types/questions";

import type { Question } from "@/types/editor";

export class QuestionRegistry {
  private static renderers = new Map<string, ScormQuestionRenderer>();

  static {
    this.register("multiple-choice", new MultipleChoiceRenderer());
    this.register("mark-words", new MarkWordsRenderer());
    this.register("matching", new MatchingRenderer());
    this.register("order", new OrderRenderer());
    // Video renderer zal in een latere sprint worden toegevoegd
  }

  static register(type: string, renderer: ScormQuestionRenderer) {
    this.renderers.set(type, renderer);
  }

  static getRenderer(type: string): ScormQuestionRenderer | undefined {
    return this.renderers.get(type);
  }

  static renderQuestion(question: Question): string {
    const renderer = this.getRenderer(question.type);
    if (!renderer) {
      throw new Error(`No renderer found for question type: ${question.type}`);
    }
    return renderer.render(question);
  }
}
