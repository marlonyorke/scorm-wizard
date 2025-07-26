# SCORM Wizard API Troubleshooting Guide

Deze gids helpt je bij het oplossen van problemen met de OpenAI API-integratie in de SCORM Wizard.

## Inhoudsopgave

1. [Veelvoorkomende problemen](#veelvoorkomende-problemen)
2. [Oplossingsstrategieën](#oplossingsstrategieën)
3. [Diagnostische tools](#diagnostische-tools)
4. [Server starten](#server-starten)
5. [API-sleutel configuratie](#api-sleutel-configuratie)

## Veelvoorkomende problemen

### 1. API-verbindingsproblemen

- **Symptoom**: "API niet beschikbaar" of "Kan geen verbinding maken met de server"
- **Mogelijke oorzaken**:
  - Express server draait niet
  - Vite proxy is niet correct geconfigureerd
  - CORS-problemen
  - Netwerkproblemen

### 2. OpenAI API-sleutel problemen

- **Symptoom**: "Invalid API key" of "API-sleutel ongeldig"
- **Mogelijke oorzaken**:
  - Ontbrekende API-sleutel in .env bestand
  - Ongeldige API-sleutel
  - API-sleutel is verlopen of heeft onvoldoende credits

### 3. Server start problemen

- **Symptoom**: Server start niet of blokkeert de interface
- **Mogelijke oorzaken**:
  - Poort is al in gebruik
  - Node.js is niet geïnstalleerd
  - Ontbrekende dependencies

## Oplossingsstrategieën

### Strategie 1: Gebruik de Mock API

Als je problemen hebt met de OpenAI API, kun je de mock API gebruiken:

1. Open de AI Question Generator
2. Schakel "Gebruik mock API (offline modus)" in
3. Genereer vragen zonder afhankelijk te zijn van de OpenAI API

### Strategie 2: Start de server in de achtergrond

Gebruik het meegeleverde PowerShell script om de server in de achtergrond te starten:

```powershell
.\start-server-background.ps1
```

Dit script:
- Controleert of Node.js is geïnstalleerd
- Controleert of het .env bestand bestaat
- Stopt eventuele bestaande servers op dezelfde poort
- Start de Express server in de achtergrond
- Start de Vite dev server in de achtergrond

### Strategie 3: Controleer de API-configuratie

Gebruik de ingebouwde diagnostische tools:

1. Open de AI Question Generator
2. Klik op "API Diagnostiek Tool" in de debug opties
3. Klik op "Start Diagnostiek" om een volledige controle uit te voeren

## Diagnostische tools

De SCORM Wizard bevat verschillende diagnostische tools:

### In de AI Question Generator

- **Check Omgevingsvariabelen**: Controleert of de omgevingsvariabelen correct zijn geladen
- **Check OpenAI Config**: Controleert de OpenAI configuratie
- **Eenvoudige API Test**: Voert een eenvoudige API-test uit
- **Test API-sleutel**: Test of de API-sleutel geldig is
- **Uitgebreide OpenAI Debug**: Geeft gedetailleerde debug-informatie
- **API Diagnostiek Tool**: Opent de volledige diagnostische tool

### Standalone Diagnostische Tool

De API Diagnostiek Tool biedt:

- Basis diagnostiek voor API-status, API-sleutel en OpenAI configuratie
- Geavanceerde debug-opties voor diepgaande probleemoplossing
- Gedetailleerde foutrapportage

## Server starten

### Optie 1: Externe terminal (aanbevolen)

```powershell
cd c:\Users\Negromancer\Desktop\scormwizard
node server.cjs
```

Open een tweede terminal voor de frontend:

```powershell
cd c:\Users\Negromancer\Desktop\scormwizard
npm run dev
```

### Optie 2: Achtergrond script

```powershell
.\start-server-background.ps1
```

### Optie 3: Batch bestand

```
start-server-external.bat
```

## API-sleutel configuratie

1. Maak een `.env` bestand in de hoofdmap van het project
2. Voeg je OpenAI API-sleutel toe:

```
OPENAI_API_KEY=jouw_api_sleutel_hier
```

3. Herstart de server

## Vite proxy configuratie

De Vite proxy is geconfigureerd in `vite.config.ts`:

```typescript
server: {
  port: 8081,
  host: '0.0.0.0',
  proxy: {
    '/api': {
      target: 'http://localhost:3002',
      changeOrigin: true,
      secure: false,
    }
  }
}
```

Zorg ervoor dat:
- De Express server draait op poort 3002
- De proxy is geconfigureerd om `/api` verzoeken door te sturen naar `http://localhost:3002`

## Ondersteuning

Als je nog steeds problemen ondervindt, neem dan contact op met de ontwikkelaar.
