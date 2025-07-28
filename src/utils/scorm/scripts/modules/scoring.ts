
export const scoringModule = `
  function submitQuiz() {
    let correctAnswers = 0;
    
    questions.forEach(question => {
      const selectedAnswers = answers[question.id] || [];
      const correctOptions = question.options.filter(opt => opt.isCorrect).map(opt => opt.id);
      
      if (question.multipleCorrect) {
        const isCorrect = selectedAnswers.length === correctOptions.length &&
          selectedAnswers.every(answer => correctOptions.includes(answer));
        if (isCorrect) correctAnswers++;
      } else {
        if (selectedAnswers[0] === correctOptions[0]) correctAnswers++;
      }
    });
    
    const score = Math.round((correctAnswers / questions.length) * 100);
    
    if (API) {
      API.LMSSetValue('cmi.core.score.raw', score.toString());
      API.LMSSetValue('cmi.core.lesson_status', score >= 70 ? 'passed' : 'failed');
      API.LMSCommit('');
    }
    
    showResults(score);
  }
`;
