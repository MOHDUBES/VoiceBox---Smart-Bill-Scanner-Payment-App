# VoiceBox React App - Development Server

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   VoiceBox React App - Starting..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to script directory
Set-Location $PSScriptRoot

Write-Host "Starting Vite development server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "App will be available at: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Run vite directly
node node_modules/vite/bin/vite.js
