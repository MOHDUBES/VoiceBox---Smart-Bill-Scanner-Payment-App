@echo off
echo.
echo ========================================
echo   Building VoiceBox for Production...
echo ========================================
echo.

cd /d "%~dp0"
npm run build

echo.
echo ========================================
echo   Build Complete! Check 'dist' folder
echo ========================================
echo.

pause
