'use client';

import React, { useState } from 'react';
import { useMacroTracker } from '@/context/MacroTrackerContext';
import { MealCategory, MealEntry } from '@/lib/types';
import { Trash2, Clock, Sparkles, ChevronRight, Plus, Image as ImageIcon } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

const CATEGORIES: { key: MealCategory; label: string; icon: string }[] = [
  { key: 'breakfast', label: 'Breakfast', icon: '🍳' },
  { key: 'lunch', label: 'Lunch', icon: '🥗' },
  { key: 'dinner', label: 'Dinner', icon: '🥩' },
  { key: 'snack', label: 'Snacks', icon: '🍎' },
];

export const MealList: React.FC = () => {
  const { dayLog, deleteMeal } = useMacroTracker();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const meals = dayLog?.meals || [];

  return (
    <div className="space-y-4">
      {CATEGORIES.map(({ key, label, icon }) => {
        const categoryMeals = meals.filter((m) => m.category === key);
        const catCalories = categoryMeals.reduce((acc, m) => acc + (m.calories || 0), 0);
        const catProtein = Math.round(categoryMeals.reduce((acc, m) => acc + (m.protein || 0), 0) * 10) / 10;
        const catCarbs = Math.round(categoryMeals.reduce((acc, m) => acc + (m.carbs || 0), 0) * 10) / 10;
        const catFat = Math.round(categoryMeals.reduce((acc, m) => acc + (m.fat || 0), 0) * 10) / 10;

        return (
          <div key={key} className="bg-zinc-900/60 border border-white/5 rounded-3xl p-4 backdrop-blur-md">
            {/* Category Header */}
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-lg">{icon}</span>
                <div>
                  <h4 className="font-bold text-sm text-white tracking-tight">{label}</h4>
                  <span className="text-[11px] text-zinc-400">
                    {categoryMeals.length} item{categoryMeals.length === 1 ? '' : 's'}
                  </span>
                </div>
              </div>

              {categoryMeals.length > 0 && (
                <div className="text-right">
                  <span className="text-xs font-bold text-zinc-200">{catCalories} kcal</span>
                  <div className="text-[10px] text-zinc-400 font-medium">
                    <span className="text-emerald-400 font-bold">{catProtein}g P</span> • {catCarbs}g C • {catFat}g F
                  </div>
                </div>
              )}
            </div>

            {/* Meal Items */}
            {categoryMeals.length === 0 ? (
              <div className="py-3 text-center">
                <p className="text-xs text-zinc-400">No {label.toLowerCase()} logged yet.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {categoryMeals.map((meal) => {
                  const timeFormatted = meal.timestamp
                    ? new Date(meal.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
                    : '';

                  return (
                    <div
                      key={meal.id}
                      className="bg-zinc-800/40 hover:bg-zinc-800/60 border border-white/5 rounded-2xl p-3 transition-all flex items-start justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Optional thumbnail if taken via camera */}
                        {meal.imageUrl && (
                          <button
                            type="button"
                            onClick={() => setSelectedImage(meal.imageUrl || null)}
                            className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10 relative group/img"
                            title="Click to view full photo"
                          >
                            <img
                              src={meal.imageUrl}
                              alt={meal.name}
                              className="w-full h-full object-cover transition-transform group-hover/img:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                              <ImageIcon className="w-3.5 h-3.5 text-white" />
                            </div>
                          </button>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h5 className="font-bold text-xs text-zinc-100 truncate">{meal.name}</h5>
                            {meal.aiAnalyzed && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-400/10 text-amber-400 text-[9px] font-semibold">
                                <Sparkles className="w-2.5 h-2.5" />
                                <span>AI</span>
                              </span>
                            )}
                          </div>

                          {/* Ingredient tags */}
                          {meal.items && meal.items.length > 0 && (
                            <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                              {meal.items.map((i) => i.name).join(' • ')}
                            </p>
                          )}

                          {/* Macro pills */}
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 text-[10px] font-semibold">
                              {meal.calories} kcal
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">
                              {meal.protein}g protein
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-300 text-[10px] font-medium">
                              {meal.carbs}g carbs
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 text-[10px] font-medium">
                              {meal.fat}g fat
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right actions: time and delete */}
                      <div className="flex flex-col items-end justify-between h-full shrink-0 gap-2">
                        {timeFormatted && (
                          <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{timeFormatted}</span>
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Remove "${meal.name}"?`)) {
                              deleteMeal(meal.id);
                            }
                          }}
                          className="opacity-60 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          title="Delete meal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Image Preview Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-sm max-h-[80vh] overflow-hidden rounded-3xl border border-white/20 shadow-2xl">
            <img src={selectedImage} alt="Scanned Meal" className="w-full h-full object-contain" />
            <div className="absolute bottom-3 left-3 right-3 text-center bg-black/60 backdrop-blur-md py-1.5 px-3 rounded-xl text-xs text-white">
              Tap anywhere to dismiss
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
