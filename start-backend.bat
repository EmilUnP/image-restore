@echo off
setlocal enabledelayedexpansion

REM This script should be called from the project directory
REM Verify we're in the correct directory
set "PROJECT_DIR=%CD%"
echo [Backend] Starting server...
echo [Backend] Working directory: "!PROJECT_DIR!"
echo.

REM Verify we're in the correct directory
if not exist "package.json" (
    echo [ERROR] package.json not found in current directory!
    echo [ERROR] Expected location: "!PROJECT_DIR!"
    echo.
    pause
    exit /b 1
)

REM Verify server directory exists
if not exist "server\index.js" (
    echo [ERROR] server\index.js not found!
    echo [ERROR] Expected location: "!PROJECT_DIR!\server\index.js"
    echo.
    pause
    exit /b 1
)
echo.

REM First try npm run
call npm.cmd run dev:backend
set "EXIT_CODE=!ERRORLEVEL!"

REM If npm run failed, try direct node command
if !EXIT_CODE! NEQ 0 (
    echo.
    echo [WARNING] npm run failed, trying direct node command...
    echo.
    node server/index.js
    set "EXIT_CODE=!ERRORLEVEL!"
)

if !EXIT_CODE! NEQ 0 (
    echo.
    echo [ERROR] Backend server failed to start!
    echo [INFO] Error code: !EXIT_CODE!
    echo.
    echo Troubleshooting:
    echo 1. Check if node_modules/express exists
    echo 2. Try running: npm install
    echo 3. Check if server/index.js exists
    echo.
)

endlocal
pause

