import { useState } from 'react';
import { Map as MapIcon, Target, Crosshair, Flame, Circle } from 'lucide-react';

const maps = [
  { id: 'dust2', name: 'Dust2', image: '/maps/dust2_overview.jpg' },
  { id: 'mirage', name: 'Mirage', image: '/maps/mirage_overview.jpg' },
  { id: 'inferno', name: 'Inferno', image: '/maps/inferno_overview.jpg' },
  { id: 'ancient', name: 'Ancient', image: '/maps/ancient_overview.jpg' },
  { id: 'nuke', name: 'Nuke', image: '/maps/nuke_overview.jpg' },
];

const modes = [
  { id: 'kills', name: '击杀', icon: Target, color: 'text-green-500' },
  { id: 'deaths', name: '死亡', icon: Crosshair, color: 'text-red-500' },
  { id: 'utility', name: '道具', icon: Flame, color: 'text-orange-500' },
];

export function Heatmap() {
  const [selectedMap, setSelectedMap] = useState(maps[0]);
  const [selectedMode, setSelectedMode] = useState(modes[0]);
  const [showDots, setShowDots] = useState(true);

  // 模拟热力点
  const heatPoints = [
    { x: 30, y: 40, intensity: 0.8 },
    { x: 45, y: 35, intensity: 0.6 },
    { x: 60, y: 50, intensity: 0.9 },
    { x: 35, y: 60, intensity: 0.4 },
    { x: 70, y: 30, intensity: 0.7 },
    { x: 50, y: 45, intensity: 0.5 },
    { x: 25, y: 55, intensity: 0.3 },
    { x: 80, y: 40, intensity: 0.6 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900">热力地图</h2>
        <p className="text-sm text-gray-500 mt-1">分析你的击杀、死亡和道具投掷位置</p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        {/* Map Selector */}
        <div className="flex items-center gap-2">
          <MapIcon size={18} className="text-gray-400" />
          <select 
            value={selectedMap.id}
            onChange={(e) => {
              const map = maps.find(m => m.id === e.target.value);
              if (map) setSelectedMap(map);
            }}
            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {maps.map(map => (
              <option key={map.id} value={map.id}>{map.name}</option>
            ))}
          </select>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-2">
          {modes.map(mode => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${selectedMode.id === mode.id 
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <Icon size={16} className={selectedMode.id === mode.id ? 'text-white' : mode.color} />
                {mode.name}
              </button>
            );
          })}
        </div>

        {/* Toggle Dots */}
        <button 
          onClick={() => setShowDots(!showDots)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
            ${showDots ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          <Circle size={16} />
          显示点位
        </button>
      </div>

      {/* Heatmap */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="aspect-[16/9] bg-gray-900 relative">
          {/* Map Placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🗺️</div>
              <p className="text-white/70 text-lg font-medium">{selectedMap.name}</p>
              <p className="text-white/50 text-sm mt-2">热力地图预览</p>
            </div>
          </div>

          {/* Grid Overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full" style={{
              backgroundImage: `
                linear-gradient(to right, #fff 1px, transparent 1px),
                linear-gradient(to bottom, #fff 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}></div>
          </div>

          {/* Heat Points */}
          {showDots && heatPoints.map((point, index) => (
            <div
              key={index}
              className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full animate-pulse"
              style={{
                left: `${point.x}%`,
                top: `${point.y}%`,
                backgroundColor: selectedMode.id === 'kills' 
                  ? `rgba(34, 197, 94, ${point.intensity * 0.6})`
                  : selectedMode.id === 'deaths'
                    ? `rgba(239, 68, 68, ${point.intensity * 0.6})`
                    : `rgba(249, 115, 22, ${point.intensity * 0.6})`,
                boxShadow: `0 0 ${20 * point.intensity}px ${selectedMode.id === 'kills' 
                  ? 'rgba(34, 197, 94, 0.5)'
                  : selectedMode.id === 'deaths'
                    ? 'rgba(239, 68, 68, 0.5)'
                    : 'rgba(249, 115, 22, 0.5)'}`,
              }}
            />
          ))}

          {/* Map Areas Labels */}
          <div className="absolute top-4 left-4 text-white/50 text-xs font-mono">
            <div className="absolute" style={{ left: '20%', top: '30%' }}>A长</div>
            <div className="absolute" style={{ left: '50%', top: '40%' }}>中路</div>
            <div className="absolute" style={{ left: '70%', top: '60%' }}>B区</div>
            <div className="absolute" style={{ left: '30%', top: '70%' }}>A小</div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200">
          <div className="flex items-center gap-6">
            <div>
              <div className="text-sm text-gray-500">总击杀</div>
              <div className="text-xl font-bold text-green-600">247</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">热点区域</div>
              <div className="text-xl font-bold text-gray-900">A区</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">场均击杀</div>
              <div className="text-xl font-bold text-gray-900">18.3</div>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            基于最近 30 场比赛数据
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Target size={16} className="text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium text-blue-900">分析建议</h4>
            <p className="text-sm text-blue-700 mt-1">
              你在A区的击杀效率最高，建议继续保持。中路死亡较多，注意预瞄和道具使用。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
