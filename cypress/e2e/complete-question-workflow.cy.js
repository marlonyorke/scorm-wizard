describe("Volledige workflow voor het maken en bewerken van vragen", () => {
  beforeEach(() => {
    // Bezoek de applicatie
    cy.visit("/");
    
    // Wacht tot de pagina volledig is geladen
    cy.wait(2000);
  });

  it("Kan een Multiple Choice vraag maken, bewerken en voorvertonen", () => {
    // Navigeer naar de Multiple Choice editor
    cy.contains("Multiple Choice").click({ force: true });
    cy.contains("Ga naar de editor").click({ force: true });
    
    // Wacht tot de editor is geladen
    cy.wait(2000);
    
    // Vul de vraag in
    cy.get('input[placeholder*="Voer je vraag in"]').type("Wat is de hoofdstad van Nederland?", { force: true });
    
    // Vul antwoordopties in
    cy.get('input[placeholder*="Antwoordoptie"]').each(($input, index) => {
      if (index === 0) {
        cy.wrap($input).type("Amsterdam", { force: true });
        // Markeer als correct antwoord
        cy.get('input[type="radio"]').eq(0).check({ force: true });
      } else if (index === 1) {
        cy.wrap($input).type("Rotterdam", { force: true });
      } else if (index === 2) {
        cy.wrap($input).type("Den Haag", { force: true });
      } else if (index === 3) {
        cy.wrap($input).type("Utrecht", { force: true });
      }
    });
    
    // Voeg feedback toe
    cy.get('textarea[placeholder*="Feedback"]').type("Amsterdam is de hoofdstad van Nederland, hoewel Den Haag de regeringszetel is.", { force: true });
    
    // Zoek naar een voorbeeldweergave knop en klik erop
    cy.get('button').then($buttons => {
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
        cy.log("Geen voorbeeldweergave knop gevonden, probeer alternatieve methode");
        // Zoek naar knoppen met specifieke classes die kunnen wijzen op een preview knop
        cy.get('button[class*="preview"], button[class*="Preview"]').first().click({ force: true });
      }
    });
    
    // Controleer of de voorbeeldweergave correct wordt getoond
    cy.wait(1000);
    cy.contains("Wat is de hoofdstad van Nederland?").should("be.visible");
    cy.contains("Amsterdam").should("be.visible");
    
    // Sluit de voorbeeldweergave
    cy.get('button').then($buttons => {
      const closeButtonTexts = ['Sluiten', 'Close', 'Terug', 'Back'];
      
      let found = false;
      $buttons.each((i, button) => {
        const buttonText = Cypress.$(button).text().trim();
        for (const text of closeButtonTexts) {
          if (buttonText.includes(text)) {
            cy.wrap(button).click({ force: true });
            found = true;
            return false; // Break the each loop
          }
        }
      });
      
      if (!found) {
        // Als geen specifieke sluitknop gevonden is, probeer de escape toets
        cy.get('body').type('{esc}', { force: true });
      }
    });
    
    // Bewerk de vraag
    cy.get('input[placeholder*="Voer je vraag in"]').clear({ force: true }).type("Wat is de grootste stad van Nederland?", { force: true });
    
    // Sla de vraag op
    cy.get('button').then($buttons => {
      const saveButtonTexts = ['Opslaan', 'Save', 'Bewaren'];
      
      let found = false;
      $buttons.each((i, button) => {
        const buttonText = Cypress.$(button).text().trim();
        for (const text of saveButtonTexts) {
          if (buttonText.includes(text)) {
            cy.wrap(button).click({ force: true });
            found = true;
            return false; // Break the each loop
          }
        }
      });
      
      if (!found && $buttons.length > 0) {
        // Als geen specifieke knop gevonden is, probeer een knop met een save icon
        cy.get('button[class*="save"], button[class*="Save"]').first().click({ force: true });
      }
    });
    
    // Controleer of de vraag is opgeslagen (kan variëren afhankelijk van de UI feedback)
    cy.wait(1000);
    cy.contains("Wat is de grootste stad van Nederland?").should("be.visible");
    
    cy.log("Multiple Choice vraag workflow test voltooid");
  });

  it("Kan een Mark Words vraag maken, bewerken en voorvertonen", () => {
    // Navigeer naar de Mark Words editor
    cy.contains("Mark Words").click({ force: true });
    cy.contains("Ga naar de editor").click({ force: true });
    
    // Wacht tot de editor is geladen
    cy.wait(2000);
    
    // Vul de instructie in
    cy.get('input[placeholder*="instructie"], input[placeholder*="Instructie"]').type("Markeer alle lidwoorden in de volgende zin:", { force: true });
    
    // Vul de tekst in
    cy.get('textarea').type("De kat zit op een mat onder het raam.", { force: true });
    
    // Markeer woorden als correct
    cy.contains("De").click({ force: true });
    cy.contains("een").click({ force: true });
    cy.contains("het").click({ force: true });
    
    // Voeg feedback toe als beschikbaar
    cy.get('textarea[placeholder*="Feedback"]').then($feedback => {
      if ($feedback.length > 0) {
        cy.wrap($feedback).type("Lidwoorden in het Nederlands zijn: de, het, een.", { force: true });
      }
    });
    
    // Zoek naar een voorbeeldweergave knop en klik erop
    cy.get('button').then($buttons => {
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
        cy.log("Geen voorbeeldweergave knop gevonden, probeer alternatieve methode");
        // Zoek naar knoppen met specifieke classes die kunnen wijzen op een preview knop
        cy.get('button[class*="preview"], button[class*="Preview"]').first().click({ force: true });
      }
    });
    
    // Controleer of de voorbeeldweergave correct wordt getoond
    cy.wait(1000);
    cy.contains("Markeer alle lidwoorden in de volgende zin:").should("be.visible");
    cy.contains("De kat zit op een mat onder het raam.").should("be.visible");
    
    // Sluit de voorbeeldweergave
    cy.get('button').then($buttons => {
      const closeButtonTexts = ['Sluiten', 'Close', 'Terug', 'Back'];
      
      let found = false;
      $buttons.each((i, button) => {
        const buttonText = Cypress.$(button).text().trim();
        for (const text of closeButtonTexts) {
          if (buttonText.includes(text)) {
            cy.wrap(button).click({ force: true });
            found = true;
            return false; // Break the each loop
          }
        }
      });
      
      if (!found) {
        // Als geen specifieke sluitknop gevonden is, probeer de escape toets
        cy.get('body').type('{esc}', { force: true });
      }
    });
    
    // Bewerk de instructie
    cy.get('input[placeholder*="instructie"], input[placeholder*="Instructie"]').clear({ force: true }).type("Markeer alle voorzetsels in de volgende zin:", { force: true });
    
    // Verwijder de huidige markeringen en markeer nieuwe woorden
    cy.contains("De").click({ force: true }); // Verwijder markering
    cy.contains("een").click({ force: true }); // Verwijder markering
    cy.contains("het").click({ force: true }); // Verwijder markering
    cy.contains("op").click({ force: true }); // Markeer voorzetsel
    cy.contains("onder").click({ force: true }); // Markeer voorzetsel
    
    // Sla de vraag op
    cy.get('button').then($buttons => {
      const saveButtonTexts = ['Opslaan', 'Save', 'Bewaren'];
      
      let found = false;
      $buttons.each((i, button) => {
        const buttonText = Cypress.$(button).text().trim();
        for (const text of saveButtonTexts) {
          if (buttonText.includes(text)) {
            cy.wrap(button).click({ force: true });
            found = true;
            return false; // Break the each loop
          }
        }
      });
      
      if (!found && $buttons.length > 0) {
        // Als geen specifieke knop gevonden is, probeer een knop met een save icon
        cy.get('button[class*="save"], button[class*="Save"]').first().click({ force: true });
      }
    });
    
    // Controleer of de vraag is opgeslagen (kan variëren afhankelijk van de UI feedback)
    cy.wait(1000);
    cy.contains("Markeer alle voorzetsels in de volgende zin:").should("be.visible");
    
    cy.log("Mark Words vraag workflow test voltooid");
  });

  it("Kan teruggaan naar de hoofdpagina en een nieuwe vraag selecteren", () => {
    // Navigeer naar de Multiple Choice editor
    cy.contains("Multiple Choice").click({ force: true });
    cy.contains("Ga naar de editor").click({ force: true });
    
    // Wacht tot de editor is geladen
    cy.wait(2000);
    
    // Ga terug naar de hoofdpagina
    cy.get('button').then($buttons => {
      const backButtonTexts = ['Terug', 'Back', 'Home'];
      
      let found = false;
      $buttons.each((i, button) => {
        const buttonText = Cypress.$(button).text().trim();
        for (const text of backButtonTexts) {
          if (buttonText.includes(text)) {
            cy.wrap(button).click({ force: true });
            found = true;
            return false; // Break the each loop
          }
        }
      });
      
      if (!found) {
        // Als geen specifieke terugknop gevonden is, probeer de browser terug knop
        cy.go('back');
      }
    });
    
    // Controleer of we terug zijn op de hoofdpagina
    cy.wait(1000);
    cy.contains("Multiple Choice").should("be.visible");
    cy.contains("Mark Words").should("be.visible");
    
    // Selecteer een ander vraagtype
    cy.contains("Mark Words").click({ force: true });
    cy.contains("Ga naar de editor").click({ force: true });
    
    // Controleer of de Mark Words editor is geladen
    cy.wait(2000);
    cy.get('textarea').should("be.visible");
    
    cy.log("Navigatie workflow test voltooid");
  });
});
