import type { EducationLevel } from "./education";

export interface QuizSettings {
  level: EducationLevel | null;
  year: number | null;
  subjectId: string | null;
}

export interface QuizSettingsContextType {
  settings: QuizSettings;
  setQuizSettings: (settings: Partial<QuizSettings>) => void;
  resetQuizSettings: () => void;
}

export const DEFAULT_QUIZ_SETTINGS: QuizSettings = {
  level: null,
  year: null,
  subjectId: null,
};

export const isValidYear = (level: EducationLevel, year: number): boolean => {
  const maxYears: Record<EducationLevel, number> = {
    MAVO: 4,
    HAVO: 5,
    VWO: 6,
  };
  return year >= 1 && year <= maxYears[level];
};

export const validateQuizSettings = (settings: Partial<QuizSettings>): string[] => {
  const errors: string[] = [];

  if (settings.level && !["MAVO", "HAVO", "VWO"].includes(settings.level)) {
    errors.push("Ongeldig onderwijsniveau");
  }

  if (settings.level && settings.year) {
    if (!isValidYear(settings.level, settings.year)) {
      errors.push(`Ongeldig leerjaar voor ${settings.level}`);
    }
  }

  if (settings.subjectId && typeof settings.subjectId !== "string") {
    errors.push("Ongeldig vak");
  }

  return errors;
};