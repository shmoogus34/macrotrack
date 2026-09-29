'use client';

import React from 'react';
import { useMacroTracker } from '@/context/MacroTrackerContext';
import { Flame, Beef, Wheat, Droplet } from 'lucide-react';

export const MacroRings: React.FC = () => {
  const { totals, targets, percentages } = useMacroTracker();

  const remainingCalories = Math.max(0, targets.calories - totals.calories);

  // SVG ring math for 3 concentric rings (Apple Activity Ring style)
  // Outer: Calories (r=62), Middle: Protein (r=48), Inner: Carbs (r=34)
  const calcDash = (radius: number, percent: number) => {
    const circumference = 2 * Math.PI * radius;
    const clamped = Math.min(100, Math.max(0, percent));
    const offset = circumference - (clamped / 100) * circumference;
    return { circumference, offset };
  };

  const calRing = calcDash(62, percentages.calories);
  const protRing = calcDash(48, percentages.protein);
  const carbRing = calcDash(34, percentages.carbs);

  return (
    <div className="bg-gradient-to-b from-zinc-900/90 to-zinc-950/80 rounded-3xl p-5 border border-white/10 shadow-2xl backdrop-blur-xl">
      {/* Top summary row */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-zinc-400">Daily Balance</span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-3xl font-extrabold tracking-tight text-white">{remainingCalories}</span>
            <span className="text-xs font-medium text-zinc-400">kcal remaining</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] font-medium text-zinc-400">Target</span>
          <p className="text-sm font-bold text-zinc-200">{targets.calories} kcal</p>
        </div>
      </div>

      {/* Hero Visualization: Concentric Apple Activity Rings & Macro Cards */}
      <div className="flex items-center gap-5 my-2">
        {/* Triple Rings */}
        <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
            {/* Background Tracks */}
            <circle cx="80" cy="80" r="62" fill="none" stroke="#27272a" strokeWidth="10" strokeLinecap="round" />
            <circle cx="80" cy="80" r="48" fill="none" stroke="#27272a" strokeWidth="10" strokeLinecap="round" />
            <circle cx="80" cy="80" r="34" fill="none" stroke="#27272a" strokeWidth="10" strokeLinecap="round" />

            {/* Calories (Coral/Red) */}
            <circle
              cx="80"
              cy="80"
              r="62"
              fill="none"
              stroke="#FF453A"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={calRing.circumference}
              strokeDashoffset={calRing.offset}
              className="transition-all duration-1000 ease-out"
            />

            {/* Protein (Apple Green) */}
            <circle
              cx="80"
              cy="80"
              r="48"
              fill="none"
              stroke="#30D158"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={protRing.circumference}
              strokeDashoffset={protRing.offset}
              className="transition-all duration-1000 ease-out"
            />

            {/* Carbs (Apple Blue) */}
            <circle
              cx="80"
              cy="80"
              r="34"
              fill="none"
              stroke="#0A84FF"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={carbRing.circumference}
              strokeDashoffset={carbRing.offset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Center flame icon */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <Flame className="w-5 h-5 text-red-400 fill-red-400/20 drop-shadow-[0_0_8px_rgba(255,69,58,0.6)]" />
            <span className="text-[10px] font-bold text-zinc-300 mt-0.5">{totals.calories}</span>
          </div>
        </div>

        {/* Macro Bars Right Column */}
        <div className="flex-1 flex flex-col gap-2.5">
          {/* Protein (Highlighted) */}
          <div className="bg-zinc-900/80 rounded-2xl p-2.5 border border-emerald-500/20 relative overflow-hidden group">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                <Beef className="w-3.5 h-3.5" />
                <span>Protein</span>
              </span>
              <span className="font-semibold text-zinc-200">
                {totals.protein} <span className="text-zinc-500 text-[10px]">/ {targets.protein}g</span>
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(48,209,88,0.5)]"
                style={{ width: `${percentages.protein}%` }}
              />
            </div>
          </div>

          {/* Carbs */}
          <div className="bg-zinc-900/60 rounded-2xl p-2.5 border border-white/5">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="flex items-center gap-1.5 font-semibold text-sky-400">
                <Wheat className="w-3.5 h-3.5" />
                <span>Carbs</span>
              </span>
              <span className="font-semibold text-zinc-200">
                {totals.carbs} <span className="text-zinc-500 text-[10px]">/ {targets.carbs}g</span>
              </span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-sky-400 h-full rounded-full transition-all duration-700"
                style={{ width: `${percentages.carbs}%` }}
              />
            </div>
          </div>

          {/* Fat */}
          <div className="bg-zinc-900/60 rounded-2xl p-2.5 border border-white/5">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="flex items-center gap-1.5 font-semibold text-amber-400">
                <Droplet className="w-3.5 h-3.5" />
                <span>Fat</span>
              </span>
              <span className="font-semibold text-zinc-200">
                {totals.fat} <span className="text-zinc-500 text-[10px]">/ {targets.fat}g</span>
              </span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-700"
                style={{ width: `${percentages.fat}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
