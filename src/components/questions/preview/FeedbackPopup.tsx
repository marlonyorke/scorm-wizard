import { X, AlertCircle, HelpCircle, CheckCircle } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";

import { Input } from "@/components/ui/input";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

interface FeedbackPopupProps {
  isCorrect: boolean;
  feedback?: string;
  feedbackImageUrl?: string;
  onClose: () => void;
  questionId: string; 
  correctAnswer: string; 
}

export function FeedbackPopup({ 
  isCorrect, 
  feedback, 
  feedbackImageUrl, 
  onClose, 
  questionId,
  correctAnswer,
}: FeedbackPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [inputError, setInputError] = useState(false);
  const [wasInactive, setWasInactive] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const { theme } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedStatus = localStorage.getItem(`question_${questionId}_status`);
    if (savedStatus) {
      const status = JSON.parse(savedStatus);
      if (status.userInput) {
        setUserInput(status.userInput);
      }
      if (status.attemptCount) {
        setAttemptCount(status.attemptCount);
      }
    }

    if (!isCorrect && document.documentElement.requestFullscreen) {
      try {
        document.documentElement.requestFullscreen();
      } catch (error) {
        console.log("Fullscreen niet beschikbaar:", error);
      }
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWasInactive(true);
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    if (!isCorrect && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }

    setIsVisible(true);
    
    return () => {
      setIsVisible(false);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen();
      }
    };
  }, [isCorrect, questionId]);

  useEffect(() => {
    const savedStatus = localStorage.getItem(`question_${questionId}_status`) || "{}";
    const status = JSON.parse(savedStatus);
    
    localStorage.setItem(`question_${questionId}_status`, JSON.stringify({
      ...status,
      userInput,
      attemptCount,
      feedbackShown: true,
      feedbackCompleted: isCorrect || userInput.toLowerCase() === correctAnswer.toLowerCase(),
    }));
  }, [userInput, isCorrect, questionId, correctAnswer, attemptCount]);

  const checkAnswer = () => {
    // Normaliseer beide strings voor vergelijking
    const normalizedInput = userInput.toLowerCase().trim();
    const normalizedCorrect = correctAnswer.toLowerCase().trim();
    
    if (normalizedInput === normalizedCorrect) {
      const savedStatus = localStorage.getItem(`question_${questionId}_status`) || "{}";
      const status = JSON.parse(savedStatus);
      
      localStorage.setItem(`question_${questionId}_status`, JSON.stringify({
        ...status,
        feedbackCompleted: true,
      }));
      
      onClose();
    } else {
      // Verhoog aantal pogingen
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);
      
      // Toon hint na 2 pogingen
      if (newAttemptCount >= 2 && !showHint) {
        setShowHint(true);
      }
      
      setInputError(true);
      setTimeout(() => setInputError(false), 1500);
    }
  };

  // Genereer een hint op basis van het correcte antwoord
  const generateHint = () => {
    const answer = correctAnswer.trim();
    
    if (answer.length <= 3) {
      return `Het antwoord is: ${answer}`;
    }
    
    // Toon eerste letter en aantal resterende karakters
    return `Het antwoord begint met "${answer[0]}" en heeft ${answer.length} karakters`;
  };

  const defaultFeedback = isCorrect 
    ? "Je hebt het juiste antwoord gekozen. Goed gedaan!" 
    : "Je antwoord is niet correct. Probeer het nog eens.";

  const getThemeStyles = () => {
    switch (theme) {
      case "cosmic":
        return {
          container: "bg-cosmic-secondary/90 border-cosmic-accent/50",
          header: isCorrect ? "bg-green-600/30" : "bg-red-600/30",
          title: isCorrect ? "text-cosmic-success" : "text-cosmic-error",
          closeButton: "bg-cosmic-accent/20 hover:bg-cosmic-accent/40 text-cosmic-accent",
          image: "border-cosmic-accent/30",
          input: "border-cosmic-accent/30 focus:border-cosmic-accent",
          button: isCorrect ? "bg-cosmic-success hover:bg-cosmic-success/80" : "bg-cosmic-accent hover:bg-cosmic-accent/80",
          hint: "bg-cosmic-accent/10 text-cosmic-accent",
        };
      case "cyberpunk":
        return {
          container: "bg-cyberpunk-secondary/90 border-cyberpunk-accent/50",
          header: isCorrect ? "bg-green-600/30" : "bg-red-600/30",
          title: isCorrect ? "text-cyberpunk-success" : "text-cyberpunk-error",
          closeButton: "bg-cyberpunk-accent/20 hover:bg-cyberpunk-accent/40 text-cyberpunk-accent",
          image: "border-cyberpunk-accent/30",
          input: "border-cyberpunk-accent/30 focus:border-cyberpunk-accent",
          button: isCorrect ? "bg-cyberpunk-success hover:bg-cyberpunk-success/80" : "bg-cyberpunk-accent hover:bg-cyberpunk-accent/80",
          hint: "bg-cyberpunk-accent/10 text-cyberpunk-accent",
        };
      default:
        return {
          container: "bg-slate-800/90 border-blue-500/50",
          header: isCorrect ? "bg-green-600/30" : "bg-red-600/30",
          title: isCorrect ? "text-green-500" : "text-red-500",
          closeButton: "bg-blue-500/20 hover:bg-blue-500/40 text-blue-500",
          image: "border-blue-500/30",
          input: "border-blue-500/30 focus:border-blue-500",
          button: isCorrect ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700",
          hint: "bg-blue-500/10 text-blue-400",
        };
    }
  };

  const styles = getThemeStyles();

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-opacity",
        "isolation-isolate", // Creëert een nieuwe stacking context
        isVisible ? "opacity-100" : "opacity-0",
      )}
      style={{
        position: "fixed", // Dubbele verzekering dat het fixed is
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999, // Zeer hoge z-index
        pointerEvents: "auto", // Zorgt ervoor dat interacties werken
      }}
    >
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={isCorrect ? onClose : undefined}
        style={{ pointerEvents: "auto" }} 
      />
      <div
        className={cn(
          "relative max-h-[90vh] w-full max-w-md overflow-auto rounded-lg border p-4 shadow-lg transition-all",
          styles.container,
          isVisible ? "scale-100" : "scale-95",
        )}
        style={{ 
          position: "relative",
          zIndex: 10000, // Nog hogere z-index dan de overlay
        }}
      >
        <div className={cn("mb-4 rounded p-2", styles.header)}>
          <div className="flex items-center justify-between">
            <h3 className={cn("text-lg font-semibold", styles.title)}>
              {isCorrect ? "Correct!" : "Helaas!"}
            </h3>
            {isCorrect && (
              <button
                onClick={onClose}
                className={cn("rounded-full p-1", styles.closeButton)}
                aria-label="Sluiten"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {wasInactive && !isCorrect && (
            <div className="mb-4 flex items-center rounded bg-yellow-500/20 p-2 text-yellow-500">
              <AlertCircle size={16} className="mr-2" />
              <p className="text-sm">Let op: Je hebt de pagina verlaten. Beantwoord de vraag om door te gaan.</p>
            </div>
          )}

          <p className="text-foreground">{feedback || defaultFeedback}</p>

          {feedbackImageUrl && (
            <div className={cn("mt-4 overflow-hidden rounded-md border", styles.image)}>
              <img
                src={feedbackImageUrl}
                alt="Feedback afbeelding"
                className="h-auto w-full object-cover"
              />
            </div>
          )}

          {!isCorrect && (
            <div className="mt-4 space-y-2">
              <label htmlFor="correct-answer" className="block text-sm font-medium">
                Voer het juiste antwoord in om door te gaan:
              </label>
              
              {/* Hint weergeven na meerdere pogingen */}
              {showHint && (
                <div className={cn("flex items-center p-2 rounded-md mb-2", styles.hint)}>
                  <HelpCircle size={16} className="mr-2 flex-shrink-0" />
                  <p className="text-sm">{generateHint()}</p>
                </div>
              )}
              
              <div className={cn(
                "relative rounded-md",
                inputError && "animate-shake",
              )}>
                <Input
                  ref={inputRef}
                  id="correct-answer"
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className={cn(
                    "w-full pr-20",
                    styles.input,
                    inputError && "border-red-500",
                  )}
                  placeholder="Typ het juiste antwoord..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      checkAnswer();
                    }
                  }}
                />
                <button
                  onClick={checkAnswer}
                  className={cn(
                    "absolute right-0 top-0 rounded-r-md px-4 py-2 text-sm font-medium text-white transition-colors",
                    styles.button,
                  )}
                >
                  Controleer
                </button>
              </div>
              
              {inputError && (
                <p className="text-sm text-red-500">
                  Dat is niet het juiste antwoord. Probeer het opnieuw.
                </p>
              )}
              
              {/* Poging teller */}
              <p className="text-xs text-muted-foreground mt-1">
                Aantal pogingen: {attemptCount}
              </p>
            </div>
          )}

          <div className="mt-4 flex justify-end">
            {isCorrect && (
              <button
                onClick={onClose}
                className={cn(
                  "rounded px-4 py-2 text-sm font-medium text-white transition-colors",
                  "bg-green-600 hover:bg-green-700",
                )}
              >
                Sluiten
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
