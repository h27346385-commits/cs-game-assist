import { useState, useEffect } from 'react';
import { Database, FileVideo, Trophy, Activity } from 'lucide-react';
import { databaseService, demoService, isElectronAvailable } from '../services/electronApi';

export function Home() {
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [dbStats, setDbStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        if (!isElectronAvailable()) {
          setError('Electron API 不可用 - 请在桌面应用中运行');
          setLoading(false);
          return;
        }

        const status = await databaseService.getStatus();
        setDbStatus(status);

        const stats = await databaseService.getStats();
        setDbStats(stats);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleSelectDemo = async () => {
    try {
      const path = await demoService.selectDemoFile();
      if (path) {
        alert(`选择的文件: ${path}`);
      }
    } catch (e: any) {
      alert(`错误: ${e.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-gray-600">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-lg font-semibold text-red-700 mb-2">错误</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      <h1 className="text-3xl font-bold text-gray-900">CS游戏助手</h1>
      
      {/* 状态卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-6 h-6 text-blue-500" />
            <span className="text-sm text-gray-500">数据库状态</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {dbStatus?.connected ? '已连接' : '未连接'}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <span className="text-sm text-gray-500">比赛记录</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {dbStats?.totalMatches || 0}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-6 h-6 text-green-500" />
            <span className="text-sm text-gray-500">击杀总数</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {dbStats?.totalKills || 0}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <FileVideo className="w-6 h-6 text-purple-500" />
            <span className="text-sm text-gray-500">高光时刻</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {dbStats?.totalHighlights || 0}
          </div>
        </div>
      </div>

      {/* 功能按钮 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h2>
        <div className="flex gap-4">
          <button
            onClick={handleSelectDemo}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            选择 Demo 文件
          </button>
          <button
            onClick={() => window.location.href = '#/matches'}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            查看比赛列表
          </button>
          <button
            onClick={() => window.location.href = '#/highlights'}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            查看高光时刻
          </button>
        </div>
      </div>

      {/* 地图统计 */}
      {dbStats?.mapsPlayed && Object.keys(dbStats.mapsPlayed).length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">地图统计</h2>
          <div className="grid grid-cols-6 gap-4">
            {Object.entries(dbStats.mapsPlayed).map(([map, count]) => (
              <div key={map} className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-sm text-gray-500">{map}</div>
                <div className="text-xl font-bold text-gray-900">{count as number}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
