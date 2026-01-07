
import React from 'react';
import Danmaku from './Danmaku';
import { Loader2 } from 'lucide-react';

interface Props {
  onEnter: () => void;
  loading: boolean;
}

const LandingPage: React.FC<Props> = ({ onEnter, loading }) => {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-[#0c0d0e] overflow-hidden">
      <Danmaku />
      <div className="z-10 text-center px-4">
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-4 text-white">
          辩才训练场
        </h1>
        <p className="text-gray-400 text-lg md:text-xl mb-12 tracking-widest uppercase">
          沉浸式 · 极简 · 思辨空间
        </p>
        
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            <span className="text-gray-500 text-sm">正在同步战场频率...</span>
          </div>
        ) : (
          <button 
            onClick={onEnter}
            className="group relative px-12 py-4 bg-transparent border border-white/20 hover:border-orange-500 transition-all duration-300"
          >
            <span className="relative z-10 text-white group-hover:text-orange-500 font-medium tracking-widest">
              进入战场
            </span>
            <div className="absolute inset-0 bg-orange-500/0 group-hover:bg-orange-500/5 transition-all" />
          </button>
        )}
      </div>
      <div className="absolute bottom-8 text-gray-600 text-xs tracking-widest">
        DESIGNED BY AiPPLE 董燕萍
      </div>
    </div>
  );
};

export default LandingPage;
