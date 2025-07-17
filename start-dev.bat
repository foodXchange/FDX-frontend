@echo off
echo 🚀 Starting FDX Development Environment...
echo.

:: Set development environment
set NODE_ENV=development
set GENERATE_SOURCEMAP=false
set DISABLE_ESLINT_PLUGIN=true
set TSC_COMPILE_ON_ERROR=true
set REACT_APP_FAST_REFRESH=true

:: Create necessary directories
if not exist "node_modules\.cache" mkdir "node_modules\.cache"
if not exist "server\dist" mkdir "server\dist"

echo ⚡ Environment optimized for fast development
echo.

:: Check if servers are already running
echo 🔍 Checking for running services...
netstat -an | find "LISTENING" | find ":3001" >nul
if %errorlevel% == 0 (
    echo ✅ Backend server already running on port 3001
    set BACKEND_RUNNING=true
) else (
    set BACKEND_RUNNING=false
)

netstat -an | find "LISTENING" | find ":3000" >nul
if %errorlevel% == 0 (
    echo ✅ Frontend server already running on port 3000
    set FRONTEND_RUNNING=true
) else (
    set FRONTEND_RUNNING=false
)

echo.

:: Start backend server if not running
if "%BACKEND_RUNNING%"=="false" (
    echo 🔧 Building and starting backend server...
    cd server
    if not exist "dist\index.js" (
        echo 📦 Building backend...
        call npm run build
        if %errorlevel% neq 0 (
            echo ❌ Backend build failed
            pause
            exit /b 1
        )
    )
    echo 🚀 Starting backend server...
    start "FDX Backend" cmd /k "npm start"
    cd ..
    
    :: Wait for backend to start
    echo ⏳ Waiting for backend server to start...
    timeout /t 3 /nobreak >nul
) else (
    echo ↗️ Backend server already running
)

:: Start frontend server if not running
if "%FRONTEND_RUNNING%"=="false" (
    echo 🎨 Starting frontend development server...
    echo ⚡ Hot reloading enabled, TypeScript checking disabled for speed
    start "FDX Frontend" cmd /k "npm start"
    
    :: Wait for frontend to start
    echo ⏳ Waiting for frontend server to start...
    timeout /t 5 /nobreak >nul
) else (
    echo ↗️ Frontend server already running
)

echo.
echo ✅ Development environment ready!
echo 🌐 Frontend: http://localhost:3000
echo 🔗 Backend:  http://localhost:3001
echo 📊 Health:   http://localhost:3001/health
echo.
echo 🔧 Development optimizations active:
echo   • Fast refresh enabled
echo   • TypeScript checking disabled
echo   • ESLint disabled for faster builds
echo   • Source maps optimized
echo   • Webpack caching enabled
echo.

:: Open browser after a delay
timeout /t 2 /nobreak >nul
start http://localhost:3000

echo 🎯 Browser opening...
echo 📝 Press any key to exit or Ctrl+C to stop all servers
pause >nul