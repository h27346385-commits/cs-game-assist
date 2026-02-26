# CS游戏助手启动测试脚本
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "CS游戏助手 - 启动测试" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

$exePath = "$PSScriptRoot\release\CSGameAssist-1.0.0-Portable.exe"
$logDir = "$env:APPDATA\cs-game-assist\logs"

# 检查可执行文件
if (!(Test-Path $exePath)) {
    Write-Host "错误: 找不到可执行文件" -ForegroundColor Red
    Write-Host "路径: $exePath" -ForegroundColor Red
    exit 1
}

Write-Host "可执行文件: $exePath" -ForegroundColor Green
Write-Host "文件大小: $([math]::Round((Get-Item $exePath).Length/1MB,2)) MB" -ForegroundColor Green
Write-Host ""

# 清理旧日志
if (Test-Path $logDir) {
    Write-Host "清理旧日志..." -ForegroundColor Yellow
    Remove-Item "$logDir\*.log" -ErrorAction SilentlyContinue
}

# 启动应用
Write-Host "启动应用..." -ForegroundColor Cyan
Write-Host "（按 Ctrl+C 停止）" -ForegroundColor Gray
Write-Host ""

try {
    $process = Start-Process -FilePath $exePath -PassThru -WindowStyle Normal
    Write-Host "进程已启动，PID: $($process.Id)" -ForegroundColor Green
    Write-Host ""
    
    # 等待几秒让应用启动
    Write-Host "等待应用启动 (5秒)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    # 检查日志
    $logFile = Get-ChildItem "$logDir\*.log" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($logFile) {
        Write-Host "日志文件: $($logFile.FullName)" -ForegroundColor Green
        Write-Host ""
        Write-Host "最新日志内容:" -ForegroundColor Cyan
        Write-Host "----------------------------------------" -ForegroundColor Gray
        Get-Content $logFile.FullName -Tail 20 | ForEach-Object { Write-Host $_ }
        Write-Host "----------------------------------------" -ForegroundColor Gray
    } else {
        Write-Host "警告: 未找到日志文件" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "应用正在运行。请检查是否出现界面。" -ForegroundColor Green
    Write-Host "如果应用崩溃，请查看上面的日志输出。" -ForegroundColor Yellow
    
    # 保持脚本运行
    Write-Host ""
    Read-Host "按 Enter 键关闭此窗口"
    
    # 尝试关闭应用
    if (!$process.HasExited) {
        Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
    }
} catch {
    Write-Host "启动失败: $_" -ForegroundColor Red
    Read-Host "按 Enter 键关闭"
}
