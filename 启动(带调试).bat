@echo off
chcp 65001 >nul
title CS游戏助手 - 调试启动

echo ==========================================
echo    CS游戏助手 - 调试启动
echo ==========================================
echo.

set EXE_NAME=CS游戏助手-客户端版-v2.exe

if not exist "%EXE_NAME%" (
    echo [错误] 找不到程序: %EXE_NAME%
    echo.
    echo 请检查文件是否存在。
    pause
    exit /b 1
)

echo 正在启动程序...
echo 如果程序闪退，错误信息将显示在下边：
echo --------------------------------------------------
echo.

REM 设置调试环境变量
set ELECTRON_ENABLE_LOGGING=1
set ELECTRON_ENABLE_STACK_DUMPING=1

REM 启动程序并等待
"%EXE_NAME%" --enable-logging 2>&1

set EXIT_CODE=%ERRORLEVEL%

echo.
echo --------------------------------------------------
echo 程序已退出，退出代码: %EXIT_CODE%
echo.

if %EXIT_CODE% NEQ 0 (
    echo [警告] 程序异常退出！
    echo.
    echo 可能的原因：
    echo   1. 程序文件损坏
    echo   2. 系统缺少必要的运行库
    echo   3. 杀毒软件拦截
    echo.
    echo 请尝试：
    echo   1. 重新下载程序
    echo   2. 关闭杀毒软件后重试
    echo   3. 以管理员身份运行
)

pause
