
export const navigationModule = `
  function handleAnswer(optionId) {
    const question = questions[currentQuestionIndex];
    if (question.multipleCorrect) {
      answers[question.id] = answers[question.id] || [];
      const index = answers[question.id].indexOf(optionId);
      if (index > -1) {
        answers[question.id].splice(index, 1);
      } else {
        answers[question.id].push(optionId);
      }
    } else {
      answers[question.id] = [optionId];
    }
    renderCurrentQuestion();
  }

  function handleNext() {
    if (currentQuestionIndex === questions.length - 1) {
      submitQuiz();
    } else {
      currentQuestionIndex++;
      renderCurrentQuestion();
    }
  }

  function handlePrevious() {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
      renderCurrentQuestion();
    }
  }
`;
