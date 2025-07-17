@echo off
title FDX Quick Start
color 0A

echo.
echo ███████╗██████╗ ██╗  ██╗    ██████╗ ██╗   ██╗██╗ ██████╗██╗  ██╗    ███████╗████████╗ █████╗ ██████╗ ████████╗
echo ██╔════╝██╔══██╗╚██╗██╔╝   ██╔═══██╗██║   ██║██║██╔════╝██║ ██╔╝    ██╔════╝╚══██╔══╝██╔══██╗██╔══██╗╚══██╔══╝
echo █████╗  ██║  ██║ ╚███╔╝    ██║   ██║██║   ██║██║██║     █████╔╝     ███████╗   ██║   ███████║██████╔╝   ██║   
echo ██╔══╝  ██║  ██║ ██╔██╗    ██║▄▄ ██║██║   ██║██║██║     ██╔═██╗     ╚════██║   ██║   ██╔══██║██╔══██╗   ██║   
echo ██║     ██████╔╝██╔╝ ██╗   ╚██████╔╝╚██████╔╝██║╚██████╗██║  ██╗    ███████║   ██║   ██║  ██║██║  ██║   ██║   
echo ╚═╝     ╚═════╝ ╚═╝  ╚═╝    ╚══▀▀═╝  ╚═════╝ ╚═╝ ╚═════╝╚═╝  ╚═╝    ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   
echo.
echo                            🚀 Food Export Digital Exchange - Quick Start
echo.

:: Check Node.js installation
echo 🔍 Checking system requirements...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js 18+ and try again.
    echo 🔗 Download: https://nodejs.org/
    pause
    exit /b 1
)

npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm not found. Please install npm and try again.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are available
echo.

:: Check if dependencies are installed
if not exist "node_modules" (
    echo 📦 Installing frontend dependencies...
    call npm install --silent
    if %errorlevel% neq 0 (
        echo ❌ Frontend dependency installation failed
        pause
        exit /b 1
    )
)

if not exist "server\node_modules" (
    echo 📦 Installing backend dependencies...
    cd server
    call npm install --silent
    cd ..
    if %errorlevel% neq 0 (
        echo ❌ Backend dependency installation failed
        pause
        exit /b 1
    )
)

echo ✅ Dependencies are ready
echo.

:: Optimize environment
set NODE_ENV=development
set GENERATE_SOURCEMAP=false
set DISABLE_ESLINT_PLUGIN=true
set TSC_COMPILE_ON_ERROR=true
set REACT_APP_FAST_REFRESH=true

echo ⚡ Development optimizations enabled
echo.

:: Check for existing servers and start
call start-dev.bat

echo.
echo 🎉 Quick start complete!
echo.
echo 📖 Useful commands:
echo   • stop-dev.bat     - Stop all servers
echo   • npm run build    - Create production build
echo   • npm test         - Run tests
echo   • npm run lint     - Check code quality
echo.
echo 🔧 Development URLs:
echo   • Frontend: http://localhost:3000
echo   • Backend:  http://localhost:3001/health
echo.
pause