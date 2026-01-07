
import React, { useState, useEffect } from 'react';
import { DebateMode, GameState, Debater, Side } from './types';
import LandingPage from './components/LandingPage';
import ConfigPage from './components/ConfigPage';
import SelectionPage from './components/SelectionPage';
import DebateGame from './components/DebateGame';
import HistoryPage from './components/HistoryPage';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'config' | 'selection' | 'game' | 'history'>('landing');
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState<Partial<GameState>>({});
  const [gameHistory, setGameHistory] = useState<GameState[]>([]);

  useEffect(() => {
    // Simulate resource loading
    const timer = setTimeout(() => setLoading(false), 2000);
    const saved = localStorage.getItem('debate_history');
    if (saved) setGameHistory(JSON.parse(saved));
    return () => clearTimeout(timer);
  }, []);

  const saveToHistory = (game: GameState) => {
    const updated = [game, ...gameHistory];
    setGameHistory(updated);
    localStorage.setItem('debate_history', JSON.stringify(updated));
  };

  if (view === 'landing') return <LandingPage onEnter={() => setView('config')} loading={loading} />;
  
  if (view === 'config') return (
    <ConfigPage 
      onNext={(mode, topic, rounds) => {
        setGameState({ mode, topic, totalRounds: rounds });
        setView('selection');
      }}
      onViewHistory={() => setView('history')}
    />
  );

  if (view === 'selection') return (
    <SelectionPage 
      mode={gameState.mode!}
      onNext={(pro, con, userSide) => {
        setGameState(prev => ({ ...prev, proDebater: pro, conDebater: con, userSide }));
        setView('game');
      }}
      onBack={() => setView('config')}
    />
  );

  if (view === 'game') return (
    <DebateGame 
      initialState={gameState as GameState}
      onFinish={(finalState) => {
        saveToHistory(finalState);
        setView('history');
      }}
      onExit={() => setView('config')}
    />
  );

  if (view === 'history') return <HistoryPage history={gameHistory} onBack={() => setView('config')} />;

  return null;
};

export default App;
