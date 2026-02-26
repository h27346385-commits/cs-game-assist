import { Trophy, Users, TrendingUp } from 'lucide-react';
import { mockProPlayers } from '../data/mock';

export function ProPlayers() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">职业选手 TOP 20</h2>
            <p className="text-sm text-gray-500 mt-1">2026年 HLTV 年度排名</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">数据来源</div>
              <div className="font-medium text-gray-900">HLTV.org</div>
            </div>
            <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
              <Trophy className="text-white" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Players List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-600">
          <div className="col-span-1">排名</div>
          <div className="col-span-4">选手</div>
          <div className="col-span-3">战队</div>
          <div className="col-span-2 text-center">Rating 2.0</div>
          <div className="col-span-2 text-center">Impact</div>
        </div>

        <div className="divide-y divide-gray-100">
          {mockProPlayers.map((player, index) => (
            <div 
              key={player.id} 
              className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 transition-colors cursor-pointer group"
            >
              {/* Rank */}
              <div className="col-span-1">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                  ${index === 0 ? 'bg-yellow-400 text-yellow-900' : 
                    index === 1 ? 'bg-gray-300 text-gray-700' : 
                    index === 2 ? 'bg-orange-400 text-orange-900' : 
                    'bg-gray-100 text-gray-600'}
                `}>
                  {player.ranking}
                </div>
              </div>

              {/* Player Info */}
              <div className="col-span-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-white font-bold">
                    {player.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {player.name}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <span>{player.flag}</span>
                      <span>{player.realName}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Team */}
              <div className="col-span-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                    {player.team.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="font-medium text-gray-700">{player.team}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="col-span-2 text-center">
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  <TrendingUp size={14} />
                  {player.stats.rating.toFixed(2)}
                </div>
              </div>

              <div className="col-span-2 text-center">
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  <Users size={14} />
                  {player.stats.impact.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* More Players Hint */}
      <div className="text-center py-8">
        <p className="text-gray-500">人气高选手也加入</p>
        <p className="text-lg font-medium text-gray-700 mt-1">CS2 全生涯数据</p>
      </div>
    </div>
  );
}
