import type { Question } from "@/types/editor";

/**
 * Base class for all SCORM renderers
 */
export abstract class BaseRenderer {
  /**
   * Render a question to HTML
   * @param question The question to render
   * @returns HTML string representation of the question
   */
  abstract render(question: Question): string;

  /**
   * Genereert een unieke ID voor een vraag
   */
  protected generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  /**
   * Creëert een wrapper voor de vraag
   */
  protected createScormWrapper(id: string, content: string): string {
    return `
      <div class="question-wrapper" id="question-wrapper-${id}">
        ${content}
      </div>
    `;
  }

  /**
   * Valideert een antwoord
   */
  validateAnswer(question: Question, answer: any): boolean {
    return false;
  }

  /**
   * Berekent een score voor een antwoord
   */
  calculateScore(question: Question, answer: any): number {
    return 0;
  }
}