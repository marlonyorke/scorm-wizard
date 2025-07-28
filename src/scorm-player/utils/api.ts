export class ScormPlayerAPI {
  private initialized: boolean = false;

  initialize(): boolean {
    if (this.initialized) {
      return false;
    }
    this.initialized = true;
    return true;
  }

  terminate(): boolean {
    if (!this.initialized) {
      return false;
    }
    this.initialized = false;
    return true;
  }
}