import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

import { FeedbackPopup } from "./FeedbackPopup";

import { MultipleChoiceQuestion } from "@/components/quiz/MultipleChoiceQuestion/MultipleChoiceQuestion";
import { cn } from "@/lib/utils";
import type { Question, QuestionOption } from "@/types/editor";

interface MultipleChoicePreviewProps {
  text: string;
  options: QuestionOption[];
  multipleCorrect?: boolean;
  feedback?: string | { correct: string; incorrect: string };
  correctFeedback?: string;
  incorrectFeedback?: string;
  mediaUrl?: string;
  imageSize?: { width: number; height: number };
  feedbackImageUrl?: string;
  correctFeedbackImageUrl?: string;
  incorrectFeedbackImageUrl?: string;
  questionId?: string; // Optionele questionId voor persistentie
}

export function MultipleChoicePreview({
  text,
  options,
  multipleCorrect = false,
  feedback,
  correctFeedback,
  incorrectFeedback,
  mediaUrl,
  imageSize,
  feedbackImageUrl,
  correctFeedbackImageUrl,
  incorrectFeedbackImageUrl,
  questionId: propQuestionId,
}: MultipleChoicePreviewProps) {
  // Genereer een unieke ID voor deze vraag als er geen is meegegeven
  const [questionId] = useState(propQuestionId || `mc-${uuidv4()}`);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [selectedOptionFeedback, setSelectedOptionFeedback] = useState<string | undefined>(undefined);
  const [correctAnswer, setCorrectAnswer] = useState<string>("");
  const [isQuestionCompleted, setIsQuestionCompleted] = useState(false);

  // Bij initialisatie, controleer of er een opgeslagen status is
  useEffect(() => {
    const savedStatus = localStorage.getItem(`question_${questionId}_status`);
    if (savedStatus) {
      try {
        const status = JSON.parse(savedStatus);
        if (status.selectedOptions) {
          setSelectedOptions(status.selectedOptions);
        }
        if (status.feedbackCompleted) {
          setIsQuestionCompleted(true);
        } else if (status.feedbackShown && !status.feedbackCompleted) {
          // Als de feedback was getoond maar niet voltooid, toon deze opnieuw
          handleSubmit(true);
        }
      } catch (error) {
        console.error("Fout bij het laden van de vraagstatus:", error);
      }
    }
    
    // Bepaal het correcte antwoord
    const correctOption = options.find((option) => option.isCorrect);
    if (correctOption) {
      setCorrectAnswer(correctOption.text);
    } else if (multipleCorrect) {
      // Voor meerkeuze vragen, combineer alle correcte antwoorden
      const correctOptions = options.filter((option) => option.isCorrect);
      if (correctOptions.length > 0) {
        setCorrectAnswer(correctOptions.map((opt) => opt.text).join(", "));
      }
    }
  }, [questionId, options, multipleCorrect]);

  const handleAnswerChange = (answers: string[]) => {
    // Als de vraag al is voltooid, sta geen wijzigingen meer toe
    if (isQuestionCompleted) {
      return;
    }
    
    setSelectedOptions(answers);
    
    // Sla de selectie op in localStorage
    const savedStatus = localStorage.getItem(`question_${questionId}_status`) || "{}";
    const status = JSON.parse(savedStatus);
    
    localStorage.setItem(`question_${questionId}_status`, JSON.stringify({
      ...status,
      selectedOptions: answers,
    }));
  };

  const handleSubmit = (fromSavedState = false) => {
    if ((selectedOptions.length === 0 && !fromSavedState) || isQuestionCompleted) {
      return;
    }

    // Check if all selected options are correct and no incorrect options are selected
    const correctOptionIds = options.filter((option) => option.isCorrect).map((option) => option.id);
    
    let isCorrect = false;
    if (multipleCorrect) {
      // For multiple correct answers, check if all selected options are correct and all correct options are selected
      const allSelectedAreCorrect = selectedOptions.every((id) => correctOptionIds.includes(id));
      const allCorrectAreSelected = correctOptionIds.every((id) => selectedOptions.includes(id));
      isCorrect = allSelectedAreCorrect && allCorrectAreSelected;
    } else {
      // For single correct answer, check if the selected option is correct
      isCorrect = correctOptionIds.includes(selectedOptions[0]);
    }
    
    setIsAnswerCorrect(isCorrect);
    
    // Haal de feedback op voor de geselecteerde optie(s)
    let optionFeedback: string | undefined = undefined;
    
    if (selectedOptions.length === 1) {
      // Voor enkele keuze, toon de feedback van de geselecteerde optie
      const selectedOption = options.find((opt) => opt.id === selectedOptions[0]);
      optionFeedback = selectedOption?.feedback;
    } else if (multipleCorrect) {
      // Voor meerkeuze, toon feedback afhankelijk van of het antwoord correct is
      if (isCorrect) {
        // Als alle correcte opties zijn geselecteerd, toon de feedback van de eerste correcte optie
        const correctOption = options.find((opt) => opt.isCorrect);
        optionFeedback = correctOption?.feedback;
      } else {
        // Als niet alle correcte opties zijn geselecteerd of er zijn incorrecte opties geselecteerd,
        // toon de feedback van de eerste incorrecte optie die is geselecteerd
        const incorrectSelectedOption = options.find((opt) => 
          selectedOptions.includes(opt.id) && !opt.isCorrect,
        );
        if (incorrectSelectedOption) {
          optionFeedback = incorrectSelectedOption.feedback;
        } else {
          // Als er geen incorrecte opties zijn geselecteerd, maar niet alle correcte opties,
          // toon de feedback van de eerste niet-geselecteerde correcte optie
          const missingCorrectOption = options.find((opt) => 
            !selectedOptions.includes(opt.id) && opt.isCorrect,
          );
          optionFeedback = missingCorrectOption?.feedback;
        }
      }
    }
    
    setSelectedOptionFeedback(optionFeedback);
    
    // Sla de status op in localStorage
    const savedStatus = localStorage.getItem(`question_${questionId}_status`) || "{}";
    const status = JSON.parse(savedStatus);
    
    localStorage.setItem(`question_${questionId}_status`, JSON.stringify({
      ...status,
      isAnswerCorrect: isCorrect,
      feedbackShown: true,
      feedbackCompleted: isCorrect, // Correcte antwoorden hebben geen invoer nodig
    }));
    
    // Altijd feedback tonen na het controleren van het antwoord
    setShowFeedback(true);
  };

  const handleCloseFeedback = () => {
    setShowFeedback(false);
    
    // Markeer de feedback als voltooid in localStorage
    const savedStatus = localStorage.getItem(`question_${questionId}_status`) || "{}";
    const status = JSON.parse(savedStatus);
    
    if (status.feedbackCompleted) {
      setIsQuestionCompleted(true);
    }
    
    localStorage.setItem(`question_${questionId}_status`, JSON.stringify({
      ...status,
      feedbackCompleted: true,
    }));
  };

  // Bepaal welke feedback getoond moet worden
  const getFeedbackContent = () => {
    // Geef prioriteit aan de specifieke feedback per antwoordoptie
    if (selectedOptionFeedback) {
      return {
        feedbackText: selectedOptionFeedback,
        feedbackImage: isAnswerCorrect ? correctFeedbackImageUrl : incorrectFeedbackImageUrl,
      };
    }
    
    // Als er geen specifieke feedback is, gebruik dan de algemene feedback
    if (typeof feedback === "object" && feedback !== null) {
      return {
        feedbackText: isAnswerCorrect ? feedback.correct : feedback.incorrect,
        feedbackImage: isAnswerCorrect ? correctFeedbackImageUrl : incorrectFeedbackImageUrl,
      };
    }
    
    // Anders, gebruik de aparte correctFeedback/incorrectFeedback velden
    return {
      feedbackText: isAnswerCorrect ? correctFeedback : incorrectFeedback,
      feedbackImage: isAnswerCorrect ? correctFeedbackImageUrl : incorrectFeedbackImageUrl,
    };
  };

  const { feedbackText, feedbackImage } = getFeedbackContent();

  // Maak een vraag object voor de MultipleChoiceQuestion component
  const questionObject: Question = {
    id: questionId,
    type: "multiple-choice",
    text: text,
    options: options,
    multipleCorrect: multipleCorrect,
  };

  return (
    <div className="space-y-4">
      {/* Media (if provided) */}
      {mediaUrl && (
        <div className="my-4 rounded-lg overflow-hidden">
          <img 
            src={mediaUrl} 
            alt="Question media" 
            className="max-w-full h-auto object-contain"
            style={imageSize ? { width: imageSize.width, height: imageSize.height } : {}}
          />
        </div>
      )}

      {/* Multiple Choice Question */}
      <MultipleChoiceQuestion
        question={questionObject}
        answers={selectedOptions}
        onAnswerChange={handleAnswerChange}
        onSubmit={() => handleSubmit()}
        showFeedback={showFeedback}
      />

      {/* Feedback popup */}
      {showFeedback && (
        <FeedbackPopup
          isCorrect={isAnswerCorrect}
          feedback={feedbackText}
          feedbackImageUrl={feedbackImage}
          onClose={handleCloseFeedback}
          questionId={questionId}
          correctAnswer={correctAnswer}
        />
      )}
    </div>
  );
}
