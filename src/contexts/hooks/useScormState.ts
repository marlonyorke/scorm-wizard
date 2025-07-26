import { useState, useCallback } from "react";

import type { ScormState } from "../types/scorm";

import { SCORMAPI } from "@/utils/scormAPI";

export const useScormState = () => {
  const [state, setState] = useState<ScormState>({
    initialized: false,
    score: 0,
    status: "not attempted",
    suspendData: "",
    api: null,
    error: null,
  });

  const initialize = useCallback(() => {
    try {
      const api = new SCORMAPI();
      const success = api.LMSInitialize("");
      
      if (success === "true") {
        setState((prev) => ({ 
          ...prev, 
          initialized: true,
          api,
          error: null,
        }));
        console.log("SCORM: Initialized successfully");
      } else {
        throw new Error("Failed to initialize SCORM API");
      }
    } catch (error) {
      setState((prev) => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : "Unknown error during initialization",
      }));
      console.error("SCORM: Initialization failed:", error);
    }
  }, []);

  const terminate = useCallback(() => {
    if (state.api) {
      const success = state.api.LMSFinish("");
      if (success === "true") {
        setState((prev) => ({ 
          ...prev, 
          initialized: false,
          api: null, 
        }));
        console.log("SCORM: Terminated successfully");
      } else {
        console.error("SCORM: Termination failed");
      }
    }
  }, [state.api]);

  const setScore = useCallback((score: number) => {
    if (state.api) {
      const success = state.api.LMSSetValue("cmi.core.score.raw", score.toString());
      if (success === "true") {
        setState((prev) => ({ ...prev, score }));
        state.api.LMSCommit("");
        console.log("SCORM: Score updated:", score);
      }
    }
  }, [state.api]);

  const setStatus = useCallback((status: ScormState["status"]) => {
    if (state.api) {
      const success = state.api.LMSSetValue("cmi.core.lesson_status", status);
      if (success === "true") {
        setState((prev) => ({ ...prev, status }));
        state.api.LMSCommit("");
        console.log("SCORM: Status updated:", status);
      }
    }
  }, [state.api]);

  const setSuspendData = useCallback((data: string) => {
    if (state.api) {
      const success = state.api.LMSSetValue("cmi.suspend_data", data);
      if (success === "true") {
        setState((prev) => ({ ...prev, suspendData: data }));
        state.api.LMSCommit("");
        console.log("SCORM: Suspend data updated:", data);
      }
    }
  }, [state.api]);

  const getApi = useCallback(() => state.api, [state.api]);

  return {
    state,
    initialize,
    terminate,
    setScore,
    setStatus,
    setSuspendData,
    getApi,
  };
};