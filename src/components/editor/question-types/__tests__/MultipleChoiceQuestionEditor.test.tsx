import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { vi, describe, it, expect, beforeEach } from "vitest";

import { MultipleChoiceQuestionEditor } from "../MultipleChoiceQuestionEditor";

import type { Question } from "@/types/editor";

// Mocks
vi.mock("@/components/editor/form/MediaUpload", () => ({
  MediaUpload: vi.fn().mockImplementation(({ onMediaChange }) => (
    <button 
      data-testid="mock-media-upload"
      onClick={() => onMediaChange("data:image/jpeg;base64,mockImageData", { width: 300, height: 200 })}
    >
      Mock Media Upload
    </button>
  )),
}));

vi.mock("@/components/questions/preview/MultipleChoicePreview", () => ({
  MultipleChoicePreview: vi.fn().mockImplementation(() => (
    <div data-testid="mock-multiple-choice-preview">Mock Preview</div>
  )),
}));

vi.mock("@/components/editor/form/EditableText", () => ({
  EditableText: vi.fn().mockImplementation(({ value, onSave }) => (
    <div>
      <span data-testid="question-text">{value}</span>
      <button 
        data-testid="mock-editable-text-save"
        onClick={() => onSave("Nieuwe vraagtekst")}
      >
        Save
      </button>
    </div>
  )),
}));

vi.mock("@/components/editor/form/AnswerOptions", () => ({
  AnswerOptions: vi.fn().mockImplementation(() => (
    <div data-testid="mock-answer-options">Mock Answer Options</div>
  )),
}));

vi.mock("@/components/editor/ai/AIQuestionGenerator", () => ({
  AIQuestionGenerator: vi.fn().mockImplementation(({ onQuestionGenerated, onClose }) => (
    <div data-testid="mock-ai-generator">
      <button 
        data-testid="mock-generate-ai-question"
        onClick={() => onQuestionGenerated({
          id: "ai-generated-id",
          type: "multiple-choice",
          text: "AI gegenereerde vraag",
          options: [
            { id: "option1", text: "Optie 1", isCorrect: true },
            { id: "option2", text: "Optie 2", isCorrect: false },
            { id: "option3", text: "Optie 3", isCorrect: false },
            { id: "option4", text: "Optie 4", isCorrect: false },
          ],
        })}
      >
        Generate AI Question
      </button>
      <button 
        data-testid="mock-close-ai-generator"
        onClick={onClose}
      >
        Close
      </button>
    </div>
  )),
}));

// Mock crypto.randomUUID
vi.stubGlobal("crypto", {
  randomUUID: () => "mocked-uuid",
});

describe("MultipleChoiceQuestionEditor", () => {
  // Default question voor tests
  const defaultQuestion: Question = {
    id: "test-question-id",
    type: "multiple-choice",
    text: "Test vraag",
    options: [
      { id: "option1", text: "Optie 1", isCorrect: true },
      { id: "option2", text: "Optie 2", isCorrect: false },
      { id: "option3", text: "Optie 3", isCorrect: false },
      { id: "option4", text: "Optie 4", isCorrect: false },
    ],
  };

  // Mock callback functies
  const mockOnQuestionChange = vi.fn();

  beforeEach(() => {
    // Reset mocks voor elke test
    vi.clearAllMocks();
  });

  it("renders the editor with initial values from the question", () => {
    render(
      <MultipleChoiceQuestionEditor 
        currentQuestion={defaultQuestion}
        onQuestionChange={mockOnQuestionChange}
      />,
    );
    
    // Controleer of de belangrijkste componenten worden gerenderd
    expect(screen.getByTestId("question-text")).toHaveTextContent("Test vraag");
    expect(screen.getByTestId("mock-answer-options")).toBeInTheDocument();
    expect(screen.getByTestId("mock-multiple-choice-preview")).toBeInTheDocument();
    expect(screen.getByText(/AI Generator/i)).toBeInTheDocument();
  });

  it("adds default options when question has no options", () => {
    const questionWithoutOptions: Question = {
      id: "test-question-id",
      type: "multiple-choice",
      text: "Test vraag zonder opties",
    };

    render(
      <MultipleChoiceQuestionEditor 
        currentQuestion={questionWithoutOptions}
        onQuestionChange={mockOnQuestionChange}
      />,
    );
    
    // Controleer of onQuestionChange is aangeroepen om standaard opties toe te voegen
    expect(mockOnQuestionChange).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.arrayContaining([
          expect.objectContaining({ isCorrect: true }),
          expect.objectContaining({ isCorrect: false }),
          expect.objectContaining({ isCorrect: false }),
          expect.objectContaining({ isCorrect: false }),
        ]),
      }),
    );
  });

  it("updates the question text when editable text changes", () => {
    render(
      <MultipleChoiceQuestionEditor 
        currentQuestion={defaultQuestion}
        onQuestionChange={mockOnQuestionChange}
      />,
    );
    
    // Klik op de save knop van de mock EditableText
    const saveButton = screen.getByTestId("mock-editable-text-save");
    fireEvent.click(saveButton);
    
    // Controleer of onQuestionChange is aangeroepen met de nieuwe tekst
    expect(mockOnQuestionChange).toHaveBeenCalledWith(
      expect.objectContaining({
        text: "Nieuwe vraagtekst",
      }),
    );
  });

  it("updates the image when media upload is used", () => {
    render(
      <MultipleChoiceQuestionEditor 
        currentQuestion={defaultQuestion}
        onQuestionChange={mockOnQuestionChange}
      />,
    );
    
    // Klik op de mock media upload knop
    const mediaUploadButton = screen.getByTestId("mock-media-upload");
    fireEvent.click(mediaUploadButton);
    
    // Controleer of onQuestionChange is aangeroepen met de nieuwe afbeelding
    expect(mockOnQuestionChange).toHaveBeenCalledWith(
      expect.objectContaining({
        mediaUrl: "data:image/jpeg;base64,mockImageData",
        imageSize: { width: 300, height: 200 },
      }),
    );
  });

  it("shows AI generator when AI Generator button is clicked", () => {
    render(
      <MultipleChoiceQuestionEditor 
        currentQuestion={defaultQuestion}
        onQuestionChange={mockOnQuestionChange}
      />,
    );
    
    // Controleer dat de AI generator niet zichtbaar is bij het begin
    expect(screen.queryByTestId("mock-ai-generator")).not.toBeInTheDocument();
    
    // Klik op de AI Generator knop
    const aiGeneratorButton = screen.getByText(/AI Generator/i);
    fireEvent.click(aiGeneratorButton);
    
    // Controleer dat de AI generator nu zichtbaar is
    expect(screen.getByTestId("mock-ai-generator")).toBeInTheDocument();
  });

  it("updates question with AI generated content when generated", async () => {
    render(
      <MultipleChoiceQuestionEditor 
        currentQuestion={defaultQuestion}
        onQuestionChange={mockOnQuestionChange}
      />,
    );
    
    // Klik op de AI Generator knop
    const aiGeneratorButton = screen.getByText(/AI Generator/i);
    fireEvent.click(aiGeneratorButton);
    
    // Klik op de generate knop in de AI generator
    const generateButton = screen.getByTestId("mock-generate-ai-question");
    fireEvent.click(generateButton);
    
    // Controleer of onQuestionChange is aangeroepen met de AI gegenereerde vraag
    // maar met behoud van het originele ID en type
    expect(mockOnQuestionChange).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "test-question-id", // Origineel ID behouden
        type: "multiple-choice", // Origineel type behouden
        text: "AI gegenereerde vraag", // Nieuwe tekst van AI
        options: expect.arrayContaining([
          expect.objectContaining({ id: "option1", text: "Optie 1", isCorrect: true }),
          expect.objectContaining({ id: "option2", text: "Optie 2", isCorrect: false }),
          expect.objectContaining({ id: "option3", text: "Optie 3", isCorrect: false }),
          expect.objectContaining({ id: "option4", text: "Optie 4", isCorrect: false }),
        ]),
      }),
    );
  });

  it("closes AI generator when close button is clicked", () => {
    render(
      <MultipleChoiceQuestionEditor 
        currentQuestion={defaultQuestion}
        onQuestionChange={mockOnQuestionChange}
      />,
    );
    
    // Klik op de AI Generator knop om de generator te openen
    const aiGeneratorButton = screen.getByText(/AI Generator/i);
    fireEvent.click(aiGeneratorButton);
    
    // Controleer dat de AI generator zichtbaar is
    expect(screen.getByTestId("mock-ai-generator")).toBeInTheDocument();
    
    // Klik op de close knop in de AI generator
    const closeButton = screen.getByTestId("mock-close-ai-generator");
    fireEvent.click(closeButton);
    
    // Controleer dat de AI generator niet meer zichtbaar is
    expect(screen.queryByTestId("mock-ai-generator")).not.toBeInTheDocument();
  });
});
