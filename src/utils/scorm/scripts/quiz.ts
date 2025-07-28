
import { navigationModule } from "./modules/navigation";
import { renderingModule } from "./modules/rendering";
import { scoringModule } from "./modules/scoring";

export const quizScripts = `
  let currentQuestionIndex = 0;
  const questions = QUIZ_QUESTIONS_PLACEHOLDER;
  const answers = {};

  window.onload = function() {
    if (API) {
      API.LMSInitialize('');
      API.LMSSetValue('cmi.core.lesson_status', 'incomplete');
      API.LMSCommit('');
      renderCurrentQuestion();
    }
  };

  window.onunload = function() {
    if (API) {
      API.LMSFinish('');
    }
  };

  ${renderingModule}
  ${navigationModule}
  ${scoringModule}
`;
