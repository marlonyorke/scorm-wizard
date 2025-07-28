export type ScormStatus = "not attempted" | "incomplete" | "completed" | "failed" | "passed";

export type ScormMessage = {
  type: "initialize" | "getValue" | "setValue" | "commit" | "finish";
  data?: {
    element?: string;
    value?: string;
  };
};

export type ScormResponse = {
  success: boolean;
  data?: any;
  error?: string;
};

export type ScormState = {
  initialized: boolean;
  score: number;
  status: ScormStatus;
  suspendData: string;
  error: string | null;
};