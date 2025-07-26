import { Trash, ListChecks, GripHorizontal, TextSelect, GitMerge, ArrowUpDown, Video, Plus } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuestions } from "@/contexts/QuestionsContext";
import { cn } from "@/lib/utils";
import type { Question } from "@/types/editor";


const questionTypeLabels: Record<string, string> = {
  "multiple-choice": "Multiple Choice",
  "mark-words": "Mark the Words",
  "matching": "Matching",
  "order": "Volgorde",
  "drag-drop": "Drag & Drop",
  "video-interactive": "Interactieve Video",
};

const typeIcons = {
  "multiple-choice": ListChecks,
  "mark-words": TextSelect,
  "matching": GitMerge,
  "order": ArrowUpDown,
  "drag-drop": GripHorizontal,
  "video-interactive": Video,
};

export function QuestionsList() {
  const { questions, deleteQuestion, setCurrentQuestion, changeQuestionType, createInitialQuestion } = useQuestions();
  const [hoveredQuestionId, setHoveredQuestionId] = useState<string | null>(null);
  const [popupPosition, setPopupPosition] = useState<{ left: number; top: number } | null>(null);
  const [hoveredQuestion, setHoveredQuestion] = useState<Question | null>(null);
  const questionRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const [currentQuestionType, setCurrentQuestionType] = useState<string>("");

  // Effect om het portal container element te creëren
  useEffect(() => {
    // Controleer of er al een portal container bestaat
    let container = document.getElementById("popup-portal-container");
    
    // Als er geen container is, maak er een aan
    if (!container) {
      container = document.createElement("div");
      container.id = "popup-portal-container";
      container.style.position = "fixed";
      container.style.top = "0";
      container.style.left = "0";
      container.style.width = "100%";
      container.style.height = "100%";
      container.style.pointerEvents = "none";
      container.style.zIndex = "999999"; // Extreem hoge z-index
      document.body.appendChild(container);
    }
    
    setPortalContainer(container);
    
    // Cleanup function
    return () => {
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
    };
  }, []);

  const handleQuestionClick = (question: Question) => {
    changeQuestionType(question.type);
    setCurrentQuestion(question);
    setCurrentQuestionType(question.type);
  };

  const handleNewQuestionClick = () => {
    // Bepaal het huidige vraagtype op basis van de vragen in de lijst
    let questionType: "multiple-choice" | "matching" | "order" | "drag-drop" | "video-interactive" | "open" | "hotspot" | "mark-words" = "multiple-choice";
    
    if (workingQuestions.length > 0) {
      // Neem het type van de eerste vraag in de lijst
      const firstQuestionType = workingQuestions[0].type;
      if (["multiple-choice", "matching", "order", "drag-drop", "video-interactive", "open", "hotspot", "mark-words"].includes(firstQuestionType)) {
        questionType = firstQuestionType as typeof questionType;
      }
    }
    
    // Maak een nieuwe lege vraag van het huidige type
    const newQuestion = createInitialQuestion(questionType);
    
    // Stel de nieuwe vraag in als huidige vraag
    setCurrentQuestion(newQuestion);
    setCurrentQuestionType(questionType);
  };

  const handleMouseEnter = (question: Question, element: HTMLDivElement) => {
    setHoveredQuestionId(question.id);
    setHoveredQuestion(question);
    const rect = element.getBoundingClientRect();
    setPopupPosition({
      left: rect.left,
      top: rect.top - 8,
    });
  };

  const handleMouseLeave = () => {
    setHoveredQuestionId(null);
    setHoveredQuestion(null);
    setPopupPosition(null);
  };

  // Filter alleen de werkende vraagtypes
  const workingQuestions = questions.filter((q) => 
    ["multiple-choice", "matching", "order", "mark-words", "video-interactive"].includes(q.type),
  );

  return (
    <div className="space-y-4 w-full"> 
      {workingQuestions.length === 0 ? (
        null
      ) : (
        <div className="space-y-2">
          {workingQuestions.map((question, index) => {
            const Icon = typeIcons[question.type as keyof typeof typeIcons] || ListChecks;
            const isHovered = hoveredQuestionId === question.id;
            
            return (
              <div 
                key={question.id} 
                className="relative"
                ref={(element) => questionRefs.current.set(question.id, element)}
                onMouseEnter={(e) => handleMouseEnter(question, e.currentTarget)}
                onMouseLeave={handleMouseLeave}
              >
                <Card 
                  className="group cursor-pointer border-transparent hover:border-purple-200 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300"
                  onClick={() => handleQuestionClick(question)}
                >
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-purple-100 text-purple-600">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{index + 1}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="hover:bg-red-100 hover:text-red-600 text-primary h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteQuestion(question.id);
                      }}
                    >
                      <Trash className="h-3 w-3" />
                    </Button>
                  </CardContent>
                </Card>
                
                {/* Mouseover popup met volledige vraagtekst */}
                {isHovered && hoveredQuestion && popupPosition && portalContainer && (
                  createPortal(
                    <div 
                      className="fixed z-[99999] bg-white dark:bg-gray-900 p-4 rounded-lg shadow-xl border border-purple-200 min-h-[100px] animate-in fade-in zoom-in-95 duration-150 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95"
                      style={{ 
                        left: `${popupPosition.left}px`,
                        top: `${popupPosition.top}px`,
                        transform: "translateY(-100%)",
                        maxWidth: "350px",
                        width: "max-content",
                        maxHeight: "350px",
                        overflow: "auto",
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Icon className="h-4 w-4 text-purple-600 shrink-0" />
                          <span className="text-sm font-medium text-gray-700">Vraag {workingQuestions.findIndex((q) => q.id === hoveredQuestion.id) + 1}</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{hoveredQuestion.text}</p>
                        {hoveredQuestion.options && hoveredQuestion.options.length > 0 && (
                          <div className="pt-1">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Antwoordopties:</p>
                            <ul className="space-y-1 text-xs">
                              {hoveredQuestion.options.map((option) => (
                                <li key={option.id} className={cn(
                                  "pl-2 border-l-2",
                                  option.isCorrect ? "border-green-500 text-green-700 dark:text-green-400" : "border-gray-300 text-gray-600 dark:text-gray-400",
                                )}>
                                  {option.text}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>,
                    portalContainer,
                  )
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
