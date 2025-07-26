
import { quizScripts } from "./scripts/quiz";
import { quizStyles } from "./styles/quiz";
import { quizTemplate } from "./templates/quiz";

import type { Question } from "@/types/editor";

export const createQuizInterface = (questions: Question[]) => {
  return quizTemplate
    .replace("QUIZ_STYLES_PLACEHOLDER", quizStyles)
    .replace("QUIZ_SCRIPTS_PLACEHOLDER", quizScripts)
    .replace("QUIZ_QUESTIONS_PLACEHOLDER", JSON.stringify(questions));
};
