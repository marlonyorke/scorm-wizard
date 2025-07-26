// Visual regression tests with screenshots
describe('Visual Regression Tests', () => {
  beforeEach(() => {
    cy.startupCheck();
  });

  it('should match homepage screenshot', () => {
    cy.visit('http://localhost:8082');
    cy.matchImageSnapshot('homepage');
  });

  it('should match question creation page screenshot', () => {
    cy.visit('http://localhost:8082');
    cy.get('[data-testid="create-question-btn"]').click();
    cy.matchImageSnapshot('question-creation');
  });

  it('should match editor page screenshot', () => {
    cy.visit('http://localhost:8082/editor');
    cy.matchImageSnapshot('editor-page');
  });

  it('should match SCORM export page screenshot', () => {
    cy.visit('http://localhost:8082');
    cy.get('[data-testid="export-scorm-btn"]').click();
    cy.matchImageSnapshot('scorm-export');
  });

  it('should match error state screenshots', () => {
    cy.intercept('GET', 'http://localhost:3002/api/**', {
      statusCode: 500,
      body: { error: 'Server error' }
    });

    cy.visit('http://localhost:8082');
    cy.matchImageSnapshot('error-state');
  });
});
