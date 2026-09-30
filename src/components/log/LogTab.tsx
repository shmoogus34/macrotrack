'use client';

import React from 'react';
import { useMacroTracker } from '@/context/MacroTrackerContext';
import { MacroRings } from './MacroRings';
import { AILoggerBar } from './AILoggerBar';
import { MealList } from './MealList';
import { MealDetailModal } from './MealDetailModal';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getTodayString } from '@/lib/storage';
import { triggerHaptic } from '@/lib/haptics';

export const LogTab: React.FC = () => {
  const { selectedDate, setSelectedDate, currentUser } = useMacroTracker();

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
    <div className="px-5 py-4 space-y-5 animate-in fade-in duration-200">
      {/* Day Navigator */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 block">
            {currentUser?.name ? `${currentUser.name.toUpperCase()}'S LOG` : 'DAILY LOG'}
          </span>
          <h2 className="text-xl font-black text-white uppercase tracking-tight">
            {isToday ? 'Today' : formattedDate}
          </h2>
        </div>

        <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 rounded-full px-2 py-1">
          <button
            onClick={() => navigateDay(-1)}
            className="p-1 text-zinc-500 hover:text-white transition-colors"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              triggerHaptic('light');
              setSelectedDate(todayStr);
            }}
            className="px-2 text-xs font-mono font-bold uppercase text-zinc-400 hover:text-white"
          >
            {isToday ? 'TODAY' : 'RESET'}
          </button>
          <button
            onClick={() => navigateDay(1)}
            className="p-1 text-zinc-500 hover:text-white transition-colors"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero Macro Budget */}
      <MacroRings />

      {/* AI Fast Food Logger */}
      <AILoggerBar />

      {/* Meals List */}
      <MealList />

      {/* Detailed Inspection Modal */}
      <MealDetailModal />
    </div>
  );
};
