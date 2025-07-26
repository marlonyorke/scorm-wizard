import { ArrowLeft, ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";

interface QuestionNavigationProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  hasAnswered: boolean;
  onPrevious: () => void;
  onNext: () => void;
  isLastQuestion: boolean;
}

export function QuestionNavigation({
  currentQuestionIndex,
  totalQuestions,
  hasAnswered,
  onPrevious,
  onNext,
  isLastQuestion,
}: QuestionNavigationProps) {
  return (
    <div className="flex justify-between pt-4">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentQuestionIndex === 0}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Vorige
      </Button>
      
      <Button
        onClick={onNext}
        disabled={!hasAnswered}
      >
        {isLastQuestion ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            Afronden
          </>
        ) : (
          <>
            Volgende
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}