/**
 * Setup voor mock services in tests
 * 
 * Dit bestand bevat functies voor het configureren van mock services voor tests.
 * Het zorgt ervoor dat tests gebruik maken van mock data in plaats van echte API calls.
 */

import type { MockableService } from "@/config/mock-config";
import mockConfig from "@/config/mock-config";

/**
 * Schakel alle mock services in voor tests
 */
export function setupAllMocks(): void {
  mockConfig.enableAll(true); // true = testOnly
}

/**
 * Schakel specifieke mock service in voor tests
 * @param service De service om in te schakelen
 */
export function setupMock(service: MockableService): void {
  mockConfig.enable(service, true); // true = testOnly
}

/**
 * Schakel alle mock services uit na tests
 */
export function teardownAllMocks(): void {
  mockConfig.disableAll();
}

/**
 * Schakel specifieke mock service uit na tests
 * @param service De service om uit te schakelen
 */
export function teardownMock(service: MockableService): void {
  mockConfig.disable(service);
}

/**
 * Reset alle mock configuraties
 */
export function resetMocks(): void {
  mockConfig.reset();
}

/**
 * Voeg deze functies toe aan de globale beforeEach en afterEach hooks in jest/vitest
 * @param services De services om te mocken (standaard alle services)
 */
export function setupGlobalMocks(services?: MockableService[]): void {
  // Deze functie moet worden aangeroepen in een context waar beforeEach en afterEach beschikbaar zijn
  // zoals in een test bestand of in de globale setup
  if (typeof globalThis.beforeEach === "function") {
    globalThis.beforeEach(() => {
      if (services && services.length > 0) {
        services.forEach((service) => setupMock(service));
      } else {
        setupAllMocks();
      }
    });
  }
  
  if (typeof globalThis.afterEach === "function") {
    globalThis.afterEach(() => {
      resetMocks();
    });
  }
}

export default {
  setupAllMocks,
  setupMock,
  teardownAllMocks,
  teardownMock,
  resetMocks,
  setupGlobalMocks,
};
