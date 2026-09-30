'use client';

import React from 'react';
import { useMacroTracker } from '@/context/MacroTrackerContext';
import { MealCategory } from '@/lib/types';
import { ChevronRight } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

const CATEGORIES: { key: MealCategory; label: string }[] = [
  { key: 'breakfast', label: 'BREAKFAST' },
  { key: 'lunch', label: 'LUNCH' },
  { key: 'dinner', label: 'DINNER' },
  { key: 'snack', label: 'SNACKS' },
];

export const MealList: React.FC = () => {
  const { dayLog, setSelectedMealDetails } = useMacroTracker();
  const meals = dayLog?.meals || [];

  const handleMealTap = (meal: any) => {
    triggerHaptic('light');
    setSelectedMealDetails(meal);
  };

  return (
    <div className="space-y-4">
      {CATEGORIES.map(({ key, label }) => {
        const categoryMeals = meals.filter((m) => m.category === key);
        const catCalories = categoryMeals.reduce((acc, m) => acc + (m.calories || 0), 0);
        const catProtein = Math.round(categoryMeals.reduce((acc, m) => acc + (m.protein || 0), 0) * 10) / 10;

        return (
          <div key={key} className="bg-black border border-zinc-800 rounded-3xl p-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-zinc-900">
              <div>
                <h4 className="font-mono text-xs font-black tracking-widest text-zinc-400">
                  {label}
                </h4>
                <span className="text-[10px] font-mono text-zinc-600">
                  {categoryMeals.length} LOGGED
                </span>
              </div>

              {categoryMeals.length > 0 && (
                <div className="text-right font-mono">
                  <span className="text-sm font-black text-white">{catCalories} kcal</span>
                  <p className="text-[10px] text-zinc-400 font-bold">{catProtein}g Protein</p>
                </div>
              )}
            </div>

            {/* List */}
            {categoryMeals.length === 0 ? (
              <p className="text-xs font-mono text-zinc-700 py-2">NO ITEMS LOGGED</p>
            ) : (
              <div className="space-y-2">
                {categoryMeals.map((meal) => (
                  <div
                    key={meal.id}
                    onClick={() => handleMealTap(meal)}
                    className="w-full bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-700 rounded-2xl p-3.5 transition-all flex items-center justify-between text-left group cursor-pointer active:scale-[0.99]"
                  >
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <h5 className="font-black text-sm text-white uppercase tracking-tight truncate">
                          {meal.name}
                        </h5>
                      </div>

                      {meal.items && meal.items.length > 0 && (
                        <p className="text-[11px] font-mono text-zinc-500 truncate mt-0.5">
                          {meal.items.map((i) => i.name).join(' • ')}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-1.5 font-mono text-[11px]">
                        <span className="font-bold text-white">{meal.calories} kcal</span>
                        <span className="text-zinc-400 font-bold">{meal.protein}g P</span>
                        <span className="text-zinc-600">{meal.carbs}g C</span>
                        <span className="text-zinc-600">{meal.fat}g F</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-zinc-600 group-hover:text-white uppercase tracking-wider hidden sm:inline">
                        View
                      </span>
                      <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
