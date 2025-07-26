import type { AIQuestionMetadata } from "./ai";

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback?: string; // Specifieke feedback voor deze antwoordoptie
  mediaUrl?: string;
  imageSize?: {
    width: number;
    height: number;
  };
}

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface OrderItem {
  id: string;
  text: string;
  correctPosition: number;
}

export interface DragDropItem {
  id: string;
  text: string;
  imageUrl?: string;
}

export interface DragDropZone {
  id: string;
  description?: string;
  textPosition?: "before" | "after";
  correctItemId: string;
  beforeText: string;
  afterText: string;
  alternativeAnswers?: Array<{
    id: string;
    itemId: string;
    feedbackText?: string;
  }>;
  specificFeedback?: {
    correct?: string;
    incorrect?: string;
  };
  style?: {
    width?: string;
    height?: string;
    backgroundColor?: string;
    borderColor?: string;
    padding?: string;
  };
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface VideoMarker {
  id: string;
  time: number;
  text: string;
  options?: QuestionOption[];
  correctFeedback?: string;
  incorrectFeedback?: string;
  showFeedbackImmediately?: boolean;
  showCorrectAnswer?: boolean;
}

export interface Keyword {
  id: string;
  text: string;
  weight?: number; // Optional weight for more important keywords
}

export interface Definition {
  id: string;
  number: number;
  text: string;
  correctHotspotId: string; // ID van de hotspot waar deze definitie geplaatst moet worden
  feedback?: {
    correct?: string;
    incorrect?: string;
  };
}

export interface Hotspot {
  id: string;
  name: string;
  isCorrect: boolean;
  isDropZone?: boolean; // Geeft aan of deze hotspot als dropzone fungeert voor definities
  shape: "rectangle" | "circle" | "polygon" | "point";
  coordinates: {
    x: number;
    y: number;
    width?: number;
    height?: number;
    radius?: number;
    points?: {x: number, y: number}[]; // voor polygon
  };
  feedback: string;
  points: number;
}

export type QuestionType = "multiple-choice" | "matching" | "order" | "drag-drop" | "video-interactive" | "open" | "hotspot" | "interactive-video" | "mark-words";

/**
 * Basisinterface voor alle vraagtypes in de editor
 */
export interface Question {
  /**
   * Unieke identifier van de vraag
   */
  id: string;
  
  /**
   * Type vraag (multiple-choice, matching, etc.)
   */
  type: QuestionType;
  
  /**
   * Optionele naam/titel van de vraag
   */
  name?: string;
  
  /**
   * Tekst van de vraag
   */
  text?: string;
  
  /**
   * Instructie voor de vraag
   */
  instruction?: string;
  
  /**
   * Woorden die gemarkeerd moeten worden (voor mark-words vraagtype)
   */
  wordsToMark?: string[];
  
  /**
   * Tekst met markeringen (voor mark-words vraagtype)
   */
  markedText?: string;
  
  /**
   * Onderwijsniveau (voor mark-words vraagtype)
   */
  niveau?: "mavo" | "havo" | "vwo";
  
  /**
   * Leerjaar (voor mark-words vraagtype)
   */
  leerjaar?: 1 | 2 | 3 | 4 | 5 | 6;
  
  /**
   * Vak (voor mark-words vraagtype)
   */
  vak?: string;
  
  /**
   * Contextbeschrijving (voor mark-words vraagtype)
   */
  contextDescription?: string;
  
  /**
   * Geeft aan of feedback onmiddellijk getoond moet worden
   */
  showFeedbackImmediately?: boolean;
  
  /**
   * Antwoordopties voor multiple choice vragen
   */
  options?: QuestionOption[];
  
  /**
   * Lijst met correcte antwoorden (IDs)
   */
  correctAnswers?: string[];
  
  /**
   * Algemene feedback voor de vraag
   */
  feedback?: string | {
    correct: string;
    incorrect: string;
  };
  
  /**
   * Feedback bij correct antwoord
   */
  correctFeedback?: string;
  
  /**
   * Feedback bij incorrect antwoord
   */
  incorrectFeedback?: string;
  
  /**
   * URL voor de feedback afbeelding of GIF
   */
  feedbackImageUrl?: string;
  
  /**
   * URL voor de feedback afbeelding bij correct antwoord
   */
  correctFeedbackImageUrl?: string;
  
  /**
   * URL voor de feedback afbeelding bij incorrect antwoord
   */
  incorrectFeedbackImageUrl?: string;
  
  /**
   * Sleutelwoorden voor de vraag
   */
  keywords?: Keyword[];
  
  /**
   * URL naar een afbeelding voor de vraag
   */
  imageUrl?: string;
  
  /**
   * Grootte van de afbeelding
   */
  imageSize?: {
    width: number;
    height: number;
  };
  
  /**
   * URL naar een video voor de vraag
   */
  videoUrl?: string;
  
  /**
   * Geeft aan of de video van YouTube is
   */
  isYouTubeVideo?: boolean;
  
  /**
   * Markers voor interactieve video vragen
   */
  markers?: VideoMarker[];
  
  /**
   * Geeft aan of de video moet loopen
   */
  loop?: boolean;
  
  /**
   * Geeft aan of de video gedempt moet worden afgespeeld
   */
  mute?: boolean;
  
  /**
   * Geeft aan of meerdere antwoorden mogelijk zijn
   */
  allowMultipleAnswers?: boolean;
  
  /**
   * Geeft aan of gedeeltelijke scoring is toegestaan
   */
  allowPartialScoring?: boolean;
  
  /**
   * Geeft aan of de opties geschud moeten worden
   */
  shuffleOptions?: boolean;
  
  /**
   * Geeft aan of de vragen geschud moeten worden
   */
  shuffleQuestions?: boolean;
  
  /**
   * Geeft aan of de correcte antwoorden getoond moeten worden
   */
  showCorrectAnswers?: boolean;
  
  /**
   * Geeft aan of feedback getoond moet worden
   */
  showFeedback?: boolean;
  
  /**
   * Tijdslimiet voor de vraag in seconden
   */
  timeLimit?: number;
  
  /**
   * Aantal toegestane pogingen
   */
  attempts?: number;
  
  /**
   * Minimale score om te slagen
   */
  passingScore?: number;
  
  /**
   * Maximale score
   */
  maxScore?: number;
  
  /**
   * Minimale score
   */
  minScore?: number;
  
  /**
   * Methode voor het berekenen van de score
   */
  scoreMethod?: "highest" | "average" | "first" | "last";
  
  /**
   * Hoe de score weergegeven moet worden
   */
  scoreDisplay?: "percentage" | "points" | "none";
  
  /**
   * Hoe de score afgerond moet worden
   */
  scoreRounding?: "none" | "nearest" | "up" | "down";
  
  /**
   * Aantal decimalen voor de score
   */
  scoreDecimalPlaces?: number;
  
  /**
   * Drempelwaarde voor een voldoende
   */
  scorePassingThreshold?: number;
  
  /**
   * Bericht bij een voldoende score
   */
  scorePassingMessage?: string;
  
  /**
   * Bericht bij een onvoldoende score
   */
  scoreFailingMessage?: string;
  
  /**
   * Metadata voor AI-gegenereerde vragen
   */
  aiMetadata?: AIQuestionMetadata;
  
  /**
   * Geeft aan of deze vraag door AI is gegenereerd
   */
  isAIGenerated?: boolean;
  
  /**
   * Versie van de vraag
   */
  version?: number;
  
  /**
   * Tijdstip waarop de vraag is aangemaakt
   */
  createdAt?: string;
  
  /**
   * Tijdstip waarop de vraag voor het laatst is bijgewerkt
   */
  updatedAt?: string;
  
  /**
   * Tags voor categorisering van de vraag
   */
  tags?: string[];
  
  /**
   * Moeilijkheidsgraad van de vraag (1-5)
   */
  difficulty?: number | string;
  
  /**
   * Geeft aan of meerdere correcte antwoorden mogelijk zijn
   */
  multipleCorrect?: boolean;
  
  /**
   * Lijst met matching pairs
   */
  pairs?: MatchingPair[];
  
  /**
   * Lijst met items voor ordening
   */
  orderItems?: OrderItem[];
  
  /**
   * Lijst met items voor drag en drop
   */
  dragDropItems?: DragDropItem[];
  
  /**
   * Lijst met zones voor drag en drop
   */
  dragDropZones?: DragDropZone[];
  
  /**
   * Lijst met hotspots
   */
  hotspots?: Hotspot[];
  
  /**
   * Lijst met definities
   */
  definitions?: Definition[];
  
  /**
   * URL naar de achtergrondafbeelding
   */
  backgroundImage?: string;
  
  /**
   * Grootte van de achtergrondafbeelding
   */
  backgroundImageSize?: {
    width: number;
    height: number;
  };
  
  /**
   * Tekst en correcte woorden voor mark-words vragen
   */
  markWords?: {
    text: string;
    correctWords: string[];
  };
}

export interface InteractiveVideoQuestion extends Question {
  type: "interactive-video";
  videoUrl: string;
  markers: VideoMarker[];
  loop?: boolean;
  mute?: boolean;
  timeLimit?: number;
  allowSkip?: boolean;
  autoPause?: boolean;
  allowSeeking?: boolean;
  allowReview?: boolean;
  defaultPoints?: number;
  passingScore?: number;
  scormVersion?: string;
  includeMetadata?: boolean;
}

/**
 * Interface voor Mark the Words vraagtype
 */
export interface MarkWordsQuestion extends Question {
  type: "mark-words";
  text: string;
  instruction: string;
  wordsToMark: string[];
  markedText: string; // Text with ^word^ notation
  niveau?: "mavo" | "havo" | "vwo";
  leerjaar?: 1 | 2 | 3 | 4 | 5 | 6;
  vak?: string;
  contextDescription?: string;
  showFeedbackImmediately?: boolean;
  allowPartialScoring?: boolean;
  imageUrl?: string;
  imageSize?: {
    width: number;
    height: number;
  };
}

/**
 * Interface voor Drag & Drop vraagtype
 */
export interface DragDropQuestion extends Question {
  type: "drag-drop";
  items: DragDropItem[];
  dropZones: DragDropZone[];
  randomizeItems?: boolean;
  mediaUrl?: string;
  imageSize?: {
    width: number;
    height: number;
  };
  width: number;
  height: number;
  settings?: {
    backgroundImage?: string;
    showLabels?: boolean;
    dropZoneMode?: "free" | "fixed";
    singleUse?: boolean;
  };
}
