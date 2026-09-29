'use client';

import React from 'react';
import { useMacroTracker } from '@/context/MacroTrackerContext';
import { MacroRings } from './MacroRings';
import { AILoggerBar } from './AILoggerBar';
import { WaterWidget } from './WaterWidget';
import { MealList } from './MealList';
import { ChevronLeft, ChevronRight, Calendar, Flame, Sparkles } from 'lucide-react';
import { getTodayString } from '@/lib/storage';
import { triggerHaptic } from '@/lib/haptics';

export const LogTab: React.FC = () => {
  const { selectedDate, setSelectedDate, totals, targets } = useMacroTracker();

  const todayStr = getTodayString();
  const isToday = selectedDate === todayStr;

  const navigateDay = (offset: number) => {
    triggerHaptic('light');
    const [y, m, d] = selectedDate.split('-').map(Number);
    const currentDate = new Date(y, m - 1, d);
    currentDate.setDate(currentDate.getDate() + offset);

    const newYear = currentDate.getFullYear();
    const newMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
    const newDay = String(currentDate.getDate()).padStart(2, '0');
    setSelectedDate(`${newYear}-${newMonth}-${newDay}`);
  };

  const formattedDate = (() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  })();

  return (
    <div className="px-5 py-4 space-y-5 animate-in fade-in duration-300">
      {/* Top Header: Streak and Day Switcher */}
      <div className="flex items-center justify-between">
        {/* Streak badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold">
          <Flame className="w-3.5 h-3.5 fill-orange-400" />
          <span>5 Day Streak</span>
        </div>

        {/* Day navigator */}
        <div className="flex items-center gap-1 bg-zinc-900/90 border border-white/10 rounded-full px-1.5 py-1 shadow-inner">
          <button
            onClick={() => navigateDay(-1)}
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
            title="Previous Day"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              setSelectedDate(todayStr);
            }}
            className="px-2.5 py-0.5 text-xs font-semibold tracking-tight text-white hover:text-amber-400 transition-colors flex items-center gap-1"
          >
            <span>{isToday ? 'Today' : formattedDate}</span>
          </button>

          <button
            onClick={() => navigateDay(1)}
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
            title="Next Day"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Hero Macro Concentric Rings & Highlights */}
      <MacroRings />

      {/* AI Prompt Input Bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5 px-1">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Fast Food Log</span>
          </span>
          <span className="text-[10px] text-zinc-400">Natural Language or Voice</span>
        </div>
        <AILoggerBar />
      </div>

      {/* Hydration tracker */}
      <WaterWidget />

      {/* Daily Meals Timeline */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Meals Timeline ({formattedDate})
          </span>
        </div>
        <MealList />
      </div>
    </div>
  );
};
