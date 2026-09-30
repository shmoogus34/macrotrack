'use client';

import React, { useState } from 'react';
import { useMacroTracker } from '@/context/MacroTrackerContext';
import { LogOut, User, Check, Edit2 } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

export const ProfileTab: React.FC = () => {
  const {
    currentUser,
    profile,
    updateProfile,
    goals,
    updateGoals,
    logWeight,
    logout,
  } = useMacroTracker();

  const [isEditing, setIsEditing] = useState(false);
  const [calorieVal, setCalorieVal] = useState(goals.dailyCalories.toString());
  const [proteinVal, setProteinVal] = useState(goals.dailyProtein.toString());
  const [carbsVal, setCarbsVal] = useState(goals.dailyCarbs.toString());
  const [fatVal, setFatVal] = useState(goals.dailyFat.toString());
  const [weightVal, setWeightVal] = useState(profile.currentWeightLbs.toString());

  const handleSave = () => {
    triggerHaptic('success');
    updateGoals({
      dailyCalories: parseInt(calorieVal) || 2400,
      dailyProtein: parseInt(proteinVal) || 180,
      dailyCarbs: parseInt(carbsVal) || 240,
      dailyFat: parseInt(fatVal) || 65,
    });
    setIsEditing(false);
  };

  const handleLogWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weightVal);
    if (!isNaN(w) && w > 0) {
      logWeight(w);
      triggerHaptic('success');
      alert(`Logged weight: ${w} lbs`);
    }
  };

  return (
    <div className="px-5 py-4 space-y-5 animate-in fade-in duration-200 pb-12 text-white">
      {/* Account Info Header */}
      <div className="bg-black border border-zinc-800 rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full border border-white flex items-center justify-center bg-zinc-950">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 block">
                {currentUser?.provider ? `${currentUser.provider.toUpperCase()} ACCOUNT` : 'LOCAL ACCOUNT'}
              </span>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">
                {profile.name || currentUser?.name || 'Athlete'}
              </h2>
              <span className="text-xs font-mono text-zinc-500">
                {currentUser?.email || 'Logged In'}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              if (confirm('Sign out of this account?')) {
                logout();
              }
            }}
            className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 transition-all"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Daily Targets Card */}
      <div className="bg-black border border-zinc-800 rounded-3xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-900 mb-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 block">
              GOALS
            </span>
            <h3 className="text-base font-black text-white uppercase">Daily Targets</h3>
          </div>

          <button
            onClick={() => {
              setCalorieVal(goals.dailyCalories.toString());
              setProteinVal(goals.dailyProtein.toString());
              setCarbsVal(goals.dailyCarbs.toString());
              setFatVal(goals.dailyFat.toString());
              setIsEditing(!isEditing);
            }}
            className="text-xs font-mono font-bold uppercase text-zinc-400 hover:text-white flex items-center gap-1"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Cancel' : 'Edit'}</span>
          </button>
        </div>

        {isEditing ? (
          <div className="space-y-3 font-mono text-xs">
            <div>
              <label className="text-zinc-500 block mb-1">PROTEIN TARGET (G)</label>
              <input
                type="number"
                value={proteinVal}
                onChange={(e) => setProteinVal(e.target.value)}
                className="w-full bg-zinc-950 border-2 border-white rounded-xl p-3 font-black text-lg text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-zinc-500 block mb-1">CALORIE TARGET (KCAL)</label>
              <input
                type="number"
                value={calorieVal}
                onChange={(e) => setCalorieVal(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 font-bold text-base text-white focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-zinc-500 block mb-1">CARBS (G)</label>
                <input
                  type="number"
                  value={carbsVal}
                  onChange={(e) => setCarbsVal(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 font-bold text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-zinc-500 block mb-1">FAT (G)</label>
                <input
                  type="number"
                  value={fatVal}
                  onChange={(e) => setFatVal(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 font-bold text-white focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              className="w-full mt-3 py-3 rounded-xl bg-white text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3px]" />
              <span>Save Targets</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {/* Protein Hero */}
            <div className="col-span-2 bg-zinc-950 border-2 border-white rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-black uppercase text-white block">
                  DAILY PROTEIN
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  Target for muscle retention
                </span>
              </div>
              <span className="text-3xl font-black text-white">{goals.dailyProtein}g</span>
            </div>

            {/* Calories */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3.5">
              <span className="text-[9px] font-mono uppercase text-zinc-500 block">CALORIES</span>
              <p className="text-xl font-black text-white mt-1">{goals.dailyCalories}</p>
            </div>

            {/* Carbs & Fat */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3.5">
              <span className="text-[9px] font-mono uppercase text-zinc-500 block">CARBS / FAT</span>
              <p className="text-xl font-black text-white mt-1">
                {goals.dailyCarbs}g <span className="text-xs text-zinc-500 font-mono">/ {goals.dailyFat}g</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Weight Log */}
      <div className="bg-black border border-zinc-800 rounded-3xl p-6">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 block mb-1">
          BODY STATS
        </span>
        <h3 className="text-base font-black text-white uppercase mb-3">Weight Check-in</h3>

        <form onSubmit={handleLogWeight} className="flex gap-2">
          <input
            type="number"
            step="0.1"
            value={weightVal}
            onChange={(e) => setWeightVal(e.target.value)}
            placeholder="Weight (lbs)"
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-white focus:outline-none focus:border-white"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-white text-black font-black text-xs font-mono uppercase rounded-xl"
          >
            LOG
          </button>
        </form>
      </div>

      {/* iPhone Web App Installation Hint */}
      <div className="p-4 rounded-2xl border border-zinc-900 bg-zinc-950/60 text-xs font-mono text-zinc-500">
        <p className="text-zinc-300 font-bold mb-1">INSTALL AS IPHONE APP:</p>
        <p>In Safari, tap the Share button [↑] and select &ldquo;Add to Home Screen&rdquo;.</p>
      </div>
    </div>
  );
};
