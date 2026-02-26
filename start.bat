@echo off
chcp 65001 >nul
title CS游戏助手 - MVP Demo版

echo ==========================================
echo    CS游戏助手 - MVP Demo版
echo ==========================================
echo.
echo 正在启动应用...
echo.

REM 检查dist目录是否存在
if not exist "dist\index.html" (
    echo [错误] 未找到构建文件！
    echo.
    echo 请先执行构建命令：
    echo   npm install
    echo   npm run build
    echo.
    pause
    exit /b 1
)

REM 尝试使用Chrome打开
echo 正在查找浏览器...

set "CHROME_PATH="

REM 检查Chrome
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    set "CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe"
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    set "CHROME_PATH=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
) else if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" (
    set "CHROME_PATH=%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"
)

REM 检查Edge
set "EDGE_PATH="
if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    set "EDGE_PATH=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
) else if exist "C:\Program Files\Microsoft\Edge\Application\msedge.exe" (
    set "EDGE_PATH=C:\Program Files\Microsoft\Edge\Application\msedge.exe"
)

REM 启动应用
if not "%CHROME_PATH%"=="" (
    echo 使用 Chrome 启动...
    start "" "%CHROME_PATH%" --app="file://%~dp0dist\index.html" --window-size=1400,900
) else if not "%EDGE_PATH%"=="" (
    echo 使用 Edge 启动...
    start "" "%EDGE_PATH%" --app="file://%~dp0dist\index.html" --window-size=1400,900
) else (
    echo 未找到 Chrome 或 Edge，使用默认浏览器...
    start "" "file://%~dp0dist\index.html"
)

echo.
echo 应用已启动！
echo.
echo 提示：这是一个绿色版应用，所有数据存储在本地。
echo.
timeout /t 3 >nul
exit
