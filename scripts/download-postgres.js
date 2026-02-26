/**
 * 下载 PostgreSQL 便携版
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DOWNLOAD_URL = 'https://get.enterprisedb.com/postgresql/postgresql-16.4-1-windows-x64-binaries.zip';
const TARGET_DIR = path.join(__dirname, '../resources/pgsql');
const TEMP_ZIP = path.join(__dirname, '../temp/postgres.zip');

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    console.log(`下载: ${url}`);
    
    const file = fs.createWriteStream(dest);
    https.get(url, { 
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        file.close();
        downloadFile(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`下载失败: ${response.statusCode}`));
        return;
      }

      const totalSize = parseInt(response.headers['content-length'], 10);
      let downloadedSize = 0;

      response.on('data', (chunk) => {
        downloadedSize += chunk.length;
        const percent = Math.floor((downloadedSize / totalSize) * 100);
        process.stdout.write(`\r进度: ${percent}%`);
      });

      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log('\n下载完成');
        resolve();
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('PostgreSQL 便携版下载工具\n');

  if (fs.existsSync(path.join(TARGET_DIR, 'bin/psql.exe'))) {
    console.log('PostgreSQL 已存在，跳过下载');
    return;
  }

  fs.mkdirSync(path.dirname(TEMP_ZIP), { recursive: true });
  fs.mkdirSync(TARGET_DIR, { recursive: true });

  try {
    await downloadFile(DOWNLOAD_URL, TEMP_ZIP);
    console.log('\n解压文件...');
    execSync(`powershell Expand-Archive -Path '${TEMP_ZIP}' -DestinationPath '${path.dirname(TARGET_DIR)}' -Force`);
    fs.unlinkSync(TEMP_ZIP);
    console.log('✅ PostgreSQL 安装完成！');
  } catch (error) {
    console.error('\n❌ 安装失败:', error.message);
    process.exit(1);
  }
}

main();
