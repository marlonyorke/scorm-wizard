const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8082',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    // Verhoog de timeout voor commands om te wachten op langzame API-calls
    defaultCommandTimeout: 10000,
    // Verhoog de timeout voor het laden van pagina's
    pageLoadTimeout: 30000,
    // Verhoog de timeout voor het wachten op assertions
    assertionTimeout: 10000,
    // Verhoog de timeout voor het wachten op requests
    requestTimeout: 10000,
  },
  // Configureer de viewport voor de tests
  viewportWidth: 1280,
  viewportHeight: 800,
  // Schakel video's uit voor snellere tests
  video: false,
  // Schakel screenshots in voor gefaalde tests
  screenshotOnRunFailure: true,
});
