import { ChevronDown, ChevronUp, Upload, Trash, MessageSquare, CheckCircle, XCircle } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

interface FeedbackPanelProps {
  feedback?: string | {
    correct: string;
    incorrect: string;
  };
  correctFeedback?: string;
  incorrectFeedback?: string;
  feedbackImageUrl?: string;
  correctFeedbackImageUrl?: string;
  incorrectFeedbackImageUrl?: string;
  onFeedbackChange: (feedback: string) => void;
  onCorrectFeedbackChange?: (feedback: string) => void;
  onIncorrectFeedbackChange?: (feedback: string) => void;
  onFeedbackImageChange: (url: string | undefined) => void;
  onCorrectFeedbackImageChange?: (url: string | undefined) => void;
  onIncorrectFeedbackImageChange?: (url: string | undefined) => void;
  useSeparateFeedback?: boolean;
  onUseSeparateFeedbackChange?: (useSeparate: boolean) => void;
}

export function FeedbackPanel({
  feedback = "",
  correctFeedback = "",
  incorrectFeedback = "",
  feedbackImageUrl,
  correctFeedbackImageUrl,
  incorrectFeedbackImageUrl,
  onFeedbackChange,
  onCorrectFeedbackChange,
  onIncorrectFeedbackChange,
  onFeedbackImageChange,
  onCorrectFeedbackImageChange,
  onIncorrectFeedbackImageChange,
  useSeparateFeedback = true,
  onUseSeparateFeedbackChange,
}: FeedbackPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();
  const { theme } = useTheme();
  const correctFileInputRef = useRef<HTMLInputElement>(null);
  const incorrectFileInputRef = useRef<HTMLInputElement>(null);
  
  // Haal de juiste feedback waarden op, rekening houdend met de nieuwe structuur
  const [correctFeedbackValue, setCorrectFeedbackValue] = useState("");
  const [incorrectFeedbackValue, setIncorrectFeedbackValue] = useState("");
  
  useEffect(() => {
    // Update de feedback waarden wanneer de props veranderen
    if (typeof feedback === "object") {
      setCorrectFeedbackValue(feedback.correct || "");
      setIncorrectFeedbackValue(feedback.incorrect || "");
    } else {
      setCorrectFeedbackValue(correctFeedback || "");
      setIncorrectFeedbackValue(incorrectFeedback || "");
    }
  }, [feedback, correctFeedback, incorrectFeedback]);

  const handleMediaUpload = async (event: React.ChangeEvent<HTMLInputElement>, onImageChange: (url: string | undefined) => void) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Fout bij uploaden",
        description: "Het bestand is te groot. Maximum grootte is 5MB.",
      });
      return;
    }

    try {
      const base64String = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            resolve(reader.result);
          } else {
            reject(new Error("Failed to convert file to base64"));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      onImageChange(base64String);

      // Reset the file input after successful upload
      if (event.target) {
        event.target.value = "";
      }

      toast({
        title: "Afbeelding geüpload",
        description: "De feedback afbeelding is succesvol toegevoegd.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Fout bij uploaden",
        description: "Er is een fout opgetreden bij het verwerken van het bestand.",
      });
    }
  };

  // Thema-specifieke stijlen
  const getThemeStyles = () => {
    switch (theme) {
      case "cosmic":
        return {
          header: "bg-cosmic-secondary/30 hover:bg-cosmic-secondary/50 border-cosmic-accent/30",
          headerActive: "bg-cosmic-secondary/50",
          content: "bg-cosmic-secondary/20 border-cosmic-accent/20",
          icon: "text-cosmic-accent",
          correctIcon: "text-cosmic-success",
          incorrectIcon: "text-cosmic-error",
        };
      case "cyberpunk":
        return {
          header: "bg-cyberpunk-secondary/30 hover:bg-cyberpunk-secondary/50 border-cyberpunk-accent/30",
          headerActive: "bg-cyberpunk-secondary/50",
          content: "bg-cyberpunk-secondary/20 border-cyberpunk-accent/20",
          icon: "text-cyberpunk-accent",
          correctIcon: "text-cyberpunk-success",
          incorrectIcon: "text-cyberpunk-error",
        };
      case "aurora":
        return {
          header: "bg-aurora-secondary/30 hover:bg-aurora-secondary/50 border-aurora-accent/30",
          headerActive: "bg-aurora-secondary/50",
          content: "bg-aurora-secondary/20 border-aurora-accent/20",
          icon: "text-aurora-accent",
          correctIcon: "text-aurora-success",
          incorrectIcon: "text-aurora-error",
        };
      default:
        return {
          header: "bg-secondary/20 hover:bg-secondary/30 border-secondary/30",
          headerActive: "bg-secondary/40",
          content: "bg-secondary/10 border-secondary/20",
          icon: "text-primary",
          correctIcon: "text-green-500",
          incorrectIcon: "text-red-500",
        };
    }
  };

  const themeStyles = getThemeStyles();

  const renderFeedbackImageSection = (
    imageUrl: string | undefined, 
    onImageChange: (url: string | undefined) => void,
    inputRef: React.RefObject<HTMLInputElement>,
    label: string = "Feedback afbeelding",
  ) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={`feedback-image-${label.toLowerCase().replace(/\s+/g, "-")}`}>{label}</Label>
        
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept="image/png,image/jpeg,image/gif"
            className="hidden"
            id={`feedback-image-upload-${label.toLowerCase().replace(/\s+/g, "-")}`}
            ref={inputRef}
            onChange={(e) => handleMediaUpload(e, onImageChange)}
          />
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1 h-8"
            onClick={() => inputRef.current?.click()}
            type="button"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Upload</span>
          </Button>
          <span className="text-xs text-muted-foreground">
            Max 5MB
          </span>
        </div>
      </div>

      {/* Voorvertoning */}
      {imageUrl && (
        <div className={cn(
          "relative border rounded-md overflow-hidden mt-3",
          "transition-all duration-300 ease-in-out",
          "bg-background/50 p-2",
        )}>
          <img 
            src={imageUrl} 
            alt="Feedback afbeelding" 
            className="max-w-full h-auto max-h-[200px] mx-auto"
          />
          <Button 
            variant="destructive" 
            size="icon" 
            className="absolute top-2 right-2 h-7 w-7 bg-white/80 hover:bg-red-100"
            onClick={() => onImageChange(undefined)}
          >
            <Trash className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="mt-6">
      {/* Uitklapbare header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-center justify-between p-3 rounded-t-lg border transition-colors",
          isExpanded ? themeStyles.headerActive : themeStyles.header,
        )}
      >
        <div className="flex items-center gap-2">
          <MessageSquare className={cn("h-5 w-5", themeStyles.icon)} />
          <span className="font-medium">Feedback voor leerling</span>
          {isExpanded ? 
            <ChevronUp className="h-4 w-4 ml-2" /> : 
            <ChevronDown className="h-4 w-4 ml-2" />
          }
        </div>
        {(correctFeedbackImageUrl || incorrectFeedbackImageUrl) && (
          <div className="flex items-center gap-1 text-xs">
            <span>Afbeelding toegevoegd</span>
            <div className="w-2 h-2 rounded-full bg-green-500" />
          </div>
        )}
      </button>

      {/* Uitklapbare inhoud */}
      {isExpanded && (
        <div className={cn(
          "p-4 border-x border-b rounded-b-lg space-y-4 transition-all duration-300",
          themeStyles.content,
        )}>
          <div className="space-y-6">
            {/* Correcte feedback */}
            <div className="space-y-4 p-3 border rounded-md bg-green-50/30">
              <div className="flex items-center gap-2">
                <CheckCircle className={cn("h-5 w-5", themeStyles.correctIcon)} />
                <Label htmlFor="correct-feedback-text" className="font-medium">Feedback bij correct antwoord</Label>
              </div>
              
              <Textarea
                id="correct-feedback-text"
                placeholder="Geef feedback bij een correct antwoord..."
                value={correctFeedbackValue}
                onChange={(e) => {
                  setCorrectFeedbackValue(e.target.value);
                  if (typeof feedback === "object") {
                    onCorrectFeedbackChange?.(e.target.value);
                  } else {
                    onCorrectFeedbackChange?.(e.target.value);
                  }
                }}
                className="min-h-[80px] resize-y"
              />
              
              {renderFeedbackImageSection(
                correctFeedbackImageUrl, 
                onCorrectFeedbackImageChange || (() => {}), 
                correctFileInputRef,
                "Afbeelding bij correct antwoord",
              )}
            </div>
            
            {/* Incorrecte feedback */}
            <div className="space-y-4 p-3 border rounded-md bg-red-50/30">
              <div className="flex items-center gap-2">
                <XCircle className={cn("h-5 w-5", themeStyles.incorrectIcon)} />
                <Label htmlFor="incorrect-feedback-text" className="font-medium">Feedback bij incorrect antwoord</Label>
              </div>
              
              <Textarea
                id="incorrect-feedback-text"
                placeholder="Geef feedback bij een incorrect antwoord..."
                value={incorrectFeedbackValue}
                onChange={(e) => {
                  setIncorrectFeedbackValue(e.target.value);
                  if (typeof feedback === "object") {
                    onIncorrectFeedbackChange?.(e.target.value);
                  } else {
                    onIncorrectFeedbackChange?.(e.target.value);
                  }
                }}
                className="min-h-[80px] resize-y"
              />
              
              {renderFeedbackImageSection(
                incorrectFeedbackImageUrl, 
                onIncorrectFeedbackImageChange || (() => {}), 
                incorrectFileInputRef,
                "Afbeelding bij incorrect antwoord",
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
