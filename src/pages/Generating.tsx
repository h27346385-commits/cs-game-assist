import { useState, useEffect } from 'react';
import { Play, Clock, CheckCircle, AlertCircle, X, Loader2 } from 'lucide-react';

interface GenerationTask {
  id: string;
  matchName: string;
  rounds: number;
  status: 'pending' | 'analyzing' | 'recording' | 'rendering' | 'completed' | 'error';
  progress: number;
  createdAt: string;
  estimatedTime?: number;
}

const mockTasks: GenerationTask[] = [
  {
    id: '1',
    matchName: 'de_mirage | 13:10',
    rounds: 3,
    status: 'rendering',
    progress: 75,
    createdAt: '2026-02-26 14:30',
    estimatedTime: 120,
  },
  {
    id: '2',
    matchName: 'de_dust2 | 10:13',
    rounds: 1,
    status: 'completed',
    progress: 100,
    createdAt: '2026-02-26 14:15',
  },
  {
    id: '3',
    matchName: 'de_inferno | 13:8',
    rounds: 2,
    status: 'error',
    progress: 45,
    createdAt: '2026-02-26 14:00',
  },
];

function StatusBadge({ status }: { status: GenerationTask['status'] }) {
  const configs = {
    pending: { color: 'bg-gray-100 text-gray-600', label: '等待中' },
    analyzing: { color: 'bg-blue-100 text-blue-600', label: '分析中' },
    recording: { color: 'bg-yellow-100 text-yellow-600', label: '录制中' },
    rendering: { color: 'bg-purple-100 text-purple-600', label: '渲染中' },
    completed: { color: 'bg-green-100 text-green-600', label: '已完成' },
    error: { color: 'bg-red-100 text-red-600', label: '失败' },
  };

  const config = configs[status];
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}

function ProgressBar({ progress, status }: { progress: number; status: GenerationTask['status'] }) {
  const getColor = () => {
    if (status === 'error') return 'bg-red-500';
    if (status === 'completed') return 'bg-green-500';
    return 'bg-blue-500';
  };

  return (
    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <div 
        className={`h-full transition-all duration-500 ${getColor()}`}
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
}

function TaskCard({ task, onCancel }: { task: GenerationTask; onCancel: (id: string) => void }) {
  const isActive = ['pending', 'analyzing', 'recording', 'rendering'].includes(task.status);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {task.status === 'completed' ? (
            <CheckCircle size={20} className="text-green-500" />
          ) : task.status === 'error' ? (
            <AlertCircle size={20} className="text-red-500" />
          ) : (
            <Loader2 size={20} className="text-blue-500 animate-spin" />
          )}
          <div>
            <h4 className="font-medium text-gray-900">{task.matchName}</h4>
            <p className="text-xs text-gray-500">{task.rounds} 个回合 • {task.createdAt}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={task.status} />
          {isActive && (
            <button 
              onClick={() => onCancel(task.id)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={16} className="text-gray-400" />
            </button>
          )}
        </div>
      </div>

      <ProgressBar progress={task.progress} status={task.status} />

      <div className="flex items-center justify-between mt-3 text-sm">
        <div className="text-gray-500">
          {task.status === 'rendering' && task.estimatedTime && (
            <span className="flex items-center gap-1">
              <Clock size={14} />
              预计还需 {Math.ceil(task.estimatedTime / 60)} 分钟
            </span>
          )}
          {task.status === 'completed' && (
            <span className="text-green-600">视频已生成</span>
          )}
          {task.status === 'error' && (
            <span className="text-red-600">生成失败，请重试</span>
          )}
        </div>
        <div className="text-gray-400">{task.progress}%</div>
      </div>
    </div>
  );
}

export function Generating() {
  const [tasks, setTasks] = useState<GenerationTask[]>(mockTasks);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      
      // 模拟进度更新
      setTasks(prev => prev.map(task => {
        if (task.status === 'rendering' && task.progress < 100) {
          return {
            ...task,
            progress: Math.min(task.progress + Math.random() * 2, 100),
            estimatedTime: task.estimatedTime ? Math.max(task.estimatedTime - 1, 0) : 0,
          };
        }
        if (task.status === 'rendering' && task.progress >= 100) {
          return { ...task, status: 'completed' };
        }
        return task;
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCancel = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const activeTasks = tasks.filter(t => ['pending', 'analyzing', 'recording', 'rendering'].includes(t.status));
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const errorTasks = tasks.filter(t => t.status === 'error');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">生成队列</h2>
            <p className="text-sm text-gray-500 mt-1">
              {activeTasks.length > 0 
                ? `正在生成 ${activeTasks.length} 个视频...` 
                : '没有正在进行的任务'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">当前时间</div>
            <div className="font-medium text-gray-900">
              {currentTime.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-500">等待中</div>
          <div className="text-2xl font-bold text-gray-900">
            {tasks.filter(t => t.status === 'pending').length}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-500">处理中</div>
          <div className="text-2xl font-bold text-blue-600">
            {tasks.filter(t => ['analyzing', 'recording', 'rendering'].includes(t.status)).length}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-500">已完成</div>
          <div className="text-2xl font-bold text-green-600">{completedTasks.length}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-500">失败</div>
          <div className="text-2xl font-bold text-red-600">{errorTasks.length}</div>
        </div>
      </div>

      {/* Active Tasks */}
      {activeTasks.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">进行中</h3>
          {activeTasks.map(task => (
            <TaskCard key={task.id} task={task} onCancel={handleCancel} />
          ))}
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">已完成</h3>
          {completedTasks.map(task => (
            <TaskCard key={task.id} task={task} onCancel={handleCancel} />
          ))}
        </div>
      )}

      {/* Error Tasks */}
      {errorTasks.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">失败</h3>
          {errorTasks.map(task => (
            <TaskCard key={task.id} task={task} onCancel={handleCancel} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {tasks.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Play size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">队列为空</h3>
          <p className="text-sm text-gray-500">去比赛历史页面选择回合生成高光视频</p>
        </div>
      )}
    </div>
  );
}
