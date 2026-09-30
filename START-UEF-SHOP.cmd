@echo off
setlocal
chcp 65001 >nul
title UEF SHOP - Local Server
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js was not found. Install Node.js and try again.
  pause
  exit /b 1
)
node serve.mjs --open
set "UEF_EXIT_CODE=%ERRORLEVEL%"
if not "%UEF_EXIT_CODE%"=="0" (
  echo.
  echo UEF SHOP could not be started. Review the message above.
  pause
)
endlocal & exit /b %UEF_EXIT_CODE%
