// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Enhanced error handling for Cypress tests
Cypress.on('uncaught:exception', (err, runnable) => {
  console.error('Uncaught exception in test:', err.message);
  return false; // Prevent test failure
});

// Wait for server startup
Cypress.Commands.add('waitForServer', (timeout = 60000) => {
  cy.request({
    url: 'http://localhost:3002/health',
    timeout,
    retryOnStatusCodeFailure: true,
    retryOnNetworkFailure: true
  }).its('status').should('equal', 200);
});

// Wait for frontend
Cypress.Commands.add('waitForFrontend', (timeout = 60000) => {
  cy.visit('http://localhost:8082', { timeout });
  cy.get('body').should('be.visible');
});

// Startup check
Cypress.Commands.add('startupCheck', () => {
  cy.log('Checking server health...');
  cy.waitForServer();
  cy.log('Checking frontend availability...');
  cy.waitForFrontend();
  cy.log('Application startup completed successfully');
});

// Voeg hier eventuele aangepaste commando's toe die je in al je tests wilt gebruiken

// Configuratie voor langere timeouts voor API calls
Cypress.config('defaultCommandTimeout', 10000);
Cypress.config('pageLoadTimeout', 30000);
Cypress.config('requestTimeout', 30000);

// Voorkom dat Cypress stopt bij onverwachte fouten
Cypress.on('uncaught:exception', (err, runnable) => {
  // Retourneer false om te voorkomen dat Cypress faalt bij onverwachte fouten
  console.log('Uncaught exception:', err.message);
  return false;
});

// Vang console errors op en log ze naar Cypress
Cypress.on('window:before:load', (win) => {
  // Bewaar de originele console methodes
  const originalConsoleError = win.console.error;
  const originalConsoleWarn = win.console.warn;

  // Overschrijf console.error
  win.console.error = (...args) => {
    // Log naar Cypress
    Cypress.log({
      name: 'Console Error',
      message: args.join(' '),
      consoleProps: () => {
        return {
          Error: args
        };
      }
    });
    // Roep de originele methode aan
    originalConsoleError.apply(win.console, args);
  };

  // Overschrijf console.warn
  win.console.warn = (...args) => {
    // Log naar Cypress
    Cypress.log({
      name: 'Console Warning',
      message: args.join(' '),
      consoleProps: () => {
        return {
          Warning: args
        };
      }
    });
    // Roep de originele methode aan
    originalConsoleWarn.apply(win.console, args);
  };
});
