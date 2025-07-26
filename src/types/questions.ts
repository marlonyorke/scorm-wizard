export interface QuestionType {
  id: string;
  name: string;
  icon: string;
  aiAssist: boolean;
}

export interface QuestionTypeCardProps {
  type: QuestionType;
  isSelected?: boolean;
  onSelect: (id: string) => void;
}

export interface TotalStats {
  totalQuestions: number;
  aiAssistedTypes: number;
  estimatedDuration: number;
  maxScore: number;
}

// Base interface voor alle vraagtypes
export interface BaseQuestion {
  id: string;
  type: string;
  name: string;
  text: string;
  feedback?: string;
  mediaUrl?: string;
  imageSize?: {
    width: number;
    height: number;
  };
}

// Multiple Choice specifieke interface
export interface MultipleChoiceQuestion extends BaseQuestion {
  type: "multiple-choice";
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
  multipleCorrect: boolean;
}

// Drag & Drop specifieke interface
export interface DragDropQuestion extends BaseQuestion {
  type: "drag-drop";
  items: Array<{
    id: string;
    text: string;
    imageUrl?: string;
  }>;
  dropZones: Array<{
    id: string;
    text: string;
    correctItemId: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  }>;
  settings?: {
    backgroundImage?: string;
    showLabels?: boolean;
    dropZoneMode?: "free" | "fixed";
    singleUse?: boolean;
  };
}

// Open vraag specifieke interface
export interface OpenQuestion extends BaseQuestion {
  type: "open";
  modelAnswer: string;
  keywords?: string[];
  aiScoring?: boolean;
  minWords?: number;
  maxWords?: number;
}

// Matching vraag specifieke interface
export interface MatchingQuestion extends BaseQuestion {
  type: "matching";
  pairs: Array<{
    id: string;
    left: string;
    right: string;
  }>;
}

// Volgorde vraag specifieke interface
export interface OrderingQuestion extends BaseQuestion {
  type: "order";
  items: Array<{
    id: string;
    text: string;
    correctPosition: number;
  }>;
}

// Hotspot vraag specifieke interface
export interface HotspotQuestion extends BaseQuestion {
  type: "hotspot";
  hotspots: Array<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    feedback?: string;
    isCorrect: boolean;
  }>;
}

// Invulvraag specifieke interface
export interface FillBlanksQuestion extends BaseQuestion {
  type: "fill-blanks";
  text: string;
  blanks: Array<{
    id: string;
    correctAnswer: string[];
    caseSensitive?: boolean;
  }>;
}

// Waar/Niet waar vraag specifieke interface

// Mark the Words vraag specifieke interface
export interface MarkWordsQuestion extends BaseQuestion {
  type: "mark-words";
  text: string;
  words: Array<{
    id: string;
    word: string;
    isMarkable: boolean;
    isCorrect: boolean;
  }>;
  caseSensitive?: boolean;
}

// Union type van alle vraagtypes
export type Question = 
  | MultipleChoiceQuestion 
  | DragDropQuestion 
  | OpenQuestion 
  | MatchingQuestion 
  | OrderingQuestion 
  | HotspotQuestion 
  | FillBlanksQuestion 
  | MarkWordsQuestion;

export interface ScormInteraction {
  id: string;
  type: string;
  correctResponses: string[];
  learnerResponse?: string;
  result?: "correct" | "incorrect";
  score?: number;
  weighting?: number;
  latency?: string;
  description?: string;
}

export interface ScormQuestionMetadata {
  interaction: ScormInteraction;
  objectives?: string[];
  prerequisites?: string[];
  timeLimit?: number;
}
