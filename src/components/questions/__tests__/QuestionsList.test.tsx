import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { vi, describe, it, expect, beforeEach } from "vitest";

import { QuestionsList } from "../QuestionsList";

import { useQuestions } from "@/contexts/QuestionsContext";
import type { Question } from "@/types/editor";

// Import de gemockte hook

// Mock de QuestionsContext
vi.mock("@/contexts/QuestionsContext", () => ({
  useQuestions: vi.fn(),
}));

// Mock de createPortal functie
vi.mock("react-dom", () => ({
  createPortal: vi.fn((element) => element),
}));

describe("QuestionsList", () => {
  // Standaard vragen voor tests
  const mockQuestions: Question[] = [
    {
      id: "question-1",
      type: "multiple-choice",
      name: "Vraag 1",
      text: "Dit is de eerste testvraag?",
      options: [
        { id: "option-1-1", text: "Antwoordoptie 1", isCorrect: true },
        { id: "option-1-2", text: "Antwoordoptie 2", isCorrect: false },
      ],
    },
    {
      id: "question-2",
      type: "mark-words",
      name: "Vraag 2",
      text: "Dit is de *tweede* testvraag met *gemarkeerde* woorden.",
      options: [],
    },
    {
      id: "question-3",
      type: "drag-drop",
      name: "Vraag 3",
      text: "Dit is een drag & drop vraag",
      options: [],
    },
  ];

  // Mock functies
  const mockDeleteQuestion = vi.fn();
  const mockSetCurrentQuestion = vi.fn();
  const mockChangeQuestionType = vi.fn();

  beforeEach(() => {
    // Reset alle mocks voor elke test
    vi.clearAllMocks();
    
    // Standaard implementatie van useQuestions
    (useQuestions as any).mockReturnValue({
      questions: mockQuestions,
      deleteQuestion: mockDeleteQuestion,
      setCurrentQuestion: mockSetCurrentQuestion,
      changeQuestionType: mockChangeQuestionType,
    });

    // Mock getBoundingClientRect voor de hover functionaliteit
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 120,
      height: 120,
      top: 100,
      left: 100,
      bottom: 220,
      right: 220,
      x: 100,
      y: 100,
      toJSON: () => {},
    }));
  });

  it("rendert een lijst van vragen", () => {
    render(<QuestionsList />);
    
    // Controleer of de titel wordt weergegeven
    expect(screen.getByText("Opgeslagen Vragen")).toBeInTheDocument();
    
    // Controleer of de werkende vraagtypes worden weergegeven
    // (multiple-choice en mark-words, maar niet drag-drop omdat die gefilterd wordt)
    expect(screen.getByText("1")).toBeInTheDocument(); // Eerste vraag (index + 1)
    expect(screen.getByText("2")).toBeInTheDocument(); // Tweede vraag (index + 1)
  });

  it("toont een bericht wanneer er geen vragen zijn", () => {
    // Overschrijf de standaard implementatie voor deze specifieke test
    (useQuestions as any).mockReturnValue({
      questions: [],
      deleteQuestion: mockDeleteQuestion,
      setCurrentQuestion: mockSetCurrentQuestion,
      changeQuestionType: mockChangeQuestionType,
    });
    
    render(<QuestionsList />);
    
    // Controleer of het "geen vragen" bericht wordt weergegeven
    expect(screen.getByText("Nog geen vragen opgeslagen.")).toBeInTheDocument();
  });

  it("roept setCurrentQuestion en changeQuestionType aan wanneer op een vraag wordt geklikt", () => {
    const { container } = render(<QuestionsList />);
    
    // Vind de eerste vraagkaart en klik erop
    const firstCard = container.querySelector(".card, .cursor-pointer");
    expect(firstCard).not.toBeNull();
    if (firstCard) {
      fireEvent.click(firstCard);
      
      // Controleer of de juiste functies zijn aangeroepen
      expect(mockSetCurrentQuestion).toHaveBeenCalledWith(mockQuestions[0]);
      expect(mockChangeQuestionType).toHaveBeenCalledWith("multiple-choice");
    }
  });

  it("roept deleteQuestion aan wanneer op de verwijderknop wordt geklikt", () => {
    const { container } = render(<QuestionsList />);
    
    // Vind de verwijderknop van de eerste vraag en klik erop
    const deleteButton = container.querySelector(".hover\\:bg-red-100, .hover\\:text-red-600");
    expect(deleteButton).not.toBeNull();
    if (deleteButton) {
      fireEvent.click(deleteButton);
      
      // Controleer of deleteQuestion is aangeroepen met het juiste vraag-ID
      expect(mockDeleteQuestion).toHaveBeenCalled();
    }
  });

  it("toont een popup met details wanneer over een vraag wordt gehoverd", () => {
    const { container } = render(<QuestionsList />);
    
    // Vind de eerste vraagkaart container en hover eroverheen
    const questionContainer = container.querySelector(".relative");
    expect(questionContainer).not.toBeNull();
    if (questionContainer) {
      fireEvent.mouseEnter(questionContainer);
      
      // De popup wordt via createPortal gerenderd, dus we moeten in het document zoeken
      expect(screen.getByText("Vraag 1")).toBeInTheDocument();
      
      // Verlaat de vraag
      fireEvent.mouseLeave(questionContainer);
    }
  });

  it("filtert alleen de ondersteunde vraagtypes", () => {
    render(<QuestionsList />);
    
    // Er zouden alleen 2 vragen moeten zijn (multiple-choice en mark-words)
    // drag-drop wordt gefilterd omdat het niet in de lijst van werkende types staat
    const vraag1 = screen.getByText("1");
    const vraag2 = screen.getByText("2");
    
    expect(vraag1).toBeInTheDocument();
    expect(vraag2).toBeInTheDocument();
    
    // Er zou geen vraag 3 moeten zijn (drag-drop wordt gefilterd)
    expect(screen.queryByText("3")).not.toBeInTheDocument();
  });
});
