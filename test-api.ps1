# PowerShell script om de AI API te testen
Write-Host "SCORM Wizard API Tester" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan
Write-Host ""

# Configuratie voor de test
$port = 3002
$endpoint = "http://localhost:$port/api/generate-questions"

# Test data
$testData = @{
    educationLevel = "havo"
    year = "3"
    subject = "Biologie"
    theme = "Het menselijk lichaam"
    chapter = "Bloedsomloop"
    batchSize = 1
    customMaterial = "De bloedsomloop, ook wel het cardiovasculaire systeem genoemd, is het systeem dat bloed door het lichaam pompt. Het bestaat uit het hart, bloedvaten en het bloed zelf. Het hart pompt bloed door het lichaam via de bloedvaten. Er zijn drie soorten bloedvaten: slagaders (arteriën), haarvaten (capillairen) en aders (venen)."
} | ConvertTo-Json -Compress

Write-Host "Test data:" -ForegroundColor Yellow
Write-Host $testData -ForegroundColor Gray
Write-Host ""

# Controleer of de server draait
try {
    $testResponse = Invoke-WebRequest -Uri "http://localhost:$port/api/test" -Method GET -ErrorAction Stop
    Write-Host "Server is bereikbaar. Status: $($testResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Server is niet bereikbaar op http://localhost:$port. Start eerst de server met .\start-server.ps1" -ForegroundColor Red
    exit 1
}

Write-Host "API aanroepen..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $endpoint -Method POST -Body $testData -ContentType "application/json" -ErrorAction Stop
    
    Write-Host "API response ontvangen. Status: $($response.StatusCode)" -ForegroundColor Green
    
    # Parse de JSON response
    $result = $response.Content | ConvertFrom-Json
    
    # Toon de gegenereerde vragen
    Write-Host "`nGegenereerde vragen:" -ForegroundColor Magenta
    
    foreach ($question in $result.questions) {
        Write-Host "`n$($question.title)" -ForegroundColor Cyan
        Write-Host "------------------------------" -ForegroundColor Cyan
        Write-Host "$($question.text)" -ForegroundColor White
        Write-Host ""
        
        foreach ($option in $question.options) {
            # Maak een marker voor correcte antwoorden
            $correctMarker = if ($option.isCorrect) { "[X]" } else { "[ ]" }
            
            Write-Host "$correctMarker $($option.id). $($option.text)" -ForegroundColor $(if ($option.isCorrect) { "Green" } else { "White" })
            Write-Host "   Feedback: $($option.feedback)" -ForegroundColor Gray
            Write-Host ""
        }
        
        Write-Host "Moeilijkheidsgraad: $($question.difficulty)" -ForegroundColor Yellow
        Write-Host "Meerdere juiste antwoorden: $($question.multipleCorrect)" -ForegroundColor Yellow
    }
    
    # Toon de metadata
    Write-Host "`nMetadata:" -ForegroundColor Magenta
    Write-Host "Gegenereerd op: $($result.metadata.generatedAt)" -ForegroundColor Gray
    Write-Host "Model: $($result.metadata.model)" -ForegroundColor Gray
    Write-Host "Tokens: $($result.metadata.totalTokens) (prompt: $($result.metadata.promptTokens), completion: $($result.metadata.completionTokens))" -ForegroundColor Gray
    Write-Host "Generatietijd: $($result.metadata.generationTime) ms" -ForegroundColor Gray
    
} catch {
    Write-Host "Fout bij API aanroep:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        Write-Host "Status code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        
        # Probeer de response body te lezen
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response body:" -ForegroundColor Red
            Write-Host $responseBody -ForegroundColor Red
        } catch {
            Write-Host "Kon response body niet lezen" -ForegroundColor Red
        }
    }
}

Write-Host "`nTest voltooid." -ForegroundColor Cyan
