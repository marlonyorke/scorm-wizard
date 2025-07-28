import { Check, X } from "lucide-react";
import React, { useState, useRef } from "react";

import { FeedbackPopup } from "./FeedbackPopup";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Hotspot } from "@/types/editor";


interface HotspotPreviewProps {
  text: string;
  mediaUrl?: string;
  imageSize?: {
    width: number;
    height: number;
  };
  hotspots: Hotspot[];
  hotspotSettings?: {
    minimumCorrectHotspots?: number;
    showFeedbackImmediately?: boolean;
    highlightColor?: string;
    incorrectPenalty?: number;
    allowRetry?: boolean;
  };
  feedback?: string;
  feedbackImageUrl?: string;
  correctFeedback?: string;
  incorrectFeedback?: string;
  correctFeedbackImageUrl?: string;
  incorrectFeedbackImageUrl?: string;
}

export function HotspotPreview({
  text,
  mediaUrl,
  imageSize,
  hotspots,
  hotspotSettings = {},
  feedback,
  feedbackImageUrl,
  correctFeedback,
  incorrectFeedback,
  correctFeedbackImageUrl,
  incorrectFeedbackImageUrl,
}: HotspotPreviewProps) {
  const [selectedHotspots, setSelectedHotspots] = useState<Set<string>>(new Set());
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  
  // Destructure settings with defaults
  const settings = {
    minimumCorrectHotspots: hotspotSettings.minimumCorrectHotspots || 1,
    showFeedbackImmediately: hotspotSettings.showFeedbackImmediately || false,
    highlightColor: hotspotSettings.highlightColor || "#3b82f6",
    incorrectPenalty: hotspotSettings.incorrectPenalty || 0,
    allowRetry: hotspotSettings.allowRetry || true,
  };
  
  const handleHotspotClick = (hotspotId: string) => {
    if (isCompleted) {
      return;
    }
    
    const newSelectedHotspots = new Set(selectedHotspots);
    
    if (newSelectedHotspots.has(hotspotId)) {
      newSelectedHotspots.delete(hotspotId);
    } else {
      newSelectedHotspots.add(hotspotId);
    }
    
    setSelectedHotspots(newSelectedHotspots);
    
    // Als feedback direct getoond moet worden
    if (settings.showFeedbackImmediately) {
      checkAnswer();
    }
  };
  
  const checkAnswer = () => {
    // Bereken score en check correctheid
    const correctHotspots = hotspots.filter((h) => h.isCorrect);
    const selectedCorrectHotspots = [...selectedHotspots].filter((id) => 
      correctHotspots.some((h) => h.id === id),
    );
    
    const incorrectSelections = [...selectedHotspots].filter((id) => 
      !correctHotspots.some((h) => h.id === id),
    );
    
    // Bereken of het antwoord correct is
    const allCorrectSelected = correctHotspots.every((h) => selectedHotspots.has(h.id));
    const noIncorrectSelected = incorrectSelections.length === 0;
    const isAnswerCorrect = allCorrectSelected && noIncorrectSelected;
    
    // Bereken score
    let totalScore = 0;
    if (isAnswerCorrect) {
      totalScore = 100;
    } else {
      // Basis score op basis van correcte selecties
      const baseScore = (selectedCorrectHotspots.length / correctHotspots.length) * 100;
      // Aftrek voor incorrecte selecties
      const penalty = incorrectSelections.length * settings.incorrectPenalty;
      totalScore = Math.max(0, baseScore - penalty);
    }
    
    setScore(totalScore);
    setIsCompleted(true);
    setIsCorrect(isAnswerCorrect);
    
    // Alleen feedback tonen als er feedback is ingesteld
    const hasFeedback = isAnswerCorrect 
      ? !!correctFeedback || !!correctFeedbackImageUrl 
      : !!incorrectFeedback || !!incorrectFeedbackImageUrl;
    
    setShowFeedback(hasFeedback);
  };

  const handleReset = () => {
    setSelectedHotspots(new Set());
    setIsCompleted(false);
    setScore(0);
    setShowFeedback(false);
  };

  const handleCloseFeedback = () => {
    setShowFeedback(false);
  };

  // Bepaal welke feedback getoond moet worden
  const getFeedbackContent = () => {
    return {
      feedbackText: isCorrect ? correctFeedback : incorrectFeedback,
      feedbackImage: isCorrect ? correctFeedbackImageUrl : incorrectFeedbackImageUrl,
    };
  };

  // Render hotspots op de afbeelding
  const renderHotspots = () => {
    if (!imageRef.current) {
      return null;
    }
    
    const imageRect = imageRef.current.getBoundingClientRect();
    
    return hotspots.map((hotspot) => {
      const isSelected = selectedHotspots.has(hotspot.id);
      const showCorrectness = isCompleted;
      
      // Bereken positie relatief aan de afbeelding
      const style = {
        left: `${hotspot.x}%`,
        top: `${hotspot.y}%`,
        width: hotspot.width ? `${hotspot.width}%` : "10%",
        height: hotspot.height ? `${hotspot.height}%` : "10%",
        borderRadius: hotspot.shape === "circle" ? "50%" : "0",
        backgroundColor: isSelected 
          ? showCorrectness
            ? hotspot.isCorrect ? "rgba(34, 197, 94, 0.5)" : "rgba(239, 68, 68, 0.5)"
            : "rgba(59, 130, 246, 0.5)"
          : "transparent",
        border: `2px solid ${isSelected ? "rgba(59, 130, 246, 0.8)" : "rgba(59, 130, 246, 0.3)"}`,
      };
      
      return (
        <div
          key={hotspot.id}
          className="absolute cursor-pointer transition-all duration-200"
          style={style}
          onClick={() => handleHotspotClick(hotspot.id)}
        >
          {showCorrectness && (
            <div className="absolute inset-0 flex items-center justify-center">
              {hotspot.isCorrect ? (
                <Check className="text-green-600 h-6 w-6" />
              ) : (
                <X className="text-red-600 h-6 w-6" />
              )}
            </div>
          )}
        </div>
      );
    });
  };

  const { feedbackText, feedbackImage } = getFeedbackContent();

  return (
    <div className="space-y-4">
      <div className="text-lg font-medium">{text}</div>
      
      {mediaUrl && (
        <div className="relative my-4 rounded-lg overflow-hidden">
          <img 
            ref={imageRef}
            src={mediaUrl} 
            alt="Hotspot afbeelding" 
            className="max-w-full h-auto"
            style={imageSize ? { width: imageSize.width, height: imageSize.height } : {}}
          />
          {renderHotspots()}
        </div>
      )}
      
      <div className="flex justify-between items-center">
        {!isCompleted ? (
          <Button 
            onClick={checkAnswer}
            disabled={selectedHotspots.size === 0}
          >
            Controleer antwoord
          </Button>
        ) : (
          settings.allowRetry && (
            <Button 
              variant="outline"
              onClick={handleReset}
            >
              Opnieuw
            </Button>
          )
        )}
      </div>

      {isCompleted && (
        <div className={cn(
          "p-4 rounded-lg mt-4",
          isCorrect ? "bg-green-100 border border-green-200" : "bg-red-100 border border-red-200",
        )}>
          <div className="flex items-center space-x-2 mb-2">
            {isCorrect ? (
              <>
                <Check className="text-green-600" />
                <span className="font-medium text-green-800">Correct!</span>
              </>
            ) : (
              <>
                <X className="text-red-600" />
                <span className="font-medium text-red-800">Niet correct</span>
              </>
            )}
          </div>
        </div>
      )}

      {showFeedback && (
        <FeedbackPopup
          isCorrect={isCorrect}
          feedback={feedbackText}
          feedbackImageUrl={feedbackImage}
          onClose={handleCloseFeedback}
        />
      )}
    </div>
  );
}