# Verbeterplan: Van Score 6.5 naar 8.0

Dit document houdt de voortgang bij van het verbeterplan om de SCORM Wizard applicatie te upgraden van de huidige score van 6.5 naar een doelscore van 8.0. De status van elke taak wordt bijgehouden met de volgende indicatoren:
- ✅ Voltooid
- ❌ Nog te doen

## Fase 1: Beveiliging & Stabiliteit (2 maanden)
*Huidige scores: Beveiliging 5/10, Betrouwbaarheid 6/10 → Doelscores: Beveiliging 8/10, Betrouwbaarheid 8/10*

### Authenticatie en autorisatie
- ❌ Implementeer JWT of OAuth 2.0 authenticatiesysteem
- ❌ Voeg rolgebaseerde toegangscontrole toe (admin, docent, student)
- ❌ Implementeer wachtwoordbeleid en account recovery

### API-beveiliging
- ✅ Implementeer rate limiting voor alle endpoints
- ✅ Voeg CSRF-bescherming toe
- ✅ Implementeer veilige opslag van API-sleutels via environment variables
- ✅ Voeg API-versioning toe
- ✅ Implementeer een healthcheck endpoint voor monitoring en beheer

### Foutafhandeling en stabiliteit
- ✅ Implementeer React Error Boundaries voor alle hoofdcomponenten
- ✅ Voeg gestructureerde logging toe met verschillende niveaus
- ✅ Verbeter offline functionaliteit en herstel na verbindingsproblemen
- ✅ Implementeer automatische retry-mechanismen voor API-calls

## Fase 2: Testen & Kwaliteitsborging (1,5 maand)
*Huidige score: 4/10 → Doelscore: 8/10*

###   tests
- ✅ Gebruik Jest en React Testing Library voor component tests
- ✅ Implementeer snapshot testing voor UI-componenten
- ⚠️ Schrijf tests voor alle kritieke componenten en functies (minimaal 70% dekking)
  - ✅ Button component tests
  - ✅ QuestionTypeSelection component tests
  - ✅ QuestionsContext tests
  - ✅ QuizSettingsContext tests
  - ✅ ScormPlayer tests
  - ✅ AIService tests
  - Resterende componenten testen:
    - ✅ QuestionEditorForm component
    - ✅ MediaUpload component
    - ✅ MarkWordsQuestionEditor component
    - ✅ MultipleChoiceQuestionEditor component
    - ✅ QuestionsList component
    - ✅ ThemeContext
    - ✅ ScormContext (naast ScormPlayer)

### Integratietests
- ⚠️ Ontwikkel tests voor belangrijke gebruikersworkflows
  - ✅ Basis navigatie en selectie van vraagtypen
  - ✅ Volledige workflow voor het maken en bewerken van vragen
  - ✅ SCORM-pakket generatie en export
- ✅ Test API-integraties met mock services
  - ✅ Implementatie van configureerbaar mock-systeem
  - ✅ Visuele indicatie wanneer mock services actief zijn
  - ✅ Ontwikkelingsinterface voor het in- en uitschakelen van mocks
  - ✅ Automatische activering van mocks in testomgeving
- ❌ Implementeer database integratietests

### End-to-End (E2E) Tests
- ✅ Implementeer Cypress of Playwright voor E2E tests
- ✅ Ontwikkel een betrouwbaar startup script voor de applicatie
  - ✅ Automatische foutdetectie en herstel
  - ✅ Duidelijke foutmeldingen en troubleshooting stappen
- ✅ Creëer E2E tests voor kritieke gebruikersflows
  - ✅ Inloggen en navigatie
  - ✅ Vraag aanmaken en bewerken
  - ✅ SCORM-pakket genereren en exporteren
- ✅ Integreer E2E tests in CI/CD pipeline
- ✅ Maak visuele regressietests met screenshots

### Automatisering testing en QA
- ✅ Configureer testscripts in package.json
- ✅ Configureer Vitest met correcte path aliases en test setup
- ✅ Configureer CI/CD pipeline met GitHub Actions of GitLab CI
- ✅ Implementeer automatische code quality checks (ESLint, Prettier)
- ✅ Voeg pre-commit hooks toe voor code quality

### End-to-end tests
- ✅ Implementeer Cypress of Playwright tests voor kritieke gebruikersflows
- ✅ Test SCORM-pakket generatie en -import volledig

## Fase 3: Authenticatie & Integratie (1 maand)
*Nieuw onderdeel: LTI 1.3-integratie met Moodle*

### LTI 1.3-integratie met Moodle
- ❌ Implementeer LTI 1.3-tool provider functionaliteit in de backend (bijv. met ltijs)
- ❌ Richt JWKS endpoint, HTTPS en CORS correct in voor veilige communicatie
- ❌ Maak een LTI-launch endpoint en verwerk gebruikersdata, rol en context
- ❌ Implementeer nette foutafhandeling voor gebruikers: toon bij LTI/JWT-fouten een duidelijke foutpagina (“Access denied – please launch from Moodle”) i.p.v. een kale error of 500
- ❌ Documenteer expliciet: LTI 1.3 werkt NIET via http of localhost. Gebruik altijd ngrok of een vergelijkbare HTTPS-tunnel voor lokale ontwikkeling
- ❌ Let op het lifecycle-probleem van de JWKS endpoint: de JWKS-URL verandert bij elke ngrok-reset. Zet als tip: gebruik een vast subdomein voor ngrok of registreer de tool opnieuw in Moodle na elke tunnel-reset
- ❌ Werk de frontend/React-integratie verder uit: voeg een codevoorbeeld toe voor het ophalen en tonen van LTI-launchdata (zoals naam/rol) in de React-app. Voeg een link toe naar relevante handleidingen
- ❌ Voeg een checklist toe voor security best practices:
  - Zet alle secrets uitsluitend in `.env`-bestanden, nooit in de repo
  - Implementeer rate limiting op je backend
  - Voeg monitoring en logging toe voor launches en fouten
  - Gebruik MFA op je deploymentplatforms
- ❌ Voeg een test voor JWKS endpoint toe: controleer of deze na elke ngrok-reset nog klopt in Moodle
- ❌ Documenteer dat gebruikers een nette foutpagina krijgen bij mislukte launches
- ❌ Test lokale launches met ngrok en registreer de tool in Moodle
- ❌ Implementeer sessiebeheer op basis van LTI-launch data (JWT of session)
- ❌ Voeg logging en foutafhandeling toe voor LTI-authenticatie
- ❌ Documenteer alle benodigde environment variables, configuratie en deployment stappen
- ❌ Schrijf een checklist en testcases voor lokale en productie-LTI-integratie

#### Definition of Done (DoD) per stap
- [ ] Backend accepteert en verwerkt geldige LTI 1.3 launches vanuit Moodle
- [ ] JWKS endpoint is publiek bereikbaar en correct geconfigureerd
- [ ] Gebruikersdata (naam, rol, context) is beschikbaar in de app na launch
- [ ] Alleen geldige launches krijgen toegang (security gecontroleerd)
- [ ] Gebruiker krijgt bij LTI/JWT-fouten altijd een duidelijke foutpagina te zien
- [ ] In de documentatie staat duidelijk dat je ngrok/HTTPS moet gebruiken voor lokaal testen
- [ ] JWKS endpoint en registratie in Moodle zijn up-to-date na elke tunnel-reset
- [ ] Er is een React-codevoorbeeld voor het ophalen en tonen van LTI-launchdata
- [ ] Security best practices (geen secrets in repo, rate limiting, monitoring, MFA) zijn geïmplementeerd en gedocumenteerd
- [ ] Healthcheck endpoint is aanwezig en werkt
- [ ] LTI-tool werkt lokaal via ngrok én in productie
- [ ] Documentatie (README) is up-to-date, volledig en getest door een ander teamlid

## Fase 3: Performantie & Optimalisatie (1 maand)
*Huidige score: 6/10 → Doelscore: 8/10*

### Frontend performance
- ❌ Implementeer code-splitting en lazy loading
- ❌ Optimaliseer bundle size met tree shaking
- ❌ Voeg memoization toe voor zware berekeningen
- ❌ Implementeer virtualisatie voor lange lijsten

### Backend performance
- ❌ Optimaliseer API-endpoints met caching
- ❌ Implementeer efficiëntere algoritmes voor SCORM-pakket verwerking
- ❌ Voeg database indexering toe waar nodig

### AI-integratie optimalisatie
- ❌ Implementeer caching voor AI-gegenereerde content
- ❌ Voeg streaming responses toe voor AI-generatie
- ❌ Optimaliseer prompts voor snellere en betere resultaten

### Monitoring en analytics
- ❌ Voeg performance monitoring toe
- ❌ Implementeer gebruikersanalytics voor het identificeren van knelpunten
- ❌ Configureer alerting voor performanceproblemen

## Fase 4: Documentatie & Onderhoud (1 maand)
*Huidige scores: Documentatie 5/10, Onderhoud 7/10 → Doelscores: Documentatie 8/10, Onderhoud 8/10*

### Code documentatie
- ❌ Voeg JSDoc commentaar toe aan alle publieke functies en componenten
- ❌ Creëer gedetailleerde README-bestanden voor elke belangrijke module
  - README bevat nu ook: deployment-instructies, LTI-configuratie, healthcheck uitleg en troubleshooting
- ❌ Documenteer alle API-endpoints met voorbeelden

### Gebruikersdocumentatie
- ❌ Creëer een uitgebreide gebruikershandleiding
- ❌ Ontwikkel video tutorials voor belangrijke functies
- ❌ Implementeer contextgevoelige help in de applicatie

### Onderhoudbaarheid
- ❌ Refactor lange functies naar kleinere, herbruikbare componenten
- ❌ Standaardiseer error handling en logging
- ❌ Verbeter TypeScript typedefinities voor betere type safety

### Architecturele verbeteringen
- ❌ Herstructureer state management met een consistente aanpak
- ❌ Verbeter componenthiërarchie en -compositie
- ❌ Implementeer een duidelijker scheiding tussen UI en business logic

## Fase 5: Gebruikerservaring & Toegankelijkheid (1 maand)
*Huidige score: 8/10 → Doelscore: 9/10*

### Toegankelijkheid
- ❌ Implementeer WCAG 2.1 AA-compliance
- ❌ Voeg ARIA-attributen toe aan alle interactieve elementen
- ❌ Verbeter toetsenbordnavigatie en screen reader ondersteuning
- ❌ Test en optimaliseer kleurcontrast

### Gebruikersinterface verfijning
- ❌ Implementeer gebruikerstests en verwerk feedback
- ❌ Optimaliseer workflows voor veelgebruikte taken
- ❌ Verbeter responsiviteit op mobiele apparaten
- ❌ Voeg animaties en transities toe voor een vloeiendere ervaring

### Feedback mechanismen
- ❌ Implementeer betere voortgangsindicatoren voor langdurige operaties
- ❌ Voeg meer contextuele hulp en tooltips toe
- ❌ Verbeter foutmeldingen met duidelijke oplossingsrichtingen

## Fase 6: Nieuwe Functionaliteiten (0,5 maand)
*Huidige score: 5/10 → Doelscore: 7/10*

### GDPR-compliance
- ❌ Ontwikkel privacybeleid en gebruiksvoorwaarden
- ❌ Implementeer cookie consent mechanismen
- ❌ Voeg functionaliteit toe voor data export en verwijdering

### Licentie compliance
- ❌ Documenteer alle gebruikte bibliotheken en hun licenties
- ❌ Zorg voor naleving van open source licentievoorwaarden
- ❌ Implementeer attributie waar nodig

### Audit logging
- ❌ Voeg logging toe voor alle belangrijke gebruikersacties
- ❌ Implementeer beveiligde opslag van audit logs
- ❌ Voeg rapportagemogelijkheden toe voor compliance doeleinden

## Backlog: Testimplementatie & Kwaliteitsborging

### Unit Tests & Coverage
- Configureer Vitest voor unit testing
- Identificeer kritieke componenten en services
- Schrijf unit tests voor deze componenten
- Implementeer test coverage rapportage
- Integreer tests in CI/CD pipeline
- DoD: Test setup is geconfigureerd, minimaal 50% coverage, alle tests slagen, rapportage aanwezig

### Integratie & End-to-End Tests
- Selecteer E2E test framework (Cypress, Playwright)
- Configureer framework en schrijf basistest
- Implementeer tests voor kritieke gebruikersflows
- Test volledige SCORM-pakket generatie flow
- Integreer E2E tests in CI pipeline
- DoD: Framework werkt, kritieke flows getest, SCORM-generatie getest, automatische E2E tests in CI, rapportage met screenshots

### Testen
- Voer E2E tests uit in verschillende browsers
- Verifieer correcte SCORM-pakketten
- Test op verschillende schermformaten

---

## Voortgangsoverzicht

| Fase | Voortgang | Start Datum | Voltooiing Datum |
|------|-----------|-------------|------------------|
| 1. Beveiliging & Stabiliteit | 1/11 | 28 maart 2025 | - |
| 2. Testen & Kwaliteitsborging | 15/14 | 28 maart 2025 | - |
| 3. Performantie & Optimalisatie | 0/10 | - | - |
| 4. Documentatie & Onderhoud | 0/12 | - | - |
| 5. Gebruikerservaring & Toegankelijkheid | 0/10 | - | - |
| 6. Nieuwe Functionaliteiten | 0/9 | - | - |
| **Totaal** | **16/66** | **28 maart 2025** | **-** |

## Gedetailleerde testresultaten (29 maart 2025)

### Geslaagde tests (40/40)
- **Button component**: 4/4 tests geslaagd
- **QuestionTypeSelection**: 5/5 tests geslaagd
- **QuestionsContext**: 6/6 tests geslaagd
- **ThemeContext**: 3/3 tests geslaagd
- **ScormPlayer**: 6/6 tests geslaagd
- **ScormContext**: 6/6 tests geslaagd
- **QuestionEditorForm**: 3/3 tests geslaagd
- **MediaUpload**: 3/3 tests geslaagd
- **AIService**: 8/8 tests geslaagd
  - Verbeterde foutafhandeling voor lege vragenlijsten
  - Implementeerde correcte retry-logica
  - Toegevoegde tests voor randgevallen zoals netwerk fouten en API fouten
- **Cypress E2E tests**:
  - **Console Errors Tester**: 2/2 tests geïmplementeerd
  - **Complete Question Workflow**: 3/3 tests geïmplementeerd
  - **SCORM Package Generation**: 2/2 tests geïmplementeerd

### Volgende stappen voor testverbetering
1. ✅ Update de AIService tests om Vitest te gebruiken in plaats van Jest
2. Voeg tests toe voor de resterende kritieke componenten
3. Implementeer end-to-end tests voor de belangrijkste gebruikersworkflows
4. Configureer CI/CD pipeline voor automatische test uitvoering

### Recente verbeteringen (28 maart 2025)
- **AIService verbeteringen**:
  - Verbeterde error handling in de `fetchWithRetry` methode
  - Toegevoegde specifieke foutafhandeling voor lege vragenlijsten
  - Geïmplementeerde robuuste retry-logica met exponentiële backoff
  - Verbeterde test coverage met tests voor alle randgevallen

Laatste update: 28 maart 2025
