import type { SCORMAPI } from "@/utils/scormAPI";

export interface ScormState {
  initialized: boolean;
  score: number;
  status: "not attempted" | "incomplete" | "completed" | "failed" | "passed";
  suspendData: string;
  api: SCORMAPI | null;
  error: string | null;
}

export interface ScormContextType {
  state: ScormState;
  initialize: () => void;
  terminate: () => void;
  setScore: (score: number) => void;
  setStatus: (status: ScormState["status"]) => void;
  setSuspendData: (data: string) => void;
  getApi: () => SCORMAPI | null;
}