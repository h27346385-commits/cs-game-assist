@echo off
chcp 65001 >nul
echo Testing Electron...
cd /d "%~dp0"
"node_modules\.bin\electron.cmd" "dist-electron\main.cjs"
echo Exit code: %ERRORLEVEL%
pause
