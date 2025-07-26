import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { ScormProvider, useScorm } from "../ScormContext";

import { SCORM_ERROR_CODES } from "@/utils/scorm/constants";

// Mock voor de SCORM API
vi.mock("@/utils/scormAPI", () => {
  return {
    SCORMAPI: vi.fn().mockImplementation(() => ({
      LMSInitialize: vi.fn().mockReturnValue("true"),
      LMSFinish: vi.fn().mockReturnValue("true"),
      LMSGetValue: vi.fn((element) => {
        switch (element) {
          case "cmi.core.score.raw":
            return "0";
          case "cmi.core.lesson_status":
            return "not attempted";
          case "cmi.suspend_data":
            return "";
          default:
            return "";
        }
      }),
      LMSSetValue: vi.fn().mockReturnValue("true"),
      LMSCommit: vi.fn().mockReturnValue("true"),
      LMSGetLastError: vi.fn().mockReturnValue(SCORM_ERROR_CODES.NO_ERROR),
      LMSGetErrorString: vi.fn().mockReturnValue("No error"),
      LMSGetDiagnostic: vi.fn().mockReturnValue("No error"),
    })),
  };
});

// Test component om de context te gebruiken
function TestComponent() {
  const { state, initialize, terminate, setScore, setStatus, setSuspendData } = useScorm();
  
  return (
    <div data-testid="scorm-test-component">
      <div data-testid="initialized">{state.initialized ? "true" : "false"}</div>
      <div data-testid="score">{state.score}</div>
      <div data-testid="status">{state.status}</div>
      <div data-testid="suspend-data">{state.suspendData}</div>
      <div data-testid="error">{state.error || "no error"}</div>
      <button data-testid="initialize-btn" onClick={initialize}>Initialize</button>
      <button data-testid="terminate-btn" onClick={terminate}>Terminate</button>
      <button data-testid="set-score-btn" onClick={() => setScore(85)}>Set Score 85</button>
      <button data-testid="set-status-btn" onClick={() => setStatus("completed")}>Set Status Completed</button>
      <button data-testid="set-suspend-data-btn" onClick={() => setSuspendData("test-data")}>Set Suspend Data</button>
    </div>
  );
}

describe("ScormContext", () => {
  // Spy op console.log en console.error om output te voorkomen
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("initializes with default state", () => {
    render(
      <ScormProvider>
        <TestComponent />
      </ScormProvider>,
    );
    
    // Controleer de initiële staat
    expect(screen.getByTestId("initialized").textContent).toBe("false");
    expect(screen.getByTestId("score").textContent).toBe("0");
    expect(screen.getByTestId("status").textContent).toBe("not attempted");
    expect(screen.getByTestId("suspend-data").textContent).toBe("");
    expect(screen.getByTestId("error").textContent).toBe("no error");
  });
  
  it("initializes SCORM API when initialize is called", () => {
    render(
      <ScormProvider>
        <TestComponent />
      </ScormProvider>,
    );
    
    // Initialiseer de SCORM API
    fireEvent.click(screen.getByTestId("initialize-btn"));
    
    // Controleer of de staat is bijgewerkt
    expect(screen.getByTestId("initialized").textContent).toBe("true");
  });
  
  it("terminates SCORM API when terminate is called", () => {
    render(
      <ScormProvider>
        <TestComponent />
      </ScormProvider>,
    );
    
    // Initialiseer de SCORM API
    fireEvent.click(screen.getByTestId("initialize-btn"));
    
    // Beëindig de SCORM API
    fireEvent.click(screen.getByTestId("terminate-btn"));
    
    // Controleer of de staat is bijgewerkt
    expect(screen.getByTestId("initialized").textContent).toBe("false");
  });
  
  it("updates score when setScore is called", () => {
    render(
      <ScormProvider>
        <TestComponent />
      </ScormProvider>,
    );
    
    // Initialiseer de SCORM API
    fireEvent.click(screen.getByTestId("initialize-btn"));
    
    // Update de score
    fireEvent.click(screen.getByTestId("set-score-btn"));
    
    // Controleer of de score is bijgewerkt
    expect(screen.getByTestId("score").textContent).toBe("85");
  });
  
  it("updates status when setStatus is called", () => {
    render(
      <ScormProvider>
        <TestComponent />
      </ScormProvider>,
    );
    
    // Initialiseer de SCORM API
    fireEvent.click(screen.getByTestId("initialize-btn"));
    
    // Update de status
    fireEvent.click(screen.getByTestId("set-status-btn"));
    
    // Controleer of de status is bijgewerkt
    expect(screen.getByTestId("status").textContent).toBe("completed");
  });
  
  it("updates suspend data when setSuspendData is called", () => {
    render(
      <ScormProvider>
        <TestComponent />
      </ScormProvider>,
    );
    
    // Initialiseer de SCORM API
    fireEvent.click(screen.getByTestId("initialize-btn"));
    
    // Update de suspend data
    fireEvent.click(screen.getByTestId("set-suspend-data-btn"));
    
    // Controleer of de suspend data is bijgewerkt
    expect(screen.getByTestId("suspend-data").textContent).toBe("test-data");
  });
});
