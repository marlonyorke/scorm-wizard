# PowerShell script om de SCORM Wizard server in een apart venster te starten
param(
    [switch]$NoWindow = $false,
    [switch]$ExpressOnly = $false,
    [switch]$ViteOnly = $false
)

$scriptTitle = "SCORM Wizard Server Launcher"
$logFile = "server-log.txt"

# Functie om een timestamp te genereren
function Get-TimeStamp {
    return "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')]"
}

# Functie om te loggen naar console en logbestand
function Write-ServerLog {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    
    $timestamp = Get-TimeStamp
    "$timestamp $Message" | Out-File -Append -FilePath $logFile
    Write-Host "$timestamp $Message" -ForegroundColor $Color
}

# Start een nieuw PowerShell venster met de server
if (-not $NoWindow) {
    Write-Host "Starten van servers in aparte vensters..." -ForegroundColor Cyan
    
    $expressCommand = "cd '$PSScriptRoot'; & '$PSScriptRoot\start-detached-server.ps1' -NoWindow -ExpressOnly"
    $viteCommand = "cd '$PSScriptRoot'; & '$PSScriptRoot\start-detached-server.ps1' -NoWindow -ViteOnly"
    
    # Start Express server in een apart venster
    if (-not $ViteOnly) {
        Start-Process powershell -ArgumentList "-NoExit", "-Command", $expressCommand -WindowStyle Normal
    }
    
    # Start Vite server in een apart venster
    if (-not $ExpressOnly) {
        Start-Process powershell -ArgumentList "-NoExit", "-Command", $viteCommand -WindowStyle Normal
    }
    
    Write-Host "Servers worden gestart in aparte vensters. Je kunt nu verder werken in deze terminal." -ForegroundColor Green
    exit
}

# Maak het logbestand leeg als we een nieuwe server starten
if (($ExpressOnly -and -not $ViteOnly) -or ($ViteOnly -and -not $ExpressOnly)) {
    if (Test-Path $logFile) {
        Clear-Content $logFile
    }
}

# Stel de titel van het PowerShell venster in
if ($ExpressOnly) {
    $Host.UI.RawUI.WindowTitle = "$scriptTitle - Express Server"
} elseif ($ViteOnly) {
    $Host.UI.RawUI.WindowTitle = "$scriptTitle - Vite Server"
}

# Controleer of Node.js is geïnstalleerd
try {
    $nodeVersion = node -v
    Write-ServerLog "Node.js versie: $nodeVersion" "Green"
} catch {
    Write-ServerLog "Node.js is niet geïnstalleerd. Installeer Node.js om verder te gaan." "Red"
    Read-Host "Druk op Enter om af te sluiten"
    exit 1
}

# Controleer of .env bestand bestaat (alleen voor Express server)
if ($ExpressOnly -and -not (Test-Path ".env")) {
    Write-ServerLog "Waarschuwing: .env bestand niet gevonden. De OpenAI API zal niet werken zonder API sleutel." "Yellow"
    
    $createEnv = Read-Host "Wil je nu een .env bestand aanmaken? (j/n)"
    
    if ($createEnv -eq "j") {
        $apiKey = Read-Host "Voer je OpenAI API sleutel in"
        "OPENAI_API_KEY=$apiKey" | Out-File -FilePath ".env" -Encoding utf8
        Write-ServerLog ".env bestand aangemaakt met API sleutel." "Green"
    } else {
        Write-ServerLog "Je kunt later handmatig een .env bestand aanmaken met je OpenAI API sleutel." "Yellow"
    }
}

# Functie om te controleren of een poort in gebruik is
function Test-PortInUse {
    param (
        [int]$Port
    )
    
    $connections = netstat -ano | findstr ":$Port"
    return $connections.Length -gt 0
}

# Functie om een proces te stoppen op basis van poort
function Stop-ProcessByPort {
    param (
        [int]$Port
    )
    
    $connections = netstat -ano | findstr ":$Port"
    $pidPattern = "\s+(\d+)$"
    $processesKilled = 0
    
    foreach ($connection in $connections) {
        if ($connection -match $pidPattern) {
            $processPid = $matches[1]
            try {
                $process = Get-Process -Id $processPid -ErrorAction SilentlyContinue
                if ($process) {
                    Write-ServerLog "Stoppen van proces $($process.ProcessName) (PID: $processPid) op poort $Port" "Yellow"
                    Stop-Process -Id $processPid -Force
                    $processesKilled++
                }
            } catch {
                Write-ServerLog "Kon proces met PID $processPid niet stoppen: $_" "Red"
            }
        }
    }
    
    return $processesKilled
}

# Start de Express server
if ($ExpressOnly) {
    $port = 3002
    
    # Controleer of poort al in gebruik is
    if (Test-PortInUse -Port $port) {
        Write-ServerLog "Poort $port is al in gebruik. Proberen om het proces te beëindigen..." "Yellow"
        $killed = Stop-ProcessByPort -Port $port
        
        if ($killed -gt 0) {
            Write-ServerLog "Bestaande processen op poort $port gestopt." "Green"
        } else {
            Write-ServerLog "Kon geen processen op poort $port stoppen." "Red"
        }
        
        # Wacht even om het proces de tijd te geven om af te sluiten
        Start-Sleep -Seconds 2
    }
    
    Write-ServerLog "Express server starten op poort $port..." "Cyan"
    Write-ServerLog "Server log wordt bijgehouden in $logFile" "Cyan"
    Write-ServerLog "Je kunt dit venster minimaliseren maar niet sluiten zolang je de server nodig hebt." "Cyan"
    Write-ServerLog "Druk op Ctrl+C om de server te stoppen." "Cyan"
    Write-ServerLog "--------- SERVER OUTPUT BELOW ---------" "Cyan"
    
    # Start de Express server
    node server.cjs
    
    # Deze code wordt alleen bereikt als de server stopt
    Write-ServerLog "Express server is gestopt." "Yellow"
    Read-Host "Druk op Enter om dit venster te sluiten"
}

# Start de Vite dev server
if ($ViteOnly) {
    $port = 8081
    
    # Controleer of poort al in gebruik is
    if (Test-PortInUse -Port $port) {
        Write-ServerLog "Poort $port is al in gebruik. Proberen om het proces te beëindigen..." "Yellow"
        $killed = Stop-ProcessByPort -Port $port
        
        if ($killed -gt 0) {
            Write-ServerLog "Bestaande processen op poort $port gestopt." "Green"
        } else {
            Write-ServerLog "Kon geen processen op poort $port stoppen." "Red"
        }
        
        # Wacht even om het proces de tijd te geven om af te sluiten
        Start-Sleep -Seconds 2
    }
    
    Write-ServerLog "Vite dev server starten..." "Cyan"
    Write-ServerLog "Server log wordt bijgehouden in $logFile" "Cyan"
    Write-ServerLog "Je kunt dit venster minimaliseren maar niet sluiten zolang je de server nodig hebt." "Cyan"
    Write-ServerLog "Druk op Ctrl+C om de server te stoppen." "Cyan"
    Write-ServerLog "--------- SERVER OUTPUT BELOW ---------" "Cyan"
    
    # Start de Vite dev server
    npm run dev
    
    # Deze code wordt alleen bereikt als de server stopt
    Write-ServerLog "Vite dev server is gestopt." "Yellow"
    Read-Host "Druk op Enter om dit venster te sluiten"
}
