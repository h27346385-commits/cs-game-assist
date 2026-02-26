@echo off
chcp 65001 >nul
title CS游戏助手 - 开发模式

echo ==========================================
echo    CS游戏助手 - 开发模式启动
echo ==========================================
echo.

REM 检查node_modules
if not exist "node_modules" (
    echo [提示] 首次运行，正在安装依赖...
    npm install
    if errorlevel 1 (
        echo [错误] 依赖安装失败！
        pause
        exit /b 1
    )
)

echo [1/3] 正在构建前端...  
call npm run build
if errorlevel 1 (
    echo [错误] 构建失败！
    pause
    exit /b 1
)

echo.
echo [2/3] 正在编译Electron主进程...
cd electron
npx tsc
if errorlevel 1 (
    echo [错误] 编译失败！
    pause
    exit /b 1
)
cd ..

echo.
echo [3/3] 正在启动Electron...
npx electron dist-electron/main.js

pause
