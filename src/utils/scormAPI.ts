import { SCORM_ERROR_CODES, ERROR_MESSAGES } from "./scorm/constants";
import type { ScormStatus } from "./scorm/types";
import { validateScore, validateStatus } from "./scorm/validation";

export class SCORMAPI {
  private initialized: boolean = false;
  private terminated: boolean = false;
  private lastError: string = SCORM_ERROR_CODES.NO_ERROR;
  private studentData: {
    score: number;
    status: ScormStatus;
    suspend_data: string;
  };

  constructor() {
    this.studentData = {
      score: 0,
      status: "not attempted",
      suspend_data: "",
    };
    
    window.addEventListener("message", this.handleMessage.bind(this));
  }

  private handleMessage(event: MessageEvent) {
    if (event.source !== window.parent) {
      return;
    }

    const { type, data } = event.data;
    console.log("SCORM API: Received message", { type, data });
  }

  private sendToParent(type: string, data?: any) {
    window.parent.postMessage({ type, data }, "*");
  }

  LMSInitialize(str: string = ""): "true" | "false" {
    if (this.initialized) {
      this.lastError = SCORM_ERROR_CODES.GENERAL_INIT_FAILURE;
      return "false";
    }
    
    this.sendToParent("initialize");
    this.initialized = true;
    this.terminated = false;
    this.lastError = SCORM_ERROR_CODES.NO_ERROR;
    return "true";
  }

  LMSFinish(str: string = ""): "true" | "false" {
    if (!this.initialized || this.terminated) {
      this.lastError = SCORM_ERROR_CODES.NOT_INITIALIZED;
      return "false";
    }
    
    this.sendToParent("finish");
    this.terminated = true;
    this.initialized = false;
    return "true";
  }

  LMSGetValue(element: string): string {
    if (!this.initialized || this.terminated) {
      this.lastError = SCORM_ERROR_CODES.NOT_INITIALIZED;
      return "";
    }

    this.sendToParent("getValue", { element });

    switch (element) {
      case "cmi.core.score.raw":
        return this.studentData.score.toString();
      case "cmi.core.lesson_status":
        return this.studentData.status;
      case "cmi.suspend_data":
        return this.studentData.suspend_data;
      default:
        this.lastError = SCORM_ERROR_CODES.NOT_IMPLEMENTED;
        return "";
    }
  }

  LMSSetValue(element: string, value: string): "true" | "false" {
    if (!this.initialized || this.terminated) {
      this.lastError = SCORM_ERROR_CODES.NOT_INITIALIZED;
      return "false";
    }

    this.sendToParent("setValue", { element, value });

    switch (element) {
      case "cmi.core.score.raw":
        if (!validateScore(value)) {
          this.lastError = SCORM_ERROR_CODES.INCORRECT_DATA_TYPE;
          return "false";
        }
        this.studentData.score = parseInt(value);
        break;
      case "cmi.core.lesson_status":
        if (!validateStatus(value)) {
          this.lastError = SCORM_ERROR_CODES.INCORRECT_DATA_TYPE;
          return "false";
        }
        this.studentData.status = value as ScormStatus;
        break;
      case "cmi.suspend_data":
        this.studentData.suspend_data = value;
        break;
      default:
        this.lastError = SCORM_ERROR_CODES.NOT_IMPLEMENTED;
        return "false";
    }

    this.lastError = SCORM_ERROR_CODES.NO_ERROR;
    return "true";
  }

  LMSCommit(str: string = ""): "true" | "false" {
    if (!this.initialized || this.terminated) {
      this.lastError = SCORM_ERROR_CODES.NOT_INITIALIZED;
      return "false";
    }
    
    this.sendToParent("commit");
    return "true";
  }

  LMSGetLastError(): string {
    return this.lastError;
  }

  LMSGetErrorString(errorCode: string): string {
    return ERROR_MESSAGES[errorCode as keyof typeof ERROR_MESSAGES] || "Unknown error";
  }

  LMSGetDiagnostic(errorCode: string = ""): string {
    return this.LMSGetErrorString(errorCode || this.lastError);
  }
}