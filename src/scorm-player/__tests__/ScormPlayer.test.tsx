import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import ScormPlayer from "../ScormPlayer";

import * as ScormContext from "@/contexts/ScormContext";
import type { ScormContextType } from "@/contexts/types/scorm";
import type { SCORMAPI } from "@/utils/scormAPI";

// Mock JSZip
vi.mock("jszip", () => ({
  default: vi.fn().mockImplementation(() => ({
    loadAsync: vi.fn().mockResolvedValue({
      files: {},
    }),
  })),
}));

// Mock the ScormBridge
vi.mock("@/utils/scorm/bridge", () => ({
  ScormBridge: vi.fn().mockImplementation(() => ({
    // Mock methods if needed
  })),
}));

// Create mock functions for the context
const mockInitialize = vi.fn();
const mockTerminate = vi.fn();
const mockSetScore = vi.fn();
const mockSetStatus = vi.fn();
const mockSetSuspendData = vi.fn();
const mockGetApi = vi.fn();

// Create a mock SCORM API
const mockApi = {
  LMSInitialize: vi.fn().mockReturnValue("true"),
  LMSFinish: vi.fn().mockReturnValue("true"),
  LMSSetValue: vi.fn().mockReturnValue("true"),
  LMSCommit: vi.fn().mockReturnValue("true"),
  LMSGetValue: vi.fn().mockReturnValue(""),
  LMSGetLastError: vi.fn().mockReturnValue("0"),
  LMSGetErrorString: vi.fn().mockReturnValue(""),
  LMSGetDiagnostic: vi.fn().mockReturnValue(""),
} as unknown as SCORMAPI;

// Create a mock context value
const mockContextValue: ScormContextType = {
  state: {
    initialized: true,
    score: 0,
    status: "not attempted",
    suspendData: "",
    api: mockApi,
    error: null,
  },
  initialize: mockInitialize,
  terminate: mockTerminate,
  setScore: mockSetScore,
  setStatus: mockSetStatus,
  setSuspendData: mockSetSuspendData,
  getApi: mockGetApi,
};

// Mock the useScorm hook
vi.mock("@/contexts/ScormContext", () => ({
  useScorm: () => mockContextValue,
  ScormProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe("ScormPlayer", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up after each test
    vi.resetAllMocks();
  });

  it("renders the ScormPlayer component", () => {
    render(<ScormPlayer />);
    
    // Check if the component renders with the title
    expect(screen.getByText("SCORM Player")).toBeInTheDocument();
  });

  it("displays the current score and status", () => {
    render(<ScormPlayer />);
    
    // Check if the score and status are displayed
    expect(screen.getByText("Status:")).toBeInTheDocument();
    expect(screen.getByText("Score:")).toBeInTheDocument();
  });

  it("sets score when test score button is clicked", () => {
    render(<ScormPlayer />);

    // Find and click the test score button
    const scoreButton = screen.getByTestId("test-score");
    fireEvent.click(scoreButton);

    // The setScore function should be called
    expect(mockSetScore).toHaveBeenCalled();
  });

  it("sets status when test status button is clicked", () => {
    render(<ScormPlayer />);

    // Find and click the test status button
    const statusButton = screen.getByTestId("test-status");
    fireEvent.click(statusButton);

    // The setStatus function should be called
    expect(mockSetStatus).toHaveBeenCalled();
  });

  it("sets suspend data when test suspend data button is clicked", () => {
    render(<ScormPlayer />);

    // Find and click the test suspend data button
    const suspendButton = screen.getByTestId("test-suspend-data");
    fireEvent.click(suspendButton);

    // The setSuspendData function should be called
    expect(mockSetSuspendData).toHaveBeenCalled();
  });
});