@echo off
echo ========================================
echo  Voice It, Shape It - Development Mode
echo ========================================
echo.
echo Starting both servers...
echo.

REM Start backend in new window
start "Backend Server" cmd /k "cd server && npm run dev"

REM Wait a moment
timeout /t 3 /nobreak > nul

REM Start frontend in new window
start "Frontend Server" cmd /k "cd client && npm run dev"

echo.
echo ========================================
echo  Servers Starting!
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo.
echo Press any key to exit this window...
pause > nul
