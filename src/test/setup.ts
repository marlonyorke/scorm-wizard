import "@testing-library/jest-dom";
import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { expect, afterEach, beforeEach, vi } from "vitest";

import { setupAllMocks, resetMocks } from "./mock-setup";

import { MockableService } from "@/config/mock-config";

expect.extend(matchers);

// Maak vi globaal beschikbaar als vervanging voor jest
global.vi = vi;

// Setup mock services voor alle tests
beforeEach(() => {
  // Schakel alle mock services in voor tests
  setupAllMocks();
});

// Runs a cleanup after each test case
afterEach(() => {
  cleanup();
  
  // Reset alle mock configuraties na elke test
  resetMocks();
});
