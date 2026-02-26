// 编译 Electron 主进程并转换为 .cjs 格式
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('编译 Electron 主进程...');

// 1. 运行 TypeScript 编译器
try {
  execSync('npx tsc', { stdio: 'inherit', cwd: __dirname });
  console.log('TypeScript 编译完成');
} catch (error) {
  console.error('编译失败:', error);
  process.exit(1);
}

// 2. 将 .js 文件重命名为 .cjs
const distDir = path.join(__dirname, '../dist-electron');
const files = fs.readdirSync(distDir);

for (const file of files) {
  if (file.endsWith('.js')) {
    const oldPath = path.join(distDir, file);
    const newPath = path.join(distDir, file.replace('.js', '.cjs'));
    fs.renameSync(oldPath, newPath);
    console.log(`重命名: ${file} -> ${file.replace('.js', '.cjs')}`);
  }
}

console.log('构建完成！');
