
import { BaseRenderer } from "./base";
import { createMarkWordsScript } from "./scripts/mark-words-script";
import { markWordsStyles } from "./styles/mark-words-styles";
import { createMarkWordsTemplate } from "./templates/mark-words-template";

import type { Question } from "@/types/editor";

export class MarkWordsRenderer extends BaseRenderer {
  render(question: Question): string {
    if (question.type !== "mark-words") {
      return "";
    }
    
    console.log("Rendering mark-words question:", question);
    
    const mediaHtml = question.mediaUrl ? `
      <div class="flex justify-center mb-6">
        <img 
          src="${question.mediaUrl}" 
          style="max-width: ${question.imageSize?.width || 300}px; height: auto;"
          alt=""
        />
      </div>
    ` : "";

    const text = question.text || "";
    console.log("Original text:", text);
    
    const cleanText = text.replace(/\^(.*?)\^/g, "$1");
    console.log("Cleaned text:", cleanText);
    
    const words = cleanText.split(/\s+/)
      .filter((word) => word.length > 0)
      .map((word, index) => ({
        word,
        id: `word-${index}`,
        isTarget: !!text.match(new RegExp(`\\^${word}\\^`)),
      }));
    
    console.log("Words array:", words);

    const correctWords = Array.from(text.match(/\^(.*?)\^/g) || [])
      .map((w) => w.replace(/\^/g, ""));

    const template = createMarkWordsTemplate({
      question: question.question,
      mediaHtml,
      words,
    });

    const script = createMarkWordsScript(correctWords);

    return this.createScormWrapper(`
      ${template}
      <style>${markWordsStyles}</style>
      <script>${script}</script>
    `);
  }

  validateAnswer(question: Question, answer: string[]): boolean {
    if (!question.words) {
      return false;
    }
    const correctWords = new Set(question.text.match(/\^(.*?)\^/g)?.map((w) => w.replace(/\^/g, "")) || []);
    const userWords = new Set(answer);
    return Array.from(correctWords).every((word) => userWords.has(word)) &&
           Array.from(userWords).every((word) => correctWords.has(word));
  }

  calculateScore(question: Question, answer: string[]): number {
    if (!question.text) {
      return 0;
    }
    const correctWords = new Set(question.text.match(/\^(.*?)\^/g)?.map((w) => w.replace(/\^/g, "")) || []);
    if (correctWords.size === 0) {
      return 0;
    }
    
    const userWords = new Set(answer);
    const correctCount = Array.from(correctWords).filter((word) => userWords.has(word)).length;
    return (correctCount / correctWords.size) * 100;
  }
}
