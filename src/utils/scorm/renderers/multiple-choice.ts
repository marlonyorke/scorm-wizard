import { BaseRenderer } from "./base";

import type { MultipleChoiceQuestion } from "@/types/editor";

export class MultipleChoiceRenderer extends BaseRenderer {
  render(question: MultipleChoiceQuestion): string {
    const questionId = `q-${this.generateId()}`;
    
    // Genereer HTML voor elke optie
    const optionsHtml = question.options.map((option, index) => {
      const optionId = `option-${questionId}-${index}`;
      const isCorrect = option.isCorrect;
      
      return `
        <label class="option-label">
          <input 
            type="radio" 
            name="${questionId}" 
            data-question-id="${questionId}" 
            data-option-id="${index}"
            data-correct="${isCorrect}"
          >
          <span class="option-text">${option.text}</span>
        </label>
        <div id="feedback-${questionId}-${index}" style="display: none;">
          ${option.feedback || (isCorrect ? "Correct!" : "Incorrect!")}
        </div>
      `;
    }).join("\n");

    // Genereer de volledige HTML voor de vraag
    const content = `
      <div class="question-content">
        <h2 class="question-text">${question.text}</h2>
        ${question.media ? `
          <div class="question-media">
            ${question.media}
          </div>
        ` : ""}
        <div class="options">
          ${optionsHtml}
        </div>
        
        <button 
          class="check-button" 
          onclick="window.checkAnswer('${questionId}')"
        >
          Controleer antwoord
        </button>
        
        <div id="feedback-container-${questionId}" class="feedback-container"></div>
      </div>
    `;

    return this.createScormWrapper(questionId, content);
  }

  validateAnswer(question: MultipleChoiceQuestion, answer: any): boolean {
    if (question.multipleCorrect) {
      // Voor meerdere correcte antwoorden
      const selectedIds = Array.isArray(answer) ? answer : [answer];
      const correctOptions = question.options?.filter((o) => o.isCorrect) || [];
      const correctIds = correctOptions.map((o) => o.id);
      
      // Alle geselecteerde opties moeten correct zijn en alle correcte opties moeten geselecteerd zijn
      return selectedIds.every((id) => correctIds.includes(id)) && 
             correctIds.every((id) => selectedIds.includes(id));
    } else {
      // Voor één correct antwoord
      const correctOption = question.options?.find((option) => option.isCorrect);
      return correctOption?.id === answer;
    }
  }

  calculateScore(question: MultipleChoiceQuestion, answer: any): number {
    return this.validateAnswer(question, answer) ? 100 : 0;
  }
}