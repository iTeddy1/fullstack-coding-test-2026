@echo off
setlocal

echo Starting backend and frontend in separate windows...
start "Backend" cmd /k "cd /d ""%~dp0backend"" && npm run dev"
start "Frontend" cmd /k "cd /d ""%~dp0frontend"" && npm run dev"

echo App started. Keep both terminal windows open while developing.
exit /b 0
