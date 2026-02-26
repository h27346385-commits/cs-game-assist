/**
 * 自动更新服务
 * 检查更新、下载、安装
 */

import { app, dialog, shell } from 'electron';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';

const UPDATE_URL = 'https://api.csgame.assist/v1/update';
const CURRENT_VERSION = app.getVersion();

export interface UpdateInfo {
  version: string;
  releaseNotes: string;
  downloadUrl: string;
  forceUpdate: boolean;
}

class AutoUpdaterService {
  private checkInterval: NodeJS.Timeout | null = null;
  private isChecking = false;

  /**
   * 检查更新
   */
  async checkForUpdates(): Promise<UpdateInfo | null> {
    if (this.isChecking) return null;
    this.isChecking = true;

    console.log('[Updater] 检查更新...');

    try {
      // 模拟 API 调用
      // TODO: 实现真实的更新检查
      const latestVersion = '1.1.0'; // 模拟版本
      
      if (this.compareVersion(latestVersion, CURRENT_VERSION) > 0) {
        const updateInfo: UpdateInfo = {
          version: latestVersion,
          releaseNotes: '- 新增功能A\n- 修复Bug B\n- 优化性能',
          downloadUrl: 'https://csgame.assist/download/latest',
          forceUpdate: false,
        };
        
        console.log('[Updater] 发现新版本:', latestVersion);
        return updateInfo;
      }

      console.log('[Updater] 当前已是最新版本');
      return null;

    } catch (error) {
      console.error('[Updater] 检查更新失败:', error);
      return null;
    } finally {
      this.isChecking = false;
    }
  }

  /**
   * 下载并安装更新
   */
  async downloadAndInstall(updateInfo: UpdateInfo): Promise<boolean> {
    console.log('[Updater] 开始下载更新...');

    try {
      // 打开浏览器下载
      await shell.openExternal(updateInfo.downloadUrl);
      
      // 提示用户手动安装
      dialog.showMessageBox({
        type: 'info',
        title: '下载更新',
        message: '更新正在下载中',
        detail: '下载完成后，请运行安装程序完成更新。更新完成后将自动重启应用。',
        buttons: ['确定'],
      });

      return true;
    } catch (error) {
      console.error('[Updater] 下载更新失败:', error);
      return false;
    }
  }

  /**
   * 启动定时检查
   */
  startPeriodicCheck(intervalHours: number = 24): void {
    this.stopPeriodicCheck();
    
    const intervalMs = intervalHours * 60 * 60 * 1000;
    this.checkInterval = setInterval(() => {
      this.checkForUpdates();
    }, intervalMs);

    console.log(`[Updater] 启动定时检查，间隔: ${intervalHours}小时`);
  }

  /**
   * 停止定时检查
   */
  stopPeriodicCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * 获取当前版本
   */
  getCurrentVersion(): string {
    return CURRENT_VERSION;
  }

  // ============ 私有方法 ============

  private compareVersion(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const a = parts1[i] || 0;
      const b = parts2[i] || 0;
      if (a > b) return 1;
      if (a < b) return -1;
    }

    return 0;
  }
}

export const autoUpdater = new AutoUpdaterService();
export default autoUpdater;
