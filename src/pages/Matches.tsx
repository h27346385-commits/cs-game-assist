import { useState } from 'react';
import { Trophy, Calendar, Target, CheckSquare, Square, X } from 'lucide-react';
import { mockMatches } from '../data/mock';
import type { Match } from '../types';

interface RoundSelectorProps {
  match: Match;
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (selectedRounds: number[]) => void;
}

function RoundSelector({ match, isOpen, onClose, onGenerate }: RoundSelectorProps) {
  const [selectedRounds, setSelectedRounds] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  if (!isOpen) return null;

  const toggleRound = (roundNum: number) => {
    setSelectedRounds(prev => 
      prev.includes(roundNum) 
        ? prev.filter(r => r !== roundNum)
        : [...prev, roundNum]
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedRounds([]);
    } else {
      setSelectedRounds(match.rounds.filter(r => r.isHighlight).map(r => r.roundNumber));
    }
    setSelectAll(!selectAll);
  };

  const ctRounds = match.rounds.filter(r => r.side === 'CT');
  const tRounds = match.rounds.filter(r => r.side === 'T');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h3 className="font-bold text-lg text-gray-900">选择回合</h3>
            <p className="text-sm text-gray-500">{match.mapName.replace('de_', '').toUpperCase()} | {match.score.teamA}:{match.score.teamB}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Round List */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {/* CT Rounds */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="font-medium text-gray-700">CT 阵营</span>
            </div>
            <div className="space-y-1">
              {ctRounds.map(round => (
                <div 
                  key={round.roundNumber}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors
                    ${round.isHighlight ? 'bg-yellow-50 border border-yellow-200' : 'hover:bg-gray-50'}
                    ${selectedRounds.includes(round.roundNumber) ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => toggleRound(round.roundNumber)}
                >
                  <button className="text-gray-400">
                    {selectedRounds.includes(round.roundNumber) ? 
                      <CheckSquare size={18} className="text-blue-600" /> : 
                      <Square size={18} />
                    }
                  </button>
                  <span className="text-sm font-medium w-12">CT{round.roundNumber}</span>
                  <div className="flex-1 flex items-center gap-1">
                    {[...Array(round.kills)].map((_, i) => (
                      <div key={i} className="w-2 h-2 rounded-full bg-red-500"></div>
                    ))}
                  </div>
                  {round.highlightType && (
                    <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded font-medium">
                      {round.highlightType === '3k' ? '3杀' : 
                       round.highlightType === '4k' ? '4杀' : 
                       round.highlightType === 'ace' ? 'ACE' : 
                       round.highlightType === 'clutch' ? '残局' : 
                       round.highlightType === 'knife' ? '刀杀' : '高光'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* T Rounds */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="font-medium text-gray-700">T 阵营</span>
            </div>
            <div className="space-y-1">
              {tRounds.map(round => (
                <div 
                  key={round.roundNumber}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors
                    ${round.isHighlight ? 'bg-yellow-50 border border-yellow-200' : 'hover:bg-gray-50'}
                    ${selectedRounds.includes(round.roundNumber) ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => toggleRound(round.roundNumber)}
                >
                  <button className="text-gray-400">
                    {selectedRounds.includes(round.roundNumber) ? 
                      <CheckSquare size={18} className="text-blue-600" /> : 
                      <Square size={18} />
                    }
                  </button>
                  <span className="text-sm font-medium w-12">T{round.roundNumber}</span>
                  <div className="flex-1 flex items-center gap-1">
                    {[...Array(round.kills)].map((_, i) => (
                      <div key={i} className="w-2 h-2 rounded-full bg-red-500"></div>
                    ))}
                  </div>
                  {round.highlightType && (
                    <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded font-medium">
                      {round.highlightType === '3k' ? '3杀' : 
                       round.highlightType === '4k' ? '4杀' : 
                       round.highlightType === 'ace' ? 'ACE' : 
                       round.highlightType === 'clutch' ? '残局' : 
                       round.highlightType === 'knife' ? '刀杀' : '高光'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200">
          <button 
            onClick={toggleSelectAll}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {selectAll ? '取消全选' : '全选高光回合'}
          </button>
          <button 
            onClick={() => onGenerate(selectedRounds)}
            disabled={selectedRounds.length === 0}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
          >
            立即生成 ({selectedRounds.length})
          </button>
        </div>
      </div>
    </div>
  );
}

export function Matches() {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [showRoundSelector, setShowRoundSelector] = useState(false);

  const handleGenerate = (match: Match) => {
    setSelectedMatch(match);
    setShowRoundSelector(true);
  };

  const handleGenerateSubmit = (selectedRounds: number[]) => {
    console.log('Generating highlights for rounds:', selectedRounds);
    setShowRoundSelector(false);
    setSelectedMatch(null);
    // TODO: Start video generation
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900">比赛历史</h2>
        <p className="text-sm text-gray-500 mt-1">已分析 {mockMatches.length} 场比赛，共 {mockMatches.reduce((sum, m) => sum + m.highlights, 0)} 个高光时刻</p>
      </div>

      {/* Matches Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-600">
          <div className="col-span-2">地图</div>
          <div className="col-span-2">比分</div>
          <div className="col-span-1">击杀</div>
          <div className="col-span-2">高光时刻</div>
          <div className="col-span-2">日期</div>
          <div className="col-span-3 text-right">操作</div>
        </div>

        <div className="divide-y divide-gray-100">
          {mockMatches.map(match => (
            <div key={match.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 transition-colors">
              {/* Map */}
              <div className="col-span-2">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded flex items-center justify-center text-white text-xs font-bold">
                    {match.mapName.replace('de_', '').toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Score */}
              <div className="col-span-2">
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-bold ${match.result === 'win' ? 'text-green-600' : 'text-red-600'}`}>
                    {match.score.teamA}:{match.score.teamB}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded ${match.result === 'win' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {match.result === 'win' ? '胜' : '负'}
                  </span>
                </div>
              </div>

              {/* Kills */}
              <div className="col-span-1">
                <div className="flex items-center gap-1">
                  <Target size={14} className="text-gray-400" />
                  <span className="font-medium">{match.kills}</span>
                </div>
              </div>

              {/* Highlights */}
              <div className="col-span-2">
                <div className="flex items-center gap-1">
                  <Trophy size={14} className="text-yellow-500" />
                  <span className="font-medium">{match.highlights}</span>
                </div>
              </div>

              {/* Date */}
              <div className="col-span-2">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Calendar size={14} />
                  {match.date}
                </div>
              </div>

              {/* Actions */}
              <div className="col-span-3 text-right">
                <button 
                  onClick={() => handleGenerate(match)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  生成高光时刻
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Round Selector Modal */}
      {selectedMatch && (
        <RoundSelector
          match={selectedMatch}
          isOpen={showRoundSelector}
          onClose={() => {
            setShowRoundSelector(false);
            setSelectedMatch(null);
          }}
          onGenerate={handleGenerateSubmit}
        />
      )}
    </div>
  );
}
