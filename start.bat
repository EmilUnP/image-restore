@echo off
echo ========================================
echo   AI Image Optimizer - Starting Servers
echo ========================================
echo.
echo Starting both frontend and backend servers...
echo.
echo Frontend will run on: http://localhost:5173
echo Backend will run on: http://localhost:3001
echo.
echo Press Ctrl+C to stop both servers
echo.
echo ========================================
echo.

npm run dev:all

pause

