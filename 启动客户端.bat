@echo off
chcp 65001 >nul
title CS游戏助手 - 启动器

echo ==========================================
echo    CS游戏助手 - 客户端启动器
echo ==========================================
echo.

set EXE_FILE=CS游戏助手-最新版.exe

if not exist "%EXE_FILE%" (
    echo [错误] 找不到程序文件: %EXE_FILE%
    echo.
    echo 请确保文件存在于当前目录。
    pause
    exit /b 1
)

echo 正在启动 CS游戏助手...
echo 功能: 数据库 + Demo解析（演示版）
echo.
start "" "%EXE_FILE%"

echo 启动成功！
timeout /t 2 >nul
