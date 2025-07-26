
export const renderingModule = `
  function renderCurrentQuestion() {
    const container = document.getElementById('quiz-content');
    const question = questions[currentQuestionIndex];
    
    const content = \`
      <div class="quiz-header">
        <span class="progress">Vraag \${currentQuestionIndex + 1} van \${questions.length}</span>
      </div>
      <div class="question">
        <h2>\${question.text}</h2>
        \${question.mediaUrl ? \`
          <div class="question-media">
            <img 
              src="\${question.mediaUrl}" 
              alt="Vraag afbeelding"
              style="width: \${question.imageSize?.width || 300}px; height: \${question.imageSize?.height || 200}px; object-fit: contain;"
              onclick="openImageModal(this.src)"
            >
          </div>
        \` : ''}
        <div class="options">
          \${question.options ? question.options.map(option => \`
            <label class="option">
              <input 
                type="\${question.multipleCorrect ? 'checkbox' : 'radio'}" 
                name="question\${question.id}" 
                value="\${option.id}"
                \${(answers[question.id] || []).includes(option.id) ? 'checked' : ''}
                onchange="handleAnswer('\${option.id}')"
              >
              \${option.text}
            </label>
          \`).join('') : ''}
        </div>
      </div>
      <div class="navigation">
        \${currentQuestionIndex > 0 ? 
          \`<button onclick="handlePrevious()" class="button button-outline">← Vorige</button>\` : 
          \`<div></div>\`
        }
        <button 
          onclick="handleNext()" 
          class="button button-primary"
          \${!answers[question.id] ? 'disabled' : ''}
        >
          \${currentQuestionIndex === questions.length - 1 ? 'Afronden ✓' : 'Volgende →'}
        </button>
      </div>
    \`;
    
    container.innerHTML = content;
  }

  function showResults(score) {
    const container = document.getElementById('quiz-content');
    container.innerHTML = \`
      <div class="results">
        <h2>Quiz Afgerond</h2>
        <p>Je score: \${score}%</p>
        <p>\${score >= 70 ? 'Gefeliciteerd, je bent geslaagd!' : 'Helaas, probeer het nog een keer.'}</p>
      </div>
    \`;
  }

  function openImageModal(src) {
    const modal = document.createElement('div');
    modal.style.cssText = \`
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      cursor: pointer;
    \`;
    
    const img = document.createElement('img');
    img.src = src;
    img.style.cssText = \`
      max-width: 90%;
      max-height: 90vh;
      border-radius: 0.5rem;
    \`;
    
    modal.appendChild(img);
    document.body.appendChild(modal);
    
    modal.onclick = () => modal.remove();
  }
`;
