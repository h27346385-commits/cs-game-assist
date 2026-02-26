import { useState } from 'react';
import { Crosshair, Mouse, Monitor, ChevronDown, Copy, Check } from 'lucide-react';
import { mockProPlayers, mockCurrentUser } from '../data/mock';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

// 雷达图数据
const radarData = [
  { subject: '火力', A: 85, B: 95, fullMark: 100 },
  { subject: '突破', A: 70, B: 88, fullMark: 100 },
  { subject: '补枪', A: 80, B: 92, fullMark: 100 },
  { subject: '残局', A: 75, B: 85, fullMark: 100 },
  { subject: '道具', A: 65, B: 78, fullMark: 100 },
  { subject: '狙击', A: 60, B: 82, fullMark: 100 },
  { subject: '枪法', A: 82, B: 96, fullMark: 100 },
];

interface GearComparisonProps {
  label: string;
  playerValue: string;
  proValue: string;
}

function GearComparison({ label, playerValue, proValue }: GearComparisonProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-900 w-20 text-right">{playerValue}</span>
        <span className="text-sm font-medium text-blue-600 w-20 text-right">{proValue}</span>
      </div>
    </div>
  );
}

export function IdolTemplate() {
  const [selectedPlayer, setSelectedPlayer] = useState(mockProPlayers[0]);
  const [copied, setCopied] = useState(false);

  const handleCopyCfg = () => {
    const cfg = `
// ${selectedPlayer.name} 配置
sensitivity ${selectedPlayer.settings.mouse.sensitivity}
zoom_sensitivity_ratio_mouse "1"
cl_crosshairstyle ${selectedPlayer.settings.crosshair.style === 'Classic Static' ? '4' : '5'}
cl_crosshairsize ${selectedPlayer.settings.crosshair.size}
cl_crosshairthickness ${selectedPlayer.settings.crosshair.thickness}
cl_crosshairgap ${selectedPlayer.settings.crosshair.gap}
cl_crosshaircolor "${selectedPlayer.settings.crosshair.color.toLowerCase()}"
cl_crosshairalpha ${selectedPlayer.settings.crosshair.alpha}
    `.trim();
    
    navigator.clipboard.writeText(cfg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Player Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">选择偶像选手:</span>
          <div className="relative">
            <select 
              value={selectedPlayer.id}
              onChange={(e) => {
                const player = mockProPlayers.find(p => p.id === e.target.value);
                if (player) setSelectedPlayer(player);
              }}
              className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {mockProPlayers.map(player => (
                <option key={player.id} value={player.id}>
                  #{player.ranking} {player.name} ({player.team})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>
      </div>

      {/* Main Comparison */}
      <div className="grid grid-cols-3 gap-6">
        {/* Player Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-center mb-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-2xl font-bold mb-3">
              {mockCurrentUser.name.slice(0, 2).toUpperCase()}
            </div>
            <h3 className="font-bold text-gray-900">{mockCurrentUser.name}</h3>
            <p className="text-sm text-gray-500">你</p>
          </div>

          {/* Skins */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {mockCurrentUser.skins.slice(0, 6).map(skin => (
              <div key={skin.id} className="aspect-square bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center">
                <span className="text-xs text-white text-center px-1">{skin.weapon}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Radar Chart */}
        <div className="bg-gray-900 rounded-xl shadow-sm p-6 text-white">
          <h3 className="text-center font-bold mb-4">能力雷达图</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="你"
                  dataKey="A"
                  stroke="#60A5FA"
                  fill="#60A5FA"
                  fillOpacity={0.3}
                />
                <Radar
                  name={selectedPlayer.name}
                  dataKey="B"
                  stroke="#F87171"
                  fill="#F87171"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-400"></div>
              <span className="text-sm">你</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <span className="text-sm">{selectedPlayer.name}</span>
            </div>
          </div>

          {/* Match Percentage */}
          <div className="mt-4 text-center">
            <div className="text-sm text-gray-400">配置相似度</div>
            <div className="text-3xl font-bold text-green-400">96%</div>
            <div className="text-xs text-gray-500 mt-1">你和{selectedPlayer.name}的配置非常相似</div>
          </div>
        </div>

        {/* Pro Player Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-center mb-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white text-2xl font-bold mb-3">
              {selectedPlayer.name.slice(0, 2).toUpperCase()}
            </div>
            <h3 className="font-bold text-gray-900">{selectedPlayer.name}</h3>
            <p className="text-sm text-gray-500">{selectedPlayer.team} | HLTV #{selectedPlayer.ranking}</p>
          </div>

          {/* Pro Skins */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="aspect-square bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center">
              <span className="text-xs text-white">AK-47</span>
            </div>
            <div className="aspect-square bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-lg flex items-center justify-center">
              <span className="text-xs text-white">AWP</span>
            </div>
            <div className="aspect-square bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <span className="text-xs text-white">M4A4</span>
            </div>
            <div className="aspect-square bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center">
              <span className="text-xs text-white">匕首</span>
            </div>
            <div className="aspect-square bg-gradient-to-br from-pink-500 to-pink-700 rounded-lg flex items-center justify-center">
              <span className="text-xs text-white">手套</span>
            </div>
            <div className="aspect-square bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg flex items-center justify-center">
              <span className="text-xs text-white">+3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Comparison */}
      <div className="grid grid-cols-3 gap-6">
        {/* Mouse Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mouse size={20} className="text-gray-400" />
            <h3 className="font-semibold text-gray-900">鼠标设置</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">型号</span>
              <div className="flex gap-4">
                <span className="text-gray-700">ZOWIE EC2</span>
                <span className="text-blue-600">{selectedPlayer.gear.find(g => g.type === 'mouse')?.name || 'ZOWIE EC2'}</span>
              </div>
            </div>
            <GearComparison label="DPI" playerValue="400" proValue={selectedPlayer.settings.mouse.dpi.toString()} />
            <GearComparison label="灵敏度" playerValue="2.0" proValue={selectedPlayer.settings.mouse.sensitivity.toString()} />
            <GearComparison label="eDPI" playerValue="800" proValue={selectedPlayer.settings.mouse.edpi.toString()} />
            <GearComparison label="轮询率" playerValue="1000Hz" proValue={`${selectedPlayer.settings.mouse.hz}Hz`} />
          </div>
        </div>

        {/* Crosshair Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Crosshair size={20} className="text-gray-400" />
            <h3 className="font-semibold text-gray-900">准星设置</h3>
          </div>
          <div className="space-y-2">
            <GearComparison label="样式" playerValue="静态" proValue={selectedPlayer.settings.crosshair.style} />
            <GearComparison label="大小" playerValue="2" proValue={selectedPlayer.settings.crosshair.size.toString()} />
            <GearComparison label="粗细" playerValue="0.5" proValue={selectedPlayer.settings.crosshair.thickness.toString()} />
            <GearComparison label="间隙" playerValue="-2" proValue={selectedPlayer.settings.crosshair.gap.toString()} />
            <GearComparison label="颜色" playerValue="绿色" proValue={selectedPlayer.settings.crosshair.color} />
          </div>
        </div>

        {/* Video Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Monitor size={20} className="text-gray-400" />
            <h3 className="font-semibold text-gray-900">视频设置</h3>
          </div>
          <div className="space-y-2">
            <GearComparison label="分辨率" playerValue="1280x960" proValue={selectedPlayer.settings.video.resolution} />
            <GearComparison label="纵横比" playerValue="4:3" proValue={selectedPlayer.settings.video.aspectRatio} />
            <GearComparison label="缩放模式" playerValue="拉伸" proValue={selectedPlayer.settings.video.scaling} />
            <GearComparison label="亮度" playerValue="100%" proValue={`${selectedPlayer.settings.video.brightness}%`} />
          </div>
        </div>
      </div>

      {/* Copy CFG Button */}
      <div className="flex justify-center">
        <button
          onClick={handleCopyCfg}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          {copied ? <Check size={20} /> : <Copy size={20} />}
          {copied ? '已复制!' : '一键抄CFG'}
        </button>
      </div>
    </div>
  );
}
