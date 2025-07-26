# SCORM Wizard Server Restarter
# Dit script herstart de servers op een veilige manier

Write-Host "SCORM Wizard Server Restarter" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan
Write-Host ""

# Functie om processen op een veilige manier te stoppen
function Stop-ProcessSafely {
    param (
        [int]$port
    )
    
    try {
        $processInfo = netstat -ano | findstr ":$port " | findstr "LISTENING"
        if ($processInfo) {
            $processId = $processInfo -split ' ' | Where-Object { $_ -match '^\d+$' } | Select-Object -Last 1
            if ($processId) {
                Write-Host "Stoppen van proces met PID: $processId op poort $port" -ForegroundColor Yellow
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                Start-Sleep -Seconds 1
                return $true
            }
        }
        return $false
    }
    catch {
        Write-Host "Geen proces gevonden op poort $port" -ForegroundColor Gray
        return $false
    }
}

# Probeer servers te stoppen
Write-Host "Stoppen van bestaande servers..." -ForegroundColor Yellow
Stop-ProcessSafely -port 3002
Stop-ProcessSafely -port 8081

# Wacht even om er zeker van te zijn dat alles is gestopt
Start-Sleep -Seconds 2

# Start de servers opnieuw
Write-Host "Servers opnieuw starten..." -ForegroundColor Green

# Start backend server
Start-Process -FilePath "node" -ArgumentList "server.refactored.cjs" -WorkingDirectory (Get-Location) -WindowStyle Normal

# Wacht even om er zeker van te zijn dat de backend is gestart
Start-Sleep -Seconds 2

# Start frontend server
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory (Get-Location) -WindowStyle Normal

Write-Host "Servers zijn herstart!" -ForegroundColor Green
Write-Host "Backend server draait op: http://localhost:3002" -ForegroundColor Cyan
Write-Host "Frontend server draait op: http://localhost:8081" -ForegroundColor Cyan
