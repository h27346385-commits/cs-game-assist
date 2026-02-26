@echo off
chcp 65001 >nul
title CS游戏助手 - 调试模式

echo ==========================================
echo    CS游戏助手 - 调试模式
echo ==========================================
echo.
echo 正在启动程序，控制台将显示错误信息...
echo.

if not exist "CS游戏助手-客户端Demo版.exe" (
    echo [错误] 找不到客户端程序！
    pause
    exit /b 1
)

REM 设置环境变量启用调试
set ELECTRON_ENABLE_LOGGING=1
set ELECTRON_ENABLE_STACK_DUMPING=1

REM 启动程序并捕获输出
"CS游戏助手-客户端Demo版.exe" --enable-logging 2>&1

echo.
echo 程序已退出，按任意键关闭窗口...
pause
