@echo off
cd /d "%~dp0"
echo ===================================
echo     FinSync All Servers Shutdown
echo ===================================
echo.

:: Kill Node.js processes
echo Stopping Node.js servers...
taskkill /F /IM node.exe >nul 2>&1

:: Kill Python processes on port 8000
echo Stopping Python backend...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 2^>nul') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo All FinSync servers have been stopped.
pause