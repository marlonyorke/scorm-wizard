import { Trash2, Image as ImageIcon, MessageSquare } from "lucide-react";
import { useState } from "react";

import { DirectEditableText } from "../DirectEditableText";
import { MediaUpload } from "../MediaUpload";

import { ResizableImage } from "@/components/questions/preview/ResizableImage";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SingleChoiceOptionProps {
  option: { 
    id: string; 
    text: string; 
    isCorrect: boolean;
    feedback?: string;
    mediaUrl?: string;
    imageSize?: {
      width: number;
      height: number;
    };
  };
  optionIndex: number;
  selectedOptionId?: string;
  onOptionChange: (optionId: string, newText: string) => void;
  onCorrectAnswerChange: (optionId: string) => void;
  onRemoveOption: (optionId: string) => void;
  onMediaChange?: (optionId: string, mediaUrl: string | undefined, imageSize?: { width: number; height: number }) => void;
  onFeedbackChange?: (optionId: string, feedback: string) => void;
}

export function SingleChoiceOption({
  option,
  optionIndex,
  selectedOptionId,
  onOptionChange,
  onCorrectAnswerChange,
  onRemoveOption,
  onMediaChange,
  onFeedbackChange,
}: SingleChoiceOptionProps) {
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleMediaChange = (mediaUrl: string | undefined, imageSize?: { width: number; height: number }) => {
    onMediaChange?.(option.id, mediaUrl, imageSize);
    setShowMediaUpload(false);
  };

  const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onFeedbackChange?.(option.id, e.target.value);
  };

  // Bepaal de weergavetekst voor de placeholder
  const displayPlaceholder = `Antwoordoptie ${optionIndex}`;

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-3">
        <div 
          className={`relative w-5 h-5 transition-all cursor-pointer ${
            option.isCorrect ? "scale-110" : "scale-100"
          }`}
          onClick={() => onCorrectAnswerChange(option.id)}
        >
          <div className={`absolute inset-0 rounded-full border-2 transition-all ${
            option.isCorrect 
              ? "border-primary animate-pulse" 
              : "border-gray-300"
          }`} />
          
          <div className={`absolute inset-0 rounded-full transform transition-transform duration-200 ${
            option.isCorrect 
              ? "scale-50 bg-primary" 
              : "scale-0 bg-transparent"
          }`} />
          
          {option.isCorrect && (
            <div className="absolute -inset-1 rounded-full bg-primary/20 animate-ping opacity-75" />
          )}
        </div>
        
        <div className="flex-1 flex items-center justify-between">
          <div className="flex-1">
            <DirectEditableText
              value={option.text || ""}
              onSave={(newText) => {
                // Als de tekst leeg is of gewist wordt, gebruik de standaard "Antwoordoptie X"
                const finalText = newText.trim() === "" ? `Antwoordoptie ${optionIndex}` : newText;
                onOptionChange(option.id, finalText);
              }}
              placeholder={displayPlaceholder}
            />
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowFeedback(!showFeedback)}
              className="h-8 w-8"
              title="Feedback voor deze optie"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMediaUpload(!showMediaUpload)}
              className="h-8 w-8"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemoveOption(option.id)}
              className="h-8 w-8 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Feedback sectie */}
      {showFeedback && (
        <div className="pt-2 pl-8 pr-2">
          <div className="space-y-2 border rounded-md p-3 bg-muted/30">
            <Label htmlFor={`feedback-${option.id}`} className="text-sm font-medium">
              Feedback
            </Label>
            <Textarea
              id={`feedback-${option.id}`}
              value={option.feedback || ""}
              onChange={handleFeedbackChange}
              placeholder="Voeg feedback toe voor deze optie..."
              className="min-h-[80px] text-sm"
            />
          </div>
        </div>
      )}

      {showMediaUpload && (
        <div className="pt-3">
          <MediaUpload 
            media={option.mediaUrl}
            imageSize={option.imageSize}
            onMediaChange={handleMediaChange}
          />
        </div>
      )}

      {option.mediaUrl && !showMediaUpload && (
        <div className="pt-3">
          <ResizableImage
            src={option.mediaUrl}
            alt={`Afbeelding voor optie ${option.text}`}
            initialSize={option.imageSize}
            className="rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
