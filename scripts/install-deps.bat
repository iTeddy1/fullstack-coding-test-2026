@echo off
setlocal

echo [1/2] Installing backend dependencies...
cd /d "%~dp0backend"
call npm install
if errorlevel 1 (
  echo Backend install failed.
  exit /b 1
)

echo [2/2] Installing frontend dependencies...
cd /d "%~dp0frontend"
call npm install
if errorlevel 1 (
  echo Frontend install failed.
  exit /b 1
)

echo Dependencies installed successfully.
exit /b 0
