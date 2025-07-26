Hier is een Markdown-bestand dat alles samenvat wat we hebben besproken, gestructureerd en klaar om in je codebase te zetten onder /docs. Ik heb het proces dat je beschreef en de gedetailleerde prompts erin verwerkt, zodat het een nuttig naslagwerk is voor jou of je team. Je kunt dit kopiëren en opslaan als bijvoorbeeld /docs/user-interaction-process.md.

User Interaction Process voor Windsurf

Dit document beschrijft een systematische aanpak om de Windsurf-applicatie te ontwerpen, documenteren, implementeren en testen, met een focus op gebruikersinteracties (use cases). Het proces bestaat uit het vastleggen van alle interacties in de UI, het maken van een testplan, en het systematisch afwerken van de functionaliteit.

Overzicht van het proces

Het doel is om:

Alle mogelijke gebruikersinteracties in de applicatie te documenteren als use cases.
Deze lijst te gebruiken om systematisch functionaliteit te implementeren en te testen.
Een volledig werkende applicatie te bouwen met minimale chaos en maximale volledigheid.
Waarom dit krachtig is

Volledigheid: Geen enkele knop of functie wordt gemist.
Structuur: Het proces is systematisch en voorspelbaar.
Kwaliteit: Tests garanderen dat alles werkt zoals bedoeld.
Stap-voor-stap proces

Stap 1: Maak een volledige inventarisatie van de gebruikersinterface (UI)
Doel: Documenteer alle interactieve elementen in de applicatie.
Prompt:
"Analyseer de huidige ontwerpen of specificaties van de Windsurf-applicatie (bijv. Figma-bestanden, wireframes, of bestaande code). Identificeer elke pagina, elk tabblad, en elk interactief element (zoals knoppen, invulvelden, checkboxes, dropdowns, enz.). Maak een gedetailleerde lijst van alle mogelijke gebruikersinteracties in de vorm:

'Als gebruiker kan ik op pagina [paginanaam], tabblad/onderdeel [tabbladnaam], [elementtype] [elementnaam] [actie] om [doel/resultaat] te bereiken.' Voorbeeld:
'Als gebruiker kan ik op pagina "Dashboard", tabblad "Overzicht", knop "Refresh" klikken om de pagina te verversen.'
'Als gebruiker kan ik op pagina "Routes", tabblad "Details", veld "Opmerkingen" invullen om een notitie toe te voegen.' Sla deze lijst op als een artifact in de repository onder project/specifications/user-interactions.md. Zorg ervoor dat de lijst volledig is en geen enkel interactief element in de UI mist."
Output: Een bestand user-interactions.md met alle use cases.

Stap 2: Valideer de volledigheid van de lijst
Doel: Zorg dat de lijst accuraat en compleet is.
Prompt:
"Controleer het bestand project/specifications/user-interactions.md. Vergelijk de lijst met de daadwerkelijke gebruikersinterface (ontwerpen, prototypes, of code) om te bevestigen dat:

Elke pagina, elk tabblad, en elk interactief element in de UI vertegenwoordigd is in de lijst.
De beschrijvingen kloppen qua paginanaam, tabbladnaam, elementtype, actie, en resultaat. Als er interacties ontbreken, voeg deze toe in dezelfde vorm ('Als gebruiker kan ik...'). Als er fouten zijn, corrigeer deze. Werk het bestand bij en commit de veranderingen naar de repository met een duidelijke beschrijving, zoals 'Geüpdatete user-interactions.md met ontbrekende interacties'."
Output: Een gevalideerd en bijgewerkt user-interactions.md.

Stap 3: Maak een systematisch implementatie- en testplan
Doel: Plan hoe elke use case wordt geïmplementeerd en getest.
Prompt:
"Neem het bestand project/specifications/user-interactions.md als basis. Voor elk item in de lijst, stel een systematisch plan op om de functionaliteit te implementeren en te testen. Nummer elk item in de lijst (bijv. UC-001, UC-002, etc.) en voeg per item de volgende informatie toe in een nieuw bestand project/test-plans/user-interactions-testplan.md:

Use Case ID: Bijv. UC-001.
Beschrijving: Kopieer de originele tekst, zoals 'Als gebruiker kan ik op pagina "Dashboard", tabblad "Overzicht", knop "Refresh" klikken om de pagina te verversen.'
Huidige status: Bestaat de functionaliteit al? (Ja/Nee)
Teststatus: Bestaat er een test? (Ja/Nee/Werkt/Niet werkend)
Actie: Wat moet er gebeuren? (Bijv. 'Test maken', 'Functionaliteit implementeren', 'Test repareren', 'Geen actie nodig'). Voorbeeld: UC-001 Beschrijving: Als gebruiker kan ik op pagina "Dashboard", tabblad "Overzicht", knop "Refresh" klikken om de pagina te verversen. Huidige status: Nee Teststatus: Nee Actie: Functionaliteit implementeren + test maken Sla dit bestand op in de repository."
Output: Een bestand user-interactions-testplan.md met een actieplan.

Stap 4: Werk de lijst systematisch af
Doel: Implementeer en test elke use case.
Prompt:
"Gebruik het bestand project/test-plans/user-interactions-testplan.md als leidraad. Begin bij UC-001 en werk systematisch door de lijst. Voor elk item:

Controleer de huidige status: Als de functionaliteit nog niet bestaat, implementeer deze volledig in de code zodat het werkt zoals beschreven in de use case.
Controleer de teststatus:
Als er geen test is, schrijf een geautomatiseerde test (bijv. in Jest, Cypress, of een relevante testframework) die de use case valideert.
Als er een test is maar deze werkt niet, repareer de test.
Als er een werkende test is, ga door.
Test de implementatie: Voer de test uit. Als deze slaagt, markeer het item als 'Voltooid'. Als deze faalt, debug en fix de code totdat de test slaagt.
Update het testplan: Werk de status bij in user-interactions-testplan.md (bijv. 'Huidige status: Ja, Teststatus: Werkt') en commit de wijzigingen met een beschrijving zoals 'UC-001 voltooid: Refresh-knop werkt met test'. Ga door naar het volgende item (UC-002, UC-003, etc.) totdat de hele lijst is afgewerkt."
Output: Een volledig geïmplementeerde en geteste applicatie, met een bijgewerkt testplan.

Stap 5: Review en afronding
Doel: Controleer dat alles werkt en rond af.
Prompt:
"Nadat alle items in project/test-plans/user-interactions-testplan.md zijn gemarkeerd als 'Voltooid', voer een laatste review uit:

Loop de hele lijst na en controleer of:
Elke use case correct is geïmplementeerd in de applicatie.
Elke test bestaat, werkt, en het verwachte resultaat valideert.
Test de applicatie handmatig door willekeurige interacties uit te voeren en te bevestigen dat alles functioneert zoals beschreven in user-interactions.md.
Als er problemen worden gevonden, noteer deze, repareer ze, en update de relevante bestanden.
Maak een samenvatting van de afronding (bijv. 'Alle [aantal] use cases geïmplementeerd en getest') en commit deze naar de repository als project/specifications/completion-report.md. De applicatie is nu volledig werkend."
Output: Een afrondingsrapport en een werkende applicatie.

Voorbeeld: Hoe het eruitziet
user-interactions.md

Als gebruiker kan ik op pagina "Dashboard", tabblad "Overzicht", knop "Refresh" klikken om de pagina te verversen.
Als gebruiker kan ik op pagina "Routes", tabblad "Details", veld "Opmerkingen" invullen om een notitie toe te voegen.
user-interactions-testplan.md
UC-001
Beschrijving: Als gebruiker kan ik op pagina "Dashboard", tabblad "Overzicht", knop "Refresh" klikken om de pagina te verversen.
Huidige status: Nee
Teststatus: Nee
Actie: Functionaliteit implementeren + test maken

UC-002
Beschrijving: Als gebruiker kan ik op pagina "Routes", tabblad "Details", veld "Opmerkingen" invullen om een notitie toe te voegen.
Huidige status: Ja
Teststatus: Werkt
Actie: Geen actie nodig

Hoe te gebruiken

Team: Geef elke stap als taak aan een ontwikkelaar of tester.
Zelf: Volg de prompts als checklist.
Automatisering: Geef de prompts aan een AI of tool om het proces te versnellen.
Dit proces zorgt ervoor dat 80% van de applicatie systematisch wordt gebouwd door simpelweg "ga door" te zeggen na elke stap. Het resultaat is een volledig gedocumenteerde, geteste en werkende applicatie.