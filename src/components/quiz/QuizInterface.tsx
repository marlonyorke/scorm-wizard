
import { useState, useEffect } from "react";

import { MultipleChoiceQuestion } from "./MultipleChoiceQuestion/MultipleChoiceQuestion";
import { OrderQuestion } from "./OrderQuestion/OrderQuestion";
import { QuestionMedia } from "./QuestionMedia";
import { QuestionNavigation } from "./QuestionNavigation";
import { QuestionProgress } from "./QuestionProgress";

import type { Question } from "@/types/editor";

interface QuizInterfaceProps {
  questions: Question[];
  onComplete: (score: number) => void;
}

export function QuizInterface({ questions, onComplete }: QuizInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string[] }>({});
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [orderItems, setOrderItems] = useState<{ [key: string]: any[] }>({});
  
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const initializeOrderItems = () => {
    if (currentQuestion.type === "order" && !orderItems[currentQuestion.id]) {
      const shuffledItems = [...currentQuestion.items].sort(() => Math.random() - 0.5);
      setOrderItems((prev) => ({
        ...prev,
        [currentQuestion.id]: shuffledItems,
      }));
    }
  };

  useEffect(() => {
    initializeOrderItems();
  }, [currentQuestion.id]);

  const calculateAndSubmitScore = () => {
    let correctAnswers = 0;
    questions.forEach((question) => {
      if (question.type === "order") {
        const currentOrder = orderItems[question.id] || [];
        const isCorrect = currentOrder.every((item, index) => 
          item.correctPosition === index + 1,
        );
        if (isCorrect) {
          correctAnswers++;
        }
      } else {
        const selectedOptionIds = answers[question.id] || [];
        const correctOptions = question.options?.filter((option) => option.isCorrect) || [];
        
        if (question.multipleCorrect) {
          const allCorrectSelected = correctOptions.every((opt) => 
            selectedOptionIds.includes(opt.id),
          );
          const noIncorrectSelected = selectedOptionIds.every((id) => 
            correctOptions.some((opt) => opt.id === id),
          );
          if (allCorrectSelected && noIncorrectSelected) {
            correctAnswers++;
          }
        } else {
          const correctOptionId = correctOptions[0]?.id;
          if (selectedOptionIds[0] === correctOptionId) {
            correctAnswers++;
          }
        }
      }
    });
    
    const score = Math.round((correctAnswers / questions.length) * 100);
    onComplete(score);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      calculateAndSubmitScore();
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      initializeOrderItems();
    }
  };

  const handleAnswerChange = (answers: string[]) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: answers,
    }));
  };

  const handleOrderItemsChange = (items: any[]) => {
    setOrderItems((prev) => ({
      ...prev,
      [currentQuestion.id]: items,
    }));
  };

  const hasAnsweredCurrentQuestion = () => {
    if (currentQuestion.type === "order") {
      return Boolean(orderItems[currentQuestion.id]?.length);
    }
    return Boolean(answers[currentQuestion.id]?.length);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <QuestionProgress 
        currentIndex={currentQuestionIndex} 
        total={questions.length} 
      />

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{currentQuestion.text}</h2>
        
        <QuestionMedia 
          mediaUrl={currentQuestion.mediaUrl}
          isDialogOpen={imageDialogOpen}
          onDialogChange={setImageDialogOpen}
        />
        
        {currentQuestion.type === "order" ? (
          <OrderQuestion
            question={currentQuestion}
            items={orderItems[currentQuestion.id] || []}
            onItemsChange={handleOrderItemsChange}
          />
        ) : (
          <MultipleChoiceQuestion
            question={currentQuestion}
            answers={answers[currentQuestion.id] || []}
            onAnswerChange={handleAnswerChange}
          />
        )}
      </div>

      <QuestionNavigation
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={questions.length}
        hasAnswered={hasAnsweredCurrentQuestion()}
        onPrevious={() => setCurrentQuestionIndex((prev) => prev - 1)}
        onNext={handleNext}
        isLastQuestion={isLastQuestion}
      />
    </div>
  );
}
