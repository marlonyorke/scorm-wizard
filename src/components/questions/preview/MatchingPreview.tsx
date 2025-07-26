import { Check } from "lucide-react";
import React from "react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

interface MatchingPreviewProps {
  text: string;
  pairs?: Array<{
    id: string;
    left: string;
    right: string;
  }>;
  mediaUrl?: string;
  imageSize?: {
    width: number;
    height: number;
  };
}

export function MatchingPreview({ text, pairs, mediaUrl, imageSize }: MatchingPreviewProps) {
  const { theme } = useTheme();
  
  if (!pairs?.length) {
    return <p className="text-muted-foreground">Voeg matching paren toe om een voorbeeld te zien.</p>;
  }

  // Verzamel alle rechterkant opties voor de dropdowns
  const rightOptions = pairs.map((pair) => pair.right).filter(Boolean);
  
  // Voor het voorbeeld: toon het eerste paar als correct beantwoord
  const examplePair = pairs[0];
  const hasExamplePair = examplePair && examplePair.left && examplePair.right;

  return (
    <div className="space-y-4">
      {text && <h3 className="text-lg font-medium">{text}</h3>}
      
      {mediaUrl && (
        <div className="question-media mb-4">
          <img 
            src={mediaUrl} 
            alt="Question media"
            style={{
              width: imageSize?.width || 300,
              height: imageSize?.height || 200,
              objectFit: "contain",
            }}
            className="rounded-lg border"
          />
        </div>
      )}

      <div className="space-y-3">
        {pairs.map((pair, index) => (
          <div key={pair.id} className="flex items-center gap-4">
            <div className={cn(
              "flex-1 p-2 rounded-md border",
              "bg-secondary/30 text-primary",
            )}>
              {pair.left || <span className="text-muted-foreground">Linker item...</span>}
            </div>
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
            <div className="flex-1 relative">
              {index === 0 && hasExamplePair ? (
                <div className="relative">
                  <div className={cn(
                    "w-full p-2 rounded-md border flex justify-between items-center",
                    "bg-secondary/30 text-primary",
                  )}>
                    <span>{pair.right}</span>
                    <Check className="h-4 w-4 text-success" />
                  </div>
                  <div className="absolute -top-2 -right-2 text-xs px-2 py-1 rounded-full bg-success/20 text-success border border-success/30">
                    Voorbeeld
                  </div>
                </div>
              ) : (
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Kies een antwoord..." />
                  </SelectTrigger>
                  <SelectContent>
                    {rightOptions.map((option, index) => (
                      <SelectItem key={index} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
