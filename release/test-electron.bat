@echo off
echo Starting Electron Test...
set ELECTRON_ENABLE_LOGGING=1
set ELECTRON_ENABLE_STACK_DUMPING=1
"%~dp0win-unpacked\CS游戏助手.exe" --enable-logging 2>&1
echo Exit code: %ERRORLEVEL%
pause
