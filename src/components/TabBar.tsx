'use client';

import React from 'react';
import { useMacroTracker, TabType } from '@/context/MacroTrackerContext';
import { Flame, Camera, User } from 'lucide-react';

export const TabBar: React.FC = () => {
  const { activeTab, setActiveTab } = useMacroTracker();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 pb-safe pt-2 bg-black/90 backdrop-blur-xl border-t border-zinc-900 transition-all"
      aria-label="Navigation"
    >
      <div className="max-w-md mx-auto px-8 flex items-center justify-between h-14">
        {/* Tab 1: Log */}
        <button
          onClick={() => setActiveTab('log')}
          className={`flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === 'log' ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'
          }`}
          aria-label="Daily Log"
        >
          <Flame
            className={`w-6 h-6 transition-transform ${
              activeTab === 'log' ? 'stroke-[2.5px] scale-110 text-white' : 'stroke-[1.5px]'
            }`}
          />
          <span
            className={`text-[10px] font-mono tracking-widest uppercase mt-1 ${
              activeTab === 'log' ? 'font-black text-white' : 'font-medium text-zinc-600'
            }`}
          >
            Log
          </span>
        </button>

        {/* Tab 2: Camera (Hero Scanner Button) */}
        <button
          onClick={() => setActiveTab('camera')}
          className="flex flex-col items-center justify-center -translate-y-2 group"
          aria-label="Scan Food"
        >
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              activeTab === 'camera'
                ? 'bg-white text-black ring-4 ring-zinc-800 scale-105'
                : 'bg-zinc-900 text-white border border-zinc-800 hover:bg-zinc-800'
            }`}
          >
            <Camera className="w-6 h-6 stroke-[2.2px]" />
          </div>
          <span
            className={`text-[10px] font-mono tracking-widest uppercase mt-0.5 ${
              activeTab === 'camera' ? 'font-black text-white' : 'font-medium text-zinc-600'
            }`}
          >
            Camera
          </span>
        </button>

        {/* Tab 3: Profile */}
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === 'profile' ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'
          }`}
          aria-label="Profile"
        >
          <User
            className={`w-6 h-6 transition-transform ${
              activeTab === 'profile' ? 'stroke-[2.5px] scale-110 text-white' : 'stroke-[1.5px]'
            }`}
          />
          <span
            className={`text-[10px] font-mono tracking-widest uppercase mt-1 ${
              activeTab === 'profile' ? 'font-black text-white' : 'font-medium text-zinc-600'
            }`}
          >
            Profile
          </span>
        </button>
      </div>
    </nav>
  );
};
