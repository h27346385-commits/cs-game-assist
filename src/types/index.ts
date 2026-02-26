// 玩家数据类型
export interface PlayerStats {
  platform: 'perfect' | '5e' | 'official' | 'faceit';
  winRate: number;
  kd: number;
  adr: number;
  hsRate: number;
  rating: number;
  impact: number;
  kast: number;
  openingKillRate: number;
  killsPerRound: number;
  deathsPerRound: number;
  assistsPerRound: number;
  roundsPlayed: number;
  matchesPlayed: number;
  wins: number;
  losses: number;
}

// 残局统计
export interface ClutchStats {
  situation: '1v1' | '1v2' | '1v3' | '1v4' | '1v5' | 'total';
  total: number;
  wins: number;
  losses: number;
  winRate: number;
  avgKills: number;
  saveRate: number;
}

// 地图数据
export interface MapStats {
  mapName: string;
  mapImage: string;
  matches: number;
  wins: number;
  losses: number;
  winRate: number;
  rounds: number;
  ctRounds: number;
  tRounds: number;
  ctWinRate: number;
  tWinRate: number;
  kd: number;
  adr: number;
  kast: number;
  hsRate: number;
}

// 外设信息
export interface Gear {
  type: 'monitor' | 'mouse' | 'keyboard' | 'headset' | 'earphone' | 'chair' | 'desk';
  name: string;
  brand: string;
  image?: string;
  specs?: Record<string, string>;
}

// 职业选手
export interface ProPlayer {
  id: string;
  name: string;
  realName: string;
  nationality: string;
  flag: string;
  team: string;
  teamLogo: string;
  ranking: number;
  stats: {
    rating: number;
    impact: number;
    adr: number;
    kast: number;
  };
  gear: Gear[];
  settings: {
    mouse: {
      dpi: number;
      sensitivity: number;
      edpi: number;
      hz: number;
    };
    crosshair: {
      style: string;
      size: number;
      thickness: number;
      gap: number;
      color: string;
      alpha: number;
    };
    video: {
      resolution: string;
      aspectRatio: string;
      scaling: string;
      brightness: number;
    };
  };
}

// 比赛/Demo
export interface Match {
  id: string;
  mapName: string;
  mapImage: string;
  score: {
    teamA: number;
    teamB: number;
  };
  result: 'win' | 'loss';
  kills: number;
  deaths: number;
  assists: number;
  highlights: number;
  date: string;
  demoPath?: string;
  rounds: Round[];
}

export interface Round {
  roundNumber: number;
  side: 'CT' | 'T';
  result: 'win' | 'loss';
  kills: number;
  isHighlight: boolean;
  highlightType?: '3k' | '4k' | 'ace' | 'clutch' | 'knife' | 'noscope';
}

// 视频片段
export interface VideoClip {
  id: string;
  title: string;
  thumbnail: string;
  duration: number;
  mapName: string;
  weapon: string;
  kills: number;
  createdAt: string;
  filePath?: string;
}

// 皮肤
export interface Skin {
  id: string;
  weapon: string;
  name: string;
  rarity: string;
  image: string;
  wear?: string;
  statTrak?: boolean;
  price?: number;
}

// 导航项
export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  children?: NavItem[];
}
