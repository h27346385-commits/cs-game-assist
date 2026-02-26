@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ==========================================
echo    CS游戏助手 - 带日志启动
echo ==========================================
echo.

set EXE_NAME=CS游戏助手-客户端版.exe
set LOG_FILE=cs-game-assist.log

if not exist "%EXE_NAME%" (
    echo [错误] 找不到程序: %EXE_NAME%
    pause
    exit /b 1
)

echo 正在启动程序，日志将保存到 %LOG_FILE%
echo 启动时间: %date% %time% > %LOG_FILE%
echo ======================================== >> %LOG_FILE%
echo.

REM 设置环境变量启用详细日志
set ELECTRON_ENABLE_LOGGING=1
set ELECTRON_ENABLE_STACK_DUMPING=1
set NODE_DEBUG=1

REM 启动程序并捕获所有输出
"%EXE_NAME%" --enable-logging 2>&1 | tee -a %LOG_FILE%

echo.
echo 程序已退出
pause
