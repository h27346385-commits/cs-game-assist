/**
 * 真实数据库实现 - 使用 SQLite (better-sqlite3)
 * 离线优先设计，支持完整的比赛数据存储和查询
 */

import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

// 动态加载 better-sqlite3，处理打包后的路径
let DatabaseConstructor: any;
try {
  // 先尝试正常加载
  DatabaseConstructor = require('better-sqlite3');
} catch (e) {
  // 如果失败，尝试从 asar.unpacked 加载
  try {
    const unpackedPath = path.join(app.getAppPath(), '..', 'app.asar.unpacked', 'node_modules', 'better-sqlite3');
    DatabaseConstructor = require(unpackedPath);
  } catch (e2) {
    console.error('[Database] 无法加载 better-sqlite3:', e2);
    throw new Error('无法加载 better-sqlite3 模块');
  }
}

export interface MatchData {
  id?: number;
  match_id: string;
  map_name: string;
  match_date: string;
  duration: number;
  score_team_a: number;
  score_team_b: number;
  team_a_name: string;
  team_b_name: string;
  demo_path: string;
  parsed_data?: string;
  created_at?: string;
}

export interface PlayerStats {
  id?: number;
  match_id: string;
  steam_id: string;
  player_name: string;
  kills: number;
  deaths: number;
  assists: number;
  headshots: number;
  damage: number;
  kd_ratio: number;
  adr: number;
  rating: number;
  team: string;
  created_at?: string;
}

export interface RoundData {
  id?: number;
  match_id: string;
  round_number: number;
  winner_team: string;
  win_reason: string;
  duration: number;
  team_a_money: number;
  team_b_money: number;
}

export interface KillEvent {
  id?: number;
  match_id: string;
  round_number: number;
  tick: number;
  killer_steam_id: string;
  killer_name: string;
  victim_steam_id: string;
  victim_name: string;
  weapon: string;
  headshot: boolean | number;
  killer_position?: string;
  victim_position?: string;
}

export interface HighlightData {
  id?: number;
  match_id: string;
  type: 'ace' | 'quadra' | 'clutch_1v3' | 'clutch_1v4' | 'clutch_1v5' | 'deagle' | 'awp_triple';
  player_name: string;
  player_steam_id: string;
  round_number: number;
  start_tick: number;
  end_tick: number;
  description: string;
  video_path?: string;
  thumbnail_path?: string;
  created_at?: string;
}

export interface QueryResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class DatabaseManager {
  private db: any = null;
  private dbPath: string;

  constructor() {
    const userDataPath = app.getPath('userData');
    this.dbPath = path.join(userDataPath, 'cs-game-assist.db');
  }

  /**
   * 初始化数据库
   */
  async init(): Promise<boolean> {
    try {
      // 确保目录存在
      const dbDir = path.dirname(this.dbPath);
      fs.mkdirSync(dbDir, { recursive: true });

      // 打开数据库
      this.db = new DatabaseConstructor(this.dbPath);
      
      // 启用 WAL 模式以获得更好的并发性能
      this.db.pragma('journal_mode = WAL');
      
      // 创建表结构
      this.createTables();
      
      console.log('[Database] 数据库初始化成功:', this.dbPath);
      return true;
    } catch (error: any) {
      console.error('[Database] 初始化失败:', error);
      return false;
    }
  }

  /**
   * 创建数据库表
   */
  private createTables(): void {
    // 比赛表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS matches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        match_id TEXT UNIQUE NOT NULL,
        map_name TEXT NOT NULL,
        match_date TEXT NOT NULL,
        duration INTEGER DEFAULT 0,
        score_team_a INTEGER DEFAULT 0,
        score_team_b INTEGER DEFAULT 0,
        team_a_name TEXT DEFAULT 'CT',
        team_b_name TEXT DEFAULT 'T',
        demo_path TEXT,
        parsed_data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date);
      CREATE INDEX IF NOT EXISTS idx_matches_map ON matches(map_name);
    `);

    // 玩家统计表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS player_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        match_id TEXT NOT NULL,
        steam_id TEXT NOT NULL,
        player_name TEXT NOT NULL,
        kills INTEGER DEFAULT 0,
        deaths INTEGER DEFAULT 0,
        assists INTEGER DEFAULT 0,
        headshots INTEGER DEFAULT 0,
        damage INTEGER DEFAULT 0,
        kd_ratio REAL DEFAULT 0,
        adr REAL DEFAULT 0,
        rating REAL DEFAULT 0,
        team TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (match_id) REFERENCES matches(match_id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_player_stats_match ON player_stats(match_id);
      CREATE INDEX IF NOT EXISTS idx_player_stats_steam ON player_stats(steam_id);
    `);

    // 回合数据表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS rounds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        match_id TEXT NOT NULL,
        round_number INTEGER NOT NULL,
        winner_team TEXT,
        win_reason TEXT,
        duration INTEGER DEFAULT 0,
        team_a_money INTEGER DEFAULT 0,
        team_b_money INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (match_id) REFERENCES matches(match_id) ON DELETE CASCADE,
        UNIQUE(match_id, round_number)
      );
      CREATE INDEX IF NOT EXISTS idx_rounds_match ON rounds(match_id);
    `);

    // 击杀事件表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS kill_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        match_id TEXT NOT NULL,
        round_number INTEGER NOT NULL,
        tick INTEGER NOT NULL,
        killer_steam_id TEXT,
        killer_name TEXT,
        victim_steam_id TEXT,
        victim_name TEXT,
        weapon TEXT,
        headshot INTEGER DEFAULT 0,
        killer_position TEXT,
        victim_position TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (match_id) REFERENCES matches(match_id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_kills_match ON kill_events(match_id);
      CREATE INDEX IF NOT EXISTS idx_kills_killer ON kill_events(killer_steam_id);
      CREATE INDEX IF NOT EXISTS idx_kills_tick ON kill_events(tick);
    `);

    // 高光时刻表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS highlights (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        match_id TEXT NOT NULL,
        type TEXT NOT NULL,
        player_name TEXT NOT NULL,
        player_steam_id TEXT,
        round_number INTEGER NOT NULL,
        start_tick INTEGER NOT NULL,
        end_tick INTEGER NOT NULL,
        description TEXT,
        video_path TEXT,
        thumbnail_path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (match_id) REFERENCES matches(match_id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_highlights_match ON highlights(match_id);
      CREATE INDEX IF NOT EXISTS idx_highlights_type ON highlights(type);
    `);

    // 用户设置表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  // ==================== 比赛操作 ====================
  
  saveMatch(match: MatchData): QueryResult<{ id: number }> {
    try {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO matches 
        (match_id, map_name, match_date, duration, score_team_a, score_team_b, 
         team_a_name, team_b_name, demo_path, parsed_data)
        VALUES (@match_id, @map_name, @match_date, @duration, @score_team_a, @score_team_b,
                @team_a_name, @team_b_name, @demo_path, @parsed_data)
      `);
      
      const result = stmt.run(match);
      return { success: true, data: { id: result.lastInsertRowid } };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  getMatches(limit: number = 50): QueryResult<MatchData[]> {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM matches ORDER BY match_date DESC LIMIT ?
      `);
      const data = stmt.all(limit);
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  getMatchById(matchId: string): QueryResult<MatchData | null> {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM matches WHERE match_id = ?
      `);
      const data = stmt.get(matchId);
      return { success: true, data: data || null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  deleteMatch(matchId: string): QueryResult<{ deleted: boolean }> {
    try {
      const stmt = this.db.prepare(`DELETE FROM matches WHERE match_id = ?`);
      const result = stmt.run(matchId);
      return { success: true, data: { deleted: result.changes > 0 } };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ==================== 玩家统计操作 ====================

  savePlayerStats(stats: PlayerStats[]): QueryResult<{ count: number }> {
    try {
      const insert = this.db.prepare(`
        INSERT OR REPLACE INTO player_stats
        (match_id, steam_id, player_name, kills, deaths, assists, headshots,
         damage, kd_ratio, adr, rating, team)
        VALUES (@match_id, @steam_id, @player_name, @kills, @deaths, @assists, @headshots,
                @damage, @kd_ratio, @adr, @rating, @team)
      `);
      
      const insertMany = this.db.transaction((items: PlayerStats[]) => {
        for (const item of items) insert.run(item);
      });
      
      insertMany(stats);
      return { success: true, data: { count: stats.length } };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  getPlayerStats(matchId: string): QueryResult<PlayerStats[]> {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM player_stats WHERE match_id = ? ORDER BY kills DESC
      `);
      const data = stmt.all(matchId);
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  getPlayerHistory(steamId: string, limit: number = 50): QueryResult<PlayerStats[]> {
    try {
      const stmt = this.db.prepare(`
        SELECT ps.*, m.map_name, m.match_date 
        FROM player_stats ps
        JOIN matches m ON ps.match_id = m.match_id
        WHERE ps.steam_id = ?
        ORDER BY m.match_date DESC
        LIMIT ?
      `);
      const data = stmt.all(steamId, limit);
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ==================== 击杀事件操作 ====================

  saveKillEvents(events: KillEvent[]): QueryResult<{ count: number }> {
    try {
      const insert = this.db.prepare(`
        INSERT INTO kill_events
        (match_id, round_number, tick, killer_steam_id, killer_name, 
         victim_steam_id, victim_name, weapon, headshot, killer_position, victim_position)
        VALUES (@match_id, @round_number, @tick, @killer_steam_id, @killer_name,
                @victim_steam_id, @victim_name, @weapon, @headshot, @killer_position, @victim_position)
      `);
      
      const insertMany = this.db.transaction((items: KillEvent[]) => {
        for (const item of items) insert.run(item);
      });
      
      insertMany(events);
      return { success: true, data: { count: events.length } };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  getKillEvents(matchId: string, roundNumber?: number): QueryResult<KillEvent[]> {
    try {
      let stmt;
      if (roundNumber !== undefined) {
        stmt = this.db.prepare(`
          SELECT * FROM kill_events WHERE match_id = ? AND round_number = ? ORDER BY tick
        `);
        return { success: true, data: stmt.all(matchId, roundNumber) };
      } else {
        stmt = this.db.prepare(`
          SELECT * FROM kill_events WHERE match_id = ? ORDER BY tick
        `);
        return { success: true, data: stmt.all(matchId) };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ==================== 高光时刻操作 ====================

  saveHighlight(highlight: HighlightData): QueryResult<{ id: number }> {
    try {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO highlights
        (match_id, type, player_name, player_steam_id, round_number, 
         start_tick, end_tick, description, video_path, thumbnail_path)
        VALUES (@match_id, @type, @player_name, @player_steam_id, @round_number,
                @start_tick, @end_tick, @description, @video_path, @thumbnail_path)
      `);
      const result = stmt.run(highlight);
      return { success: true, data: { id: result.lastInsertRowid } };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  getHighlights(matchId?: string, type?: string): QueryResult<HighlightData[]> {
    try {
      let query = 'SELECT * FROM highlights';
      const params: any[] = [];
      const conditions: string[] = [];

      if (matchId) {
        conditions.push('match_id = ?');
        params.push(matchId);
      }
      if (type) {
        conditions.push('type = ?');
        params.push(type);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      query += ' ORDER BY created_at DESC';

      const stmt = this.db.prepare(query);
      const data = stmt.all(...params);
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  updateHighlightVideo(highlightId: number, videoPath: string, thumbnailPath?: string): QueryResult<boolean> {
    try {
      const stmt = this.db.prepare(`
        UPDATE highlights SET video_path = ?, thumbnail_path = ? WHERE id = ?
      `);
      stmt.run(videoPath, thumbnailPath || null, highlightId);
      return { success: true, data: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ==================== 统计数据 ====================

  getStats(): QueryResult<{
    totalMatches: number;
    totalKills: number;
    totalHighlights: number;
    mapsPlayed: Record<string, number>;
  }> {
    try {
      const matches = this.db.prepare('SELECT COUNT(*) as count FROM matches').get();
      const kills = this.db.prepare('SELECT COUNT(*) as count FROM kill_events').get();
      const highlights = this.db.prepare('SELECT COUNT(*) as count FROM highlights').get();
      
      const mapRows = this.db.prepare('SELECT map_name, COUNT(*) as count FROM matches GROUP BY map_name').all();
      const mapsPlayed: Record<string, number> = {};
      for (const row of mapRows) {
        mapsPlayed[row.map_name] = row.count;
      }

      return {
        success: true,
        data: {
          totalMatches: matches.count,
          totalKills: kills.count,
          totalHighlights: highlights.count,
          mapsPlayed,
        }
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ==================== 设置操作 ====================

  getSetting(key: string): QueryResult<string | null> {
    try {
      const stmt = this.db.prepare('SELECT value FROM user_settings WHERE key = ?');
      const row = stmt.get(key);
      return { success: true, data: row?.value || null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  setSetting(key: string, value: string): QueryResult<boolean> {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO user_settings (key, value) VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
      `);
      stmt.run(key, value);
      return { success: true, data: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 关闭数据库连接
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  /**
   * 检查数据库状态
   */
  getStatus(): { connected: boolean; path: string } {
    return {
      connected: this.db !== null,
      path: this.dbPath,
    };
  }
}

// 单例实例
const databaseManager = new DatabaseManager();
export default databaseManager;
