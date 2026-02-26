/**
 * CS游戏助手 - 主进程入口 (干净版本)
 */

import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

// 确保日志目录存在
const logDir = path.join(app.getPath('userData'), 'logs');
fs.mkdirSync(logDir, { recursive: true });
const logFile = path.join(logDir, `app-${new Date().toISOString().split('T')[0]}.log`);

function log(level: string, msg: string, ...args: any[]) {
  const line = `[${new Date().toISOString()}] [${level}] ${msg} ${args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')}`;
  console.log(line);
  fs.appendFileSync(logFile, line + '\n');
}

log('INFO', '==========================================');
log('INFO', 'CS游戏助手 v' + app.getVersion() + ' 启动');
log('INFO', '==========================================');

// 动态加载模块
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
    return true;
  } catch (error: any) {
    log('ERROR', '模块加载失败:', error.message);
    return false;
  }
}

let mainWindow: BrowserWindow | null = null;

async function createWindow() {
  log('INFO', '创建窗口...');
  
  const preloadPath = path.join(__dirname, 'preload.cjs');
  log('INFO', 'Preload路径:', preloadPath);
  
  if (!fs.existsSync(preloadPath)) {
    log('ERROR', 'Preload文件不存在:', preloadPath);
    // 列出目录内容
    try {
      const files = fs.readdirSync(__dirname);
      log('ERROR', '目录内容:', files);
    } catch (e: any) {
      log('ERROR', '无法读取目录:', e.message);
    }
    return;
  }

  try {
    mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1200,
      minHeight: 700,
      title: 'CS游戏助手',
      show: true,  // 立即显示
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: preloadPath,
        devTools: true,
      },
    });

    log('INFO', '窗口创建成功');

    // 错误处理
    mainWindow.webContents.on('did-fail-load', (_, code, desc) => {
      log('ERROR', '页面加载失败:', code, desc);
    });

    // 加载页面
    const isDev = !app.isPackaged;
    log('INFO', '开发模式:', isDev);

    if (!isDev) {
      // 生产模式 - 尝试多个路径
      const possiblePaths = [
        path.join(__dirname, '../dist/index.html'),
        path.join(__dirname, '../../dist/index.html'),
        path.join(process.resourcesPath, 'app/dist/index.html'),
      ];

      let loaded = false;
      for (const htmlPath of possiblePaths) {
        log('INFO', '尝试路径:', htmlPath);
        if (fs.existsSync(htmlPath)) {
          log('INFO', '找到文件，加载:', htmlPath);
          await mainWindow.loadFile(htmlPath);
          loaded = true;
          break;
        }
      }

      if (!loaded) {
        log('ERROR', '错误: 找不到 index.html！');
        mainWindow.loadURL('data:text/html,<h1>错误</h1><p>找不到应用程序文件</p>');
      }
    } else {
      // 开发模式
      log('INFO', '加载开发服务器');
      await mainWindow.loadURL('http://localhost:5173');
      mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
      log('INFO', '窗口关闭');
      mainWindow = null;
    });

    log('INFO', '窗口初始化完成');
  } catch (e: any) {
    log('ERROR', '创建窗口失败:', e.message);
    log('ERROR', e.stack);
  }
}

// 注册 IPC
function registerIpc() {
  log('INFO', '注册IPC处理程序...');
  
  ipcMain.handle('db-status', () => {
    return { initialized: !!databaseManager };
  });
  
  ipcMain.handle('get-matches', () => {
    return databaseManager ? databaseManager.getMatches() : [];
  });
  
  ipcMain.handle('get-app-version', () => app.getVersion());
  
  log('INFO', 'IPC注册完成');
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

// 错误捕获
process.on('uncaughtException', (error) => {
  log('ERROR', '未捕获的异常:', error.message);
});

process.on('unhandledRejection', (reason) => {
  log('ERROR', '未处理的Promise拒绝:', reason);
});
