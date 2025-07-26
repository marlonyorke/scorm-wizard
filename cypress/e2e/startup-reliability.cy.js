// E2E tests for startup reliability and error handling
describe('Application Startup Reliability', () => {
  beforeEach(() => {
    cy.startupCheck();
  });

  it('should start backend server successfully', () => {
    cy.waitForServer();
    cy.request('http://localhost:3002/health').then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('status', 'healthy');
    });
  });

  it('should start frontend successfully', () => {
    cy.waitForFrontend();
    cy.url().should('include', 'localhost:8082');
  });

  it('should display clear error messages on startup failure', () => {
    // Simulate server failure
    cy.intercept('GET', 'http://localhost:3002/health', {
      statusCode: 500,
      body: { error: 'Server startup failed' }
    });

    cy.visit('http://localhost:8082');
    cy.get('[data-testid="error-message"]').should('contain', 'Server connection failed');
    cy.get('[data-testid="troubleshooting-steps"]').should('be.visible');
  });

  it('should handle network errors gracefully', () => {
    cy.intercept('**', { forceNetworkError: true });
    cy.visit('http://localhost:8082');
    cy.get('[data-testid="offline-message"]').should('be.visible');
  });

  it('should recover from connection issues', () => {
    // Simulate offline
    cy.simulateOffline();
    cy.visit('http://localhost:8082');
    cy.get('[data-testid="offline-status"]').should('contain', 'Offline');

    // Restore network
    cy.restoreNetwork();
    cy.waitForServer();
    cy.get('[data-testid="online-status"]').should('contain', 'Online');
  });
});
