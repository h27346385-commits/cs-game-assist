@echo off
chcp 65001 >nul
echo 正在启动 CS游戏助手...
echo.

:: 获取脚本所在目录
set "SCRIPT_DIR=%~dp0"

:: 检查 electron.exe 是否存在
if not exist "%SCRIPT_DIR%..\node_modules\electron\dist\electron.exe" (
    echo 错误: 找不到 electron.exe
    echo 请先运行: npm install
    pause
    exit /b 1
)

:: 启动应用
"%SCRIPT_DIR%..\node_modules\electron\dist\electron.exe" "%SCRIPT_DIR%win-unpacked\resources\app.asar"

if %ERRORLEVEL% neq 0 (
    echo.
    echo 应用退出，代码: %ERRORLEVEL%
    pause
)
