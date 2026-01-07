
import React, { useState } from 'react';
import { DebateMode, Debater, Side } from '../types';
import { DEBATERS } from '../constants';
import { User, Cpu, ChevronLeft, Info } from 'lucide-react';

interface Props {
  mode: DebateMode;
  onNext: (pro: Debater | 'User', con: Debater | 'User', userSide?: Side) => void;
  onBack: () => void;
}

const SelectionPage: React.FC<Props> = ({ mode, onNext, onBack }) => {
  const [userSide, setUserSide] = useState<Side>(Side.PRO);
  const [proDebater, setProDebater] = useState<Debater | null>(null);
  const [conDebater, setConDebater] = useState<Debater | null>(null);
  const [hoveredDebater, setHoveredDebater] = useState<Debater | null>(null);

  const handleConfirm = () => {
    if (mode === DebateMode.HUMAN_VS_AI) {
      if (userSide === Side.PRO && conDebater) onNext('User', conDebater, Side.PRO);
      if (userSide === Side.CON && proDebater) onNext(proDebater, 'User', Side.CON);
    } else {
      if (proDebater && conDebater) onNext(proDebater, conDebater);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0d0e] flex flex-col">
      <header className="p-6 flex items-center justify-between border-b border-gray-900">
        <button onClick={onBack} className="text-gray-500 hover:text-white transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-bold tracking-widest">选择辩手</h1>
        <div className="w-6" />
      </header>

      <main className="flex-1 overflow-y-auto p-6 md:p-12 space-y-12 max-w-6xl mx-auto w-full">
        {mode === DebateMode.HUMAN_VS_AI ? (
          <section className="space-y-8">
             <div className="flex justify-center gap-8">
               <button 
                 onClick={() => { setUserSide(Side.PRO); setProDebater(null); }}
                 className={`px-8 py-3 border transition-all ${userSide === Side.PRO ? 'border-orange-500 text-orange-500' : 'border-gray-800 text-gray-500'}`}
               >
                 我要当正方
               </button>
               <button 
                 onClick={() => { setUserSide(Side.CON); setConDebater(null); }}
                 className={`px-8 py-3 border transition-all ${userSide === Side.CON ? 'border-orange-500 text-orange-500' : 'border-gray-800 text-gray-500'}`}
               >
                 我要当反方
               </button>
             </div>
             
             <div className="text-center">
               <p className="text-gray-400">选择你的对手：</p>
             </div>
          </section>
        ) : (
          <section className="flex justify-around items-center border border-gray-800 p-8 bg-gray-900/20">
            <div className="text-center space-y-2">
              <span className="text-xs text-gray-500 uppercase">正方辩手</span>
              <div className="text-xl font-bold">{proDebater?.name || '未选择'}</div>
            </div>
            <div className="text-gray-700 font-bold text-2xl">VS</div>
            <div className="text-center space-y-2">
              <span className="text-xs text-gray-500 uppercase">反方辩手</span>
              <div className="text-xl font-bold">{conDebater?.name || '未选择'}</div>
            </div>
          </section>
        )}

        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {DEBATERS.map(d => {
            const isSelected = proDebater?.id === d.id || conDebater?.id === d.id;
            return (
              <button 
                key={d.id}
                onMouseEnter={() => setHoveredDebater(d)}
                onMouseLeave={() => setHoveredDebater(null)}
                onClick={() => {
                  if (mode === DebateMode.HUMAN_VS_AI) {
                    if (userSide === Side.PRO) setConDebater(d);
                    else setProDebater(d);
                  } else {
                    if (!proDebater) setProDebater(d);
                    else if (proDebater.id === d.id) setProDebater(null);
                    else setConDebater(d);
                  }
                }}
                className={`relative flex flex-col items-center p-3 border transition-all group ${isSelected ? 'border-orange-500 scale-105' : 'border-gray-800 grayscale hover:grayscale-0'}`}
              >
                <img src={d.avatar} className="w-16 h-16 rounded-full mb-3 object-cover border-2 border-transparent group-hover:border-orange-500/50" alt={d.name} />
                <span className="text-sm font-medium">{d.name}</span>
                {isSelected && <div className="absolute -top-2 -right-2 bg-orange-500 text-white p-1 rounded-full"><Cpu size={12} /></div>}
              </button>
            );
          })}
        </div>

        {hoveredDebater && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-gray-900 border border-gray-700 p-4 animate-in slide-in-from-bottom-4">
            <h4 className="font-bold text-orange-500">{hoveredDebater.name} · {hoveredDebater.style}</h4>
            <p className="text-sm text-gray-400 mt-2 leading-relaxed">{hoveredDebater.persona}</p>
          </div>
        )}

        <div className="sticky bottom-8 flex justify-center pt-8">
          <button 
            disabled={mode === DebateMode.HUMAN_VS_AI ? (userSide === Side.PRO ? !conDebater : !proDebater) : (!proDebater || !conDebater)}
            onClick={handleConfirm}
            className="px-16 py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all disabled:opacity-20"
          >
            进入对辩
          </button>
        </div>
      </main>
    </div>
  );
};

export default SelectionPage;
