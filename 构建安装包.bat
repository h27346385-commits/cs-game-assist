@echo off
chcp 65001 >nul
title CS游戏助手 - 构建安装包

echo ==========================================
echo    CS游戏助手 - 构建安装包
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

echo [1/4] 正在构建前端...  
call npm run build
if errorlevel 1 (
    echo [错误] 构建失败！
    pause
    exit /b 1
)

echo.
echo [2/4] 正在编译Electron主进程...
cd electron
npx tsc
cd ..

echo.
echo [3/4] 正在打包安装程序...  
call npx electron-builder --win nsis
if errorlevel 1 (
    echo [错误] 打包失败！
    pause
    exit /b 1
)

echo.
echo [4/4] 构建完成！
echo.
echo 输出文件位置:
echo   release\CS游戏助手 Setup 1.0.0.exe
echo.
pause
