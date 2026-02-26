import type { Match, Round } from '../types';

// Demo解析器接口
export interface DemoParseResult {
  success: boolean;
  match?: Match;
  error?: string;
}

// 模拟Demo解析 - MVP版本
export async function parseDemoFile(filePath: string): Promise<DemoParseResult> {
  console.log('Parsing demo file:', filePath);
  
  // 模拟解析延迟
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 返回模拟数据
  return {
    success: true,
    match: {
      id: Date.now().toString(),
      mapName: 'de_mirage',
      mapImage: '/maps/mirage.jpg',
      score: {
        teamA: 13,
        teamB: 10,
      },
      result: 'win',
      kills: 24,
      deaths: 18,
      assists: 5,
      highlights: 3,
      date: new Date().toISOString().split('T')[0],
      demoPath: filePath,
      rounds: [
        { roundNumber: 1, side: 'CT', result: 'win', kills: 2, isHighlight: false },
        { roundNumber: 5, side: 'CT', result: 'win', kills: 3, isHighlight: true, highlightType: '3k' },
        { roundNumber: 12, side: 'T', result: 'win', kills: 4, isHighlight: true, highlightType: '4k' },
        { roundNumber: 18, side: 'T', result: 'win', kills: 5, isHighlight: true, highlightType: 'ace' },
      ],
    },
  };
}

// 扫描Demo目录
export async function scanDemoDirectory(directoryPath: string): Promise<string[]> {
  console.log('Scanning demo directory:', directoryPath);
  
  // 模拟扫描延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 返回模拟的demo文件列表
  return [
    `${directoryPath}/match1.dem`,
    `${directoryPath}/match2.dem`,
    `${directoryPath}/match3.dem`,
  ];
}

// 检测CS2安装路径
export async function detectCS2Path(): Promise<string | null> {
  // 模拟检测
  const possiblePaths = [
    'C:/Program Files (x86)/Steam/steamapps/common/Counter-Strike Global Offensive',
    'D:/SteamLibrary/steamapps/common/Counter-Strike Global Offensive',
    'E:/Games/Steam/steamapps/common/Counter-Strike Global Offensive',
  ];
  
  // 随机返回一个路径作为演示
  return possiblePaths[0];
}

// 获取Demo目录
export function getDemoDirectory(cs2Path: string): string {
  return `${cs2Path}/game/csgo/replays`;
}

// 分析比赛数据
export function analyzeMatchData(rounds: Round[]): {
  totalKills: number;
  highlightRounds: Round[];
  clutchRounds: Round[];
  aceRounds: Round[];
} {
  const highlightRounds = rounds.filter(r => r.isHighlight);
  const clutchRounds = rounds.filter(r => r.highlightType === 'clutch');
  const aceRounds = rounds.filter(r => r.highlightType === 'ace');
  const totalKills = rounds.reduce((sum, r) => sum + r.kills, 0);
  
  return {
    totalKills,
    highlightRounds,
    clutchRounds,
    aceRounds,
  };
}

// 计算Rating 2.0 (简化版)
export function calculateRating(stats: {
  kills: number;
  deaths: number;
  assists: number;
  rounds: number;
  damage: number;
}): number {
  const kpr = stats.kills / stats.rounds;
  const dpr = stats.deaths / stats.rounds;
  const apr = stats.assists / stats.rounds;
  const adr = stats.damage / stats.rounds;
  
  // 简化公式
  const rating = (0.7 * kpr) + (0.3 * apr) - (0.5 * dpr) + (0.001 * adr) + 0.5;
  
  return Math.round(rating * 100) / 100;
}

// 导出数据为JSON
export function exportDataToJSON(data: unknown, filename: string): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

// 导入JSON数据
export function importDataFromJSON<T>(jsonString: string): T | null {
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return null;
  }
}
