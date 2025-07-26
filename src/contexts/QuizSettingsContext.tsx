import React, { createContext, useContext, useState } from "react";

import { useToast } from "@/hooks/use-toast";
import type {
  QuizSettings,
  QuizSettingsContextType} from "@/types/quiz-settings";
import {
  DEFAULT_QUIZ_SETTINGS,
  validateQuizSettings,
} from "@/types/quiz-settings";

const QuizSettingsContext = createContext<QuizSettingsContextType | undefined>(undefined);

export function QuizSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<QuizSettings>(DEFAULT_QUIZ_SETTINGS);
  const { toast } = useToast();

  const setQuizSettings = (newSettings: Partial<QuizSettings>) => {
    const errors = validateQuizSettings(newSettings);
    
    if (errors.length > 0) {
      toast({
        variant: "destructive",
        title: "Fout bij het instellen",
        description: errors.join(", "),
      });
      return;
    }

    setSettings((current) => ({
      ...current,
      ...newSettings,
    }));
  };

  const resetQuizSettings = () => {
    setSettings(DEFAULT_QUIZ_SETTINGS);
  };

  return (
    <QuizSettingsContext.Provider value={{ settings, setQuizSettings, resetQuizSettings }}>
      {children}
    </QuizSettingsContext.Provider>
  );
}

export function useQuizSettings() {
  const context = useContext(QuizSettingsContext);
  if (context === undefined) {
    throw new Error("useQuizSettings must be used within a QuizSettingsProvider");
  }
  return context;
}