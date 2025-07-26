interface WordData {
  word: string;
  id: string;
  isTarget: boolean;
}

interface TemplateData {
  question?: string;
  mediaHtml: string;
  words: WordData[];
}

export const createMarkWordsTemplate = ({ question, mediaHtml, words }: TemplateData) => `
  <div class="question mark-words">
    ${question ? `<h2 class="text-lg font-medium mb-4">${question}</h2>` : ""}
    ${mediaHtml}
    <div class="bg-gray-50 rounded-lg p-6 mb-4">
      <p class="leading-relaxed text-lg mark-words-text">
        ${words.map(({ word, id, isTarget }) => `
          <button 
            class="word-button px-1.5 py-0.5 rounded transition-colors hover:bg-blue-100"
            data-word="${word}"
            data-id="${id}"
            data-target="${isTarget}"
            type="button"
          >${word}</button>
        `).join(" ")}
      </p>
    </div>
    <div class="flex justify-center">
      <button 
        id="check-button"
        class="w-full max-w-md bg-[#3B82F6] hover:bg-[#2563EB] text-white px-4 py-2 rounded disabled:opacity-50"
        disabled
      >
        Controleer
      </button>
    </div>
    <div id="feedback" class="mt-4 p-4 rounded hidden"></div>
  </div>
`;
