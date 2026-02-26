import { User, Clock, Package, DollarSign, Plus, ExternalLink } from 'lucide-react';
import { mockCurrentUser } from '../data/mock';

interface RankBadgeProps {
  platform: string;
  tier: string;
  score?: number;
}

function RankBadge({ platform, tier, score }: RankBadgeProps) {
  const platformNames: Record<string, string> = {
    perfect: '完美',
    '5e': '5E',
    official: '官匹',
    faceit: 'Faceit',
  };

  return (
    <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg min-w-[80px]">
      <span className="text-xs text-gray-500 mb-1">{platformNames[platform]}</span>
      <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center text-white font-bold text-sm mb-1">
        {tier}
      </div>
      {score ? <span className="text-xs text-gray-400">{score}</span> : <span className="text-xs text-gray-400">段位分数</span>}
    </div>
  );
}

interface SkinCardProps {
  skin: typeof mockCurrentUser.skins[0];
}

function SkinCard({ skin }: SkinCardProps) {
  const rarityColors: Record<string, string> = {
    covert: 'from-red-500 to-red-700',
    classified: 'from-pink-500 to-pink-700',
    restricted: 'from-purple-500 to-purple-700',
    milSpec: 'from-blue-500 to-blue-700',
    industrial: 'from-teal-500 to-teal-700',
    consumer: 'from-gray-500 to-gray-700',
  };

  return (
    <div className="relative group">
      <div className={`w-24 h-20 bg-gradient-to-br ${rarityColors[skin.rarity] || 'from-gray-500 to-gray-700'} rounded-lg p-2 flex flex-col justify-between cursor-pointer transition-transform hover:scale-105`}>
        <div className="text-[10px] text-white/80 truncate">{skin.weapon}</div>
        <div className="text-xs text-white font-medium truncate">{skin.name}</div>
        {skin.statTrak && (
          <div className="absolute top-1 right-1 text-[8px] bg-orange-500 text-white px-1 rounded">ST</div>
        )}
      </div>
    </div>
  );
}

function SkinPlaceholder() {
  return (
    <div className="w-24 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
      <Plus size={24} className="text-gray-400" />
    </div>
  );
}

interface GearCardProps {
  gear: typeof mockCurrentUser.gear[0];
}

function GearCard({ gear }: GearCardProps) {
  const typeIcons: Record<string, string> = {
    monitor: '🖥️',
    mouse: '🖱️',
    keyboard: '⌨️',
    headset: '🎧',
    earphone: '🎵',
    chair: '🪑',
    desk: '📋',
  };

  const typeLabels: Record<string, string> = {
    monitor: 'Monitor',
    mouse: 'Mouse',
    keyboard: 'Keyboard',
    headset: 'Headset',
    earphone: 'Earphone',
    chair: 'Chair',
    desk: 'Desk',
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{typeLabels[gear.type]}</span>
        <ExternalLink size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="flex flex-col items-center">
        <div className="text-4xl mb-2">{typeIcons[gear.type]}</div>
        <div className="text-sm font-medium text-gray-900 text-center truncate w-full">{gear.name}</div>
        <div className="text-xs text-gray-500">{gear.brand}</div>
      </div>
      {gear.specs && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          {Object.entries(gear.specs).slice(0, 2).map(([key, value]) => (
            <div key={key} className="flex justify-between text-xs">
              <span className="text-gray-400">{key}</span>
              <span className="text-gray-600">{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function Profile() {
  const user = mockCurrentUser;
  const displayedSkins = user.skins.slice(0, 5);
  const gearItems = user.gear.slice(0, 4);
  const setupItems = user.gear.slice(5, 7);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Player Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-blue-500 to-blue-600"></div>
        <div className="px-6 pb-6">
          <div className="flex items-end -mt-12 mb-4">
            <div className="w-24 h-24 bg-white rounded-xl shadow-lg flex items-center justify-center border-4 border-white">
              <User size={48} className="text-gray-400" />
            </div>
            <div className="ml-4 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-sm text-gray-500">Steam ID: 76561198xxxxxx</p>
            </div>
          </div>

          {/* Rank Badges */}
          <div className="flex gap-3">
            <RankBadge platform="perfect" tier={user.rank.perfect.tier} score={user.rank.perfect.score} />
            <RankBadge platform="5e" tier={user.rank['5e'].tier} score={user.rank['5e'].score} />
            <RankBadge platform="official" tier={user.rank.official.tier} />
            <RankBadge platform="faceit" tier={user.rank.faceit.tier} score={user.rank.faceit.score} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Agent & Stats */}
        <div className="space-y-6">
          {/* Agent Preview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="aspect-[3/4] bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-6xl mb-2">🎮</div>
                <p className="text-sm opacity-70">探员预览</p>
              </div>
            </div>
            <div className="mt-3 text-center">
              <p className="font-medium text-gray-900">第三特种兵连 | 专业人士</p>
              <p className="text-xs text-gray-500">探员品质: 卓越</p>
            </div>
          </div>
        </div>

        {/* Right Column - Stats & Collections */}
        <div className="col-span-2 space-y-6">
          {/* Game Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-6 mb-6">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-gray-400" />
                <span className="text-sm text-gray-600">CS游戏时长:</span>
                <span className="font-medium text-gray-900">{Math.floor(user.playTime / 1000)}小时</span>
              </div>
              <div className="flex items-center gap-2">
                <Package size={18} className="text-gray-400" />
                <span className="text-sm text-gray-600">拥有的皮肤数:</span>
                <span className="font-medium text-gray-900">{user.skinCount}个</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign size={18} className="text-gray-400" />
                <span className="text-sm text-gray-600">皮肤价值:</span>
                <span className="font-medium text-gray-900">¥{user.skinValue.toLocaleString()}</span>
              </div>
            </div>

            {/* Skins Grid */}
            <div className="flex items-center gap-3">
              {displayedSkins.map(skin => (
                <SkinCard key={skin.id} skin={skin} />
              ))}
              <SkinPlaceholder />
            </div>
          </div>

          {/* Gear Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">外设 Gear</h3>
            <div className="grid grid-cols-4 gap-4">
              {gearItems.map((gear, index) => (
                <GearCard key={index} gear={gear} />
              ))}
            </div>
          </div>

          {/* Setup Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Setup & Streaming</h3>
            <div className="grid grid-cols-4 gap-4">
              {setupItems.map((gear, index) => (
                <GearCard key={index} gear={gear} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
