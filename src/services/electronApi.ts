/**
 * Electron API 服务层
 * 封装与主进程的 IPC 通信
 */

// 类型定义在需要时从 types 导入
// import type { Match, Highlight, VideoTemplate, VideoTask } from '../types';

// 检查 electronAPI 是否可用
export function isElectronAvailable(): boolean {
  return typeof window !== 'undefined' && !!(window as any).electronAPI;
}

// 获取 electronAPI
function getApi() {
  if (!isElectronAvailable()) {
    throw new Error('Electron API 不可用');
  }
  return (window as any).electronAPI;
}

// 数据库服务
export const databaseService = {
  async getStatus() {
    return getApi().dbStatus();
  },
  
  async getStats() {
    return getApi().dbStats();
  },
  
  async getMatches(limit?: number) {
    return getApi().getMatches(limit);
  },
  
  async getMatch(matchId: string) {
    return getApi().getMatch(matchId);
  },
  
  async saveMatch(data: any) {
    return getApi().saveMatch(data);
  },
  
  async deleteMatch(matchId: string) {
    return getApi().deleteMatch(matchId);
  },
  
  async getPlayerStats(matchId: string) {
    return getApi().getPlayerStats(matchId);
  },
  
  async getHighlights(matchId?: string, type?: string) {
    return getApi().getHighlights(matchId, type);
  },
};

// Demo 解析服务
export const demoService = {
  async parseDemo(filePath: string) {
    return getApi().parseDemo(filePath);
  },
  
  async scanDemoDirectory(dirPath?: string) {
    return getApi().scanDemoDirectory(dirPath);
  },
  
  async selectDemoFile() {
    return getApi().selectDemoFile();
  },
  
  async selectDirectory() {
    return getApi().selectDirectory();
  },
};

// 视频生成服务
export const videoService = {
  async getTemplates() {
    return getApi().getVideoTemplates();
  },
  
  async checkTools() {
    return getApi().checkVideoTools();
  },
  
  async createTask(task: any) {
    return getApi().createGenerateTask(task);
  },
  
  async getTask(taskId: string) {
    return getApi().getGenerateTask(taskId);
  },
  
  async getAllTasks() {
    return getApi().getAllGenerateTasks();
  },
};

// 平台服务
export const platformService = {
  async getPlatforms() {
    return getApi().getPlatforms();
  },
  
  async startAuth(platform: string) {
    return getApi().startPlatformAuth(platform);
  },
};

// 系统服务
export const systemService = {
  async getAppVersion() {
    if (!isElectronAvailable()) return '1.0.0';
    return getApi().getAppVersion();
  },
  
  async openExternal(url: string) {
    if (!isElectronAvailable()) {
      window.open(url, '_blank');
      return;
    }
    return getApi().openExternal(url);
  },
  
  async getLogs() {
    if (!isElectronAvailable()) return [];
    return getApi().getLogs();
  },
};
