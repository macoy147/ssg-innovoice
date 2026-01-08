@echo off
echo ========================================
echo  Stopping Development Servers
echo ========================================
echo.

REM Kill Node.js processes
taskkill /F /IM node.exe /T 2>nul

echo.
echo All Node.js processes stopped!
echo.
echo Press any key to exit...
pause > nul
