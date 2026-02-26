/**
 * 内存数据库 - 演示版
 * 用于快速开发和演示，数据存储在内存中
 */

import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

// 数据存储
const memoryDB = {
  matches: [] as any[],
  rounds: [] as any[],
  kills: [] as any[],
  playerStats: [] as any[],
  highlights: [] as any[],
  userSettings: new Map<string, string>(),
};

// 持久化文件路径
function getDataPath() {
  const userData = app.getPath('userData');
  return path.join(userData, 'data.json');
}

class MockDatabaseService {
  private initialized = false;

  /**
   * 初始化数据库
   */
  async initialize(): Promise<boolean> {
    console.log('[MockDB] 初始化内存数据库...');
    
    // 尝试从文件加载数据
    this.loadFromFile();
    
    this.initialized = true;
    console.log('[MockDB] 数据库初始化完成');
    console.log(`[MockDB] 当前数据: ${memoryDB.matches.length} 场比赛, ${memoryDB.highlights.length} 个高光`);
    return true;
  }

  /**
   * 检查状态
   */
  async checkStatus(): Promise<{ initialized: boolean; running: boolean }> {
    return {
      initialized: this.initialized,
      running: this.initialized,
    };
  }

  /**
   * 启动服务（内存数据库无需启动）
   */
  async start(): Promise<boolean> {
    return true;
  }

  /**
   * 停止服务（保存数据到文件）
   */
  async stop(): Promise<boolean> {
    this.saveToFile();
    return true;
  }

  /**
   * 运行迁移（内存数据库无需迁移）
   */
  async runMigrations(): Promise<boolean> {
    return true;
  }

  // ============ CRUD 操作 ============

  /**
   * 插入数据
   */
  insert(table: keyof typeof memoryDB, data: any): any {
    const id = this.generateId();
    const record = { ...data, id, created_at: new Date().toISOString() };
    
    if (Array.isArray(memoryDB[table])) {
      (memoryDB[table] as any[]).push(record);
    }
    
    this.saveToFile();
    return record;
  }

  /**
   * 查询所有
   */
  select(table: keyof typeof memoryDB, where?: Partial<any>): any[] {
    const data = memoryDB[table];
    if (!Array.isArray(data)) return [];
    
    if (!where) return [...data];
    
    return data.filter(item => {
      return Object.entries(where).every(([key, value]) => item[key] === value);
    });
  }

  /**
   * 查询单条
   */
  selectOne(table: keyof typeof memoryDB, where: Partial<any>): any | null {
    const results = this.select(table, where);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * 更新数据
   */
  update(table: keyof typeof memoryDB, where: Partial<any>, data: Partial<any>): any[] {
    const items = memoryDB[table] as any[];
    const updated: any[] = [];
    
    for (const item of items) {
      if (Object.entries(where).every(([key, value]) => item[key] === value)) {
        Object.assign(item, data, { updated_at: new Date().toISOString() });
        updated.push(item);
      }
    }
    
    this.saveToFile();
    return updated;
  }

  /**
   * 删除数据
   */
  delete(table: keyof typeof memoryDB, where: Partial<any>): number {
    const items = memoryDB[table] as any[];
    const initialLength = items.length;
    
    const filtered = items.filter(item => {
      return !Object.entries(where).every(([key, value]) => item[key] === value);
    });
    
    (memoryDB[table] as any[]) = filtered;
    
    const deleted = initialLength - filtered.length;
    if (deleted > 0) this.saveToFile();
    return deleted;
  }

  /**
   * 获取统计
   */
  getStats(): any {
    return {
      totalMatches: memoryDB.matches.length,
      totalHighlights: memoryDB.highlights.length,
      totalKills: memoryDB.matches.reduce((sum, m) => sum + (m.kills || 0), 0),
    };
  }

  // ============ 业务方法 ============

  saveMatch(matchData: any) {
    return this.insert('matches', matchData);
  }

  getMatches(limit?: number) {
    const matches = this.select('matches');
    return limit ? matches.slice(0, limit) : matches;
  }

  getMatchById(id: string) {
    return this.selectOne('matches', { id });
  }

  saveHighlight(highlight: any) {
    return this.insert('highlights', highlight);
  }

  getHighlights(limit?: number) {
    const highlights = this.select('highlights');
    return limit ? highlights.slice(0, limit) : highlights;
  }

  // ============ 私有方法 ============

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private loadFromFile() {
    try {
      const dataPath = getDataPath();
      if (fs.existsSync(dataPath)) {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        Object.assign(memoryDB, data);
        console.log('[MockDB] 从文件加载数据');
      }
    } catch (error) {
      console.error('[MockDB] 加载数据失败:', error);
    }
  }

  private saveToFile() {
    try {
      const dataPath = getDataPath();
      fs.mkdirSync(path.dirname(dataPath), { recursive: true });
      fs.writeFileSync(dataPath, JSON.stringify({
        matches: memoryDB.matches,
        rounds: memoryDB.rounds,
        kills: memoryDB.kills,
        playerStats: memoryDB.playerStats,
        highlights: memoryDB.highlights,
      }, null, 2));
    } catch (error) {
      console.error('[MockDB] 保存数据失败:', error);
    }
  }
}

export const mockDB = new MockDatabaseService();
export default mockDB;
