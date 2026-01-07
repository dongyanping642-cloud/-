
import React, { useState } from 'react';
import { GameState } from '../types';
import { ChevronLeft, Download, Trash2, FileText, Share2 } from 'lucide-react';

interface Props {
  history: GameState[];
  onBack: () => void;
}

const HistoryPage: React.FC<Props> = ({ history, onBack }) => {
  const [selectedGame, setSelectedGame] = useState<GameState | null>(null);

  const exportAs = (game: GameState, format: 'txt' | 'md' | 'pdf' | 'docx') => {
    let content = `辩才训练场 - 战局记录\n`;
    content += `辩题: ${game.topic}\n`;
    content += `模式: ${game.mode}\n`;
    content += `比分: 正方 ${game.proScore} / 反方 ${game.conScore}\n\n`;
    content += `对话记录:\n`;
    game.messages.forEach(m => {
      content += `[${m.side === 'PRO' ? '正方' : '反方'}] ${m.senderName}: ${m.content}\n\n`;
    });
    content += `\n开发者: AiPPLE 董燕萍`;

    if (format === 'txt' || format === 'md') {
       const blob = new Blob([content], { type: 'text/plain' });
       const url = URL.createObjectURL(blob);
       const link = document.createElement('a');
       link.href = url;
       link.download = `debate-history-${game.id}.${format}`;
       link.click();
    } else {
       // PDF/Docx placeholder - In real world would use jspdf / docx libraries
       alert(`正在导出 ${format.toUpperCase()} 格式... (需要引入对应库)`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0d0e] flex flex-col">
       <header className="p-6 border-b border-gray-900 flex items-center justify-between bg-gray-900/20">
         <button onClick={onBack} className="text-gray-500 hover:text-white"><ChevronLeft size={24}/></button>
         <h1 className="text-lg font-bold tracking-widest">历史战局回顾</h1>
         <div className="w-6" />
       </header>

       <main className="flex-1 overflow-y-auto p-6 md:p-12 max-w-4xl mx-auto w-full">
         {history.length === 0 ? (
           <div className="text-center py-20 text-gray-600 italic">尚未有战局记录，快去开启你的第一场思辨吧。</div>
         ) : (
           <div className="space-y-4">
             {history.map(game => (
               <div 
                 key={game.id}
                 className="p-6 border border-gray-800 bg-gray-900/50 hover:border-orange-500 transition-all group"
               >
                 <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-gray-200">{game.topic}</h3>
                      <p className="text-xs text-gray-500 mt-1">{new Date(Number(game.id)).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                       <span className="text-sm font-bold text-orange-500">{game.proScore} : {game.conScore}</span>
                    </div>
                 </div>
                 
                 <div className="flex gap-2">
                    <button onClick={() => exportAs(game, 'txt')} className="p-2 border border-gray-800 text-gray-500 hover:text-white transition-all"><FileText size={16} /></button>
                    <button onClick={() => exportAs(game, 'md')} className="p-2 border border-gray-800 text-gray-500 hover:text-white transition-all text-[10px] font-bold">MD</button>
                    <button onClick={() => exportAs(game, 'pdf')} className="p-2 border border-gray-800 text-gray-500 hover:text-white transition-all text-[10px] font-bold">PDF</button>
                 </div>
               </div>
             ))}
           </div>
         )}
       </main>
    </div>
  );
};

export default HistoryPage;
