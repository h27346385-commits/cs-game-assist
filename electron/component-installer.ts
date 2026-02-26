/**
 * 外部组件下载安装器
 * 在应用首次启动时自动下载和配置 PostgreSQL、FFmpeg、HLAE
 */

import { app } from 'electron';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';

const COMPONENTS = {
  postgresql: {
    name: 'PostgreSQL 17',
    url: 'https://get.enterprisedb.com/postgresql/postgresql-16.4-1-windows-x64-binaries.zip',
    size: 210000000, // ~210MB
    installDir: 'pgsql',
    executable: 'bin/psql.exe',
  },
  ffmpeg: {
    name: 'FFmpeg 6.x',
    url: 'https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip',
    size: 85000000, // ~85MB
    installDir: 'ffmpeg',
    executable: 'bin/ffmpeg.exe',
  },
  hlae: {
    name: 'HLAE',
    url: 'https://github.com/advancedfx/advancedfx/releases/download/v2.155.2/HLAE_Setup.exe',
    size: 35000000, // ~35MB
    installDir: 'hlae',
    executable: 'HLAE.exe',
  },
};

export interface InstallProgress {
  component: string;
  status: 'pending' | 'downloading' | 'extracting' | 'completed' | 'error';
  progress: number;
  error?: string;
}

class ComponentInstaller {
  private resourcesPath: string;
  private progressCallback?: (progress: InstallProgress) => void;

  constructor() {
    const isDev = !app.isPackaged;
    this.resourcesPath = isDev 
      ? path.join(__dirname, '../resources')
      : path.join(process.resourcesPath, 'resources');
  }

  setProgressCallback(callback: (progress: InstallProgress) => void) {
    this.progressCallback = callback;
  }

  /**
   * 检查组件是否已安装
   */
  checkComponents(): Record<string, boolean> {
    const status: Record<string, boolean> = {};
    
    for (const [key, config] of Object.entries(COMPONENTS)) {
      const executablePath = path.join(this.resourcesPath, config.installDir, config.executable);
      status[key] = fs.existsSync(executablePath);
    }
    
    return status;
  }

  /**
   * 安装所有组件
   */
  async installAll(): Promise<boolean> {
    const status = this.checkComponents();
    
    for (const [component, installed] of Object.entries(status)) {
      if (!installed) {
        const success = await this.installComponent(component as keyof typeof COMPONENTS);
        if (!success) return false;
      }
    }
    
    return true;
  }

  /**
   * 安装单个组件
   */
  private async installComponent(component: keyof typeof COMPONENTS): Promise<boolean> {
    const config = COMPONENTS[component];
    const installPath = path.join(this.resourcesPath, config.installDir);
    
    this.reportProgress(component, 'downloading', 0);
    
    try {
      // 创建临时下载目录
      const tempDir = path.join(app.getPath('temp'), 'cs-game-assist-install');
      fs.mkdirSync(tempDir, { recursive: true });
      
      const downloadPath = path.join(tempDir, `${component}_download.tmp`);
      
      // 下载文件
      await this.downloadFile(config.url, downloadPath, (progress) => {
        this.reportProgress(component, 'downloading', progress);
      });
      
      this.reportProgress(component, 'extracting', 90);
      
      // 解压文件
      await this.extractFile(downloadPath, installPath);
      
      // 清理临时文件
      fs.unlinkSync(downloadPath);
      
      this.reportProgress(component, 'completed', 100);
      
      return true;
      
    } catch (error: any) {
      this.reportProgress(component, 'error', 0, error.message);
      return false;
    }
  }

  /**
   * 下载文件
   */
  private downloadFile(url: string, dest: string, onProgress: (progress: number) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(dest);
      
      https.get(url, { 
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 300000,
      }, (response) => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          file.close();
          this.downloadFile(response.headers.location!, dest, onProgress).then(resolve).catch(reject);
          return;
        }
        
        if (response.statusCode !== 200) {
          reject(new Error(`下载失败: ${response.statusCode}`));
          return;
        }

        const totalSize = parseInt(response.headers['content-length'] || '0', 10);
        let downloadedSize = 0;

        response.on('data', (chunk) => {
          downloadedSize += chunk.length;
          if (totalSize > 0) {
            const progress = Math.floor((downloadedSize / totalSize) * 90);
            onProgress(progress);
          }
        });

        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          onProgress(90);
          resolve();
        });
      }).on('error', (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
    });
  }

  /**
   * 解压文件
   */
  private async extractFile(filePath: string, destPath: string): Promise<void> {
    const ext = path.extname(filePath).toLowerCase();
    
    if (ext === '.zip') {
      // 使用 PowerShell 解压
      return new Promise((resolve, reject) => {
        const ps = spawn('powershell', [
          '-Command',
          `Expand-Archive -Path '${filePath}' -DestinationPath '${destPath}' -Force`
        ], { windowsHide: true });
        
        ps.on('close', (code) => {
          if (code === 0) resolve();
          else reject(new Error(`解压失败，退出码: ${code}`));
        });
        
        ps.on('error', reject);
      });
    } else if (ext === '.exe') {
      // 对于安装程序，直接复制到目标目录
      fs.mkdirSync(destPath, { recursive: true });
      fs.copyFileSync(filePath, path.join(destPath, path.basename(filePath)));
    }
  }

  private reportProgress(component: string, status: InstallProgress['status'], progress: number, error?: string) {
    this.progressCallback?.({ component, status, progress, error });
  }
}

export const componentInstaller = new ComponentInstaller();
export default componentInstaller;
