# SCORM Wizard Server Gebruikshandleiding

Deze handleiding legt uit hoe je de SCORM Wizard server kunt starten en beheren zonder dat je hoofdterminal geblokkeerd wordt.

## Inhoudsopgave

1. [Server starten](#server-starten)
2. [Server stoppen](#server-stoppen)
3. [API debugging](#api-debugging)
4. [Veelgestelde vragen](#veelgestelde-vragen)

## Server starten

### Methode 1: Aparte vensters (aanbevolen)

Dit script start zowel de Express API server als de Vite development server in aparte vensters:

```powershell
.\start-detached-server.ps1
```

Voordelen:
- Je kunt blijven werken in je hoofdterminal
- Je kunt de serveroutput in aparte vensters bekijken
- De servers blijven draaien, zelfs als je de hoofdterminal sluit

### Methode 2: Alleen Express server

Als je alleen de Express API server wilt starten:

```powershell
.\start-detached-server.ps1 -ExpressOnly
```

### Methode 3: Alleen Vite server

Als je alleen de Vite development server wilt starten:

```powershell
.\start-detached-server.ps1 -ViteOnly
```

## Server stoppen

Je kunt de servers op verschillende manieren stoppen:

1. Druk op `Ctrl+C` in de servervensters
2. Sluit de servervensters
3. Gebruik het stop-server script:

```powershell
.\stop-server.ps1
```

## API debugging

Voor het debuggen van API-problemen is er een speciale tool beschikbaar:

```powershell
.\api-debug-tool.ps1
```

Deze tool biedt verschillende diagnostische opties:

1. **Controleer omgevingsvariabelen**: Controleert of de omgevingsvariabelen correct zijn geladen
2. **Test API sleutel**: Test of de OpenAI API-sleutel geldig is
3. **Eenvoudige API test**: Voert een eenvoudige API-test uit
4. **Uitgebreide OpenAI debug**: Geeft gedetailleerde debug-informatie
5. **Volledige diagnostiek**: Voert alle bovenstaande tests uit

Je kunt ook direct een specifieke test uitvoeren:

```powershell
# Test de API-sleutel
.\api-debug-tool.ps1 -TestApiKey

# Controleer omgevingsvariabelen
.\api-debug-tool.ps1 -CheckEnv

# Voer een eenvoudige API-test uit
.\api-debug-tool.ps1 -SimpleTest

# Voer volledige diagnostiek uit
.\api-debug-tool.ps1 -FullDiagnostics
```

## Veelgestelde vragen

### Waarom zie ik de server output niet in mijn hoofdterminal?

De servers draaien in aparte vensters om te voorkomen dat je hoofdterminal geblokkeerd wordt. Kijk in de servervensters voor output.

### Hoe weet ik of de servers draaien?

Je kunt de status van de servers controleren met:

```powershell
# Controleer of de Express server draait
Invoke-WebRequest -Uri "http://localhost:3002/api/health" -Method GET

# Controleer of de Vite server draait
Invoke-WebRequest -Uri "http://localhost:8081" -Method GET
```

### Wat moet ik doen als de servers niet starten?

1. Controleer of de poorten niet al in gebruik zijn
2. Controleer of Node.js is geïnstalleerd
3. Controleer of alle dependencies zijn geïnstalleerd met `npm install`
4. Gebruik de API debug tool om problemen te diagnosticeren

### Hoe configureer ik mijn OpenAI API-sleutel?

Maak een `.env` bestand in de hoofdmap van het project met:

```
OPENAI_API_KEY=jouw_api_sleutel_hier
```

### Kan ik de server in een Docker container draaien?

Momenteel is Docker-ondersteuning niet geïmplementeerd. Je kunt de servers alleen lokaal draaien.
