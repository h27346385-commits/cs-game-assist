// 最小化启动测试
const fs = require('fs');
const path = require('path');

const debugLogPath = path.join(process.env.TEMP || 'C:\\temp', 'cs-test-startup.log');
fs.writeFileSync(debugLogPath, `[${new Date().toISOString()}] test-startup.cjs 开始执行\n`);

try {
  fs.appendFileSync(debugLogPath, `[${new Date().toISOString()}] 尝试导入 electron...\n`);
  const { app } = require('electron');
  fs.appendFileSync(debugLogPath, `[${new Date().toISOString()}] electron 导入成功, app=${typeof app}\n`);
  
  if (app && app.whenReady) {
    fs.appendFileSync(debugLogPath, `[${new Date().toISOString()}] app.whenReady 存在\n`);
    app.whenReady().then(() => {
      fs.appendFileSync(debugLogPath, `[${new Date().toISOString()}] app 就绪!\n`);
      // 创建窗口
      const { BrowserWindow } = require('electron');
      const win = new BrowserWindow({ width: 800, height: 600 });
      win.loadURL('data:text/html,<h1>测试成功</h1>');
      fs.appendFileSync(debugLogPath, `[${new Date().toISOString()}] 窗口创建成功\n`);
    });
  } else {
    fs.appendFileSync(debugLogPath, `[${new Date().toISOString()}] app.whenReady 不存在\n`);
  }
} catch (e) {
  fs.appendFileSync(debugLogPath, `[${new Date().toISOString()}] 错误: ${e.message}\n`);
  fs.appendFileSync(debugLogPath, `[${new Date().toISOString()}] 堆栈: ${e.stack}\n`);
}
