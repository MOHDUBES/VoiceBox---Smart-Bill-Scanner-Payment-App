@echo off
color 0A
title VoiceBox - Quick Deploy Helper

:menu
cls
echo ========================================
echo     VoiceBox Deployment Helper
echo ========================================
echo.
echo Choose your deployment method:
echo.
echo 1. Netlify (Easiest - Drag ^& Drop)
echo 2. Vercel (Fast - Auto Deploy)
echo 3. GitHub Pages (Free Hosting)
echo 4. Firebase Hosting (Professional)
echo 5. Test Locally First
echo 6. Exit
echo.
set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" goto netlify
if "%choice%"=="2" goto vercel
if "%choice%"=="3" goto github
if "%choice%"=="4" goto firebase
if "%choice%"=="5" goto local
if "%choice%"=="6" goto end
goto menu

:netlify
cls
echo ========================================
echo     Netlify Deployment
echo ========================================
echo.
echo Opening Netlify Drop Zone...
echo.
start https://app.netlify.com/drop
echo.
echo INSTRUCTIONS:
echo 1. Drag your entire project folder to the browser
echo 2. Wait for upload to complete
echo 3. Your site will be live instantly!
echo 4. You'll get a URL like: https://random-name.netlify.app
echo.
echo TIP: You can change the site name in Netlify settings
echo.
pause
goto menu

:vercel
cls
echo ========================================
echo     Vercel Deployment
echo ========================================
echo.
echo Checking if Vercel CLI is installed...
where vercel >nul 2>&1
if %errorlevel% neq 0 (
    echo Vercel CLI not found. Installing...
    npm install -g vercel
)
echo.
echo Starting Vercel deployment...
echo.
vercel
echo.
echo Deployment complete!
echo.
pause
goto menu

:github
cls
echo ========================================
echo     GitHub Pages Deployment
echo ========================================
echo.
echo Opening GitHub...
start https://github.com/new
echo.
echo INSTRUCTIONS:
echo.
echo 1. Create a new repository on GitHub
echo 2. Run these commands in your project folder:
echo.
echo    git init
echo    git add .
echo    git commit -m "Initial commit - VoiceBox App"
echo    git remote add origin YOUR_REPO_URL
echo    git branch -M main
echo    git push -u origin main
echo.
echo 3. Go to Settings ^> Pages
echo 4. Select 'main' branch
echo 5. Click Save
echo.
echo Your site will be live at:
echo https://YOUR_USERNAME.github.io/REPO_NAME/html/index.html
echo.
pause
goto menu

:firebase
cls
echo ========================================
echo     Firebase Hosting Deployment
echo ========================================
echo.
echo Checking if Firebase CLI is installed...
where firebase >nul 2>&1
if %errorlevel% neq 0 (
    echo Firebase CLI not found. Installing...
    npm install -g firebase-tools
)
echo.
echo Logging in to Firebase...
firebase login
echo.
echo Initializing Firebase Hosting...
firebase init hosting
echo.
echo Deploying to Firebase...
firebase deploy
echo.
echo Deployment complete!
echo.
pause
goto menu

:local
cls
echo ========================================
echo     Local Testing Server
echo ========================================
echo.
echo Starting local server on port 8000...
echo.
echo Your app will be available at:
echo http://localhost:8000/html/index.html
echo.
echo Press Ctrl+C to stop the server
echo.
python -m http.server 8000
pause
goto menu

:end
cls
echo.
echo Thank you for using VoiceBox Deployment Helper!
echo.
echo Your app is ready to go live! 🚀
echo.
pause
exit
