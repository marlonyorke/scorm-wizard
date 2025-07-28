import JSZip from "jszip";

import { createManifest } from "./manifest";
import { QuestionRegistry } from "./registry";
import { BaseRenderer } from "./renderers/base";

import type { Question } from "@/types/editor";

export interface ScormExportOptions {
  displayMode: "single-page" | "multi-page" | "grouped";
  questionsPerGroup?: number;
  theme?: string;
}

export const generateScormPackage = async (
  questions: Question[],
  options: ScormExportOptions = { displayMode: "single-page", theme: "cyberpunk" },
) => {
  const zip = new JSZip();
  const theme = options.theme || "cyberpunk";

  // Add manifest file
  const manifestContent = createManifest(questions);
  zip.file("imsmanifest.xml", manifestContent);

  // Add SCORM API script
  const scormAPIScript = `
    var API = {
      LMSInitialize: function() { return "true"; },
      LMSFinish: function() { return "true"; },
      LMSGetValue: function(element) { return ""; },
      LMSSetValue: function(element, value) { return "true"; },
      LMSCommit: function() { return "true"; },
      LMSGetLastError: function() { return "0"; },
      LMSGetErrorString: function() { return ""; },
      LMSGetDiagnostic: function() { return ""; }
    };
  `;
  zip.file("scripts/scormAPI.js", scormAPIScript);

  // Eenvoudige CSS voor de quiz
  const themesCSS = `
    /* Basis stijlen */
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.5;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background-color: #0F0F12;
      color: #E0E0FF;
    }

    /* Vraag container */
    .question {
      background-color: #1A1A24;
      border: 1px solid #303050;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 30px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    }

    /* Vraagtekst */
    .question-text {
      font-size: 1.25rem;
      margin-bottom: 20px;
      color: #FF2E6E;
    }

    /* Media */
    .question-media {
      margin-bottom: 20px;
    }

    /* Opties */
    .options {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 20px;
    }

    /* Optie label */
    .option-label {
      display: flex;
      align-items: center;
      padding: 12px 15px;
      background-color: #1A1A24;
      border: 1px solid #303050;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .option-label:hover {
      border-color: #FF2E6E;
      box-shadow: 0 0 8px rgba(255, 46, 110, 0.3);
    }

    /* Geselecteerde optie */
    .option-label.selected {
      background-color: rgba(255, 46, 110, 0.2);
      border-color: #FF2E6E;
    }

    /* Optie tekst */
    .option-text {
      margin-left: 10px;
    }

    /* Knop */
    .check-button {
      background-color: #FF2E6E;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 10px 20px;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .check-button:hover {
      background-color: #ff4b80;
      box-shadow: 0 0 10px rgba(255, 46, 110, 0.5);
    }

    /* Feedback container */
    .feedback-container {
      margin-top: 20px;
      padding: 15px;
      border-radius: 6px;
      display: none;
    }

    /* Feedback stijlen */
    .feedback-correct {
      background-color: rgba(1, 255, 195, 0.1);
      border: 1px solid #01FFC3;
      color: #01FFC3;
    }

    .feedback-incorrect {
      background-color: rgba(255, 46, 110, 0.1);
      border: 1px solid #FF2E6E;
      color: #FF2E6E;
    }

    .feedback-warning {
      background-color: rgba(255, 193, 7, 0.1);
      border: 1px solid #FFC107;
      color: #FFC107;
      font-weight: bold;
    }

    /* Correct antwoord invoer */
    .correct-answer-input {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid rgba(255, 46, 110, 0.3);
    }

    .correct-answer-input p {
      margin-bottom: 10px;
    }

    .correct-answer-input input[type="text"] {
      background-color: #0F0F12;
      color: #E0E0FF;
      border: 1px solid #303050;
      border-radius: 4px;
      padding: 8px 12px;
      width: 100%;
      margin-bottom: 10px;
      font-size: 1rem;
    }

    .correct-answer-input input[type="text"]:focus {
      border-color: #FF2E6E;
      outline: none;
      box-shadow: 0 0 5px rgba(255, 46, 110, 0.5);
    }

    .correct-answer-input button {
      background-color: #1A1A24;
      color: #E0E0FF;
      border: 1px solid #303050;
      border-radius: 4px;
      padding: 8px 12px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .correct-answer-input button:hover {
      border-color: #FF2E6E;
      box-shadow: 0 0 5px rgba(255, 46, 110, 0.3);
    }

    .answer-feedback {
      margin-top: 10px;
      padding: 8px;
      border-radius: 4px;
    }

    .answer-feedback.correct {
      background-color: rgba(1, 255, 195, 0.1);
      color: #01FFC3;
    }

    .answer-feedback.incorrect {
      background-color: rgba(255, 46, 110, 0.1);
      color: #FF2E6E;
    }

    .answer-feedback.warning {
      background-color: rgba(255, 193, 7, 0.1);
      color: #FFC107;
      font-weight: bold;
    }

    /* Paginering */
    .pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #303050;
    }

    .pagination button {
      background-color: #1A1A24;
      color: #E0E0FF;
      border: 1px solid #303050;
      border-radius: 6px;
      padding: 8px 15px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .pagination button:hover:not(:disabled) {
      border-color: #FF2E6E;
      box-shadow: 0 0 8px rgba(255, 46, 110, 0.3);
    }

    .pagination button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Pagina indicator */
    #page-indicator {
      color: #A0A0C0;
    }

    /* Pagina's */
    .page {
      display: none;
    }

    .page.active {
      display: block;
    }
  `;
  
  // Voeg CSS toe aan het pakket
  zip.file("styles/styles.css", themesCSS);

  // JavaScript voor de quiz functionaliteit
  const quizScript = `
    // Globale functies definiëren voor gebruik in HTML
    window.checkAnswer = function(questionId) {
      // Vind de geselecteerde optie
      var selectedInput = document.querySelector('input[data-question-id="' + questionId + '"]:checked');
      
      if (selectedInput) {
        var isCorrect = selectedInput.getAttribute('data-correct') === 'true';
        var optionId = selectedInput.getAttribute('data-option-id');
        
        // Haal de feedback container op
        var feedbackContainer = document.getElementById('feedback-container-' + questionId);
        
        // Stel de juiste klasse in
        feedbackContainer.className = 'feedback-container';
        feedbackContainer.classList.add(isCorrect ? 'feedback-correct' : 'feedback-incorrect');
        
        // Haal de feedback tekst op
        var feedbackText = document.getElementById('feedback-' + questionId + '-' + optionId);
        
        // Schakel alle antwoordopties uit na de eerste controle
        var allOptions = document.querySelectorAll('input[data-question-id="' + questionId + '"]');
        allOptions.forEach(function(option) {
          option.disabled = true;
        });
        
        // Verberg de "Controleer antwoord" knop na de eerste controle
        var checkButton = document.querySelector('button[onclick="window.checkAnswer(\\'' + questionId + '\\')"]');
        if (checkButton) {
          checkButton.style.display = 'none';
        }
        
        if (isCorrect) {
          // Toon de feedback voor correcte antwoorden
          feedbackContainer.innerHTML = feedbackText ? feedbackText.innerHTML : 'Correct!';
          enableNextButton();
        } else {
          // Voor incorrecte antwoorden, toon feedback met invoerveld
          var correctOption = document.querySelector('input[data-question-id="' + questionId + '"][data-correct="true"]');
          var correctText = correctOption.nextElementSibling.textContent.trim();
          
          feedbackContainer.innerHTML = (feedbackText ? feedbackText.innerHTML : 'Incorrect!') + 
            '<div class="correct-answer-input">' +
            '<p>Vul het juiste antwoord in om verder te gaan:</p>' +
            '<input type="text" id="correct-answer-input-' + questionId + '" placeholder="Typ het juiste antwoord">' +
            '<button onclick="checkCorrectAnswer(\\'' + questionId + '\\', \\'' + correctText + '\\')">Controleer</button>' +
            '<p id="answer-feedback-' + questionId + '" class="answer-feedback"></p>' +
            '</div>';
          
          disableNextButton();
          
          // Setup typing detection voor het invoerveld
          setTimeout(function() {
            setupTypingDetection('correct-answer-input-' + questionId, questionId);
          }, 100);
        }
        
        feedbackContainer.style.display = 'block';
        
        // Stuur resultaat naar SCORM API
        if (typeof API !== 'undefined') {
          API.LMSSetValue('cmi.core.score.raw', isCorrect ? '100' : '0');
          API.LMSSetValue('cmi.core.lesson_status', isCorrect ? 'passed' : 'failed');
          API.LMSCommit('');
        }
      }
    };
    
    // Controleer of het ingevoerde antwoord correct is
    window.checkCorrectAnswer = function(questionId, correctText) {
      var inputField = document.getElementById('correct-answer-input-' + questionId);
      var answerFeedback = document.getElementById('answer-feedback-' + questionId);
      
      if (inputField.value.trim().toLowerCase() === correctText.toLowerCase()) {
        answerFeedback.textContent = 'Correct! Je kunt nu verder gaan.';
        answerFeedback.className = 'answer-feedback correct';
        enableNextButton();
      } else {
        answerFeedback.textContent = 'Dat is niet het juiste antwoord. Probeer opnieuw.';
        answerFeedback.className = 'answer-feedback incorrect';
      }
    };
    
    // Schakel de Volgende knop in
    function enableNextButton() {
      var nextButton = document.getElementById('next-button');
      if (nextButton) {
        nextButton.disabled = false;
      }
    }
    
    // Schakel de Volgende knop uit
    function disableNextButton() {
      var nextButton = document.getElementById('next-button');
      if (nextButton) {
        nextButton.disabled = true;
      }
    }
    
    // Controleer op natuurlijk typgedrag
    function setupTypingDetection(inputId, questionId) {
      var inputField = document.getElementById(inputId);
      if (!inputField) return;
      
      var lastTypedTime = 0;
      var typingTimes = [];
      var suspiciousActivity = false;
      
      inputField.addEventListener('keydown', function(event) {
        var currentTime = new Date().getTime();
        
        // Sla de eerste toetsaanslag over
        if (lastTypedTime > 0) {
          var timeDiff = currentTime - lastTypedTime;
          typingTimes.push(timeDiff);
          
          // Controleer op onnatuurlijk typgedrag
          if (typingTimes.length > 5) {
            var avgTime = typingTimes.reduce((a, b) => a + b, 0) / typingTimes.length;
            var stdDev = Math.sqrt(typingTimes.map(x => Math.pow(x - avgTime, 2)).reduce((a, b) => a + b, 0) / typingTimes.length);
            
            // Als de standaarddeviatie te laag is (te consistent typgedrag) of de gemiddelde tijd tussen toetsaanslagen te kort is
            if (stdDev < 20 || avgTime < 50) {
              suspiciousActivity = true;
              var answerFeedback = document.getElementById('answer-feedback-' + questionId);
              answerFeedback.textContent = 'Verdacht typgedrag gedetecteerd. Typ het antwoord handmatig.';
              answerFeedback.className = 'answer-feedback warning';
              inputField.value = '';
              inputField.disabled = true;
              
              // Herstel na 3 seconden
              setTimeout(function() {
                inputField.disabled = false;
                inputField.focus();
                typingTimes = [];
                suspiciousActivity = false;
              }, 3000);
            }
          }
        }
        
        lastTypedTime = currentTime;
      });
      
      // Anti-plak maatregelen
      inputField.addEventListener('copy', function(event) {
        event.preventDefault();
      });
      inputField.addEventListener('cut', function(event) {
        event.preventDefault();
      });
      inputField.addEventListener('paste', function(event) {
        event.preventDefault();
        var answerFeedback = document.getElementById('answer-feedback-' + questionId);
        answerFeedback.textContent = 'Plakken is niet toegestaan. Typ het antwoord handmatig.';
        answerFeedback.className = 'answer-feedback warning';
      });
    }
    
    // Initialiseer paginering
    function initPagination() {
      var currentPage = 0;
      var pages = document.querySelectorAll('.page');
      var totalPages = pages.length;
      var prevButton = document.getElementById('prev-button');
      var nextButton = document.getElementById('next-button');
      var pageIndicator = document.getElementById('page-indicator');
      
      // Toon alleen de eerste pagina
      for (var i = 0; i < pages.length; i++) {
        if (i === 0) {
          pages[i].classList.add('active');
        } else {
          pages[i].classList.remove('active');
        }
      }
      
      // Update paginering
      function updatePagination() {
        prevButton.disabled = currentPage === 0;
        nextButton.disabled = currentPage === totalPages - 1;
        pageIndicator.textContent = 'Vraag ' + (currentPage + 1) + ' van ' + totalPages;
      }
      
      // Voeg event listeners toe aan de knoppen
      prevButton.addEventListener('click', function() {
        if (currentPage > 0) {
          pages[currentPage].classList.remove('active');
          currentPage--;
          pages[currentPage].classList.add('active');
          updatePagination();
        }
      });
      
      nextButton.addEventListener('click', function() {
        if (currentPage < totalPages - 1) {
          pages[currentPage].classList.remove('active');
          currentPage++;
          pages[currentPage].classList.add('active');
          updatePagination();
        }
      });
      
      // Initialiseer de paginering
      updatePagination();
    }
    
    // Wacht tot de pagina geladen is
    window.onload = function() {
      // Initialiseer SCORM API
      if (typeof API !== 'undefined') {
        API.LMSInitialize('');
      }
      
      // Voeg click event toe aan alle optie labels
      var optionLabels = document.querySelectorAll('.option-label');
      for (var i = 0; i < optionLabels.length; i++) {
        optionLabels[i].addEventListener('click', function() {
          // Haal vraag ID op
          var input = this.querySelector('input');
          var questionId = input.getAttribute('data-question-id');
          
          // Verwijder selected class van alle opties in deze vraag
          var questionOptions = document.querySelectorAll('input[data-question-id="' + questionId + '"]');
          for (var j = 0; j < questionOptions.length; j++) {
            questionOptions[j].parentNode.classList.remove('selected');
          }
          
          // Voeg selected class toe aan deze optie
          this.classList.add('selected');
          
          // Zet de input op checked
          input.checked = true;
        });
      }
      
      // Initialiseer paginering als we in multi-page modus zijn
      if (document.getElementById('prev-button')) {
        initPagination();
      }
    };
  `;
  
  zip.file("scripts/quiz.js", quizScript);

  // Genereer HTML op basis van displayMode
  let quizHTML = "";
  
  if (options.displayMode === "single-page") {
    // Alle vragen op één pagina
    quizHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Quiz</title>
          <script src="scripts/scormAPI.js"></script>
          <script src="scripts/quiz.js"></script>
          <link rel="stylesheet" href="styles/styles.css">
        </head>
        <body>
          <div id="quiz-container">
            ${questions.map((question, index) => {
    const renderer = QuestionRegistry.getRenderer(question.type);
    if (renderer instanceof BaseRenderer) {
      return `
                  <div class="question" id="question-${index}">
                    ${renderer.render(question)}
                  </div>
                `;
    }
    return "";
  }).join("\n")}
          </div>
        </body>
      </html>
    `;
  } else if (options.displayMode === "multi-page") {
    // Één vraag per pagina met navigatie
    quizHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Quiz</title>
          <script src="scripts/scormAPI.js"></script>
          <script src="scripts/quiz.js"></script>
          <link rel="stylesheet" href="styles/styles.css">
        </head>
        <body>
          <div id="quiz-container">
            ${questions.map((question, index) => {
    const renderer = QuestionRegistry.getRenderer(question.type);
    if (renderer instanceof BaseRenderer) {
      return `
                  <div class="page ${index === 0 ? "active" : ""}" id="page-${index}">
                    <div class="question" id="question-${index}">
                      ${renderer.render(question)}
                    </div>
                  </div>
                `;
    }
    return "";
  }).join("\n")}
            
            <div class="pagination">
              <button id="prev-button" disabled>Vorige</button>
              <span id="page-indicator">Vraag 1 van ${questions.length}</span>
              <button id="next-button" ${questions.length <= 1 ? "disabled" : ""}>Volgende</button>
            </div>
          </div>
        </body>
      </html>
    `;
  } else if (options.displayMode === "grouped") {
    // Implementatie voor gegroepeerde vragen
    // ...
  }
  
  zip.file("index.html", quizHTML);

  // Generate and download zip
  const content = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(content);
  const link = document.createElement("a");
  link.href = url;
  link.download = "quiz.zip";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return true;
};
