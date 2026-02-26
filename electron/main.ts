/**
 * CS游戏助手 - 主进程入口
 */

import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

// 日志系统
let logFile: string;
function log(level: string, msg: string, ...args: any[]) {
  const line = `[${new Date().toISOString()}] [${level}] ${msg} ${args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')}`;
  console.log(line);
  if (logFile) {
    try { fs.appendFileSync(logFile, line + '\n'); } catch (e) {}
  }
}

// 初始化日志路径
try {
  const logDir = path.join(app.getPath('userData'), 'logs');
  fs.mkdirSync(logDir, { recursive: true });
  logFile = path.join(logDir, `app-${new Date().toISOString().split('T')[0]}.log`);
} catch (e) {
  logFile = path.join(process.env.TEMP || 'C:\\temp', 'cs-game-assist.log');
}

log('INFO', '==========================================');
log('INFO', 'CS游戏助手 v' + app.getVersion() + ' 启动');
log('INFO', '==========================================');

// 服务模块
let databaseManager: any;
let demoParser: any;
let videoGenerator: any;

async function loadModules() {
  try {
    log('INFO', '加载模块...');
    const dbModule = require('./database.cjs');
    databaseManager = dbModule.default || dbModule;
    const demoModule = require('./demo-parser.cjs');
    demoParser = demoModule.default || demoModule;
    const videoModule = require('./video-generator.cjs');
    videoGenerator = videoModule.default || videoModule;
    log('INFO', '模块加载成功');
  } catch (error: any) {
    log('ERROR', '模块加载失败:', error.message);
  }
}

let mainWindow: BrowserWindow | null = null;

async function createWindow() {
  log('INFO', '创建窗口...');
  
  const preloadPath = path.join(__dirname, 'preload.cjs');
  if (!fs.existsSync(preloadPath)) {
    log('ERROR', 'Preload文件不存在:', preloadPath);
    return;
  }

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    title: 'CS游戏助手',
    show: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
    },
  });

  // 加载页面
  const isPackaged = app.isPackaged;
  if (!isPackaged) {
    await mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    const possiblePaths = [
      path.join(__dirname, '../dist/index.html'),
      path.join(__dirname, '../../dist/index.html'),
    ];

    let loaded = false;
    for (const htmlPath of possiblePaths) {
      if (fs.existsSync(htmlPath)) {
        await mainWindow.loadFile(htmlPath);
        loaded = true;
        break;
      }
    }

    if (!loaded) {
      mainWindow.loadURL('data:text/html,<h1>错误</h1><p>找不到应用程序文件</p>');
    }
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC
function registerIpc() {
  ipcMain.handle('get-app-version', () => app.getVersion());
  ipcMain.handle('db-status', () => ({ initialized: !!databaseManager }));
  ipcMain.handle('get-matches', () => databaseManager ? databaseManager.getMatches() : []);
  ipcMain.handle('db-stats', () => databaseManager ? databaseManager.getStats() : { success: false });
}

// 应用生命周期
app.whenReady().then(async () => {
  log('INFO', 'Electron 就绪');
  
  await loadModules();
  registerIpc();
  await createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  log('INFO', '所有窗口关闭');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 错误处理
process.on('uncaughtException', (error) => {
  log('ERROR', '未捕获异常:', error.message);
});

process.on('unhandledRejection', (reason) => {
  log('ERROR', '未处理拒绝:', reason);
});
