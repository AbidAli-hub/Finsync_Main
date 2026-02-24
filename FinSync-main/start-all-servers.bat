@echo off
cd /d "%~dp0"
echo ===================================
echo     FinSync All Servers Startup
echo ===================================
echo.

:: Kill any existing processes on port 5000 (Node.js)
echo Checking for existing processes on port 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 2^>nul') do (
    echo Terminating existing Node.js process %%a on port 5000
    taskkill /F /PID %%a >nul 2>&1
)

:: Kill any existing processes on port 8000 (Python)
echo Checking for existing processes on port 8000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 2^>nul') do (
    echo Terminating existing Python process %%a on port 8000
    taskkill /F /PID %%a >nul 2>&1
)

echo Ports 5000 and 8000 are now available
echo.

:: Start Python backend in background
echo Starting Python FastAPI backend on port 8000...
start "Python Backend" cmd /c "cd python_backend && python main.py"
timeout /t 3 /nobreak >nul

:: Start Node.js server
echo Starting Node.js Express server on port 5000...
echo Frontend will be available at: http://localhost:5000
echo Python backend available at: http://localhost:8000
echo.
echo Press Ctrl+C to stop all servers
npm run dev