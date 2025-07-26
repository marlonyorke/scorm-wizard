
import { BaseRenderer } from "./base";

import type { Question, OrderItem } from "@/types/editor";

export class OrderRenderer extends BaseRenderer {
  render(question: Question): string {
    if (question.type !== "order") {
      return "";
    }
    
    // Ensure we're working with OrderItems
    const orderItems = question.items as OrderItem[];
    if (!orderItems || !orderItems.every((item) => "correctPosition" in item)) {
      console.error("Invalid items type for order question");
      return "";
    }

    // Shuffle items for initial display
    const shuffledItems = [...orderItems].sort(() => Math.random() - 0.5);

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
        <div class="order-container" id="orderContainer">
          ${shuffledItems.map((item) => `
            <div class="order-item" draggable="true" data-item-id="${item.id}">
              ${item.text}
            </div>
          `).join("")}
        </div>
        <button onclick="checkOrder()" class="check-button">Controleer volgorde</button>
      </div>
      <style>
        .order-container {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin: 1rem 0;
        }
        .order-item {
          padding: 1rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.25rem;
          cursor: move;
          user-select: none;
        }
        .order-item.correct {
          border-color: #86efac;
          background-color: #f0fdf4;
        }
        .order-item.incorrect {
          border-color: #fca5a5;
          background-color: #fef2f2;
        }
        .order-item.dragging {
          opacity: 0.5;
        }
      </style>
      <script>
        const container = document.getElementById('orderContainer');
        const items = ${JSON.stringify(orderItems)};
        let draggingElement = null;

        // Drag and drop functionality
        container.addEventListener('dragstart', (e) => {
          draggingElement = e.target;
          e.target.classList.add('dragging');
        });

        container.addEventListener('dragend', (e) => {
          e.target.classList.remove('dragging');
        });

        container.addEventListener('dragover', (e) => {
          e.preventDefault();
          const afterElement = getDragAfterElement(container, e.clientY);
          if (draggingElement) {
            if (afterElement) {
              container.insertBefore(draggingElement, afterElement);
            } else {
              container.appendChild(draggingElement);
            }
          }
        });

        function getDragAfterElement(container, y) {
          const draggableElements = [...container.querySelectorAll('.order-item:not(.dragging)')];
          
          return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
              return { offset: offset, element: child };
            } else {
              return closest;
            }
          }, { offset: Number.NEGATIVE_INFINITY }).element;
        }

        function checkOrder() {
          const currentOrder = [...container.children].map(item => item.dataset.itemId);
          let correctCount = 0;
          
          currentOrder.forEach((itemId, index) => {
            const item = items.find(i => i.id === itemId);
            const element = container.children[index];
            
            if (item && item.correctPosition === index + 1) {
              correctCount++;
              element.classList.add('correct');
            } else {
              element.classList.add('incorrect');
            }
          });

          const score = Math.round((correctCount / items.length) * 100);
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

  validateAnswer(question: Question, orderIds: string[]): boolean {
    if (question.type !== "order") {
      return false;
    }
    const orderItems = question.items as OrderItem[];
    if (!orderItems || !orderItems.every((item) => "correctPosition" in item)) {
      return false;
    }
    
    return orderIds.every((id, index) => {
      const item = orderItems.find((i) => i.id === id);
      return item?.correctPosition === index + 1;
    });
  }

  calculateScore(question: Question, orderIds: string[]): number {
    if (question.type !== "order") {
      return 0;
    }
    const orderItems = question.items as OrderItem[];
    if (!orderItems || !orderItems.every((item) => "correctPosition" in item)) {
      return 0;
    }
    
    const correctPositions = orderIds.filter((id, index) => {
      const item = orderItems.find((i) => i.id === id);
      return item?.correctPosition === index + 1;
    }).length;

    return Math.round((correctPositions / orderItems.length) * 100);
  }
}
