import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import * as path from 'path';

// 获取 __dirname 的绝对路径
const __dirname = path.dirname(__filename);

console.log('==========================================');
console.log('CS游戏助手 启动');
console.log('==========================================');
console.log('主进程文件:', __filename);
console.log('主进程目录:', __dirname);
console.log('当前工作目录:', process.cwd());
console.log('平台:', process.platform);
console.log('版本:', app.getVersion());
console.log('==========================================');

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  // 预加载脚本路径
  const preloadPath = path.join(__dirname, 'preload.js');
  console.log('Preload路径:', preloadPath);

  // 创建窗口
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    title: 'CS游戏助手',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
      devTools: true,
    },
    show: false,
  });

  // 处理加载错误
  mainWindow.webContents.on('did-fail-load', (_, code, desc) => {
    console.error('加载失败:', code, desc);
  });

  mainWindow.webContents.on('console-message', (_, level, msg) => {
    console.log(`[渲染进程] ${msg}`);
  });

  // 确定要加载的文件
  const isPackaged = app.isPackaged;
  console.log('是否打包:', isPackaged);

  if (!isPackaged) {
    // 开发模式
    console.log('开发模式: 加载 http://localhost:5173');
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // 生产模式 - 使用多种方式尝试找到 index.html
    const possiblePaths = [
      path.join(__dirname, '../dist/index.html'),      // 标准路径
      path.join(__dirname, '../../dist/index.html'),   // 上一级
      path.join(process.resourcesPath, 'app/dist/index.html'), // resources路径
      path.join(app.getAppPath(), 'dist/index.html'),  // app路径
    ];

    let loaded = false;
    for (const htmlPath of possiblePaths) {
      console.log('尝试路径:', htmlPath);
      try {
        const fs = require('fs');
        if (fs.existsSync(htmlPath)) {
          console.log('找到文件，正在加载:', htmlPath);
          mainWindow.loadFile(htmlPath);
          loaded = true;
          break;
        }
      } catch (e: any) {
        console.log('路径无效:', e.message);
      }
    }

    if (!loaded) {
      console.error('错误: 找不到 index.html 文件！');
      console.log('尝试列出目录内容...');
      try {
        console.log('__dirname 内容:', require('fs').readdirSync(__dirname));
      } catch (e) {}
      try {
        console.log('父目录内容:', require('fs').readdirSync(path.join(__dirname, '..')));
      } catch (e) {}
    }
  }

  mainWindow.once('ready-to-show', () => {
    console.log('窗口就绪，显示窗口');
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    console.log('窗口关闭');
    mainWindow = null;
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  console.log('Electron 就绪');
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  console.log('所有窗口关闭');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC 处理
ipcMain.handle('select-demo-file', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'Demo', extensions: ['dem'] }, { name: 'All', extensions: ['*'] }],
  });
  return result.filePaths[0] || null;
});

ipcMain.handle('select-directory', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] });
  return result.filePaths[0] || null;
});

ipcMain.handle('get-app-version', () => app.getVersion());
ipcMain.handle('open-external', async (_, url: string) => shell.openExternal(url));
