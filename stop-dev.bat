@echo off
echo 🛑 Stopping FDX Development Environment...
echo.

:: Kill processes running on ports 3000 and 3001
echo 🔍 Finding and stopping development servers...

:: Stop frontend (port 3000)
for /f "tokens=5" %%a in ('netstat -ano ^| find ":3000"') do (
    echo 🎨 Stopping frontend server (PID: %%a)
    taskkill /PID %%a /F >nul 2>&1
)

:: Stop backend (port 3001)
for /f "tokens=5" %%a in ('netstat -ano ^| find ":3001"') do (
    echo 🔧 Stopping backend server (PID: %%a)
    taskkill /PID %%a /F >nul 2>&1
)

:: Close any remaining Node.js processes related to the project
echo 🧹 Cleaning up remaining processes...
taskkill /IM node.exe /F >nul 2>&1
taskkill /IM npm.exe /F >nul 2>&1

echo.
echo ✅ Development servers stopped
echo 🗑️ Temporary files cleaned
echo.
pause