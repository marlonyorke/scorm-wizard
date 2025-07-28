import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";

import QuestionTypeSelection from "../QuestionTypeSelection";

// Mock de navigate functie
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Mock window.location.href
const originalLocation = window.location;
delete window.location;
window.location = { ...originalLocation, href: "" } as unknown as Location;

describe("QuestionTypeSelection Component", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    window.location.href = "";
  });

  it("renders all question types", () => {
    render(
      <BrowserRouter>
        <QuestionTypeSelection />
      </BrowserRouter>,
    );
    
    // Controleer of alle vraagtypes worden weergegeven
    expect(screen.getByText("Multiple Choice")).toBeInTheDocument();
    expect(screen.getByText("Drag and Drop")).toBeInTheDocument();
    expect(screen.getByText("Matching")).toBeInTheDocument();
    expect(screen.getByText("Hotspot")).toBeInTheDocument();
    expect(screen.getByText("Open Vraag")).toBeInTheDocument();
    expect(screen.getByText("Volgorde")).toBeInTheDocument();
    expect(screen.getByText("Mark the Words")).toBeInTheDocument();
    expect(screen.getByText("Interactieve Video")).toBeInTheDocument();
  });

  it("allows selecting and deselecting question types", () => {
    render(
      <BrowserRouter>
        <QuestionTypeSelection />
      </BrowserRouter>,
    );
    
    // Selecteer een vraagtype
    const multipleChoiceCard = screen.getByText("Multiple Choice").closest(".cursor-pointer");
    fireEvent.click(multipleChoiceCard!);
    
    // Controleer of de kaart geselecteerd is (heeft een ring)
    expect(multipleChoiceCard).toHaveClass("ring-2");
    
    // Deselecteer het vraagtype
    fireEvent.click(multipleChoiceCard!);
    
    // Controleer of de kaart niet meer geselecteerd is
    expect(multipleChoiceCard).not.toHaveClass("ring-2");
  });

  it("enables the editor button when at least one type is selected", () => {
    render(
      <BrowserRouter>
        <QuestionTypeSelection />
      </BrowserRouter>,
    );
    
    // De knop zou uitgeschakeld moeten zijn bij het begin
    const editorButton = screen.getByText("Ga naar de editor").closest("button");
    expect(editorButton).toBeDisabled();
    
    // Selecteer een vraagtype
    const multipleChoiceCard = screen.getByText("Multiple Choice").closest(".cursor-pointer");
    fireEvent.click(multipleChoiceCard!);
    
    // De knop zou nu ingeschakeld moeten zijn
    expect(editorButton).not.toBeDisabled();
  });

  it("saves selected types to localStorage and navigates to editor", () => {
    render(
      <BrowserRouter>
        <QuestionTypeSelection />
      </BrowserRouter>,
    );
    
    // Selecteer een vraagtype
    const multipleChoiceCard = screen.getByText("Multiple Choice").closest(".cursor-pointer");
    fireEvent.click(multipleChoiceCard!);
    
    // Klik op de editor knop
    const editorButton = screen.getByText("Ga naar de editor");
    fireEvent.click(editorButton);
    
    // Controleer of localStorage is bijgewerkt
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "editor_selected_types", 
      JSON.stringify(["multiple-choice"]),
    );
    
    // Controleer of de navigatie plaatsvond
    expect(window.location.href).toBe("/editor");
  });

  it("navigates to AI editor with multiple-choice preset", () => {
    render(
      <BrowserRouter>
        <QuestionTypeSelection />
      </BrowserRouter>,
    );
    
    // Klik op de AI Generator knop
    const aiButton = screen.getByText("AI Vragengenerator");
    fireEvent.click(aiButton);
    
    // Controleer of localStorage is bijgewerkt met multiple-choice
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "editor_selected_types", 
      JSON.stringify(["multiple-choice"]),
    );
    
    // Controleer of de navigatie plaatsvond
    expect(window.location.href).toBe("/editor");
  });
});
