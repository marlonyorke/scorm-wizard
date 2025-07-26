
export const quizStyles = `
  body {
    font-family: system-ui, -apple-system, sans-serif;
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }
  .quiz-container {
    min-height: 400px;
  }
  .quiz-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  .question {
    margin-bottom: 2rem;
    animation: fadeIn 0.3s ease-in;
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .question-media {
    margin: 1rem 0;
    text-align: left;
    cursor: pointer;
  }
  .question-media img {
    max-width: 300px;
    height: auto;
    border-radius: 0.5rem;
    transition: transform 0.2s;
  }
  .question-media img:hover {
    transform: scale(1.02);
  }
  .options {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    cursor: pointer;
  }
  .navigation {
    display: flex;
    justify-content: space-between;
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid #e2e8f0;
  }
  .button {
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.2s;
  }
  .button-primary {
    background-color: #2563eb;
    color: white;
    border: none;
  }
  .button-primary:hover {
    background-color: #1d4ed8;
  }
  .button-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .button-outline {
    background-color: transparent;
    border: 1px solid #e2e8f0;
  }
  .button-outline:hover {
    background-color: #f8fafc;
  }
  .results {
    text-align: center;
    padding: 2rem;
  }
  .progress {
    color: #64748b;
    font-size: 0.875rem;
  }
`;
