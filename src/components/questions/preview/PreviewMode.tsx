import { useState } from "react";

import { ResizableImage } from "./ResizableImage";

import { OrderQuestion } from "@/components/quiz/OrderQuestion/OrderQuestion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import type { Question } from "@/types/editor";

interface PreviewModeProps {
  question: Question;
  onQuestionChange: (question: Question) => void;
}

export function PreviewMode({ question, onQuestionChange }: PreviewModeProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string }>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [orderItems, setOrderItems] = useState<any[]>([]);

  // Initialize order items in shuffled order
  useState(() => {
    if (question.type === "order" && question.items) {
      setOrderItems([...question.items].sort(() => Math.random() - 0.5));
    }
  });

  const checkAnswers = () => {
    if (question.type === "matching") {
      const allCorrect = question.pairs?.every(
        (pair) => selectedAnswers[pair.id] === pair.right,
      );

      if (allCorrect) {
        toast({
          title: "Correct!",
          description: "Alle antwoorden zijn juist!",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Niet helemaal juist",
          description: "Controleer je antwoorden en probeer het opnieuw.",
        });
      }
      setShowFeedback(true);
    } else if (question.type === "order") {
      const isCorrect = orderItems.every((item, index) => 
        item.correctPosition === index + 1,
      );

      if (isCorrect) {
        toast({
          title: "Correct!",
          description: "De volgorde is juist!",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Niet helemaal juist",
          description: "De volgorde is nog niet correct. Probeer het opnieuw.",
        });
      }
      setShowFeedback(true);
    }
  };

  const isAnswerCorrect = (pairId: string) => {
    if (!showFeedback) {
      return undefined;
    }
    const pair = question.pairs?.find((p) => p.id === pairId);
    return pair ? selectedAnswers[pairId] === pair.right : false;
  };

  if (question.type === "matching") {
    return (
      <div className="space-y-6 p-4 max-w-2xl mx-auto bg-card rounded-lg">
        <div className="text-lg font-medium mb-4">{question.text}</div>
        
        <div className="space-y-4">
          {question.pairs?.map((pair) => (
            <div key={pair.id} className="flex items-center gap-4">
              <div className="flex-1">
                <div className="p-2 bg-gray-50 rounded border">{pair.left}</div>
              </div>
              <div className="flex-1">
                <Select
                  value={selectedAnswers[pair.id]}
                  onValueChange={(value) => {
                    setSelectedAnswers((prev) => ({
                      ...prev,
                      [pair.id]: value,
                    }));
                  }}
                >
                  <SelectTrigger className={`w-full ${
                    showFeedback
                      ? isAnswerCorrect(pair.id)
                        ? "border-green-500 bg-green-50"
                        : "border-red-500 bg-red-50"
                      : ""
                  }`}>
                    <SelectValue placeholder="Selecteer een antwoord..." />
                  </SelectTrigger>
                  <SelectContent>
                    {question.pairs?.map((option) => (
                      <SelectItem key={option.id} value={option.right}>
                        {option.right}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>

        <Button 
          onClick={checkAnswers}
          className="w-full mt-4"
          disabled={!question.pairs?.every((pair) => selectedAnswers[pair.id])}
        >
          Controleer antwoorden
        </Button>

        {showFeedback && question.feedback && (
          <div className="mt-6 pt-4 border-t">
            <Label>Feedback</Label>
            <div className="mt-2 text-gray-700">
              {question.feedback}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (question.type === "order") {
    return (
      <div className="space-y-6 p-4 max-w-2xl mx-auto bg-card rounded-lg">
        <div className="text-lg font-medium mb-4">{question.text}</div>
        
        <OrderQuestion
          question={question}
          items={orderItems}
          onItemsChange={setOrderItems}
        />

        <Button 
          onClick={checkAnswers}
          className="w-full mt-4"
          disabled={orderItems.length === 0}
        >
          Controleer volgorde
        </Button>

        {showFeedback && question.feedback && (
          <div className="mt-6 pt-4 border-t">
            <Label>Feedback</Label>
            <div className="mt-2 text-gray-700">
              {question.feedback}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 max-w-2xl mx-auto bg-card rounded-lg">
      {question.mediaUrl && (
        <div className="my-4">
          <ResizableImage
            src={question.mediaUrl}
            initialSize={question.imageSize}
          />
        </div>
      )}

      <div className="space-y-3">
        {question.options?.map((option) => (
          <div key={option.id} className="flex items-center space-x-3">
            {question.multipleCorrect ? (
              <Checkbox checked={option.isCorrect} disabled />
            ) : (
              <RadioGroup value={question.options?.find((opt) => opt.isCorrect)?.id}>
                <RadioGroupItem value={option.id} disabled />
              </RadioGroup>
            )}
            <div className="flex-1">
              <div className="text-sm">
                {option.text}
              </div>
            </div>
          </div>
        ))}
      </div>

      {question.feedback && (
        <div className="mt-6 pt-4 border-t">
          <Label>Feedback</Label>
          <div className="mt-2 text-gray-700">
            {question.feedback}
          </div>
        </div>
      )}
    </div>
  );
}
