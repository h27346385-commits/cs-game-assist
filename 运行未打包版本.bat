@echo off
chcp 65001 >nul
title CS游戏助手 - 未打包版本（调试）

echo ==========================================
echo    CS游戏助手 - 未打包版本启动
echo ==========================================
echo.

set EXE_PATH=release\win-unpacked\CS游戏助手.exe

if not exist "%EXE_PATH%" (
    echo [错误] 找不到未打包版本: %EXE_PATH%
    echo.
    echo 请先运行"构建便携版.bat"生成程序。
    pause
    exit /b 1
)

echo 正在启动未打包版本...
echo 路径: %EXE_PATH%
echo.
echo 注意: 如果闪退，错误信息将显示在此窗口。
echo --------------------------------------------------
echo.

"%EXE_PATH%" --enable-logging 2>&1

echo.
echo --------------------------------------------------
echo 退出代码: %ERRORLEVEL%
pause
