'use client';

import React from 'react';
import { useMacroTracker, TabType } from '@/context/MacroTrackerContext';
import { Flame, Camera, User, Sparkles } from 'lucide-react';

export const TabBar: React.FC = () => {
  const { activeTab, setActiveTab } = useMacroTracker();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 pb-safe pt-2 bg-zinc-950/85 backdrop-blur-2xl border-t border-white/10 transition-all"
      aria-label="App Navigation"
    >
      <div className="max-w-md mx-auto px-6 flex items-center justify-around h-14">
        {/* Tab 1: Log (Default) */}
        <button
          onClick={() => setActiveTab('log')}
          className={`flex flex-col items-center justify-center w-20 py-1 transition-all group ${
            activeTab === 'log' ? 'text-amber-400 scale-105' : 'text-zinc-400 hover:text-zinc-200'
          }`}
          aria-label="Daily Macro Log"
        >
          <div className="relative">
            <Flame
              className={`w-6 h-6 transition-transform ${
                activeTab === 'log' ? 'stroke-[2.5px] drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'stroke-[1.75px]'
              }`}
            />
            {activeTab === 'log' && (
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            )}
          </div>
          <span
            className={`text-[11px] font-medium tracking-tight mt-1 transition-colors ${
              activeTab === 'log' ? 'font-semibold text-white' : 'text-zinc-400'
            }`}
          >
            Log
          </span>
        </button>

        {/* Tab 2: Camera (Hero Scanner) */}
        <button
          onClick={() => setActiveTab('camera')}
          className="flex flex-col items-center justify-center -translate-y-2 group"
          aria-label="AI Food Camera Scanner"
        >
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
              activeTab === 'camera'
                ? 'bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 text-black shadow-emerald-500/40 ring-4 ring-emerald-500/20 scale-105'
                : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700 shadow-black/50 border border-white/10'
            }`}
          >
            <div className="relative">
              <Camera className="w-6 h-6 stroke-[2.2px]" />
              <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-white fill-white/80 animate-pulse" />
            </div>
          </div>
          <span
            className={`text-[11px] font-medium tracking-tight mt-0.5 transition-colors ${
              activeTab === 'camera' ? 'font-semibold text-emerald-400' : 'text-zinc-400'
            }`}
          >
            Camera AI
          </span>
        </button>

        {/* Tab 3: Profile */}
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center justify-center w-20 py-1 transition-all group ${
            activeTab === 'profile' ? 'text-sky-400 scale-105' : 'text-zinc-400 hover:text-zinc-200'
          }`}
          aria-label="Profile and Goals"
        >
          <div className="relative">
            <User
              className={`w-6 h-6 transition-transform ${
                activeTab === 'profile' ? 'stroke-[2.5px] drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]' : 'stroke-[1.75px]'
              }`}
            />
          </div>
          <span
            className={`text-[11px] font-medium tracking-tight mt-1 transition-colors ${
              activeTab === 'profile' ? 'font-semibold text-white' : 'text-zinc-400'
            }`}
          >
            Profile
          </span>
        </button>
      </div>
    </nav>
  );
};
