'use client';

import React from 'react';
import { useMacroTracker } from '@/context/MacroTrackerContext';
import { X, Trash2, Clock } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

export const MealDetailModal: React.FC = () => {
  const { selectedMealDetails, setSelectedMealDetails, deleteMeal } = useMacroTracker();

  if (!selectedMealDetails) return null;

  const meal = selectedMealDetails;
  const timeFormatted = meal.timestamp
    ? new Date(meal.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : '';

  const handleDelete = () => {
    triggerHaptic('medium');
    if (confirm(`Delete "${meal.name}"?`)) {
      deleteMeal(meal.id);
      setSelectedMealDetails(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={() => setSelectedMealDetails(null)}
    >
      <div
        className="bg-black border border-white/20 rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 pb-safe shadow-2xl text-white selection:bg-white selection:text-black"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">
                {meal.category}
              </span>
              {timeFormatted && (
                <>
                  <span className="text-zinc-600">•</span>
                  <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{timeFormatted}</span>
                  </span>
                </>
              )}
            </div>
            <h3 className="text-2xl font-black tracking-tight text-white uppercase">
              {meal.name}
            </h3>
          </div>

          <button
            onClick={() => setSelectedMealDetails(null)}
            className="p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Photo if present */}
        {meal.imageUrl && (
          <div className="my-4 rounded-2xl overflow-hidden border border-white/10 max-h-56 bg-zinc-950">
            <img src={meal.imageUrl} alt={meal.name} className="w-full h-full object-cover" />
          </div>
        )}

        {/* What AI Saw in Photo */}
        {meal.visualDescription && (
          <div className="my-3 p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-left">
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 block mb-1 font-bold">
              WHAT AI SAW IN PHOTO
            </span>
            <p className="text-xs font-mono text-zinc-300 leading-relaxed">
              {meal.visualDescription}
            </p>
          </div>
        )}

        {/* Huge Bold Macro Breakdown Grid */}
        <div className="grid grid-cols-4 gap-2 my-5">
          <div className="bg-zinc-950 border border-white/10 rounded-2xl p-3 text-center">
            <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 block">
              CALORIES
            </span>
            <p className="text-xl font-black text-white mt-0.5">{meal.calories}</p>
            <span className="text-[8px] text-zinc-500 uppercase">kcal</span>
          </div>

          <div className="bg-zinc-950 border-2 border-white rounded-2xl p-3 text-center">
            <span className="text-[9px] font-mono uppercase tracking-wider text-white font-bold block">
              PROTEIN
            </span>
            <p className="text-xl font-black text-white mt-0.5">{meal.protein}g</p>
            <span className="text-[8px] text-zinc-400 uppercase">target</span>
          </div>

          <div className="bg-zinc-950 border border-white/10 rounded-2xl p-3 text-center">
            <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 block">
              CARBS
            </span>
            <p className="text-xl font-black text-white mt-0.5">{meal.carbs}g</p>
            <span className="text-[8px] text-zinc-500 uppercase">fuel</span>
          </div>

          <div className="bg-zinc-950 border border-white/10 rounded-2xl p-3 text-center">
            <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 block">
              FAT
            </span>
            <p className="text-xl font-black text-white mt-0.5">{meal.fat}g</p>
            <span className="text-[8px] text-zinc-500 uppercase">lipids</span>
          </div>
        </div>

        {/* Itemized Ingredients Breakdown */}
        {meal.items && meal.items.length > 0 && (
          <div className="space-y-2 mt-4">
            <div className="flex items-center justify-between pb-1 border-b border-white/5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                DETECTED INGREDIENTS ({meal.items.length})
              </span>
            </div>

            <div className="divide-y divide-zinc-900 bg-zinc-950 rounded-2xl border border-white/10 p-2">
              {meal.items.map((item, idx) => (
                <div key={idx} className="py-2.5 px-2 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-white text-sm">{item.name}</p>
                    <p className="text-[11px] font-mono text-zinc-500">{item.portion}</p>
                  </div>

                  <div className="text-right">
                    <p className="font-mono font-bold text-white text-sm">{item.calories} kcal</p>
                    <p className="text-[10px] font-mono text-zinc-400">
                      {item.protein}g P • {item.carbs}g C • {item.fat}g F
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Health Tip / AI Notes */}
        {meal.healthTip && (
          <div className="mt-4 p-3.5 rounded-2xl bg-zinc-950 border border-white/10 text-xs text-zinc-300">
            <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 block mb-1">
              NUTRITION INSIGHT
            </span>
            <p className="leading-relaxed">{meal.healthTip}</p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex items-center justify-between pt-3 border-t border-white/10">
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl bg-zinc-950 hover:bg-red-950/40 text-red-400 border border-red-500/20 text-xs font-bold transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Meal</span>
          </button>

          <button
            onClick={() => setSelectedMealDetails(null)}
            className="py-2.5 px-6 rounded-xl bg-white text-black font-black text-xs uppercase tracking-wider hover:bg-zinc-200 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
