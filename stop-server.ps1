# PowerShell script om de SCORM Wizard servers te stoppen
Write-Host "SCORM Wizard Server Stopper" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

# Functie om processen te vinden en te stoppen op basis van poort
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
                    Write-Host "Stoppen van proces $($process.ProcessName) (PID: $processPid) op poort $Port" -ForegroundColor Yellow
                    Stop-Process -Id $processPid -Force
                    $processesKilled++
                }
            } catch {
                Write-Host "Kon proces met PID $processPid niet stoppen: $_" -ForegroundColor Red
            }
        }
    }
    
    return $processesKilled
}

# Stop Express server op poort 3002
$expressKilled = Stop-ProcessByPort -Port 3002
if ($expressKilled -gt 0) {
    Write-Host "Express server gestopt." -ForegroundColor Green
} else {
    Write-Host "Geen Express server gevonden op poort 3002." -ForegroundColor Yellow
}

# Stop Vite dev server (meestal op poort 8081, maar kan ook op andere poorten zijn)
$viteKilled = 0
foreach ($port in 8081..8090) {
    $viteKilled += Stop-ProcessByPort -Port $port
}

if ($viteKilled -gt 0) {
    Write-Host "Vite dev server gestopt." -ForegroundColor Green
} else {
    Write-Host "Geen Vite dev server gevonden." -ForegroundColor Yellow
}

# Zoek naar node processen die mogelijk de servers zijn
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { 
    $_.CommandLine -like "*server.cjs*" -or $_.CommandLine -like "*vite*" 
}

if ($nodeProcesses) {
    Write-Host "Extra node processen gevonden die mogelijk de servers zijn:" -ForegroundColor Yellow
    foreach ($process in $nodeProcesses) {
        Write-Host "Stoppen van $($process.ProcessName) (PID: $($process.Id))" -ForegroundColor Yellow
        Stop-Process -Id $process.Id -Force
    }
    Write-Host "Extra node processen gestopt." -ForegroundColor Green
}

Write-Host ""
Write-Host "Alle servers zijn gestopt." -ForegroundColor Green
