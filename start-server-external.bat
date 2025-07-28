@echo off
echo SCORM Wizard Server Starter
echo ============================
echo.

:: Start de server
echo Server starten...
echo Express server op poort 3002 en Vite dev server op poort 8081
echo Druk op Ctrl+C om te stoppen
echo.

:: Start de server met npm run dev:server
start cmd /k "cd %~dp0 && npm run dev:server"
