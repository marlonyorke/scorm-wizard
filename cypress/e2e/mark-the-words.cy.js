describe("Mark the Words", () => {
  beforeEach(() => {
    // Bezoek de hoofdpagina voor elke test
    cy.visit("/");
    // Wacht even zodat de applicatie volledig kan laden
    cy.wait(1000);
  });

  it("kan navigeren naar de Mark the Words editor via de juiste flow", () => {
    // Stap 1: Bezoek de hoofdpagina
    cy.visit("/");
    
    // Stap 2: Selecteer "Mark the Words" (als er een selector is)
    cy.contains("Mark the Words").click({ force: true });
    
    // Stap 3: Klik op "Ga naar de editor" knop
    cy.contains("Ga naar de editor").click({ force: true });
    
    // Controleer of we op de editor pagina zijn
    cy.contains("Mark the Words vraagtype").should("be.visible");
  });

  it("kan een Mark the Words vraag handmatig maken", () => {
    // Stap 1: Navigeer naar de editor via de juiste flow
    cy.visit("/");
    cy.contains("Mark the Words").click({ force: true });
    cy.contains("Ga naar de editor").click({ force: true });
    
    // Stap 2: Vul woorden in
    cy.get('input[placeholder*="Voer woorden"]').clear().type("hart, longen, lever");
    
    // Stap 3: Vul context beschrijving in
    cy.get('textarea[placeholder*="Beschrijf de context"]').clear().type("Organen in het menselijk lichaam");
    
    // Stap 4: Vul instructie in
    cy.get('input[placeholder*="Klik op alle woorden"]').clear().type("Klik op alle woorden die betrekking hebben op het onderwerp");
    
    // Stap 5: Klik op de "Genereer met AI" knop
    cy.contains("Genereer met AI").click();
    
    // Wacht op het resultaat (dit kan even duren)
    cy.wait(10000);
    
    // Controleer of er resultaat is
    cy.contains("hart").should("exist");
  });

  it("kan de slider voor aantal woorden aanpassen", () => {
    // Stap 1: Navigeer naar de editor via de juiste flow
    cy.visit("/");
    cy.contains("Mark the Words").click({ force: true });
    cy.contains("Ga naar de editor").click({ force: true });
    
    // Stap 2: Zoek de slider op basis van de tekst eromheen
    cy.contains("Aantal woorden in het verhaal").should("be.visible");
    
    // Probeer een meer algemene aanpak - zoek naar elementen in de buurt van de tekst
    cy.contains("Aantal woorden in het verhaal")
      .parent()
      .within(() => {
        // Klik op een positie rechts van het midden (voor een hogere waarde)
        cy.get('div').last().click(300, 10, { force: true });
      });
    
    // Alternatieve methode - zoek naar elementen die mogelijk de slider zijn
    cy.get('div').filter((idx, el) => {
      const $el = Cypress.$(el);
      const rect = el.getBoundingClientRect();
      // Zoek naar een element dat er uitziet als een slider (breed en niet erg hoog)
      return rect.width > 200 && rect.height < 50;
    }).then(($possibleSliders) => {
      if ($possibleSliders.length) {
        cy.wrap($possibleSliders.last()).click(300, 10, { force: true });
      }
    });
    
    // Wacht even om te zien of er een verandering is
    cy.wait(1000);
  });

  it("kan dropdown selecties maken", () => {
    // Stap 1: Navigeer naar de editor via de juiste flow
    cy.visit("/");
    cy.contains("Mark the Words").click({ force: true });
    cy.contains("Ga naar de editor").click({ force: true });
    
    // Stap 2: Zoek naar de dropdown voor niveau
    cy.contains("Niveau:").should("be.visible");
    cy.contains("HAVO").click({ force: true });
    
    // Wacht even tot de dropdown opent
    cy.wait(500);
    
    // Probeer een andere optie te selecteren
    cy.get('div[role="option"], li, [class*="option"], [class*="Option"]')
      .contains("VWO", { matchCase: false })
      .first()
      .click({ force: true });
    
    // Wacht even tot de dropdown sluit
    cy.wait(500);
    
    // Stap 3: Zoek naar de dropdown voor vak
    cy.contains("Vak:").should("be.visible");
    cy.contains("Biologie").click({ force: true });
    
    // Wacht even tot de dropdown opent
    cy.wait(500);
    
    // Probeer een andere optie te selecteren
    cy.get('div[role="option"], li, [class*="option"], [class*="Option"]')
      .contains("Scheikunde", { matchCase: false })
      .first()
      .click({ force: true });
  });

});
