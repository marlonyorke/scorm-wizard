# PowerShell script om de SCORM Wizard server in de achtergrond te starten
Write-Host "SCORM Wizard Server Starter (Background Mode)" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
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

# Functie om te controleren of een poort in gebruik is
function Test-PortInUse {
    param (
        [int]$Port
    )
    
    $connections = netstat -ano | findstr ":$Port"
    return $connections.Length -gt 0
}

# Controleer of poort 3002 al in gebruik is
if (Test-PortInUse -Port 3002) {
    Write-Host "Poort 3002 is al in gebruik. Proberen om het proces te beëindigen..." -ForegroundColor Yellow
    
    $connections = netstat -ano | findstr ":3002"
    $pidPattern = "\s+(\d+)$"
    
    foreach ($connection in $connections) {
        if ($connection -match $pidPattern) {
            $processPid = $matches[1]
            Write-Host "Beëindigen van proces met PID: $processPid" -ForegroundColor Yellow
            Stop-Process -Id $processPid -Force -ErrorAction SilentlyContinue
        }
    }
    
    # Wacht even om het proces de tijd te geven om af te sluiten
    Start-Sleep -Seconds 2
}

# Start de Express server in een apart proces
Write-Host "Express server starten op poort 3002..." -ForegroundColor Cyan
Start-Process -FilePath "node" -ArgumentList "server.cjs" -WindowStyle Hidden

# Start de Vite dev server in een apart proces
Write-Host "Vite dev server starten..." -ForegroundColor Cyan
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Hidden

Write-Host ""
Write-Host "Servers zijn gestart in de achtergrond:" -ForegroundColor Green
Write-Host "- Express API server: http://localhost:3002" -ForegroundColor Green
Write-Host "- Vite dev server: http://localhost:8081" -ForegroundColor Green
Write-Host ""
Write-Host "Om de servers te stoppen, gebruik het stop-server.ps1 script of Task Manager." -ForegroundColor Yellow
