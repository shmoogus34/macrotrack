'use client';

import React, { useState, useEffect } from 'react';
import { useMacroTracker } from '@/context/MacroTrackerContext';

export const IPhoneFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { totals, targets, activeTab } = useMacroTracker();
  const [currentTime, setCurrentTime] = useState('9:41');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      hours = hours % 12 || 12;
      setCurrentTime(`${hours}:${minutes}`);
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  const remainingCalories = Math.max(0, targets.calories - totals.calories);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white selection:bg-white selection:text-black">
      {/* Frame Container */}
      <div className="w-full max-w-md min-h-screen sm:min-h-[880px] sm:max-h-[95vh] sm:rounded-[48px] sm:border sm:border-zinc-800 sm:shadow-2xl bg-black overflow-hidden flex flex-col relative">
        {/* iOS Top Status Bar: Clean, with no icons on top right */}
        <header className="sticky top-0 z-40 w-full pt-safe px-6 pt-3 pb-2 flex items-center justify-between bg-black/90 backdrop-blur-xl border-b border-zinc-900/60">
          <span className="text-xs font-mono font-bold tracking-tight text-white w-14">
            {currentTime}
          </span>

          {/* Minimal Dynamic Island */}
          <div className="flex items-center justify-center px-4 py-1 rounded-full bg-zinc-950 border border-zinc-800 text-[11px] h-7">
            <span className="font-mono text-zinc-400">
              <strong className="text-white font-black">{remainingCalories}</strong> KCAL LEFT
            </span>
          </div>

          {/* Top Right: Completely clean and empty */}
          <div className="w-14" />
        </header>

        {/* App Main Body: fills screen, camera tab manages its own viewport without scroll */}
        <div className={`flex-1 ${activeTab === 'camera' ? 'overflow-hidden flex flex-col' : 'overflow-y-auto no-scrollbar pb-24'} relative flex flex-col`}>
          {children}
        </div>

        {/* iOS Home Indicator */}
        <div className="absolute bottom-1 left-0 right-0 z-50 pointer-events-none flex justify-center pb-1">
          <div className="w-32 h-1 rounded-full bg-zinc-800" />
        </div>
      </div>
    </div>
  );
};
