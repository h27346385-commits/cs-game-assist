/**
 * CS2 Demo 解析器 - 真实实现
 * 使用 demoinfocs-golang 或直接解析 .dem 文件
 */

import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { spawn, execFile } from 'child_process';

// 动态加载数据库模块（处理 .cjs 扩展名问题）
let databaseManager: any;
function getDatabaseManager() {
  if (!databaseManager) {
    try {
      const dbModule = require('./database.cjs');
      databaseManager = dbModule.default || dbModule;
    } catch (e) {
      console.error('[DemoParser] 加载数据库模块失败:', e);
    }
  }
  return databaseManager;
}

// 解析结果类型
export interface DemoParseResult {
  success: boolean;
  matchId: string;
  mapName: string;
  matchDate: string;
  duration: number;
  scoreA: number;
  scoreB: number;
  teamAName: string;
  teamBName: string;
  players: PlayerData[];
  rounds: RoundData[];
  kills: KillEventData[];
  highlights: HighlightData[];
  error?: string;
}

export interface PlayerData {
  steamId: string;
  name: string;
  kills: number;
  deaths: number;
  assists: number;
  headshots: number;
  damage: number;
  team: string;
}

export interface RoundData {
  roundNumber: number;
  winner: string;
  winReason: string;
  duration: number;
  teamAMoney: number;
  teamBMoney: number;
}

export interface KillEventData {
  round: number;
  tick: number;
  killerSteamId?: string;
  killerName?: string;
  victimSteamId: string;
  victimName: string;
  weapon: string;
  headshot: boolean;
}

export interface HighlightData {
  type: 'ace' | 'quadra' | 'clutch_1v3' | 'clutch_1v4' | 'clutch_1v5' | 'deagle' | 'awp_triple';
  playerName: string;
  playerSteamId: string;
  round: number;
  startTick: number;
  endTick: number;
  description: string;
}

class DemoParser {
  private csdaPath: string;
  private useMock: boolean = false;

  constructor() {
    // 检查是否存在 CSDA 解析器二进制文件
    const resourcesPath = app.isPackaged 
      ? path.join(process.resourcesPath, 'resources')
      : path.join(__dirname, '../resources');
    
    this.csdaPath = path.join(resourcesPath, 'csda', 'csda.exe');
    this.useMock = !fs.existsSync(this.csdaPath);
    
    if (this.useMock) {
      console.log('[DemoParser] CSDA 未找到，使用基础解析模式');
    } else {
      console.log('[DemoParser] 使用 CSDA 解析器:', this.csdaPath);
    }
  }

  /**
   * 解析 Demo 文件
   */
  async parseDemo(filePath: string): Promise<DemoParseResult> {
    try {
      // 检查文件是否存在
      if (!fs.existsSync(filePath)) {
        throw new Error('Demo 文件不存在');
      }

      // 生成比赛 ID
      const stats = fs.statSync(filePath);
      const fileName = path.basename(filePath, '.dem');
      const matchId = `match_${fileName}_${stats.mtime.getTime()}`;

      // 如果有 CSDA 解析器，使用它
      if (!this.useMock && fs.existsSync(this.csdaPath)) {
        return await this.parseWithCsda(filePath, matchId);
      }

      // 否则使用基础信息提取
      return await this.parseBasicInfo(filePath, matchId);

    } catch (error: any) {
      console.error('[DemoParser] 解析失败:', error);
      return {
        success: false,
        matchId: '',
        mapName: 'unknown',
        matchDate: new Date().toISOString(),
        duration: 0,
        scoreA: 0,
        scoreB: 0,
        teamAName: 'CT',
        teamBName: 'T',
        players: [],
        rounds: [],
        kills: [],
        highlights: [],
        error: error.message,
      };
    }
  }

  /**
   * 使用 CSDA 解析器
   */
  private async parseWithCsda(filePath: string, matchId: string): Promise<DemoParseResult> {
    return new Promise((resolve, reject) => {
      const outputPath = path.join(app.getPath('temp'), `csda_${Date.now()}.json`);
      
      execFile(this.csdaPath, ['parse', filePath, '-o', outputPath], {
        timeout: 300000, // 5分钟超时
        maxBuffer: 50 * 1024 * 1024, // 50MB 缓冲区
      }, (error, stdout, stderr) => {
        if (error && !fs.existsSync(outputPath)) {
          reject(new Error(`CSDA 解析失败: ${stderr || error.message}`));
          return;
        }

        try {
          const result = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
          fs.unlinkSync(outputPath); // 清理临时文件

          resolve({
            success: true,
            matchId,
            mapName: result.map || 'unknown',
            matchDate: result.date || new Date().toISOString(),
            duration: result.duration || 0,
            scoreA: result.score?.ct || 0,
            scoreB: result.score?.t || 0,
            teamAName: 'CT',
            teamBName: 'T',
            players: result.players || [],
            rounds: result.rounds || [],
            kills: result.kills || [],
            highlights: this.extractHighlights(result.kills || []),
          });
        } catch (parseError: any) {
          reject(new Error(`解析结果失败: ${parseError.message}`));
        }
      });
    });
  }

  /**
   * 基础信息提取（无 CSDA 时的降级方案）
   * 提取文件名中的信息
   */
  private async parseBasicInfo(filePath: string, matchId: string): Promise<DemoParseResult> {
    const fileName = path.basename(filePath, '.dem');
    const stats = fs.statSync(filePath);

    // 尝试从文件名解析地图和分数
    // 常见格式: match730_003..._de_dust2.dem 或 auto-20240101-de_inferno.dem
    let mapName = 'unknown';
    let scoreA = 0;
    let scoreB = 0;

    const mapMatch = fileName.match(/de_[a-z0-9_]+/);
    if (mapMatch) {
      mapName = mapMatch[0];
    }

    // 尝试读取文件头部的基本信息
    const headerInfo = await this.readDemoHeader(filePath);

    return {
      success: true,
      matchId,
      mapName: headerInfo.mapName || mapName,
      matchDate: stats.mtime.toISOString(),
      duration: headerInfo.duration || 0,
      scoreA,
      scoreB,
      teamAName: 'CT',
      teamBName: 'T',
      players: [],
      rounds: [],
      kills: [],
      highlights: [],
    };
  }

  /**
   * 读取 Demo 文件头部信息
   */
  private async readDemoHeader(filePath: string): Promise<{ mapName: string; duration: number }> {
    return new Promise((resolve) => {
      const stream = fs.createReadStream(filePath, { start: 0, end: 1024 });
      let buffer = Buffer.alloc(0);

      stream.on('data', (chunk: any) => {
        buffer = Buffer.concat([buffer, chunk]);
      });

      stream.on('end', () => {
        try {
          // HL2 Demo 格式头部
          // 前 8 字节是 HL2DEMO 标识
          // 之后是协议版本、网络版本等
          // 地图名在偏移 540 左右的位置
          
          // 简单检测：查找 de_ 开头的地图名
          const str = buffer.toString('ascii');
          const mapMatch = str.match(/(de_[a-z0-9_]+)/);
          
          resolve({
            mapName: mapMatch ? mapMatch[1] : 'unknown',
            duration: 0, // 需要完整解析才能获取
          });
        } catch {
          resolve({ mapName: 'unknown', duration: 0 });
        }
      });

      stream.on('error', () => {
        resolve({ mapName: 'unknown', duration: 0 });
      });
    });
  }

  /**
   * 从击杀数据中提取高光时刻
   */
  private extractHighlights(kills: any[]): HighlightData[] {
    const highlights: HighlightData[] = [];
    
    // 按回合分组统计击杀
    const killsByRound: Record<number, any[]> = {};
    for (const kill of kills) {
      const round = kill.round || 0;
      if (!killsByRound[round]) killsByRound[round] = [];
      killsByRound[round].push(kill);
    }

    // 检测 Ace (一回合击杀 5 人)
    for (const [round, roundKills] of Object.entries(killsByRound)) {
      const killerCounts: Record<string, { count: number; name: string; steamId: string; kills: any[] }> = {};
      
      for (const kill of roundKills) {
        const id = kill.killerSteamId;
        if (id) {
          if (!killerCounts[id]) {
            killerCounts[id] = { 
              count: 0, 
              name: kill.killerName || 'Unknown',
              steamId: id,
              kills: [],
            };
          }
          killerCounts[id].count++;
          killerCounts[id].kills.push(kill);
        }
      }

      // 检测多杀
      for (const [steamId, data] of Object.entries(killerCounts)) {
        if (data.count >= 5) {
          highlights.push({
            type: 'ace',
            playerName: data.name,
            playerSteamId: data.steamId,
            round: parseInt(round),
            startTick: data.kills[0].tick,
            endTick: data.kills[data.kills.length - 1].tick,
            description: `${data.name} 在本回合完成 ACE (5杀)`,
          });
        } else if (data.count === 4) {
          highlights.push({
            type: 'quadra',
            playerName: data.name,
            playerSteamId: data.steamId,
            round: parseInt(round),
            startTick: data.kills[0].tick,
            endTick: data.kills[data.kills.length - 1].tick,
            description: `${data.name} 在本回合完成 4杀`,
          });
        }

        // 检测 AWP 三杀
        const awpKills = data.kills.filter((k: any) => k.weapon?.includes('AWP'));
        if (awpKills.length >= 3) {
          highlights.push({
            type: 'awp_triple',
            playerName: data.name,
            playerSteamId: data.steamId,
            round: parseInt(round),
            startTick: awpKills[0].tick,
            endTick: awpKills[awpKills.length - 1].tick,
            description: `${data.name} AWP 三杀`,
          });
        }

        // 检测沙鹰击杀
        const deagleKills = data.kills.filter((k: any) => k.weapon?.includes('Deagle'));
        if (deagleKills.length >= 3) {
          highlights.push({
            type: 'deagle',
            playerName: data.name,
            playerSteamId: data.steamId,
            round: parseInt(round),
            startTick: deagleKills[0].tick,
            endTick: deagleKills[deagleKills.length - 1].tick,
            description: `${data.name} 沙鹰 ${deagleKills.length}杀`,
          });
        }
      }
    }

    return highlights;
  }

  /**
   * 扫描 Demo 目录
   */
  async scanDemoDirectory(dirPath?: string): Promise<{ demos: string[]; count: number }> {
    try {
      // 默认扫描 CS2 的 demo 目录
      const targetDir = dirPath || await this.getDefaultDemoPath();
      
      if (!fs.existsSync(targetDir)) {
        return { demos: [], count: 0 };
      }

      const files = fs.readdirSync(targetDir);
      const demos = files
        .filter(f => f.endsWith('.dem'))
        .map(f => path.join(targetDir, f));

      return { demos, count: demos.length };
    } catch (error: any) {
      console.error('[DemoParser] 扫描目录失败:', error);
      return { demos: [], count: 0 };
    }
  }

  /**
   * 获取默认 Demo 目录
   */
  private async getDefaultDemoPath(): Promise<string> {
    // 尝试从 Steam 库获取 CS2 路径
    const cs2Path = await this.findCS2Path();
    if (cs2Path) {
      return path.join(cs2Path, 'game', 'csgo', 'replays');
    }

    // 默认路径
    return path.join(app.getPath('home'), 'AppData', 'Local', 'Replays');
  }

  /**
   * 查找 CS2 安装路径
   */
  private async findCS2Path(): Promise<string | null> {
    try {
      // 检查注册表
      const { exec } = await import('child_process');
      
      return new Promise((resolve) => {
        exec('reg query "HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Valve\\Steam" /v InstallPath', 
          (err, stdout) => {
            if (err) {
              resolve(null);
              return;
            }

            const match = stdout.match(/InstallPath\s+REG_SZ\s+(.+)/);
            if (match) {
              const steamPath = match[1].trim();
              const cs2Path = path.join(steamPath, 'steamapps', 'common', 'Counter-Strike Global Offensive');
              if (fs.existsSync(cs2Path)) {
                resolve(cs2Path);
                return;
              }
            }
            resolve(null);
          }
        );
      });
    } catch {
      return null;
    }
  }

  /**
   * 解析并保存 Demo 到数据库
   */
  async parseAndSave(filePath: string): Promise<DemoParseResult> {
    const result = await this.parseDemo(filePath);
    const db = getDatabaseManager();
    
    if (result.success && db) {
      // 保存比赛数据
      await db.saveMatch({
        match_id: result.matchId,
        map_name: result.mapName,
        match_date: result.matchDate,
        duration: result.duration,
        score_team_a: result.scoreA,
        score_team_b: result.scoreB,
        team_a_name: result.teamAName,
        team_b_name: result.teamBName,
        demo_path: filePath,
        parsed_data: JSON.stringify(result),
      });

      // 保存玩家统计
      if (result.players.length > 0) {
        const stats = result.players.map(p => ({
          match_id: result.matchId,
          steam_id: p.steamId,
          player_name: p.name,
          kills: p.kills,
          deaths: p.deaths,
          assists: p.assists,
          headshots: p.headshots,
          damage: p.damage,
          kd_ratio: p.deaths > 0 ? p.kills / p.deaths : p.kills,
          adr: p.damage / (result.rounds.length || 1),
          rating: 0, // 需要计算
          team: p.team,
        }));
        await db.savePlayerStats(stats);
      }

      // 保存击杀事件
      if (result.kills.length > 0) {
        const events = result.kills.map(k => ({
          match_id: result.matchId,
          round_number: k.round,
          tick: k.tick,
          killer_steam_id: k.killerSteamId || '',
          killer_name: k.killerName || '',
          victim_steam_id: k.victimSteamId,
          victim_name: k.victimName,
          weapon: k.weapon,
          headshot: k.headshot,
        }));
        await db.saveKillEvents(events);
      }

      // 保存高光时刻
      for (const highlight of result.highlights) {
        await db.saveHighlight({
          match_id: result.matchId,
          type: highlight.type,
          player_name: highlight.playerName,
          player_steam_id: highlight.playerSteamId,
          round_number: highlight.round,
          start_tick: highlight.startTick,
          end_tick: highlight.endTick,
          description: highlight.description,
        });
      }
    }

    return result;
  }
}

const demoParser = new DemoParser();
export default demoParser;
