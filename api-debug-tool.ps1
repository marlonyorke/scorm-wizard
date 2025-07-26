# PowerShell script voor API debugging zonder de server te blokkeren
param(
    [switch]$TestApiKey = $false,
    [switch]$CheckEnv = $false,
    [switch]$SimpleTest = $false,
    [switch]$FullDiagnostics = $false
)

$scriptTitle = "SCORM Wizard API Debug Tool"
$Host.UI.RawUI.WindowTitle = $scriptTitle

# Functie om een timestamp te genereren
function Get-TimeStamp {
    return "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')]"
}

# Functie om te loggen naar console
function Write-DebugLog {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    
    $timestamp = Get-TimeStamp
    Write-Host "$timestamp $Message" -ForegroundColor $Color
}

# Functie om HTTP requests te maken
function Invoke-ApiRequest {
    param(
        [string]$Endpoint,
        [string]$Method = "GET",
        [object]$Body = $null,
        [string]$Description = ""
    )
    
    $baseUrl = "http://localhost:3002"
    $url = "$baseUrl$Endpoint"
    
    Write-DebugLog "API Request: $Method $url" "Cyan"
    if ($Description) {
        Write-DebugLog "Doel: $Description" "Cyan"
    }
    
    try {
        $params = @{
            Uri = $url
            Method = $Method
            ContentType = "application/json"
            TimeoutSec = 30
        }
        
        if ($Body) {
            $jsonBody = $Body | ConvertTo-Json -Depth 10
            $params.Body = $jsonBody
            Write-DebugLog "Request body: $jsonBody" "Gray"
        }
        
        $response = Invoke-RestMethod @params
        Write-DebugLog "API aanroep succesvol!" "Green"
        return $response
    }
    catch {
        Write-DebugLog "API aanroep mislukt: $($_.Exception.Message)" "Red"
        
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode.value__
            $statusDescription = $_.Exception.Response.StatusDescription
            
            Write-DebugLog "HTTP Status: $statusCode $statusDescription" "Red"
            
            try {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                $errorContent = $reader.ReadToEnd()
                $reader.Close()
                
                Write-DebugLog "Error details: $errorContent" "Red"
            }
            catch {
                Write-DebugLog "Kon error details niet lezen: $($_.Exception.Message)" "Red"
            }
        }
        
        return $null
    }
}

# Functie om te controleren of de Express server draait
function Test-ServerRunning {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3002/api/health" -Method GET -TimeoutSec 5 -ErrorAction SilentlyContinue
        return $response.StatusCode -eq 200
    }
    catch {
        return $false
    }
}

# Controleer of de server draait
if (-not (Test-ServerRunning)) {
    Write-DebugLog "De Express server lijkt niet te draaien op http://localhost:3002" "Red"
    Write-DebugLog "Start eerst de server met .\start-detached-server.ps1" "Yellow"
    Read-Host "Druk op Enter om af te sluiten"
    exit 1
}

Write-DebugLog "Express server is bereikbaar op http://localhost:3002" "Green"

# Functie om omgevingsvariabelen te controleren
function Check-Environment {
    Write-DebugLog "Controleren van omgevingsvariabelen..." "Cyan"
    
    $response = Invoke-ApiRequest -Endpoint "/api/check-env" -Description "Controleren van omgevingsvariabelen"
    
    if ($response) {
        Write-DebugLog "Omgevingsvariabelen check resultaat:" "Cyan"
        $response | Format-List | Out-String | Write-Host
        
        if ($response.hasOpenAIKey) {
            Write-DebugLog "OpenAI API sleutel is geconfigureerd." "Green"
        } else {
            Write-DebugLog "OpenAI API sleutel ontbreekt!" "Red"
            Write-DebugLog "Maak een .env bestand aan met OPENAI_API_KEY=jouw_api_sleutel" "Yellow"
        }
    }
}

# Functie om API sleutel te testen
function Test-ApiKey {
    Write-DebugLog "Testen van OpenAI API sleutel..." "Cyan"
    
    $response = Invoke-ApiRequest -Endpoint "/api/test-api-key" -Description "Testen van OpenAI API sleutel"
    
    if ($response) {
        Write-DebugLog "API sleutel test resultaat:" "Cyan"
        $response | Format-List | Out-String | Write-Host
        
        if ($response.valid) {
            Write-DebugLog "OpenAI API sleutel is geldig!" "Green"
        } else {
            Write-DebugLog "OpenAI API sleutel is ongeldig of er is een probleem met de API." "Red"
            Write-DebugLog "Error: $($response.error)" "Red"
        }
    }
}

# Functie om een eenvoudige API test uit te voeren
function Run-SimpleTest {
    Write-DebugLog "Uitvoeren van eenvoudige API test..." "Cyan"
    
    $response = Invoke-ApiRequest -Endpoint "/api/simple-test" -Description "Eenvoudige API test"
    
    if ($response) {
        Write-DebugLog "Eenvoudige API test resultaat:" "Cyan"
        $response | Format-List | Out-String | Write-Host
        
        if ($response.success) {
            Write-DebugLog "Eenvoudige API test geslaagd!" "Green"
        } else {
            Write-DebugLog "Eenvoudige API test mislukt." "Red"
            Write-DebugLog "Error: $($response.error)" "Red"
        }
    }
}

# Functie om uitgebreide OpenAI debug uit te voeren
function Debug-OpenAI {
    Write-DebugLog "Uitvoeren van uitgebreide OpenAI debug..." "Cyan"
    
    $response = Invoke-ApiRequest -Endpoint "/api/debug-openai" -Description "Uitgebreide OpenAI debug"
    
    if ($response) {
        Write-DebugLog "OpenAI debug resultaat:" "Cyan"
        $response | ConvertTo-Json -Depth 10 | Write-Host
        
        if ($response.openaiConfigured) {
            Write-DebugLog "OpenAI is correct geconfigureerd!" "Green"
        } else {
            Write-DebugLog "OpenAI configuratie heeft problemen." "Red"
            Write-DebugLog "Controleer de details hierboven voor meer informatie." "Yellow"
        }
    }
}

# Functie om volledige diagnostiek uit te voeren
function Run-FullDiagnostics {
    Write-DebugLog "Uitvoeren van volledige API diagnostiek..." "Cyan"
    Write-DebugLog "Dit kan even duren, even geduld..." "Yellow"
    
    # Stap 1: Controleer omgevingsvariabelen
    Write-DebugLog "STAP 1: Controleren van omgevingsvariabelen" "Magenta"
    Check-Environment
    
    # Stap 2: Test API sleutel
    Write-DebugLog "STAP 2: Testen van API sleutel" "Magenta"
    Test-ApiKey
    
    # Stap 3: Eenvoudige API test
    Write-DebugLog "STAP 3: Eenvoudige API test" "Magenta"
    Run-SimpleTest
    
    # Stap 4: OpenAI debug
    Write-DebugLog "STAP 4: Uitgebreide OpenAI debug" "Magenta"
    Debug-OpenAI
    
    Write-DebugLog "Volledige diagnostiek voltooid." "Green"
}

# Toon welkom bericht
Write-DebugLog "===== SCORM Wizard API Debug Tool =====" "Cyan"
Write-DebugLog "Deze tool helpt bij het diagnosticeren van API-problemen" "Cyan"
Write-DebugLog "zonder de hoofdterminal te blokkeren." "Cyan"
Write-DebugLog "========================================" "Cyan"
Write-DebugLog ""

# Voer de gevraagde actie uit op basis van parameters
if ($TestApiKey) {
    Test-ApiKey
} elseif ($CheckEnv) {
    Check-Environment
} elseif ($SimpleTest) {
    Run-SimpleTest
} elseif ($FullDiagnostics) {
    Run-FullDiagnostics
} else {
    # Toon menu als er geen parameters zijn opgegeven
    Write-DebugLog "Kies een optie:" "Yellow"
    Write-DebugLog "1. Controleer omgevingsvariabelen" "White"
    Write-DebugLog "2. Test API sleutel" "White"
    Write-DebugLog "3. Eenvoudige API test" "White"
    Write-DebugLog "4. Uitgebreide OpenAI debug" "White"
    Write-DebugLog "5. Volledige diagnostiek" "White"
    Write-DebugLog "6. Afsluiten" "White"
    
    $choice = Read-Host "Voer je keuze in (1-6)"
    
    switch ($choice) {
        "1" { Check-Environment }
        "2" { Test-ApiKey }
        "3" { Run-SimpleTest }
        "4" { Debug-OpenAI }
        "5" { Run-FullDiagnostics }
        "6" { exit 0 }
        default { Write-DebugLog "Ongeldige keuze." "Red" }
    }
}

Write-DebugLog ""
Read-Host "Druk op Enter om af te sluiten"
