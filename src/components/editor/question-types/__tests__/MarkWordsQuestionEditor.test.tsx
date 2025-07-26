import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { MarkWordsQuestionEditor } from "../MarkWordsQuestionEditor";

import { MediaUpload } from "@/components/editor/form/MediaUpload";
import { useToast } from "@/components/ui/use-toast";
import { aiService } from "@/services/aiService";
import type { Question } from "@/types/editor";

// Mock ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Add ResizeObserver to the global object
global.ResizeObserver = ResizeObserverMock;

// Mock the useToast hook
vi.mock("@/components/ui/use-toast", () => ({
  useToast: vi.fn().mockReturnValue({
    toast: vi.fn(),
  }),
}));

// Mock the aiService
vi.mock("@/services/aiService", () => ({
  aiService: {
    generateMarkWordsStory: vi.fn(),
  },
}));

// Mock the MediaUpload component
vi.mock("@/components/editor/form/MediaUpload", () => ({
  MediaUpload: vi.fn().mockImplementation(({ onMediaChange, ...rest }) => (
    <button 
      data-testid="mock-media-upload"
      onClick={() => onMediaChange("data:image/jpeg;base64,mockImageData", { width: 300, height: 200 })}
      {...rest}
    >
      Mock Media Upload
    </button>
  )),
}));

// Mock the MarkWordsPreview component
vi.mock("@/components/questions/preview/MarkWordsPreview", () => ({
  MarkWordsPreview: vi.fn().mockImplementation(({ question }) => (
    <div data-testid="mark-words-preview">
      <div>Instruction: {question.instruction}</div>
      <div>Marked Text: {question.markedText}</div>
    </div>
  )),
}));

// Mock de Tabs componenten van shadcn/ui
vi.mock("@/components/ui/tabs", () => ({
  Tabs: vi.fn().mockImplementation(({ children }) => <div>{children}</div>),
  TabsList: vi.fn().mockImplementation(({ children }) => <div>{children}</div>),
  TabsTrigger: vi.fn().mockImplementation(({ children, value }) => (
    <button data-value={value}>{children}</button>
  )),
  TabsContent: vi.fn().mockImplementation(({ children, value }) => (
    <div data-content={value} data-testid={`tab-content-${value}`}>
      {children}
    </div>
  )),
}));

// Mock the withBaseQuestionEditor HOC
vi.mock("../question-editors/base/BaseQuestionEditor", () => ({
  withBaseQuestionEditor: (Component: any) => Component,
  ValidationError: class ValidationError {
    constructor(public field: string, public message: string) {}
  },
}));

describe("MarkWordsQuestionEditor", () => {
  const mockOnQuestionChange = vi.fn();
  const mockToast = vi.fn();
  const mockGenerateMarkWordsStory = vi.fn();
  
  const defaultQuestion: Question = {
    id: "1",
    type: "mark-words",
    name: "Test Mark Words Question",
    instruction: "Mark all words related to biology",
    markedText: "This is a text about ^biology^ and ^science^.",
    wordsToMark: ["biology", "science"],
    niveau: "havo",
    leerjaar: 3,
    vak: "Biologie",
    contextDescription: "A text about biology",
    imageUrl: undefined,
    imageSize: undefined,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useToast as any).mockReturnValue({ toast: mockToast });
    (aiService.generateMarkWordsStory as any).mockImplementation(mockGenerateMarkWordsStory);
  });

  it("renders the editor with initial values from the question", () => {
    render(
      <MarkWordsQuestionEditor 
        currentQuestion={defaultQuestion}
        onQuestionChange={mockOnQuestionChange}
      />,
    );
    
    // Check if the form fields are initialized with the correct values
    expect(screen.getByDisplayValue("Mark all words related to biology")).toBeInTheDocument();
    expect(screen.getByDisplayValue("This is a text about ^biology^ and ^science^.")).toBeInTheDocument();
    expect(screen.getByDisplayValue("biology, science")).toBeInTheDocument();
    expect(screen.getByDisplayValue("A text about biology")).toBeInTheDocument();
  });

  it("updates the question when form fields change", async () => {
    render(
      <MarkWordsQuestionEditor 
        currentQuestion={defaultQuestion}
        onQuestionChange={mockOnQuestionChange}
      />,
    );
    
    // Change the instruction
    const instructionInput = screen.getByPlaceholderText("Klik op alle woorden die betrekking hebben op het onderwerp");
    fireEvent.change(instructionInput, { target: { value: "New instruction" } });
    
    // Change the marked text
    const markedTextInput = screen.getByPlaceholderText("Dit is een voorbeeldtekst met ^woord1^ en ^woord2^ en ook ^woord3^ om te markeren.");
    fireEvent.change(markedTextInput, { target: { value: "New text with ^marked^ words." } });
    
    // Click the save button
    const saveButton = screen.getByText("Opslaan");
    fireEvent.click(saveButton);
    
    // Check if onQuestionChange was called with the updated values
    expect(mockOnQuestionChange).toHaveBeenCalledWith(expect.objectContaining({
      instruction: "New instruction",
      markedText: "New text with ^marked^ words.",
      wordsToMark: ["marked"],
    }));
  });

  it("extracts marked words from the text correctly", async () => {
    render(
      <MarkWordsQuestionEditor 
        currentQuestion={defaultQuestion}
        onQuestionChange={mockOnQuestionChange}
      />,
    );
    
    // Change the marked text with multiple marked words
    const markedTextInput = screen.getByPlaceholderText("Dit is een voorbeeldtekst met ^woord1^ en ^woord2^ en ook ^woord3^ om te markeren.");
    fireEvent.change(markedTextInput, { target: { value: "Text with ^multiple^ ^marked^ ^words^." } });
    
    // Click the save button
    const saveButton = screen.getByText("Opslaan");
    fireEvent.click(saveButton);
    
    // Check if onQuestionChange was called with the correct extracted words
    expect(mockOnQuestionChange).toHaveBeenCalledWith(expect.objectContaining({
      wordsToMark: ["multiple", "marked", "words"],
    }));
  });

  it("shows the preview when switching to preview tab", async () => {
    render(
      <MarkWordsQuestionEditor 
        currentQuestion={defaultQuestion}
        onQuestionChange={mockOnQuestionChange}
      />,
    );
    
    // Click the preview tab
    const previewTab = screen.getByText("Preview");
    fireEvent.click(previewTab);
    
    // Check if the preview tab content is present
    expect(screen.getByTestId("tab-content-preview")).toBeInTheDocument();
  });

  it("calls AI service when generate button is clicked", async () => {
    // Mock the AI service to return a story
    mockGenerateMarkWordsStory.mockResolvedValue({
      story: "Generated story with ^marked^ ^words^.",
    });
    
    render(
      <MarkWordsQuestionEditor 
        currentQuestion={defaultQuestion}
        onQuestionChange={mockOnQuestionChange}
      />,
    );
    
    // Click the generate button
    const generateButton = screen.getByText("Genereer met AI");
    fireEvent.click(generateButton);
    
    // Wait for the AI service to be called
    await waitFor(() => {
      expect(mockGenerateMarkWordsStory).toHaveBeenCalledWith(expect.objectContaining({
        words: ["biology", "science"],
        context: "A text about biology",
        niveau: "havo",
        leerjaar: 3,
        vak: "Biologie",
      }));
    });
    
    // Check if the toast was shown
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: "Verhaal gegenereerd",
      }));
    });
    
    // Check if onQuestionChange was called with the generated story
    await waitFor(() => {
      expect(mockOnQuestionChange).toHaveBeenCalledWith(expect.objectContaining({
        markedText: "Generated story with ^marked^ ^words^.",
      }));
    });
  });

  it("shows error toast when AI generation fails", async () => {
    // Mock the AI service to throw an error
    mockGenerateMarkWordsStory.mockRejectedValue(new Error("AI error"));
    
    render(
      <MarkWordsQuestionEditor 
        currentQuestion={defaultQuestion}
        onQuestionChange={mockOnQuestionChange}
      />,
    );
    
    // Click the generate button
    const generateButton = screen.getByText("Genereer met AI");
    fireEvent.click(generateButton);
    
    // Wait for the error toast to be shown
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: "Fout bij genereren",
        variant: "destructive",
      }));
    });
  });

  it.skip("updates the image when media upload is used", async () => {
    // Test logica wordt later geïmplementeerd
  });
});
