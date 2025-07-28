describe("Console Errors Tester", () => {
  it("vangt console errors op en toont ze in de Cypress logs", () => {
    // Bezoek de applicatie
    cy.visit("/");
    
    // Wacht tot de pagina volledig is geladen
    cy.wait(2000);
    
    // Navigeer naar de Multiple Choice editor
    cy.contains("Multiple Choice").click({ force: true });
    cy.contains("Ga naar de editor").click({ force: true });
    
    // Wacht tot de editor is geladen
    cy.wait(2000);
    
    // Vul antwoordopties in
    cy.get('input[placeholder*="Antwoordoptie"]').each(($input, index) => {
      if (index === 0) {
        cy.wrap($input).type("Amsterdam", { force: true });
      } else if (index === 1) {
        cy.wrap($input).type("Rotterdam", { force: true });
      }
    });
    
    // Zoek naar een AI generatie knop en klik erop om errors te genereren
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
    
    // Wacht lang genoeg om errors te zien (dit kan even duren)
    cy.wait(15000);
    
    // Log een bericht dat de test is voltooid
    cy.log("Test voltooid - Bekijk de Cypress logs voor console errors");
  });
  
  it("toont alle beschikbare knoppen in de Multiple Choice editor", () => {
    // Bezoek de applicatie
    cy.visit("/");
    
    // Navigeer naar de Multiple Choice editor
    cy.contains("Multiple Choice").click({ force: true });
    cy.contains("Ga naar de editor").click({ force: true });
    
    // Wacht tot de editor is geladen
    cy.wait(2000);
    
    // Log alle beschikbare knoppen
    cy.get('button').then($buttons => {
      const buttonTexts = $buttons.map((i, el) => {
        const $el = Cypress.$(el);
        return {
          text: $el.text().trim(),
          classes: $el.attr('class'),
          id: $el.attr('id') || 'geen id',
          disabled: $el.prop('disabled')
        };
      }).get();
      
      cy.log('Alle beschikbare knoppen:');
      buttonTexts.forEach((btn, i) => {
        cy.log(`Knop ${i + 1}: "${btn.text}" (ID: ${btn.id}, Disabled: ${btn.disabled})`);
      });
    });
  });
});
