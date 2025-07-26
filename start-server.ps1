# PowerShell script om de SCORM Wizard server te starten
Write-Host "SCORM Wizard Server Starter" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""

# Controleer of Node.js is geïnstalleerd
try {
    $nodeVersion = node -v
    Write-Host "Node.js versie: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js is niet geïnstalleerd. Installeer Node.js om verder te gaan." -ForegroundColor Red
    exit 1
}

# Controleer of .env bestand bestaat
if (-not (Test-Path ".env")) {
    Write-Host "Waarschuwing: .env bestand niet gevonden. Maak een .env bestand met je OpenAI API sleutel." -ForegroundColor Yellow
    
    # Vraag of de gebruiker een .env bestand wil aanmaken
    $createEnv = Read-Host "Wil je nu een .env bestand aanmaken? (j/n)"
    
    if ($createEnv -eq "j") {
        $apiKey = Read-Host "Voer je OpenAI API sleutel in"
        "OPENAI_API_KEY=$apiKey" | Out-File -FilePath ".env" -Encoding utf8
        Write-Host ".env bestand aangemaakt met API sleutel." -ForegroundColor Green
    } else {
        Write-Host "Je kunt later handmatig een .env bestand aanmaken met je OpenAI API sleutel." -ForegroundColor Yellow
    }
}

# Controleer of npm packages zijn geïnstalleerd
if (-not (Test-Path "node_modules")) {
    Write-Host "Node modules niet gevonden. Installeren van dependencies..." -ForegroundColor Yellow
    npm install
}

# Start de server
Write-Host "Server starten..." -ForegroundColor Cyan
Write-Host "Express server op poort 3002 en Vite dev server op poort 8081" -ForegroundColor Cyan
Write-Host "Druk op Ctrl+C om te stoppen" -ForegroundColor Yellow
Write-Host ""

# Start de server met npm run dev:server
npm run dev:server
