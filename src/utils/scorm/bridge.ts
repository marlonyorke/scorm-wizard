import type { ScormMessage, ScormResponse } from "./types";

export class ScormBridge {
  private iframe: HTMLIFrameElement | null = null;
  private initialized = false;

  setIframe(iframe: HTMLIFrameElement) {
    this.iframe = iframe;
    this.setupMessageListener();
  }

  private setupMessageListener() {
    window.addEventListener("message", this.handleMessage.bind(this));
  }

  private handleMessage(event: MessageEvent<ScormMessage>) {
    if (event.source !== this.iframe?.contentWindow) {
      return;
    }

    const message = event.data;
    console.log("SCORM Bridge: Received message", message);

    const response: ScormResponse = {
      success: true,
    };

    switch (message.type) {
      case "initialize":
        this.initialized = true;
        break;
      case "getValue":
        // Implement getValue logic
        break;
      case "setValue":
        // Implement setValue logic
        break;
      case "commit":
        // Implement commit logic
        break;
      case "finish":
        this.initialized = false;
        break;
    }

    this.sendResponse(response);
  }

  private sendResponse(response: ScormResponse) {
    if (!this.iframe?.contentWindow) {
      return;
    }

    this.iframe.contentWindow.postMessage(response, "*");
  }

  destroy() {
    window.removeEventListener("message", this.handleMessage.bind(this));
    this.iframe = null;
    this.initialized = false;
  }
}