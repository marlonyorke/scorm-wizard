
export const markWordsStyles = `
  .question.mark-words {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
  .word-button {
    background: none;
    border: none;
    cursor: pointer;
    margin: 0;
    padding: 4px 6px;
    font-size: 16px;
    display: inline-block;
    color: #374151;
  }
  .word-button.selected {
    background-color: #E5DEFF;
    color: #4F46E5;
    font-weight: 500;
    border: 1px solid rgba(79, 70, 229, 0.2);
    border-radius: 4px;
  }
  .word-button.correct {
    background-color: #F2FCE2;
    color: #166534;
  }
  .word-button.incorrect {
    background-color: #FEE2E2;
    color: #991B1B;
  }
  .word-button:disabled {
    cursor: default;
  }
  .mark-words-text {
    line-height: 2;
    color: #374151;
  }
  img {
    max-width: 100%;
    height: auto;
  }
`;
