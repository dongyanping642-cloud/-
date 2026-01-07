
import React, { useState, useEffect, useRef } from 'react';
import { GameState, Side, Message, DebateMode, CoachAdvice } from '../types';
import { getDebateResponse, getCoachAdvice } from '../services/geminiService';
import { DEBATERS } from '../constants';
import { Send, Mic, TrendingUp, Lightbulb, ChevronRight, ChevronLeft, Download, X } from 'lucide-react';

interface Props {
  initialState: GameState;
  onFinish: (state: GameState) => void;
  onExit: () => void;
}

const DebateGame: React.FC<Props> = ({ initialState, onFinish, onExit }) => {
  const [gameState, setGameState] = useState<GameState>({
    ...initialState,
    id: Date.now().toString(),
    messages: [],
    proScore: 50,
    conScore: 50,
    currentRound: 0,
    isFinished: false
  });
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const [coachAdvice, setCoachAdvice] = useState<CoachAdvice | null>(null);
  const [suggestedQuotes, setSuggestedQuotes] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gameState.messages.length === 0) {
      // Start of game
      if (gameState.mode === DebateMode.HUMAN_VS_AI) {
        // AI speaks first
        const opponent = gameState.userSide === Side.PRO ? gameState.conDebater : gameState.proDebater;
        const opponentSide = gameState.userSide === Side.PRO ? Side.CON : Side.PRO;
        handleAiTurn(opponent as any, opponentSide);
      } else {
        // Pro AI starts
        handleAiTurn(gameState.proDebater as any, Side.PRO);
      }
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [gameState.messages]);

  const handleAiTurn = async (debater: any, side: Side) => {
    setIsTyping(true);
    try {
      const response = await getDebateResponse(
        debater,
        gameState.topic,
        side,
        gameState.messages.map(m => ({ sender: m.senderName, content: m.content })),
        gameState.currentRound,
        gameState.totalRounds
      );

      const newMessage: Message = {
        senderId: debater.id,
        senderName: debater.name,
        side,
        content: response.content,
        timestamp: Date.now()
      };

      setGameState(prev => {
        const nextScorePro = side === Side.PRO ? prev.proScore + response.scoreDelta : prev.proScore - response.scoreDelta;
        const nextScoreCon = 100 - nextScorePro;
        
        return {
          ...prev,
          messages: [...prev.messages, newMessage],
          proScore: Math.min(100, Math.max(0, nextScorePro)),
          conScore: Math.min(100, Math.max(0, nextScoreCon))
        };
      });

      // Update coach if next is user turn
      if (gameState.mode === DebateMode.HUMAN_VS_AI) {
        updateCoachAdvice([...gameState.messages, newMessage]);
      } else {
        // AI vs AI logic
        setTimeout(() => {
           const nextSide = side === Side.PRO ? Side.CON : Side.PRO;
           const nextDebater = nextSide === Side.PRO ? gameState.proDebater : gameState.conDebater;
           if (gameState.currentRound < gameState.totalRounds) {
              setGameState(prev => ({...prev, currentRound: prev.currentRound + (nextSide === Side.PRO ? 1 : 0) }));
              handleAiTurn(nextDebater as any, nextSide);
           } else {
              setGameState(prev => ({...prev, isFinished: true}));
           }
        }, 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  const updateCoachAdvice = async (history: Message[]) => {
    const advice = await getCoachAdvice(gameState.topic, gameState.userSide!, history.map(m => ({ sender: m.senderName, content: m.content })));
    setCoachAdvice(advice);
    setSuggestedQuotes(advice.goldenQuotes);
  };

  const handleUserSubmit = async () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      senderId: 'User',
      senderName: '我',
      side: gameState.userSide!,
      content: inputText,
      timestamp: Date.now()
    };

    setGameState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }));
    setInputText('');
    setSuggestedQuotes([]);

    // After user turn, check rounds or AI response
    if (gameState.currentRound < gameState.totalRounds) {
        setGameState(prev => ({...prev, currentRound: prev.currentRound + (gameState.userSide === Side.CON ? 1 : 0) }));
        const opponent = gameState.userSide === Side.PRO ? gameState.conDebater : gameState.proDebater;
        const opponentSide = gameState.userSide === Side.PRO ? Side.CON : Side.PRO;
        handleAiTurn(opponent as any, opponentSide);
    } else {
        setGameState(prev => ({...prev, isFinished: true}));
    }
  };

  const startStt = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert('当前浏览器不支持语音识别');
    const rec = new SpeechRecognition();
    rec.lang = 'zh-CN';
    rec.onresult = (e: any) => setInputText(prev => prev + e.results[0][0].transcript);
    rec.start();
  };

  const renderSummaryImage = () => {
    const summaryRef = document.getElementById('game-summary');
    if (summaryRef) {
       (window as any).html2canvas(summaryRef).then((canvas: HTMLCanvasElement) => {
          const link = document.createElement('a');
          link.download = `debate-summary-${Date.now()}.png`;
          link.href = canvas.toDataURL();
          link.click();
       });
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0c0d0e] flex overflow-hidden">
      {/* Danmaku Layer */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute top-1/4 left-0 w-full flex gap-12 animate-scroll">
           <span className="text-xl">太精彩了！</span>
           <span className="text-xl">反方逻辑有漏洞</span>
           <span className="text-xl">正方金句频出</span>
           <span className="text-xl">天哪，这一段说得我起鸡皮疙瘩</span>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isCoachOpen ? 'mr-80' : 'mr-0'}`}>
        <header className="px-6 py-4 border-b border-gray-900 bg-gray-900/50 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <button onClick={onExit} className="text-gray-500 hover:text-white"><X size={20}/></button>
            <div className="text-center">
              <h2 className="text-sm text-gray-400">辩题：{gameState.topic}</h2>
              <span className="text-xs text-orange-500">第 {gameState.currentRound + 1} / {gameState.totalRounds} 轮</span>
            </div>
            <button onClick={() => setIsCoachOpen(!isCoachOpen)} className="text-orange-500 hover:text-orange-400">
               <Lightbulb size={24} />
            </button>
          </div>

          {/* Score Bar */}
          <div className="relative h-1 w-full bg-gray-800">
            <div 
              className="absolute left-0 top-0 h-full bg-orange-500 transition-all duration-1000"
              style={{ width: `${gameState.proScore}%` }}
            />
            <div className="flex justify-between text-[10px] mt-2 uppercase tracking-widest text-gray-500">
              <span>正方: {gameState.proScore.toFixed(0)}</span>
              <span>反方: {gameState.conScore.toFixed(0)}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {gameState.messages.map((m, i) => (
            <div key={i} className={`flex ${m.side === Side.PRO ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2`}>
              <div className={`max-w-[80%] p-4 rounded-none border ${m.side === Side.PRO ? 'border-gray-800 bg-gray-900/40 text-left' : 'border-orange-900/30 bg-orange-950/10 text-right'}`}>
                <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                   {m.side === Side.PRO && <span className="bg-white text-black px-1 font-bold">正</span>}
                   <span className="font-bold">{m.senderName}</span>
                   {m.side === Side.CON && <span className="bg-orange-500 text-white px-1 font-bold">反</span>}
                </div>
                <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
              </div>
            </div>
          ))}
          {isTyping && (
             <div className="flex justify-start">
               <div className="p-4 border border-gray-800 bg-gray-900/20 text-gray-500 text-sm animate-pulse">
                  正在构思逻辑...
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        <footer className="p-4 bg-gray-900/80 border-t border-gray-800">
          {!gameState.isFinished ? (
            <div className="max-w-4xl mx-auto space-y-4">
              {suggestedQuotes.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                  {suggestedQuotes.map((q, i) => (
                    <button 
                      key={i}
                      onClick={() => setInputText(q)}
                      className="whitespace-nowrap px-4 py-2 bg-gray-800 border border-gray-700 text-xs text-gray-300 hover:border-orange-500 transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex gap-4">
                <button onClick={startStt} className="p-4 bg-gray-800 text-gray-400 hover:text-white"><Mic size={20}/></button>
                <textarea 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="请输入你的观点..."
                  className="flex-1 bg-gray-900 border border-gray-800 p-3 text-sm focus:outline-none focus:border-orange-500 resize-none h-12"
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleUserSubmit())}
                />
                <button onClick={handleUserSubmit} className="p-4 bg-orange-600 text-white hover:bg-orange-500 transition-colors"><Send size={20}/></button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 space-y-4">
              <h3 className="text-xl font-bold text-orange-500 uppercase tracking-widest">战局已结</h3>
              <div className="flex justify-center gap-4">
                <button onClick={() => onFinish(gameState)} className="px-8 py-3 border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white transition-all">查看战绩</button>
              </div>
            </div>
          )}
        </footer>
      </div>

      {/* Side Coach Panel */}
      <aside className={`fixed top-0 right-0 h-full w-80 bg-gray-900 border-l border-gray-800 transform transition-transform duration-300 z-50 p-6 space-y-8 overflow-y-auto ${isCoachOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between">
           <h3 className="text-lg font-bold flex items-center gap-2"><Lightbulb className="text-orange-500" /> 我的专属教练</h3>
           <button onClick={() => setIsCoachOpen(false)} className="text-gray-500"><X size={20}/></button>
        </div>
        
        {coachAdvice ? (
          <div className="space-y-6">
            <section className="space-y-2">
              <h4 className="text-xs text-orange-500 uppercase tracking-widest">局势分析</h4>
              <p className="text-sm text-gray-400 leading-relaxed">{coachAdvice.analysis}</p>
            </section>
            
            <section className="space-y-3">
              <h4 className="text-xs text-orange-500 uppercase tracking-widest">反驳切入点</h4>
              {coachAdvice.counterPoints.map((p, i) => (
                <div key={i} className="p-3 bg-gray-800 text-xs text-gray-300 border-l-2 border-orange-500">
                  {p}
                </div>
              ))}
            </section>

            <section className="space-y-2">
              <h4 className="text-xs text-orange-500 uppercase tracking-widest">战术类比</h4>
              <div className="p-3 border border-gray-700 italic text-sm text-gray-500">
                "{coachAdvice.analogy}"
              </div>
            </section>
          </div>
        ) : (
          <div className="text-center text-gray-600 text-sm pt-20">正在等待对战开启，实时战术分析即将上线...</div>
        )}
      </aside>

      {/* Final Summary Component (Hidden, for Image capture) */}
      <div id="game-summary" className="fixed -left-[1000vw] w-[400px] bg-[#0c0d0e] p-8 border border-gray-800">
         <h1 className="text-2xl font-bold mb-2">辩才训练场</h1>
         <div className="text-sm text-gray-500 mb-6">辩题：{gameState.topic}</div>
         <div className="flex justify-between items-end mb-8">
            <div className="text-center">
               <div className="text-3xl font-bold text-orange-500">{gameState.proScore.toFixed(0)}</div>
               <div className="text-xs text-gray-600">正方得分</div>
            </div>
            <div className="text-xl font-bold text-gray-800">VS</div>
            <div className="text-center">
               <div className="text-3xl font-bold text-gray-400">{gameState.conScore.toFixed(0)}</div>
               <div className="text-xs text-gray-600">反方得分</div>
            </div>
         </div>
         <div className="space-y-4 mb-8">
            <div className="text-sm font-bold border-b border-gray-800 pb-2">关键对话</div>
            {gameState.messages.slice(-3).map((m, i) => (
              <div key={i} className="text-xs text-gray-400">
                <span className="font-bold text-gray-200">{m.senderName}:</span> {m.content.slice(0, 50)}...
              </div>
            ))}
         </div>
         <div className="text-[10px] text-gray-700 border-t border-gray-900 pt-4 flex justify-between">
            <span>开发者: AiPPLE 董燕萍</span>
            <span>{new Date().toLocaleDateString()}</span>
         </div>
      </div>
    </div>
  );
};

export default DebateGame;
