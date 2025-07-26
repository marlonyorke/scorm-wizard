@echo off
echo ========================================
echo        SCORM Wizard Startup Tool
echo ========================================
echo.

:: Zorg ervoor dat we in de juiste directory zijn
cd /d "%~dp0"
echo Werkdirectory: %CD%
echo.

echo [1/3] Controleren of poort 5173 in gebruik is...
netstat -ano | findstr :5173 | findstr LISTENING > nul
if %errorlevel% equ 0 (
    echo Poort 5173 is in gebruik. Proberen om het proces te beëindigen...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do (
        echo Proces met PID %%a beëindigen...
        taskkill /F /PID %%a
        if %errorlevel% equ 0 (
            echo Proces succesvol beëindigd.
        ) else (
            echo Kon het proces niet beëindigen. Probeer het handmatig te sluiten.
            pause
            exit /b 1
        )
    )
) else (
    echo Poort 5173 is beschikbaar.
)

echo.
echo [2/3] Controleren of alle dependencies zijn geïnstalleerd...
if not exist "node_modules" (
    echo node_modules map niet gevonden! Dependencies installeren...
    call npm install
    if %errorlevel% neq 0 (
        echo Fout bij het installeren van dependencies.
        pause
        exit /b 1
    )
) else (
    echo Dependencies zijn geïnstalleerd.
)

echo.
echo [3/3] Applicatie starten...
echo.
echo De applicatie wordt nu gestart. Open je browser op http://localhost:5173
echo Druk op Ctrl+C gevolgd door 'N' om de applicatie te stoppen.
echo.
echo ========================================
echo.

call npm run dev
