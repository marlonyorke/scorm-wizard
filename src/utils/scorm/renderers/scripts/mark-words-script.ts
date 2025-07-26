export const createMarkWordsScript = (correctWords: string[]) => `
(function() {
  console.log('Initializing mark-words script');
  
  const selectedWords = new Map();
  const correctWords = new Set(${JSON.stringify(correctWords)});
  
  console.log('Correct words:', Array.from(correctWords));
  
  const buttons = document.querySelectorAll('.word-button');
  const checkButton = document.getElementById('check-button');
  const feedbackDiv = document.getElementById('feedback');
  
  const savedProgress = localStorage.getItem('markWordsProgress');
  if (savedProgress) {
    const savedWords = new Map(JSON.parse(savedProgress));
    savedWords.forEach((word, id) => {
      const button = Array.from(buttons).find(b => b.dataset.id === id);
      if (button) {
        button.classList.add('selected');
        selectedWords.set(id, word);
      }
    });
    updateButtonState();
  }
  
  function updateButtonState() {
    checkButton.disabled = selectedWords.size === 0;
    localStorage.setItem('markWordsProgress', JSON.stringify(Array.from(selectedWords)));
  }
  
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const id = button.dataset.id;
      const word = button.dataset.word;
      console.log('Button clicked:', { id, word });
      
      if (selectedWords.has(id)) {
        selectedWords.delete(id);
        button.classList.remove('selected');
      } else {
        selectedWords.set(id, word);
        button.classList.add('selected');
      }
      updateButtonState();
    });
  });

  checkButton.addEventListener('click', () => {
    buttons.forEach(button => button.disabled = true);
    checkButton.style.display = 'none';
    
    const totalCorrect = correctWords.size;
    let correctCount = 0;
    
    selectedWords.forEach((word, id) => {
      const button = Array.from(buttons).find(b => b.dataset.id === id);
      if (correctWords.has(word)) {
        button.classList.add('correct');
        correctCount++;
      } else {
        button.classList.add('incorrect');
      }
    });

    const score = Math.round((correctCount / totalCorrect) * 100);
    
    localStorage.removeItem('markWordsProgress');
    
    feedbackDiv.innerHTML = \`
      <div class="\${score >= 70 ? 'bg-[#F2FCE2]' : 'bg-red-50'} p-4 rounded-lg">
        <h3 class="\${score >= 70 ? 'text-green-800' : 'text-red-800'} font-medium">
          \${score >= 70 ? 'Correct! 🎉' : 'Blijf oefenen! 💪'}
        </h3>
        <p class="\${score >= 70 ? 'text-green-700' : 'text-red-700'}">
          Je hebt \${correctCount} van de \${totalCorrect} woorden correct gemarkeerd.
        </p>
        \${question.feedback && score >= 70 ? \`<p class="mt-2 text-green-700">\${question.feedback}</p>\` : ''}
      </div>
      <button 
        class="mt-4 w-full max-w-md border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50"
        onclick="location.reload()"
      >
        Opnieuw proberen
      </button>
    \`;
    feedbackDiv.classList.remove('hidden');
    
    // SCORM reporting
    if (window.API) {
      window.API.LMSSetValue('cmi.core.score.raw', score);
      window.API.LMSSetValue('cmi.core.score.min', '0');
      window.API.LMSSetValue('cmi.core.score.max', '100');
      window.API.LMSSetValue('cmi.core.lesson_status', score >= 70 ? 'passed' : 'failed');
      window.API.LMSCommit('');
    }
  });
})();
`;
