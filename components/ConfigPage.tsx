
import React, { useState } from 'react';
import { DebateMode } from '../types';
// Fix: Import RANDOM_TOPICS from constants.ts instead of types.ts
import { RANDOM_TOPICS } from '../constants';
import { Shuffle, Edit3, ArrowRight, History } from 'lucide-react';

interface Props {
  onNext: (mode: DebateMode, topic: string, rounds: number) => void;
  onViewHistory: () => void;
}

const ConfigPage: React.FC<Props> = ({ onNext, onViewHistory }) => {
  const [mode, setMode] = useState<DebateMode>(DebateMode.HUMAN_VS_AI);
  const [topic, setTopic] = useState('');
  const [rounds, setRounds] = useState(3);

  const handleRandomTopic = () => {
    const random = RANDOM_TOPICS[Math.floor(Math.random() * RANDOM_TOPICS.length)];
    setTopic(random);
  };

  return (
    <div className="min-h-screen bg-[#0c0d0e] p-8 flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full space-y-12">
        <section className="space-y-4">
          <h2 className="text-sm uppercase tracking-widest text-orange-500">选择对战模式</h2>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setMode(DebateMode.HUMAN_VS_AI)}
              className={`p-6 border transition-all ${mode === DebateMode.HUMAN_VS_AI ? 'border-orange-500 bg-orange-500/5' : 'border-gray-800 bg-gray-900/50'}`}
            >
              <h3 className="text-lg font-bold">挑战AI辩手</h3>
              <p className="text-xs text-gray-500 mt-2">人机对决，磨炼技艺</p>
            </button>
            <button 
              onClick={() => setMode(DebateMode.AI_VS_AI)}
              className={`p-6 border transition-all ${mode === DebateMode.AI_VS_AI ? 'border-orange-500 bg-orange-500/5' : 'border-gray-800 bg-gray-900/50'}`}
            >
              <h3 className="text-lg font-bold">AI巅峰对战</h3>
              <p className="text-xs text-gray-500 mt-2">观摩名家，深度复盘</p>
            </button>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm uppercase tracking-widest text-orange-500">设定辩题</h2>
          <div className="relative">
            <input 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="输入你的辩题..."
              className="w-full bg-gray-900 border border-gray-800 px-6 py-4 rounded-none focus:outline-none focus:border-orange-500"
            />
            <button 
              onClick={handleRandomTopic}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-orange-500 transition-colors"
            >
              <Shuffle size={20} />
            </button>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm uppercase tracking-widest text-orange-500">对辩局数</h2>
          <div className="flex gap-4">
            {[3, 5, 10].map(r => (
              <button 
                key={r}
                onClick={() => setRounds(r)}
                className={`flex-1 py-3 border transition-all ${rounds === r ? 'border-orange-500 bg-orange-500/5' : 'border-gray-800 bg-gray-900/50'}`}
              >
                {r} 轮
              </button>
            ))}
          </div>
        </section>

        <div className="pt-8 flex flex-col gap-4">
          <button 
            disabled={!topic}
            onClick={() => onNext(mode, topic, rounds)}
            className="w-full py-5 bg-orange-600 hover:bg-orange-500 disabled:opacity-30 disabled:hover:bg-orange-600 transition-all font-bold flex items-center justify-center gap-2"
          >
            确认设定 <ArrowRight size={20} />
          </button>
          
          <button 
            onClick={onViewHistory}
            className="w-full py-4 text-gray-400 hover:text-white transition-all flex items-center justify-center gap-2 text-sm"
          >
            <History size={16} /> 历史战局回顾
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigPage;
