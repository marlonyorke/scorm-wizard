# SCORM Wizard

SCORM Wizard is een geavanceerde webapplicatie voor het beheren, bewerken en testen van SCORM-pakketten met LTI 1.3-integratie voor onderwijsplatforms zoals Moodle.

## Inhoudsopgave

- [Over het Project](#over-het-project)
- [Features](#features)
- [Voorbereiding](#voorbereiding)
- [Installatie](#installatie)
- [Gebruik](#gebruik)
- [LTI 1.3-integratie](#lti-13-integratie)
- [Documentatie](#documentatie)
- [Testen](#testen)
- [Bijdragen](#bijdragen)
- [Licentie](#licentie)

## Over het Project

SCORM Wizard is ontworpen om ontwikkelaars en onderwijsprofessionals een krachtige tool te bieden voor het werken met SCORM-pakketten. Met de ingebouwde LTI 1.3-integratie kan de applicatie naadloos worden geïntegreerd met onderwijsplatforms.

## Features

- SCORM-pakket upload en extractie
- Visuele editor voor SCORM-inhoud
- LTI 1.3-integratie met onderwijsplatforms
- AI-ondersteunde contentgeneratie
- Gedetailleerde analytics en tracking
- Responsive webinterface

## Voorbereiding

Zorg dat je de volgende software hebt geïnstalleerd:

- Node.js (versie 16 of hoger)
- npm of yarn

## Installatie

1. Clone de repository:
   ```bash
   git clone https://github.com/marlonyorke/scorm-wizard.git
   ```

2. Navigeer naar de projectmap:
   ```bash
   cd scorm-wizard
   ```

3. Installeer de dependencies:
   ```bash
   npm install
   ```

4. Kopieer het .env.example bestand en configureer de environment variables:
   ```bash
   cp .env.example .env
   ```

## Gebruik

Start de applicatie met het PowerShell-script:

```powershell
.\start-servers-fixed.ps1
```

De applicatie is beschikbaar op `http://localhost:3000` voor de frontend en `http://localhost:3002` voor de backend.

## LTI 1.3-integratie

Voor LTI 1.3-integratie met platforms zoals Moodle:

1. Zorg dat de applicatie beschikbaar is via HTTPS (gebruik ngrok voor lokale ontwikkeling)
2. Configureer de LTI-variabelen in het .env bestand
3. Registreer de tool in het onderwijsplatform met de juiste endpoints

Meer informatie over LTI 1.3-configuratie vind je in de [LTI-documentatie](docs/lti-integration.md).

## Documentatie

Uitgebreide documentatie is beschikbaar in de [docs/](docs/) map:

- [LTI 1.3-integratie handleiding](docs/lti-integration.md)
- [API-documentatie](docs/api.md)
- [Ontwikkelhandleiding](docs/development.md)
- [Deployment handleiding](docs/deployment.md)

## Testen

Voer de E2E-tests uit met Cypress:

```bash
npm run test:e2e
```

## Bijdragen

1. Fork het project
2. Maak een feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit je wijzigingen (`git commit -m 'Add some AmazingFeature'`)
4. Push naar de branch (`git push origin feature/AmazingFeature`)
5. Open een Pull Request

## Licentie

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.
