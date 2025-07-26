import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { QuestionsProvider, useQuestions } from "../QuestionsContext";

import type { Question } from "@/types/editor";

// Mock voor localStorage
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

// Mock voor crypto.randomUUID
Object.defineProperty(window, "crypto", {
  value: {
    randomUUID: () => "test-uuid",
  },
});

// Mock voor aiService
vi.mock("@/services", () => ({
  aiService: {
    generateQuestions: vi.fn(),
    cancelGeneration: vi.fn(),
  },
}));

// Test component om de context te gebruiken
function TestComponent({ onContextReady }: { onContextReady: (context: any) => void }) {
  const context = useQuestions();
  onContextReady(context);
  return <div>Test Component</div>;
}

describe("QuestionsContext", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("initializes with empty questions array when localStorage is empty", () => {
    let contextValue: any;
    render(
      <QuestionsProvider>
        <TestComponent onContextReady={(context) => {
          contextValue = context; 
        }} />
      </QuestionsProvider>,
    );

    expect(contextValue.questions).toEqual([]);
    expect(contextValue.selectedQuestionTypes).toEqual([]);
    expect(contextValue.currentQuestion).toBeNull();
  });

  it("loads questions from localStorage if available", () => {
    const mockQuestions = [{ id: "1", type: "multiple-choice", name: "Test Question" }];
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === "editor_questions") {
        return JSON.stringify(mockQuestions);
      }
      return null;
    });

    let contextValue: any;
    render(
      <QuestionsProvider>
        <TestComponent onContextReady={(context) => {
          contextValue = context; 
        }} />
      </QuestionsProvider>,
    );

    expect(contextValue.questions).toEqual(mockQuestions);
  });

  it("adds a new question", () => {
    let contextValue: any;
    render(
      <QuestionsProvider>
        <TestComponent onContextReady={(context) => {
          contextValue = context; 
        }} />
      </QuestionsProvider>,
    );

    const newQuestion = { id: "1", type: "multiple-choice", name: "New Question" } as Question;
    
    act(() => {
      contextValue.addQuestion(newQuestion);
    });

    // Controleer of de vraag is toegevoegd door te kijken naar de id, type en name
    expect(contextValue.questions.some((q: Question) => 
      q.id === newQuestion.id && 
      q.type === newQuestion.type && 
      q.name === newQuestion.name,
    )).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledWith("editor_questions", expect.any(String));
  });

  it("updates an existing question", () => {
    const initialQuestions = [
      { id: "1", type: "multiple-choice", name: "Original Question" } as Question,
    ];
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === "editor_questions") {
        return JSON.stringify(initialQuestions);
      }
      return null;
    });

    let contextValue: any;
    render(
      <QuestionsProvider>
        <TestComponent onContextReady={(context) => {
          contextValue = context; 
        }} />
      </QuestionsProvider>,
    );

    const updatedQuestion = { id: "1", type: "multiple-choice", name: "Updated Question" } as Question;
    
    act(() => {
      contextValue.updateQuestion("1", updatedQuestion);
    });

    expect(contextValue.questions[0].name).toBe("Updated Question");
    expect(localStorageMock.setItem).toHaveBeenCalledWith("editor_questions", expect.any(String));
  });

  it("deletes a question", () => {
    const initialQuestions = [
      { id: "1", type: "multiple-choice", name: "Question 1" } as Question,
      { id: "2", type: "matching", name: "Question 2" } as Question,
    ];
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === "editor_questions") {
        return JSON.stringify(initialQuestions);
      }
      return null;
    });

    let contextValue: any;
    render(
      <QuestionsProvider>
        <TestComponent onContextReady={(context) => {
          contextValue = context; 
        }} />
      </QuestionsProvider>,
    );

    act(() => {
      contextValue.deleteQuestion("1");
    });

    expect(contextValue.questions.length).toBe(1);
    expect(contextValue.questions[0].id).toBe("2");
    expect(localStorageMock.setItem).toHaveBeenCalledWith("editor_questions", expect.any(String));
  });

  it("creates an initial question with the correct structure", () => {
    let contextValue: any;
    render(
      <QuestionsProvider>
        <TestComponent onContextReady={(context) => {
          contextValue = context; 
        }} />
      </QuestionsProvider>,
    );

    const initialQuestion = contextValue.createInitialQuestion("multiple-choice");

    expect(initialQuestion.id).toBe("test-uuid");
    expect(initialQuestion.type).toBe("multiple-choice");
    expect(initialQuestion.options).toBeDefined();
    expect(Array.isArray(initialQuestion.options)).toBe(true);
  });
});
