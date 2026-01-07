
import React, { useEffect, useState } from 'react';
import { LANDING_DANMAKU } from '../constants';

const Danmaku: React.FC = () => {
  const [items, setItems] = useState<{ id: number; text: string; top: string; duration: string }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newItem = {
        id: Date.now(),
        text: LANDING_DANMAKU[Math.floor(Math.random() * LANDING_DANMAKU.length)],
        top: `${Math.random() * 80 + 10}%`,
        duration: `${Math.random() * 10 + 10}s`
      };
      setItems(prev => [...prev.slice(-20), newItem]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="danmaku-container">
      {items.map(item => (
        <div
          key={item.id}
          className="danmaku-item"
          style={{ top: item.top, animationDuration: item.duration }}
        >
          {item.text}
        </div>
      ))}
    </div>
  );
};

export default Danmaku;
