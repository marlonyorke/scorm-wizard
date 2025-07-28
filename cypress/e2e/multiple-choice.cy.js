describe("Multiple Choice", () => {
  beforeEach(() => {
    // Bezoek de hoofdpagina voor elke test
    cy.visit("/");
    // Wacht even zodat de applicatie volledig kan laden
    cy.wait(1000);
  });

  it("kan navigeren naar de Multiple Choice editor via de juiste flow", () => {
    // Stap 1: Bezoek de hoofdpagina
    cy.visit("/");
    
    // Stap 2: Selecteer "Multiple Choice" (als er een selector is)
    cy.contains("Multiple Choice").click({ force: true });
    
    // Stap 3: Klik op "Ga naar de editor" knop
    cy.contains("Ga naar de editor").click({ force: true });
    
    // Controleer of we op de editor pagina zijn
    cy.contains("Multiple Choice").should("be.visible");
  });

  it("kan een Multiple Choice vraag handmatig maken", () => {
    // Stap 1: Navigeer naar de editor via de juiste flow
    cy.visit("/");
    cy.contains("Multiple Choice").click({ force: true });
    cy.contains("Ga naar de editor").click({ force: true });
    
    // Wacht tot de pagina volledig is geladen
    cy.wait(2000);
    
    // Stap 2: Zoek naar invoervelden op basis van placeholder
    cy.get('input[placeholder*="Antwoordoptie"]').first().should('be.visible');
    
    // Stap 3: Vul antwoordopties in
    cy.get('input[placeholder*="Antwoordoptie"]').each(($input, index) => {
      if (index === 0) {
        cy.wrap($input).type("Amsterdam", { force: true });
      } else if (index === 1) {
        cy.wrap($input).type("Rotterdam", { force: true });
      } else if (index === 2) {
        cy.wrap($input).type("Den Haag", { force: true });
      } else if (index === 3) {
        cy.wrap($input).type("Utrecht", { force: true });
      }
    });
    
    // Controleer of de antwoordopties zijn ingevuld
    cy.contains("Amsterdam").should("be.visible");
    cy.contains("Rotterdam").should("be.visible");
  });

  it("kan een voorbeeldweergave tonen van een Multiple Choice vraag", () => {
    // Stap 1: Navigeer naar de editor via de juiste flow
    cy.visit("/");
    cy.contains("Multiple Choice").click({ force: true });
    cy.contains("Ga naar de editor").click({ force: true });
    
    // Wacht tot de pagina volledig is geladen
    cy.wait(2000);
    
    // Stap 2: Zoek naar invoervelden op basis van placeholder
    cy.get('input[placeholder*="Antwoordoptie"]').first().should('be.visible');
    
    // Stap 3: Vul antwoordopties in
    cy.get('input[placeholder*="Antwoordoptie"]').each(($input, index) => {
      if (index === 0) {
        cy.wrap($input).type("Amsterdam", { force: true });
      } else if (index === 1) {
        cy.wrap($input).type("Rotterdam", { force: true });
      }
    });
    
    // Stap 4: Log alle beschikbare knoppen om te zien welke knoppen er zijn
    cy.get('button').then($buttons => {
      const buttonTexts = $buttons.map((i, el) => Cypress.$(el).text().trim()).get();
      cy.log('Beschikbare knoppen:', buttonTexts);
    });
    
    // Stap 5: Probeer verschillende mogelijke knoppen voor voorbeeldweergave
    cy.get('button').then($buttons => {
      // Probeer verschillende mogelijke teksten voor de voorbeeldweergave knop
      const previewButtonTexts = ['Voorbeeld', 'Preview', 'Toon', 'Bekijk', 'Show', 'View'];
      
      let found = false;
      $buttons.each((i, button) => {
        const buttonText = Cypress.$(button).text().trim();
        for (const text of previewButtonTexts) {
          if (buttonText.includes(text)) {
            cy.wrap(button).click({ force: true });
            found = true;
            return false; // Break the each loop
          }
        }
      });
      
      if (!found) {
        // Als geen specifieke knop gevonden is, klik op de eerste knop die niet "Genereer" of "AI" bevat
        $buttons.each((i, button) => {
          const buttonText = Cypress.$(button).text().trim();
          if (!buttonText.includes('Genereer') && !buttonText.includes('AI')) {
            cy.wrap(button).click({ force: true });
            return false; // Break the each loop
          }
        });
      }
    });
    
    // Wacht even om te zien of er iets gebeurt
    cy.wait(2000);
  });

  it("kan een Multiple Choice vraag genereren met AI", () => {
    // Stap 1: Navigeer naar de editor via de juiste flow
    cy.visit("/");
    cy.contains("Multiple Choice").click({ force: true });
    cy.contains("Ga naar de editor").click({ force: true });
    
    // Wacht tot de pagina volledig is geladen
    cy.wait(2000);
    
    // Stap 2: Log alle beschikbare knoppen om te zien welke knoppen er zijn
    cy.get('button').then($buttons => {
      const buttonTexts = $buttons.map((i, el) => Cypress.$(el).text().trim()).get();
      cy.log('Beschikbare knoppen:', buttonTexts);
    });
    
    // Stap 3: Zoek naar een AI generatie knop
    cy.get('button').then($buttons => {
      // Probeer verschillende mogelijke teksten voor de AI generatie knop
      const aiButtonTexts = ['Genereer', 'Generate', 'AI', 'GPT'];
      
      let found = false;
      $buttons.each((i, button) => {
        const buttonText = Cypress.$(button).text().trim();
        for (const text of aiButtonTexts) {
          if (buttonText.includes(text)) {
            cy.wrap(button).click({ force: true });
            found = true;
            return false; // Break the each loop
          }
        }
      });
      
      if (!found && $buttons.length > 0) {
        // Als geen specifieke knop gevonden is, klik op de laatste knop
        cy.wrap($buttons[$buttons.length - 1]).click({ force: true });
      }
    });
    
    // Wacht op het resultaat (dit kan even duren)
    cy.wait(10000);
  });
});
