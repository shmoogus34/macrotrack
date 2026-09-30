'use client';

import React from 'react';
import { useMacroTracker } from '@/context/MacroTrackerContext';

export const MacroRings: React.FC = () => {
  const { totals, targets, percentages } = useMacroTracker();

  const remainingCalories = Math.max(0, targets.calories - totals.calories);

  return (
    <div className="bg-black border border-zinc-800 rounded-3xl p-6 text-white">
      {/* Hero Calorie Counter */}
      <div className="mb-6">
        <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-zinc-500 block mb-1">
          DAILY BUDGET
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-6xl font-black tracking-tighter text-white leading-none">
            {remainingCalories}
          </span>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
            Kcal Left
          </span>
        </div>

        {/* Minimalist Calorie Bar */}
        <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden mt-3">
          <div
            className="bg-white h-full rounded-full transition-all duration-500"
            style={{ width: `${percentages.calories}%` }}
          />
        </div>
      </div>

      {/* 3 Core Macros Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Protein (Highlighted) */}
        <div className="bg-zinc-950 border-2 border-white rounded-2xl p-3 text-left">
          <span className="text-[9px] font-mono uppercase tracking-widest text-white font-extrabold block">
            PROTEIN
          </span>
          <div className="my-1">
            <span className="text-2xl font-black text-white">{Math.round(totals.protein)}</span>
            <span className="text-[10px] font-mono text-zinc-500">/{targets.protein}g</span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-white h-full rounded-full"
              style={{ width: `${percentages.protein}%` }}
            />
          </div>
        </div>

        {/* Carbs */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3 text-left">
          <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 font-bold block">
            CARBS
          </span>
          <div className="my-1">
            <span className="text-2xl font-black text-white">{Math.round(totals.carbs)}</span>
            <span className="text-[10px] font-mono text-zinc-500">/{targets.carbs}g</span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-zinc-400 h-full rounded-full"
              style={{ width: `${percentages.carbs}%` }}
            />
          </div>
        </div>

        {/* Fat */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3 text-left">
          <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 font-bold block">
            FAT
          </span>
          <div className="my-1">
            <span className="text-2xl font-black text-white">{Math.round(totals.fat)}</span>
            <span className="text-[10px] font-mono text-zinc-500">/{targets.fat}g</span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-zinc-400 h-full rounded-full"
              style={{ width: `${percentages.fat}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
