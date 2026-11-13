@echo off
REM AI Media Generator - Startup Script for Windows

echo.
echo ========================================
echo  AI Media Generator - Setup Script
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [X] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo [OK] Node.js found: 
node --version
echo [OK] NPM found: 
npm --version
echo.

REM Install backend dependencies
echo [*] Installing backend dependencies...
cd backend
call npm install
if errorlevel 1 (
    echo [X] Failed to install backend dependencies
    pause
    exit /b 1
)
echo [OK] Backend dependencies installed
cd ..

REM Install frontend dependencies
echo [*] Installing frontend dependencies...
cd frontend
call npm install
if errorlevel 1 (
    echo [X] Failed to install frontend dependencies
    pause
    exit /b 1
)
echo [OK] Frontend dependencies installed
cd ..

echo.
echo [OK] Setup complete!
echo.
echo ========================================
echo  Next Steps:
echo ========================================
echo.
echo Terminal 1 (Backend):
echo   cd backend
echo   npm run dev
echo.
echo Terminal 2 (Frontend):
echo   cd frontend
echo   npm run dev
echo.
echo Then open your browser to:
echo   http://localhost:5173
echo.
pause
