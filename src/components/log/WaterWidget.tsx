'use client';

import React from 'react';
import { useMacroTracker } from '@/context/MacroTrackerContext';
import { Droplet, Plus, Minus } from 'lucide-react';

export const WaterWidget: React.FC = () => {
  const { totals, targets, addWater, percentages } = useMacroTracker();

  return (
    <div className="bg-zinc-900/70 border border-white/5 rounded-3xl p-4 backdrop-blur-md">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Droplet className="w-4 h-4 fill-cyan-400/40" />
          </div>
          <div>
            <span className="text-xs font-bold text-zinc-300">Hydration</span>
            <div className="text-[11px] text-zinc-400">
              <span className="font-semibold text-cyan-400">{totals.water}</span> / {targets.water} ml ({percentages.water}%)
            </div>
          </div>
        </div>

        {/* Quick add buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => addWater(-250)}
            disabled={totals.water <= 0}
            className="w-8 h-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-zinc-300 flex items-center justify-center transition-all text-xs"
            title="Subtract 250ml"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => addWater(250)}
            className="px-2.5 h-8 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 flex items-center gap-1 text-xs font-semibold transition-all shadow-sm"
          >
            <Plus className="w-3 h-3" />
            <span>250ml</span>
          </button>
          <button
            onClick={() => addWater(500)}
            className="px-2.5 h-8 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black flex items-center gap-1 text-xs font-bold transition-all shadow-md shadow-cyan-500/20"
          >
            <Plus className="w-3 h-3 stroke-[3px]" />
            <span>500ml</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-sky-400 to-cyan-300 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(100,210,255,0.4)]"
          style={{ width: `${percentages.water}%` }}
        />
      </div>
    </div>
  );
};
