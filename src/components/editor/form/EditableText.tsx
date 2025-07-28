import { Pencil, AlertCircle } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";

import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface EditableTextProps {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
}

const MAX_LENGTH = 255;

export function EditableText({ value, onSave, placeholder = "" }: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const validate = (text: string): boolean => {
    if (text.length > MAX_LENGTH) {
      setError(`Tekst mag niet langer zijn dan ${MAX_LENGTH} karakters`);
      return false;
    }
    setError(null);
    return true;
  };

  const handleSave = () => {
    if (validate(tempValue)) {
      onSave(tempValue);
      setIsEditing(false);
    } else {
      toast({
        variant: "destructive",
        title: "Fout",
        description: error,
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setTempValue(value);
      setIsEditing(false);
      setError(null);
    }
  };

  const handleBlur = () => {
    if (tempValue !== value) {
      handleSave();
    } else {
      setIsEditing(false);
      setError(null);
    }
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn(error && "border-destructive")}
        placeholder={placeholder}
      />
    );
  }

  return (
    <div 
      className="group relative flex items-center rounded-md border border-input bg-transparent px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
      onClick={() => setIsEditing(true)}
    >
      {value ? (
        <span className="flex-grow truncate">{value}</span>
      ) : (
        <span className="flex-grow truncate text-muted-foreground">{placeholder}</span>
      )}
      <Pencil className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity ml-2" />
    </div>
  );
}