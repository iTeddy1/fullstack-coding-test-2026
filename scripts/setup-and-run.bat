@echo off
setlocal

echo Installing dependencies and starting the app...
call "%~dp0install-deps.bat"
if errorlevel 1 (
  echo Setup failed during dependency installation.
  exit /b 1
)

call "%~dp0run-app.bat"
exit /b 0
