'use client';

import React, { useState, useEffect } from 'react';
import { useMacroTracker } from '@/context/MacroTrackerContext';
import { Wifi, Battery, Smartphone, Maximize2, Minimize2, Sparkles } from 'lucide-react';

export const IPhoneFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDesktopFrame, setIsDesktopFrame, totals, targets } = useMacroTracker();
  const [currentTime, setCurrentTime] = useState('9:41');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      // Format 12-hour or standard
      hours = hours % 12 || 12;
      setCurrentTime(`${hours}:${minutes}`);
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  const remainingCalories = Math.max(0, targets.calories - totals.calories);

  // If in desktop frame mode
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white relative selection:bg-amber-500 selection:text-black">
      {/* Desktop view controls banner */}
      <div className="hidden md:flex items-center justify-between w-full max-w-4xl px-6 py-2.5 mb-2 text-xs text-zinc-400 border-b border-zinc-800/60 bg-zinc-900/40 backdrop-blur-md rounded-b-2xl">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-zinc-200">MacroTrack AI</span>
          <span className="text-zinc-500">•</span>
          <span>iPhone iOS Experience</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDesktopFrame(!isDesktopFrame)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-all text-xs font-medium border border-white/5"
            title="Toggle iPhone 16 Pro frame"
          >
            {isDesktopFrame ? (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Full Screen</span>
              </>
            ) : (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
                <span>iPhone Frame</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div
        className={`w-full transition-all duration-300 relative ${
          isDesktopFrame
            ? 'max-w-[420px] h-[890px] max-h-[96vh] rounded-[52px] ring-1 ring-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_12px_#18181b,0_0_0_14px_#27272a] bg-black overflow-hidden flex flex-col'
            : 'max-w-md min-h-screen flex flex-col bg-black'
        }`}
      >
        {/* iOS Top Status Bar & Dynamic Island */}
        <header className="sticky top-0 z-50 w-full pt-safe px-7 pt-2 flex items-center justify-between bg-black/75 backdrop-blur-xl border-b border-white/[0.03]">
          {/* Time */}
          <span className="text-xs font-semibold tracking-tight text-white w-14">
            {currentTime}
          </span>

          {/* Dynamic Island */}
          <div className="flex items-center justify-between px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] min-w-[130px] h-7 shadow-inner transition-all hover:ring-1 hover:ring-amber-500/50">
            <div className="flex items-center gap-1.5 text-amber-400">
              <Sparkles className="w-3 h-3 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="text-[10px] font-medium text-zinc-300">MacroAI</span>
            </div>
            <div className="text-[10px] font-semibold text-zinc-400">
              <span className="text-white">{remainingCalories}</span> left
            </div>
          </div>

          {/* Icons: Cellular, Wifi, Battery */}
          <div className="flex items-center justify-end gap-1.5 text-zinc-300 w-14">
            {/* Cellular */}
            <div className="flex items-end gap-[1.5px] h-3">
              <div className="w-[2.5px] h-1 bg-white rounded-xs" />
              <div className="w-[2.5px] h-1.5 bg-white rounded-xs" />
              <div className="w-[2.5px] h-2 bg-white rounded-xs" />
              <div className="w-[2.5px] h-2.5 bg-white rounded-xs" />
            </div>
            <Wifi className="w-3.5 h-3.5 text-white" />
            <div className="flex items-center gap-0.5">
              <Battery className="w-4 h-4 text-white" />
            </div>
          </div>
        </header>

        {/* App Main Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-24 relative flex flex-col">
          {children}
        </div>

        {/* iOS Home Indicator Bar */}
        <div className="absolute bottom-1 left-0 right-0 z-50 pointer-events-none flex justify-center pb-1">
          <div className="w-36 h-1 rounded-full bg-white/30" />
        </div>
      </div>
    </div>
  );
};
