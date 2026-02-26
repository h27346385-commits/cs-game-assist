@echo off
chcp 65001 >nul
echo ========================================
echo   CS游戏助手 - 后台自动推送系统
echo ========================================
echo.
echo 此脚本将持续尝试推送到GitHub
echo 按Ctrl+C停止
echo.

cd /d "%~dp0"

:loop
set /a attempt+=1
echo [%date% %time%] 尝试 #%attempt%...

git push origin master:main --force 2>nul
if %errorlevel% == 0 (
    echo [%date% %time%] 推送成功！
    echo.
    echo ========================================
    echo   推送完成！
    echo ========================================
    pause
    exit /b 0
)

echo [%date% %time%] 失败，10秒后重试...
timeout /t 10 /nobreak >nul
goto loop
