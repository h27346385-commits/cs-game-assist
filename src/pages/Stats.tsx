import { useState } from 'react';
import { TrendingUp, Target, Crosshair, Shield, Zap } from 'lucide-react';
import { mockPlayerStats, mockClutchStats, mockMapStats } from '../data/mock';
// PlayerStats type is available in mock data

const platforms = [
  { id: 'perfect', name: '完美', color: 'bg-blue-500' },
  { id: '5e', name: '5E', color: 'bg-orange-500' },
  { id: 'official', name: '官匹', color: 'bg-yellow-500' },
  { id: 'faceit', name: 'FACEIT', color: 'bg-red-500' },
] as const;

function StatCard({ label, value, subValue, icon: Icon, highlight }: { 
  label: string; 
  value: string | number; 
  subValue?: string;
  icon: any;
  highlight?: boolean;
}) {
  return (
    <div className={`p-4 rounded-lg ${highlight ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm ${highlight ? 'text-gray-400' : 'text-gray-500'}`}>{label}</span>
        <Icon size={16} className={highlight ? 'text-gray-400' : 'text-gray-400'} />
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {subValue && <div className={`text-xs mt-1 ${highlight ? 'text-gray-500' : 'text-gray-400'}`}>{subValue}</div>}
    </div>
  );
}

function ClutchCard({ stats }: { stats: typeof mockClutchStats[0] }) {
  const labels: Record<string, string> = {
    '1v1': '1v1',
    '1v2': '1v2',
    '1v3': '1v3',
    '1v4': '1v4',
    '1v5': '1v5',
    'total': '全部',
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4 text-white">
      <div className="text-sm text-gray-400 mb-2">{labels[stats.situation]}</div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-gray-500">总计</span>
          <span className="ml-2 font-medium">{stats.total}</span>
        </div>
        <div>
          <span className="text-gray-500">胜</span>
          <span className="ml-2 text-green-400">{stats.wins}</span>
        </div>
        <div>
          <span className="text-gray-500">负</span>
          <span className="ml-2 text-red-400">{stats.losses}</span>
        </div>
        <div>
          <span className="text-gray-500">胜率</span>
          <span className="ml-2 font-medium">{stats.winRate}%</span>
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-gray-700">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">平均击杀</span>
          <span>{stats.avgKills}</span>
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span className="text-gray-500">保枪率</span>
          <span>{stats.saveRate}%</span>
        </div>
      </div>
    </div>
  );
}

function MapCard({ stats }: { stats: typeof mockMapStats[0] }) {
  return (
    <div className="bg-gray-900 rounded-lg p-4 text-white">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-16 h-10 bg-gray-700 rounded overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-xs font-bold">
            {stats.mapName.replace('de_', '').toUpperCase()}
          </div>
        </div>
        <div>
          <div className="font-medium">{stats.mapName.replace('de_', '').toUpperCase()}</div>
          <div className="text-xs text-gray-400">{stats.matches} 场比赛</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs mb-3">
        <div className="bg-gray-800 rounded p-2">
          <div className="text-gray-400">比赛</div>
          <div className="font-medium">{stats.wins}胜 {stats.losses}负</div>
          <div className="text-green-400">{stats.winRate}%</div>
        </div>
        <div className="bg-gray-800 rounded p-2">
          <div className="text-gray-400">回合</div>
          <div className="font-medium">{stats.ctRounds}CT</div>
          <div className="font-medium">{stats.tRounds}T</div>
        </div>
        <div className="bg-gray-800 rounded p-2">
          <div className="text-gray-400">胜率</div>
          <div className="text-blue-400">CT {stats.ctWinRate}%</div>
          <div className="text-orange-400">T {stats.tWinRate}%</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 text-xs">
        <div className="text-center">
          <div className="text-gray-400">K/D</div>
          <div className="font-medium">{stats.kd}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-400">ADR</div>
          <div className="font-medium">{stats.adr}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-400">KAST</div>
          <div className="font-medium">{stats.kast}%</div>
        </div>
        <div className="text-center">
          <div className="text-gray-400">HS%</div>
          <div className="font-medium">{stats.hsRate}%</div>
        </div>
      </div>
    </div>
  );
}

export function Stats() {
  const [activePlatform, setActivePlatform] = useState<string>('perfect');
  const stats = mockPlayerStats[activePlatform];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Platform Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
        <div className="flex gap-2">
          {platforms.map(platform => (
            <button
              key={platform.id}
              onClick={() => setActivePlatform(platform.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                ${activePlatform === platform.id 
                  ? 'bg-gray-900 text-white' 
                  : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              <div className={`w-2 h-2 rounded-full ${platform.color}`}></div>
              {platform.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard 
          label="胜率" 
          value={`${stats.winRate}%`} 
          subValue={`${stats.matchesPlayed} 场比赛`}
          icon={TrendingUp}
          highlight
        />
        <StatCard 
          label="K/D" 
          value={stats.kd} 
          subValue={`${stats.killsPerRound} KPR`}
          icon={Target}
          highlight
        />
        <StatCard 
          label="ADR" 
          value={stats.adr} 
          subValue={`${stats.assistsPerRound} APR`}
          icon={Zap}
          highlight
        />
        <StatCard 
          label="Rating 2.0" 
          value={stats.rating} 
          subValue={`Impact ${stats.impact}`}
          icon={Star}
          highlight
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-6 gap-4">
        <StatCard label="HS%" value={`${stats.hsRate}%`} icon={Crosshair} />
        <StatCard label="KAST%" value={`${stats.kast}%`} icon={Shield} />
        <StatCard label="首杀率" value={`${stats.openingKillRate}%`} icon={Target} />
        <StatCard label="Impact" value={stats.impact} icon={Zap} />
        <StatCard label="击杀/回合" value={stats.killsPerRound} icon={Target} />
        <StatCard label="死亡/回合" value={stats.deathsPerRound} icon={Crosshair} />
      </div>

      {/* Clutch Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">残局统计</h3>
        <div className="grid grid-cols-6 gap-4">
          {mockClutchStats.map((clutch, index) => (
            <ClutchCard key={index} stats={clutch} />
          ))}
        </div>
      </div>

      {/* Map Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">地图数据</h3>
        <div className="grid grid-cols-2 gap-4">
          {mockMapStats.map((mapStat, index) => (
            <MapCard key={index} stats={mapStat} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Star icon component
function Star({ size, className }: { size?: number; className?: string }) {
  return (
    <svg 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
