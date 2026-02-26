import { useState } from 'react';
import { Play, Share2, Clock, MapPin, Crosshair, X, Link2, Copy } from 'lucide-react';
import { mockVideoClips } from '../data/mock';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  clip: typeof mockVideoClips[0] | null;
}

function ShareModal({ isOpen, onClose, clip }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !clip) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://csgame.assist/clip/${clip.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-gray-900">分享高光时刻</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="bg-gray-100 rounded-lg p-4 mb-4">
          <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center mb-3">
            <Play size={48} className="text-white/50" />
          </div>
          <h4 className="font-medium text-gray-900">{clip.title}</h4>
          <p className="text-sm text-gray-500">{clip.mapName.replace('de_', '').toUpperCase()} • {clip.kills}杀</p>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-600">分享到:</p>
          <div className="flex gap-3">
            <button className="flex-1 flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white text-xl">
                🎵
              </div>
              <span className="text-xs text-gray-600">抖音</span>
            </button>
            <button className="flex-1 flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white text-xl">
                💬
              </div>
              <span className="text-xs text-gray-600">微信</span>
            </button>
            <button className="flex-1 flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white text-xl">
                📺
              </div>
              <span className="text-xs text-gray-600">B站</span>
            </button>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <button 
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            {copied ? <Copy size={18} /> : <Link2 size={18} />}
            {copied ? '链接已复制!' : '复制链接'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface VideoCardProps {
  clip: typeof mockVideoClips[0];
  onShare: (clip: typeof mockVideoClips[0]) => void;
}

function VideoCard({ clip, onShare }: VideoCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-md transition-shadow">
      {/* Thumbnail */}
      <div className="aspect-video bg-gray-800 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white/70">
            <p className="text-sm">视频将在预览时播放</p>
          </div>
        </div>
        
        {/* Play Button */}
        <button className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
            <Play size={32} className="text-white ml-1" />
          </div>
        </button>

        {/* Duration */}
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded text-xs text-white font-medium">
          {Math.floor(clip.duration / 60)}:{String(clip.duration % 60).padStart(2, '0')}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
          <MapPin size={12} />
          <span>{clip.mapName.replace('de_', '').toUpperCase()}</span>
          <span>•</span>
          <Crosshair size={12} />
          <span>{clip.kills}杀</span>
          <span>•</span>
          <Clock size={12} />
          <span>{clip.createdAt}</span>
        </div>
        
        <h4 className="font-medium text-gray-900 mb-3 truncate">{clip.title}</h4>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
            <Play size={16} />
            播放
          </button>
          <button 
            onClick={() => onShare(clip)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Share2 size={16} />
            分享
          </button>
        </div>
      </div>
    </div>
  );
}

export function Highlights() {
  const [shareClip, setShareClip] = useState<typeof mockVideoClips[0] | null>(null);
  const [filter, setFilter] = useState('all');

  const filters = [
    { id: 'all', label: '全部' },
    { id: '3k', label: '3杀' },
    { id: '4k', label: '4杀' },
    { id: 'ace', label: 'ACE' },
    { id: 'clutch', label: '残局' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">高光列表</h2>
          <p className="text-sm text-gray-500 mt-1">共 {mockVideoClips.length} 个高光时刻</p>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-2">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${filter === f.id 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-4 gap-4">
        {mockVideoClips.map(clip => (
          <VideoCard 
            key={clip.id} 
            clip={clip} 
            onShare={setShareClip}
          />
        ))}
        
        {/* Placeholder for more videos */}
        {mockVideoClips.length < 8 && (
          <div className="aspect-[4/3] bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-2">
              <Play size={24} />
            </div>
            <span className="text-sm">更多高光</span>
            <span className="text-xs text-gray-400 mt-1">分析更多Demo来生成</span>
          </div>
        )}
      </div>

      {/* Empty State */}
      {mockVideoClips.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Play size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">还没有高光时刻</h3>
          <p className="text-sm text-gray-500 mb-4">分析Demo并生成你的第一个高光视频</p>
          <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
            去生成
          </button>
        </div>
      )}

      {/* Share Modal */}
      <ShareModal 
        isOpen={!!shareClip}
        onClose={() => setShareClip(null)}
        clip={shareClip}
      />
    </div>
  );
}
