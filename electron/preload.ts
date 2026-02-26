/**
 * 预加载脚本 - 安全地暴露主进程 API 到渲染进程
 */

import { contextBridge, ipcRenderer } from 'electron';

// 暴露给渲染进程的 API
contextBridge.exposeInMainWorld('electronAPI', {
  // ============ 数据库操作 ============
  dbStatus: () => ipcRenderer.invoke('db-status'),
  dbStats: () => ipcRenderer.invoke('db-stats'),
  getMatches: (limit?: number) => ipcRenderer.invoke('get-matches', limit),
  getMatch: (matchId: string) => ipcRenderer.invoke('get-match', matchId),
  saveMatch: (data: any) => ipcRenderer.invoke('save-match', data),
  deleteMatch: (matchId: string) => ipcRenderer.invoke('delete-match', matchId),
  
  // 玩家统计
  getPlayerStats: (matchId: string) => ipcRenderer.invoke('get-player-stats', matchId),
  getPlayerHistory: (steamId: string, limit?: number) => ipcRenderer.invoke('get-player-history', steamId, limit),
  
  // 高光
  getHighlights: (matchId?: string, type?: string) => ipcRenderer.invoke('get-highlights', matchId, type),
  saveHighlight: (data: any) => ipcRenderer.invoke('save-highlight', data),

  // ============ Demo 解析 ============
  parseDemo: (filePath: string) => ipcRenderer.invoke('parse-demo', filePath),
  scanDemoDirectory: (dirPath?: string) => ipcRenderer.invoke('scan-demo-directory', dirPath),

  // ============ 视频生成 ============
  createGenerateTask: (task: any) => ipcRenderer.invoke('create-generate-task', task),
  getGenerateTask: (taskId: string) => ipcRenderer.invoke('get-generate-task', taskId),
  getAllGenerateTasks: () => ipcRenderer.invoke('get-all-generate-tasks'),
  getVideoTemplates: () => ipcRenderer.invoke('get-video-templates'),
  checkVideoTools: () => ipcRenderer.invoke('check-video-tools'),

  // ============ 平台 OAuth ============
  getPlatforms: () => ipcRenderer.invoke('get-platforms'),
  startPlatformAuth: (platform: string) => ipcRenderer.invoke('start-platform-auth', platform),

  // ============ 自动更新 ============
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),

  // ============ 埋点统计 ============
  trackEvent: (event: string, props?: any) => ipcRenderer.invoke('track-event', event, props),
  trackPageView: (page: string) => ipcRenderer.invoke('track-page-view', page),

  // ============ 系统操作 ============
  selectDemoFile: () => ipcRenderer.invoke('select-demo-file'),
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
});

// 类型声明，供 TypeScript 使用
declare global {
  interface Window {
    electronAPI: {
      dbStatus: () => Promise<any>;
      dbStats: () => Promise<any>;
      getMatches: (limit?: number) => Promise<any[]>;
      getMatch: (matchId: string) => Promise<any>;
      saveMatch: (data: any) => Promise<any>;
      deleteMatch: (matchId: string) => Promise<any>;
      
      getPlayerStats: (matchId: string) => Promise<any[]>;
      getPlayerHistory: (steamId: string, limit?: number) => Promise<any[]>;
      
      getHighlights: (matchId?: string, type?: string) => Promise<any[]>;
      saveHighlight: (data: any) => Promise<any>;
      
      parseDemo: (filePath: string) => Promise<any>;
      scanDemoDirectory: (dirPath?: string) => Promise<any>;
      
      createGenerateTask: (task: any) => Promise<any>;
      getGenerateTask: (taskId: string) => Promise<any>;
      getAllGenerateTasks: () => Promise<any[]>;
      getVideoTemplates: () => Promise<any[]>;
      checkVideoTools: () => Promise<any>;
      
      getPlatforms: () => Promise<any[]>;
      startPlatformAuth: (platform: string) => Promise<any>;
      
      checkForUpdates: () => Promise<any>;
      
      trackEvent: (event: string, props?: any) => Promise<void>;
      trackPageView: (page: string) => Promise<void>;
      
      selectDemoFile: () => Promise<string | null>;
      selectDirectory: () => Promise<string | null>;
      getAppVersion: () => Promise<string>;
      openExternal: (url: string) => Promise<void>;
    };
  }
}

export {};
