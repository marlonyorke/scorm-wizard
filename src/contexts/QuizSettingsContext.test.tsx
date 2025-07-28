import { render, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { QuizSettingsProvider, useQuizSettings } from "./QuizSettingsContext";

import { DEFAULT_QUIZ_SETTINGS } from "@/types/quiz-settings";

// Mock the toast hook
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Test component that uses the context
const TestComponent = () => {
  const { settings, setQuizSettings, resetQuizSettings } = useQuizSettings();
  return (
    <div>
      <div data-testid="settings">{JSON.stringify(settings)}</div>
      <button
        onClick={() => setQuizSettings({ level: "HAVO" })}
        data-testid="update-btn"
      >
        Update
      </button>
      <button onClick={resetQuizSettings} data-testid="reset-btn">
        Reset
      </button>
    </div>
  );
};

describe("QuizSettingsContext", () => {
  it("should provide default settings", () => {
    const { getByTestId } = render(
      <QuizSettingsProvider>
        <TestComponent />
      </QuizSettingsProvider>,
    );

    expect(JSON.parse(getByTestId("settings").textContent || "")).toEqual(
      DEFAULT_QUIZ_SETTINGS,
    );
  });

  it("should update settings", () => {
    const { getByTestId } = render(
      <QuizSettingsProvider>
        <TestComponent />
      </QuizSettingsProvider>,
    );

    act(() => {
      getByTestId("update-btn").click();
    });

    const settings = JSON.parse(getByTestId("settings").textContent || "");
    expect(settings.level).toBe("HAVO");
  });

  it("should reset settings", () => {
    const { getByTestId } = render(
      <QuizSettingsProvider>
        <TestComponent />
      </QuizSettingsProvider>,
    );

    // First update settings
    act(() => {
      getByTestId("update-btn").click();
    });

    // Then reset
    act(() => {
      getByTestId("reset-btn").click();
    });

    expect(JSON.parse(getByTestId("settings").textContent || "")).toEqual(
      DEFAULT_QUIZ_SETTINGS,
    );
  });
});