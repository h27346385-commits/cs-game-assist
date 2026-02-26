// 最先执行的代码
const fs = require('fs');
const path = require('path');
const logDir = path.join('K:\\kimi_code', 'logs');
try { fs.mkdirSync(logDir, { recursive: true }); } catch (e) {}
const logFile = path.join(logDir, `app-${Date.now()}.log`);
fs.writeFileSync(logFile, `[${new Date().toISOString()}] [INFO] === CS游戏助手启动 ===\n`);
fs.appendFileSync(logFile, `[${new Date().toISOString()}] [INFO] Step 0: 第一行代码\n`);

/**
 * CS游戏助手 - 主进程入口
 */

import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';

fs.appendFileSync(logFile, `[${new Date().toISOString()}] [INFO] Step 1: Electron 导入完成\n`);

function log(level: string, msg: string, ...args: any[]) {
  const line = `[${new Date().toISOString()}] [${level}] ${msg} ${args.join(' ')}`;
  console.log(line);
  try { fs.appendFileSync(logFile, line + '\n'); } catch (e) {}
}

log('INFO', 'Step 2: 日志函数定义完成');

// 延迟加载模块
let databaseManager: any;
let demoParser: any;
let videoGenerator: any;

async function loadModules() {
  log('INFO', 'Step 2: 加载模块');
  try {
    const dbModule = require('./database.cjs');
    databaseManager = dbModule.default || dbModule;
    log('INFO', '  database 加载成功');
  } catch (e: any) {
    log('ERROR', '  database 失败:', e.message);
  }
  
  try {
    const demoModule = require('./demo-parser.cjs');
    demoParser = demoModule.default || demoModule;
    log('INFO', '  demo-parser 加载成功');
  } catch (e: any) {
    log('ERROR', '  demo-parser 失败:', e.message);
  }
  
  try {
    const videoModule = require('./video-generator.cjs');
    videoGenerator = videoModule.default || videoModule;
    log('INFO', '  video-generator 加载成功');
  } catch (e: any) {
    log('ERROR', '  video-generator 失败:', e.message);
  }
}

let mainWindow: BrowserWindow | null = null;

async function createWindow() {
  log('INFO', 'Step 3: 创建窗口');
  
  try {
    const preloadPath = path.join(__dirname, 'preload.cjs');
    log('INFO', '  Preload路径:', preloadPath);
    
    mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      title: 'CS游戏助手',
      show: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: preloadPath,
      },
    });

    log('INFO', '  窗口创建成功');

    // 加载页面
    const possiblePaths = [
      path.join(__dirname, '../dist/index.html'),
      path.join(__dirname, '../../dist/index.html'),
    ];

    let loaded = false;
    for (const htmlPath of possiblePaths) {
      if (fs.existsSync(htmlPath)) {
        log('INFO', '  加载:', htmlPath);
        await mainWindow.loadFile(htmlPath);
        loaded = true;
        break;
      }
    }

    if (!loaded) {
      log('ERROR', '  找不到 index.html');
      await mainWindow.loadURL('data:text/html,<h1>错误</h1>');
    } else {
      log('INFO', '  页面加载成功');
    }

    mainWindow.on('closed', () => {
      log('INFO', '窗口关闭');
      mainWindow = null;
    });

  } catch (e: any) {
    log('ERROR', '创建窗口失败:', e.message);
    log('ERROR', e.stack);
  }
}

function registerIpc() {
  log('INFO', 'Step 4: 注册IPC');
  ipcMain.handle('get-app-version', () => app.getVersion());
  ipcMain.handle('db-status', () => ({ initialized: !!databaseManager }));
}

// 应用生命周期
log('INFO', 'Step 5: 等待 app ready');
fs.appendFileSync(logFile, `[${new Date().toISOString()}] [INFO] Step 5a: about to call whenReady\n`);
app.whenReady().then(async () => {
  fs.appendFileSync(logFile, `[${new Date().toISOString()}] [INFO] Step 6: app ready\n`);
  
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
  app.quit();
});

process.on('uncaughtException', (error) => {
  log('ERROR', '未捕获异常:', error.message);
});

log('INFO', 'Step 7: main.ts 加载完成');
