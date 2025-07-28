import { AlertCircle } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";

import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface DirectEditableTextProps {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const MAX_LENGTH = 255;

export function DirectEditableText({ 
  value, 
  onSave, 
  placeholder = "Voer tekst in...",
  className,
}: DirectEditableTextProps) {
  // Gebruik een ref om de input te tracken
  const inputRef = useRef<HTMLInputElement>(null);
  // Gebruik een ref om bij te houden of we in edit mode zijn
  const isEditingRef = useRef(false);
  // Gebruik een state voor de huidige waarde
  const [currentValue, setCurrentValue] = useState(value);
  // State voor validatiefouten
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();

  // Update de waarde wanneer de prop verandert (alleen als we niet aan het bewerken zijn)
  useEffect(() => {
    if (!isEditingRef.current) {
      setCurrentValue(value);
    }
  }, [value]);

  const validate = (text: string): boolean => {
    if (!text.trim()) {
      setError("Tekst mag niet leeg zijn");
      return false;
    }
    if (text.length > MAX_LENGTH) {
      setError(`Tekst mag niet langer zijn dan ${MAX_LENGTH} karakters`);
      return false;
    }
    setError(null);
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentValue(e.target.value);
  };

  const handleFocus = () => {
    isEditingRef.current = true;
    
    // Gebruik een timeout om de cursor aan het einde te plaatsen
    setTimeout(() => {
      if (inputRef.current) {
        const length = inputRef.current.value.length;
        inputRef.current.setSelectionRange(length, length);
      }
    }, 0);
  };

  const handleBlur = () => {
    isEditingRef.current = false;
    
    if (currentValue !== value) {
      if (validate(currentValue)) {
        onSave(currentValue);
      } else {
        toast({
          variant: "destructive",
          title: "Fout",
          description: error,
        });
        // Reset naar originele waarde bij een validatiefout
        setCurrentValue(value);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (validate(currentValue)) {
        onSave(currentValue);
        inputRef.current?.blur();
        isEditingRef.current = false;
      } else {
        toast({
          variant: "destructive",
          title: "Fout",
          description: error,
        });
      }
    } else if (e.key === "Escape") {
      // Reset naar originele waarde en verwijder focus
      setCurrentValue(value);
      inputRef.current?.blur();
      isEditingRef.current = false;
    }
  };

  // Gebruik een custom component om volledige controle te hebben over het gedrag
  return (
    <Input
      ref={inputRef}
      value={currentValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={cn(
        "transition-all",
        error && "border-destructive",
        className,
      )}
      placeholder={placeholder}
    />
  );
}
