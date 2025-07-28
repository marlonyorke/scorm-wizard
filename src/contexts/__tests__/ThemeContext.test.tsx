import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { ThemeProvider, useTheme, ThemeInitializer, ThemeType } from "../ThemeContext";

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

// Installeer de localStorage mock
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Mock voor document.documentElement.classList
const classListMock = {
  add: vi.fn(),
  remove: vi.fn(),
  contains: vi.fn(() => false),
  toggle: vi.fn(),
  replace: vi.fn(),
  item: vi.fn(() => null),
  value: "",
  length: 0,
  forEach: vi.fn(),
  entries: vi.fn(() => [][Symbol.iterator]()),
  keys: vi.fn(() => [][Symbol.iterator]()),
  values: vi.fn(() => [][Symbol.iterator]()),
  [Symbol.iterator]: () => [][Symbol.iterator](),
  toString: vi.fn(() => ""),
  supports: vi.fn(() => true),
};

// Installeer de classList mock
Object.defineProperty(document.documentElement, "classList", { value: classListMock, writable: true });

// Reset alle mocks voor elke test
beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});

// Test component die de ThemeContext gebruikt
function TestComponent() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div data-testid="theme-test-component">
      <div data-testid="current-theme">{theme}</div>
      <button 
        data-testid="toggle-theme" 
        onClick={() => toggleTheme()}
      >
        Toggle Theme
      </button>
    </div>
  );
}

describe("ThemeContext", () => {
  it("provides default theme value", () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );
    
    // Default theme should be 'light'
    expect(screen.getByTestId("current-theme").textContent).toBe("light");
  });

  it("cycles through themes when toggleTheme is called", () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );
    
    // Check initial state (light)
    expect(screen.getByTestId("current-theme").textContent).toBe("light");
    
    // Toggle to dark theme
    fireEvent.click(screen.getByTestId("toggle-theme"));
    expect(screen.getByTestId("current-theme").textContent).toBe("dark");
    
    // Toggle to neon theme
    fireEvent.click(screen.getByTestId("toggle-theme"));
    expect(screen.getByTestId("current-theme").textContent).toBe("neon");
    
    // Toggle back to light theme
    fireEvent.click(screen.getByTestId("toggle-theme"));
    expect(screen.getByTestId("current-theme").textContent).toBe("light");
  });

  it("applies the correct CSS classes when theme changes", () => {
    render(
      <ThemeProvider>
        <TestComponent />
        <ThemeInitializer />
      </ThemeProvider>,
    );
    
    // Check initial state (light theme)
    expect(classListMock.add).toHaveBeenCalledWith("light-mode");
    
    // Toggle to dark theme
    fireEvent.click(screen.getByTestId("toggle-theme"));
    expect(classListMock.remove).toHaveBeenCalledWith("light-mode", "dark-mode", "theme-neon");
    expect(classListMock.add).toHaveBeenCalledWith("dark-mode");
    
    // Toggle to neon theme
    fireEvent.click(screen.getByTestId("toggle-theme"));
    expect(classListMock.remove).toHaveBeenCalledWith("light-mode", "dark-mode", "theme-neon");
    expect(classListMock.add).toHaveBeenCalledWith("theme-neon");
  });

  it("loads theme from localStorage on initialization", () => {
    // Set initial theme in localStorage
    localStorageMock.setItem("theme", "neon");
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );
    
    // Theme should be loaded from localStorage
    expect(screen.getByTestId("current-theme").textContent).toBe("neon");
  });

  it("saves theme to localStorage when changed", () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );
    
    // Toggle to dark theme
    fireEvent.click(screen.getByTestId("toggle-theme"));
    
    // Check if theme was saved to localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith("theme", "dark");
    
    // Toggle to neon theme
    fireEvent.click(screen.getByTestId("toggle-theme"));
    
    // Check if theme was saved to localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith("theme", "neon");
  });
});
