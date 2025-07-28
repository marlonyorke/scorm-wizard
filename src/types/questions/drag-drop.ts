
import type { BaseQuestionData } from "./base";

import type { ValidationError } from "@/components/editor/question-editors/base/BaseQuestionEditor";

export interface DraggableItem {
  id: string;
  text: string;
}

export interface AlternativeAnswer {
  id: string;
  itemId: string;
  feedbackText?: string;
}

export interface DropZone {
  id: string;
  description: string;
  textPosition: "before" | "after"; // whether text comes before or after the drop area
  correctItemId: string;
  alternativeAnswers?: AlternativeAnswer[];
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
}

export interface DropZoneSettings {
  allowMultipleItemsPerZone?: boolean;
  onlyAcceptCorrectItems?: boolean;
  returnItemsToOrigin?: boolean;
  highlightColor?: string;
  feedbackStyle?: "icon" | "color" | "text" | "all";
  animationType?: "fade" | "bounce" | "shake" | "none";
}

export interface DragDropQuestionData extends BaseQuestionData {
  type: "drag-drop";
  items: DraggableItem[];
  dropZones: DropZone[];
  dropZoneSettings?: DropZoneSettings;
}

export const DragDropDefinition = {
  type: "drag-drop",
  createInitialState: (): DragDropQuestionData => ({
    id: crypto.randomUUID(),
    type: "drag-drop",
    name: "",
    text: "",
    items: [],
    dropZones: [],
    dropZoneSettings: {
      allowMultipleItemsPerZone: false,
      onlyAcceptCorrectItems: false,
      returnItemsToOrigin: true,
      highlightColor: "#e6f7ff",
      feedbackStyle: "all",
      animationType: "fade",
    },
  }),
  validate: (question: DragDropQuestionData): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (!question.text.trim()) {
      errors.push({
        field: "text",
        message: "Voer een vraag in",
      });
    }

    if (question.items.length === 0) {
      errors.push({
        field: "items",
        message: "Voeg minimaal één sleepbaar item toe",
      });
    }

    const allItemsHaveText = question.items.every((item) => item.text.trim());
    if (!allItemsHaveText) {
      errors.push({
        field: "items",
        message: "Alle sleepbare items moeten tekst bevatten",
      });
    }
    
    if (question.dropZones.length === 0) {
      errors.push({
        field: "dropZones",
        message: "Voeg minimaal één dropzone toe",
      });
    }

    const allDropZonesHaveCorrectItem = question.dropZones.every((zone) => {
      return question.items.some((item) => item.id === zone.correctItemId);
    });
    
    if (!allDropZonesHaveCorrectItem) {
      errors.push({
        field: "dropZones",
        message: "Alle dropzones moeten een correct antwoord hebben",
      });
    }

    return errors;
  },
  isComplete: (question: DragDropQuestionData): boolean => {
    return (
      question.text.trim() !== "" &&
      question.items.length > 0 &&
      question.items.every((item) => item.text.trim()) &&
      question.dropZones.length > 0 &&
      question.dropZones.every((zone) => {
        return question.items.some((item) => item.id === zone.correctItemId);
      })
    );
  },
};

