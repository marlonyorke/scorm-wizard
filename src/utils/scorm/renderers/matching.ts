
import { BaseRenderer } from "./base";

import type { Question } from "@/types/editor";

export class MatchingRenderer extends BaseRenderer {
  render(question: Question): string {
    if (question.type !== "matching") {
      return "";
    }

    const content = `
      <div class="question">
        <h2>${question.text}</h2>
        ${question.mediaUrl ? `
          <div class="question-media">
            <img 
              src="${question.mediaUrl}" 
              alt="Question media"
              style="width: ${question.imageSize?.width || 300}px; height: ${question.imageSize?.height || 200}px; object-fit: contain;"
            >
          </div>
        ` : ""}
        <div class="matching-container">
          ${question.pairs?.map((pair, index) => `
            <div class="matching-pair">
              <div class="left-item">${pair.left}</div>
              <select class="matching-select" data-pair-id="${pair.id}">
                <option value="">Selecteer een antwoord...</option>
                ${question.pairs?.map((p) => `
                  <option value="${p.right}">${p.right}</option>
                `).join("")}
              </select>
            </div>
          `).join("")}
        </div>
        <button onclick="checkAnswers()" class="check-button">Controleer antwoorden</button>
      </div>
      <style>
        .matching-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin: 1rem 0;
        }
        .matching-pair {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        .left-item {
          flex: 1;
          padding: 0.5rem;
          background: #f1f5f9;
          border-radius: 0.25rem;
        }
        .matching-select {
          flex: 1;
          padding: 0.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.25rem;
        }
        .correct {
          border-color: #86efac;
          background-color: #f0fdf4;
        }
        .incorrect {
          border-color: #fca5a5;
          background-color: #fef2f2;
        }
      </style>
      <script>
        function checkAnswers() {
          const pairs = ${JSON.stringify(question.pairs)};
          let correctAnswers = 0;
          
          pairs.forEach(pair => {
            const select = document.querySelector(\`[data-pair-id="\${pair.id}"]\`);
            if (!select) return;
            
            const selectedValue = select.value;
            if (selectedValue === pair.right) {
              correctAnswers++;
              select.classList.add('correct');
            } else {
              select.classList.add('incorrect');
            }
          });

          const score = Math.round((correctAnswers / pairs.length) * 100);
          if (API) {
            API.LMSSetValue('cmi.core.score.raw', score.toString());
            API.LMSSetValue('cmi.core.lesson_status', score >= 70 ? 'passed' : 'failed');
            API.LMSCommit('');
          }
        }
      </script>
    `;

    return this.createScormWrapper(content);
  }

  validateAnswer(question: Question, answers: Record<string, string>): boolean {
    if (question.type !== "matching") {
      return false;
    }
    return question.pairs?.every((pair) => answers[pair.id] === pair.right) || false;
  }

  calculateScore(question: Question, answers: Record<string, string>): number {
    if (question.type !== "matching") {
      return 0;
    }
    if (!question.pairs?.length) {
      return 0;
    }
    
    const correctAnswers = question.pairs.filter((pair) => answers[pair.id] === pair.right).length;
    return Math.round((correctAnswers / question.pairs.length) * 100);
  }
}

