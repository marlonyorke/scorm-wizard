# Drag & Drop Vraagtype Testplan

Dit document bevat het testplan voor het Drag & Drop vraagtype in de SCORM Wizard applicatie. Het beschrijft alle gebruikersinteracties die mogelijk zijn binnen de Drag & Drop editor en dient als leidraad voor implementatie en testing.

## User Interactions Testplan

### UC-DND-001
**Beschrijving:** Als gebruiker kan ik op pagina "Vraagbeheer", tabblad "Vraagtypen", optie "Drag & Drop" selecteren om een nieuwe drag & drop vraag aan te maken.
**Huidige status:** Nee
**Teststatus:** Nee
**Actie:** Functionaliteit implementeren + test maken

### UC-DND-002
**Beschrijving:** Als gebruiker kan ik op pagina "Vraagbeheer", tabblad "Drag & Drop Editor", knop "Nieuw item toevoegen" klikken om een nieuw sleepbaar item toe te voegen.
**Huidige status:** Nee
**Teststatus:** Nee
**Actie:** Functionaliteit implementeren + test maken

### UC-DND-003
**Beschrijving:** Als gebruiker kan ik op pagina "Vraagbeheer", tabblad "Drag & Drop Editor", een item slepen naar een doelgebied om de correcte positie te definiëren.
**Huidige status:** Nee
**Teststatus:** Nee
**Actie:** Functionaliteit implementeren + test maken

### UC-DND-004
**Beschrijving:** Als gebruiker kan ik op pagina "Vraagbeheer", tabblad "Drag & Drop Editor", knop "Nieuw doelgebied toevoegen" klikken om een nieuw doelgebied aan te maken.
**Huidige status:** Nee
**Teststatus:** Nee
**Actie:** Functionaliteit implementeren + test maken

### UC-DND-005
**Beschrijving:** Als gebruiker kan ik op pagina "Vraagbeheer", tabblad "Drag & Drop Editor", veld "Titel" invullen om een titel voor de vraag te specificeren.
**Huidige status:** Nee
**Teststatus:** Nee
**Actie:** Functionaliteit implementeren + test maken

### UC-DND-006
**Beschrijving:** Als gebruiker kan ik op pagina "Vraagbeheer", tabblad "Drag & Drop Editor", veld "Instructies" invullen om instructies voor de leerling toe te voegen.
**Huidige status:** Nee
**Teststatus:** Nee
**Actie:** Functionaliteit implementeren + test maken

### UC-DND-007
**Beschrijving:** Als gebruiker kan ik op pagina "Vraagbeheer", tabblad "Drag & Drop Editor", checkbox "Willekeurige volgorde" aanvinken om de volgorde van items te randomiseren.
**Huidige status:** Nee
**Teststatus:** Nee
**Actie:** Functionaliteit implementeren + test maken

### UC-DND-008
**Beschrijving:** Als gebruiker kan ik op pagina "Vraagbeheer", tabblad "Drag & Drop Editor", knop "Voorvertoning" klikken om een preview van de vraag te zien.
**Huidige status:** Nee
**Teststatus:** Nee
**Actie:** Functionaliteit implementeren + test maken

### UC-DND-009
**Beschrijving:** Als gebruiker kan ik op pagina "Vraagbeheer", tabblad "Drag & Drop Editor", knop "Opslaan" klikken om de vraag op te slaan.
**Huidige status:** Nee
**Teststatus:** Nee
**Actie:** Functionaliteit implementeren + test maken

### UC-DND-010
**Beschrijving:** Als gebruiker kan ik op pagina "Vraagbeheer", tabblad "Drag & Drop Editor", een bestaand item selecteren en knop "Verwijderen" klikken om het item te verwijderen.
**Huidige status:** Nee
**Teststatus:** Nee
**Actie:** Functionaliteit implementeren + test maken

### UC-DND-011
**Beschrijving:** Als gebruiker kan ik op pagina "Vraagbeheer", tabblad "Drag & Drop Editor", een bestaand doelgebied selecteren en knop "Verwijderen" klikken om het doelgebied te verwijderen.
**Huidige status:** Nee
**Teststatus:** Nee
**Actie:** Functionaliteit implementeren + test maken

### UC-DND-012
**Beschrijving:** Als gebruiker kan ik op pagina "Vraagbeheer", tabblad "Drag & Drop Editor", knop "Feedback toevoegen" klikken om feedback voor correcte en incorrecte antwoorden toe te voegen.
**Huidige status:** Nee
**Teststatus:** Nee
**Actie:** Functionaliteit implementeren + test maken

### UC-DND-013
**Beschrijving:** Als gebruiker kan ik op pagina "Vraagbeheer", tabblad "Drag & Drop Editor", knop "Exporteren" klikken om de vraag te exporteren als SCORM-pakket.
**Huidige status:** Nee
**Teststatus:** Nee
**Actie:** Functionaliteit implementeren + test maken

### UC-DND-014
**Beschrijving:** Als gebruiker kan ik op pagina "Vraagbeheer", tabblad "Drag & Drop Editor", de achtergrondafbeelding uploaden of wijzigen voor de drag & drop vraag.
**Huidige status:** Nee
**Teststatus:** Nee
**Actie:** Functionaliteit implementeren + test maken

### UC-DND-015
**Beschrijving:** Als gebruiker kan ik op pagina "Vraagbeheer", tabblad "Drag & Drop Editor", de grootte en positie van een doelgebied aanpassen door te slepen en vergroten/verkleinen.
**Huidige status:** Nee
**Teststatus:** Nee
**Actie:** Functionaliteit implementeren + test maken

## Implementatie Prioriteiten

1. Basisstructuur van de Drag & Drop editor opzetten (UC-DND-001)
2. Toevoegen en beheren van sleepbare items (UC-DND-002, UC-DND-010)
3. Toevoegen en beheren van doelgebieden (UC-DND-004, UC-DND-011, UC-DND-015)
4. Implementatie van sleep-functionaliteit (UC-DND-003)
5. Configuratie-opties voor de vraag (UC-DND-005, UC-DND-006, UC-DND-007, UC-DND-014)
6. Voorvertoning en opslaan (UC-DND-008, UC-DND-009)
7. Feedback en export functionaliteit (UC-DND-012, UC-DND-013)

## Testscenario's

Voor elk van de bovenstaande use cases moeten de volgende testscenario's worden uitgevoerd:

1. **Positief scenario**: Test of de functionaliteit werkt zoals verwacht met geldige invoer.
2. **Negatief scenario**: Test hoe de applicatie reageert op ongeldige invoer of onverwachte gebruikersacties.
3. **Randgevallen**: Test extreme waarden (bijv. zeer grote afbeeldingen, veel items, etc.).
4. **Gebruiksvriendelijkheid**: Evalueer of de functionaliteit intuïtief en gebruiksvriendelijk is.

## Integratie met Neon Thema

Alle UI-elementen in de Drag & Drop editor moeten consistent zijn met het Neon thema van de applicatie, met de volgende kenmerken:
- Donkere achtergrond (#0c0032, #190061)
- Heldere neon-accenten (#00f2ff, #7b2ff7)
- Glow-effecten op knoppen en interactieve elementen
- Glassmorphism-effecten voor kaarten en containers
- Witte tekst voor optimale leesbaarheid

## Afrondingscriteria

Het Drag & Drop vraagtype wordt als volledig beschouwd wanneer:
1. Alle bovenstaande use cases zijn geïmplementeerd en getest
2. De UI is consistent met het Neon thema
3. De functionaliteit werkt correct in verschillende browsers
4. De gegenereerde SCORM-pakketten voldoen aan de SCORM-standaard
5. Gebruikerstests bevestigen dat de functionaliteit intuïtief en gebruiksvriendelijk is
