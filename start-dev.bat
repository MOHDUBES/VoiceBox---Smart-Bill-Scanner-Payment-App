@echo off
echo.
echo ========================================
echo   VoiceBox React App - Starting...
echo ========================================
echo.

cd /d "%~dp0"

echo Starting Vite development server...
echo.
echo App will be available at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

node node_modules/vite/bin/vite.js

pause
