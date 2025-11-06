@echo off
setlocal enabledelayedexpansion

REM This script should be called from the project directory
REM Verify we're in the correct directory
echo [Frontend] Starting server...
echo [Frontend] Working directory: %CD%
echo.

REM Verify we're in the correct directory
if not exist "package.json" (
    echo [ERROR] package.json not found in current directory!
    echo [ERROR] Expected location: %CD%
    echo.
    pause
    exit /b 1
)

REM Verify node_modules exists
if not exist "node_modules" (
    echo [ERROR] node_modules not found!
    echo [INFO] Please run: npm install
    echo.
    pause
    exit /b 1
)
echo.

REM Use npm run dev which now uses node directly (avoids path resolution issues)
echo [INFO] Starting vite using npm run dev...
call npm.cmd run dev
set "EXIT_CODE=!ERRORLEVEL!"

if !EXIT_CODE! NEQ 0 (
    echo.
    echo [ERROR] Frontend server failed to start!
    echo [INFO] Error code: !EXIT_CODE!
    echo.
    echo Troubleshooting:
    echo 1. Check if node_modules/vite exists
    echo 2. Try running: npm install
    echo 3. Check if node_modules/vite/bin/vite.js exists
    echo.
)

endlocal
pause

