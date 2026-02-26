// Electron 入口文件
// 这个文件用于启动主进程

const path = require('path');

// 根据环境加载不同的主进程文件
const isDev = process.env.NODE_ENV === 'development';

if (isDev) {
  require('ts-node/register');
  require('./main.ts');
} else {
  require('./main.js');
}
