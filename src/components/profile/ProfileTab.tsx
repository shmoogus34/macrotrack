'use client';

import React, { useState } from 'react';
import { useMacroTracker } from '@/context/MacroTrackerContext';
import { GoalMode, ActivityLevel, UserGoals } from '@/lib/types';
import {
  User,
  Beef,
  Flame,
  Wheat,
  Droplet,
  Scale,
  Sparkles,
  Smartphone,
  Download,
  Upload,
  RefreshCw,
  Calculator,
  ChevronRight,
  Check,
  Key,
  ShieldCheck,
  Edit2,
  Share2,
} from 'lucide-react';
import { exportAllData, importAllData } from '@/lib/storage';
import { triggerHaptic, celebrateGoal } from '@/lib/haptics';

export const ProfileTab: React.FC = () => {
  const {
    profile,
    updateProfile,
    goals,
    updateGoals,
    weightLogs,
    logWeight,
    resetAll,
  } = useMacroTracker();

  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [tempGoals, setTempGoals] = useState<UserGoals>(goals);
  const [newWeight, setNewWeight] = useState(profile.currentWeightLbs.toString());
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [customKeyInput, setCustomKeyInput] = useState(profile.customApiKey || '');
  const [apiKeySaved, setApiKeySaved] = useState(false);

  // TDEE Calculator state
  const [calcAge, setCalcAge] = useState(profile.age);
  const [calcWeight, setCalcWeight] = useState(profile.currentWeightLbs);
  const [calcHeight, setCalcHeight] = useState(profile.heightInches);
  const [calcGender, setCalcGender] = useState(profile.gender);
  const [calcActivity, setCalcActivity] = useState(profile.activityLevel);
  const [calcGoalMode, setCalcGoalMode] = useState(profile.goalMode);

  // Calculate Mifflin-St Jeor TDEE
  const calculateTDEE = () => {
    // Weight in kg, height in cm
    const weightKg = calcWeight * 0.453592;
    const heightCm = calcHeight * 2.54;

    let bmr = 10 * weightKg + 6.25 * heightCm - 5 * calcAge;
    if (calcGender === 'male') {
      bmr += 5;
    } else {
      bmr -= 161;
    }

    const activityMultipliers: Record<ActivityLevel, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      very_active: 1.725,
      athlete: 1.9,
    };

    const tdee = Math.round(bmr * activityMultipliers[calcActivity]);

    // Target adjustment based on goal mode
    let targetCalories = tdee;
    if (calcGoalMode === 'cut') targetCalories = Math.round(tdee - 450);
    else if (calcGoalMode === 'bulk') targetCalories = Math.round(tdee + 350);

    // Protein target: 1g per lb of bodyweight (ideal for muscle retention/growth)
    const targetProtein = Math.round(calcWeight * 1.0);
    // Fat target: 25% of calories
    const targetFat = Math.round((targetCalories * 0.25) / 9);
    // Carbs target: remainder
    const targetCarbs = Math.max(
      50,
      Math.round((targetCalories - targetProtein * 4 - targetFat * 9) / 4)
    );

    return {
      tdee,
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFat,
      water: Math.round(calcWeight * 0.6 * 29.5735), // ~0.6 oz per lb in ml
    };
  };

  const calculatedPlan = calculateTDEE();

  const handleApplyCalculated = () => {
    triggerHaptic('success');
    celebrateGoal();
    updateGoals({
      dailyCalories: calculatedPlan.targetCalories,
      dailyProtein: calculatedPlan.targetProtein,
      dailyCarbs: calculatedPlan.targetCarbs,
      dailyFat: calculatedPlan.targetFat,
      dailyWaterMl: calculatedPlan.water,
    });
    updateProfile({
      age: calcAge,
      currentWeightLbs: calcWeight,
      heightInches: calcHeight,
      gender: calcGender,
      activityLevel: calcActivity,
      goalMode: calcGoalMode,
    });
    setShowCalculator(false);
  };

  const handleSaveGoals = () => {
    triggerHaptic('success');
    updateGoals(tempGoals);
    setIsEditingGoals(false);
  };

  const handleSaveApiKey = () => {
    triggerHaptic('light');
    updateProfile({ customApiKey: customKeyInput.trim() });
    setApiKeySaved(true);
    setTimeout(() => setApiKeySaved(false), 2500);
  };

  const handleLogWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(newWeight);
    if (!isNaN(w) && w > 0) {
      logWeight(w);
      triggerHaptic('success');
    }
  };

  const handleExport = () => {
    triggerHaptic('light');
    const dataStr = exportAllData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `macrotrack-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content && importAllData(content)) {
        triggerHaptic('success');
        alert('Data imported successfully! Reloading...');
        window.location.reload();
      } else {
        alert('Invalid backup file format.');
      }
    };
    reader.readAsText(file);
  };

  const proteinRatio = (goals.dailyProtein / (profile.currentWeightLbs || 175)).toFixed(2);

  return (
    <div className="px-5 py-4 space-y-5 animate-in fade-in duration-300 pb-10">
      {/* User Header Profile Card */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-white/10 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 via-emerald-400 to-sky-400 p-[2px] shadow-lg">
            <div className="w-full h-full bg-zinc-950 rounded-2xl flex items-center justify-center text-white">
              <User className="w-8 h-8 text-amber-400" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-white truncate">{profile.name}</h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                {profile.goalMode}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {profile.currentWeightLbs} lbs • Target: {profile.targetWeightLbs} lbs
            </p>
          </div>
        </div>

        {/* Quick Goal Mode Switcher */}
        <div className="grid grid-cols-4 gap-1.5 mt-4 pt-3 border-t border-white/5">
          {(['cut', 'maintain', 'bulk', 'performance'] as GoalMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                triggerHaptic('light');
                updateProfile({ goalMode: mode });
              }}
              className={`py-1.5 px-1 rounded-xl text-[11px] font-semibold capitalize transition-all ${
                profile.goalMode === mode
                  ? 'bg-white text-black shadow-md'
                  : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* HERO SECTION: DAILY PROTEIN & CALORIE TARGETS */}
      <div className="bg-zinc-900/80 border border-white/10 rounded-3xl p-5 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-400">
              Personalized Nutrition Target
            </span>
            <h3 className="text-base font-extrabold text-white mt-0.5">Daily Macro Goals</h3>
          </div>

          <button
            onClick={() => {
              setTempGoals(goals);
              setIsEditingGoals(!isEditingGoals);
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition-all border border-white/5"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>{isEditingGoals ? 'Close' : 'Adjust'}</span>
          </button>
        </div>

        {/* Highlighted Protein Goal Card (Requested by user) */}
        <div className="bg-emerald-500/10 border-2 border-emerald-500/30 rounded-2xl p-4 relative overflow-hidden mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-black flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Beef className="w-5 h-5 stroke-[2.5px]" />
              </div>
              <div>
                <span className="text-xs uppercase font-extrabold text-emerald-400 tracking-wide">
                  Daily Protein Goal
                </span>
                <p className="text-[11px] text-zinc-400">
                  {proteinRatio}g per lb of body weight
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-3xl font-black text-emerald-400">{goals.dailyProtein}</span>
              <span className="text-sm font-bold text-emerald-300 ml-1">g / day</span>
            </div>
          </div>
        </div>

        {/* Other Macro Targets Row */}
        <div className="grid grid-cols-3 gap-2">
          {/* Calories */}
          <div className="bg-zinc-800/50 rounded-2xl p-3 border border-white/5 text-center">
            <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center justify-center gap-1">
              <Flame className="w-3 h-3 text-red-400" />
              <span>Calories</span>
            </span>
            <p className="text-lg font-extrabold text-white mt-1">{goals.dailyCalories}</p>
            <span className="text-[10px] text-zinc-400">kcal</span>
          </div>

          {/* Carbs */}
          <div className="bg-zinc-800/50 rounded-2xl p-3 border border-white/5 text-center">
            <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center justify-center gap-1">
              <Wheat className="w-3 h-3 text-sky-400" />
              <span>Carbs</span>
            </span>
            <p className="text-lg font-extrabold text-white mt-1">{goals.dailyCarbs}</p>
            <span className="text-[10px] text-zinc-400">grams</span>
          </div>

          {/* Fat */}
          <div className="bg-zinc-800/50 rounded-2xl p-3 border border-white/5 text-center">
            <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center justify-center gap-1">
              <Droplet className="w-3 h-3 text-amber-400" />
              <span>Fats</span>
            </span>
            <p className="text-lg font-extrabold text-white mt-1">{goals.dailyFat}</p>
            <span className="text-[10px] text-zinc-400">grams</span>
          </div>
        </div>

        {/* Goal Editor Form Drawer */}
        {isEditingGoals && (
          <div className="mt-4 pt-4 border-t border-white/10 space-y-3 animate-in slide-in-from-top duration-200">
            <h4 className="text-xs font-bold text-zinc-300">Set Custom Targets</h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-zinc-400 font-medium">Daily Calories (kcal)</label>
                <input
                  type="number"
                  value={tempGoals.dailyCalories}
                  onChange={(e) =>
                    setTempGoals({ ...tempGoals, dailyCalories: Number(e.target.value) })
                  }
                  className="w-full mt-1 bg-zinc-800 border border-white/10 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-emerald-400 font-medium">Protein Target (g)</label>
                <input
                  type="number"
                  value={tempGoals.dailyProtein}
                  onChange={(e) =>
                    setTempGoals({ ...tempGoals, dailyProtein: Number(e.target.value) })
                  }
                  className="w-full mt-1 bg-zinc-800 border border-emerald-500/40 rounded-xl px-3 py-2 text-sm font-bold text-emerald-400 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-sky-400 font-medium">Carbs Target (g)</label>
                <input
                  type="number"
                  value={tempGoals.dailyCarbs}
                  onChange={(e) =>
                    setTempGoals({ ...tempGoals, dailyCarbs: Number(e.target.value) })
                  }
                  className="w-full mt-1 bg-zinc-800 border border-white/10 rounded-xl px-3 py-2 text-sm font-bold text-sky-300 focus:outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-amber-400 font-medium">Fat Target (g)</label>
                <input
                  type="number"
                  value={tempGoals.dailyFat}
                  onChange={(e) =>
                    setTempGoals({ ...tempGoals, dailyFat: Number(e.target.value) })
                  }
                  className="w-full mt-1 bg-zinc-800 border border-white/10 rounded-xl px-3 py-2 text-sm font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-cyan-400 font-medium">Water Goal (ml)</label>
              <input
                type="number"
                step="250"
                value={tempGoals.dailyWaterMl}
                onChange={(e) =>
                  setTempGoals({ ...tempGoals, dailyWaterMl: Number(e.target.value) })
                }
                className="w-full mt-1 bg-zinc-800 border border-white/10 rounded-xl px-3 py-2 text-sm font-bold text-cyan-300 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <button
              onClick={handleSaveGoals}
              className="w-full py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 transition-all"
            >
              <Check className="w-4 h-4 stroke-[3px]" />
              <span>Save Macro Targets</span>
            </button>
          </div>
        )}
      </div>

      {/* SMART TDEE & MACRO CALCULATOR */}
      <div className="bg-zinc-900/60 border border-white/5 rounded-3xl p-5 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Smart Macro Calculator</h4>
              <p className="text-[11px] text-zinc-400">Harris-Benedict & Mifflin-St Jeor TDEE</p>
            </div>
          </div>

          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
          >
            {showCalculator ? 'Hide' : 'Calculate'}
          </button>
        </div>

        {showCalculator && (
          <div className="mt-4 pt-3 border-t border-white/5 space-y-3 animate-in slide-in-from-top duration-200">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-zinc-400 text-[10px]">Weight (lbs)</label>
                <input
                  type="number"
                  value={calcWeight}
                  onChange={(e) => setCalcWeight(Number(e.target.value))}
                  className="w-full bg-zinc-800 rounded-xl p-2 text-white font-bold border border-white/5"
                />
              </div>
              <div>
                <label className="text-zinc-400 text-[10px]">Height (inches)</label>
                <input
                  type="number"
                  value={calcHeight}
                  onChange={(e) => setCalcHeight(Number(e.target.value))}
                  className="w-full bg-zinc-800 rounded-xl p-2 text-white font-bold border border-white/5"
                />
              </div>
              <div>
                <label className="text-zinc-400 text-[10px]">Age</label>
                <input
                  type="number"
                  value={calcAge}
                  onChange={(e) => setCalcAge(Number(e.target.value))}
                  className="w-full bg-zinc-800 rounded-xl p-2 text-white font-bold border border-white/5"
                />
              </div>
              <div>
                <label className="text-zinc-400 text-[10px]">Biological Sex</label>
                <select
                  value={calcGender}
                  onChange={(e) => setCalcGender(e.target.value as any)}
                  className="w-full bg-zinc-800 rounded-xl p-2 text-white font-semibold border border-white/5"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-zinc-400 text-[10px]">Activity Level</label>
              <select
                value={calcActivity}
                onChange={(e) => setCalcActivity(e.target.value as ActivityLevel)}
                className="w-full bg-zinc-800 rounded-xl p-2 text-white text-xs font-semibold border border-white/5"
              >
                <option value="sedentary">Sedentary (Office job, little exercise)</option>
                <option value="light">Lightly Active (Workouts 1-3 days/wk)</option>
                <option value="moderate">Moderately Active (Workouts 3-5 days/wk)</option>
                <option value="very_active">Very Active (Heavy training 6-7 days/wk)</option>
                <option value="athlete">Elite Athlete / Physical Labor</option>
              </select>
            </div>

            {/* Calculated Plan Preview */}
            <div className="bg-zinc-800/80 rounded-2xl p-3 border border-purple-500/20">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-purple-300">Recommended Plan:</span>
                <span className="text-zinc-400 text-[11px]">TDEE: {calculatedPlan.tdee} kcal</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-white">
                <span className="text-red-400">{calculatedPlan.targetCalories} kcal</span>
                <span className="text-emerald-400">{calculatedPlan.targetProtein}g Protein</span>
                <span className="text-sky-400">{calculatedPlan.targetCarbs}g Carbs</span>
                <span className="text-amber-400">{calculatedPlan.targetFat}g Fat</span>
              </div>
            </div>

            <button
              onClick={handleApplyCalculated}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all"
            >
              Apply Recommended Macros to My Profile
            </button>
          </div>
        )}
      </div>

      {/* WEIGHT TRACKER CHECK-IN */}
      <div className="bg-zinc-900/60 border border-white/5 rounded-3xl p-5 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-400" />
            <h4 className="font-bold text-sm text-white">Weight Check-in</h4>
          </div>
          <span className="text-xs font-bold text-zinc-300">{profile.currentWeightLbs} lbs</span>
        </div>

        <form onSubmit={handleLogWeightSubmit} className="flex gap-2">
          <input
            type="number"
            step="0.1"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            placeholder="e.g. 175.5"
            className="flex-1 bg-zinc-800/80 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-amber-400"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs rounded-xl shadow-md transition-all"
          >
            Log Weight
          </button>
        </form>

        {/* History Spark list */}
        {weightLogs && weightLogs.length > 0 && (
          <div className="flex items-center gap-2 mt-3 overflow-x-auto no-scrollbar py-1">
            {weightLogs.slice(-5).map((l) => (
              <div
                key={l.id}
                className="bg-zinc-800/60 border border-white/5 rounded-xl px-2.5 py-1 text-center shrink-0"
              >
                <span className="text-[9px] text-zinc-400 block">{l.date.slice(5)}</span>
                <span className="text-xs font-bold text-zinc-200">{l.weight}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI ENGINE & API CONFIGURATION */}
      <div className="bg-zinc-900/60 border border-white/5 rounded-3xl p-5 backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h4 className="font-bold text-sm text-white">AI Vision & Engine</h4>
          </div>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            <ShieldCheck className="w-3 h-3" />
            <span>Active</span>
          </span>
        </div>

        <div>
          <label className="text-[11px] text-zinc-400 font-medium">Selected AI Model</label>
          <select
            value={profile.preferredModel}
            onChange={(e) => updateProfile({ preferredModel: e.target.value })}
            className="w-full mt-1 bg-zinc-800 border border-white/10 rounded-xl p-2.5 text-xs font-semibold text-white focus:outline-none"
          >
            <option value="google/gemini-2.5-flash">Gemini 2.5 Flash (Fastest & Accurate Vision)</option>
            <option value="openai/gpt-4o">OpenAI GPT-4o</option>
            <option value="meta-llama/llama-3.3-70b-instruct">Llama 3.3 70B</option>
            <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] text-zinc-400 font-medium">
            Custom API Key (Optional)
          </label>
          <div className="flex gap-2 mt-1">
            <input
              type="password"
              value={customKeyInput}
              onChange={(e) => setCustomKeyInput(e.target.value)}
              placeholder="sk-or-v1-... or leave empty for default"
              className="flex-1 bg-zinc-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            />
            <button
              onClick={handleSaveApiKey}
              className="px-3 py-2 rounded-xl bg-zinc-700 hover:bg-zinc-600 text-white font-semibold text-xs transition-all"
            >
              {apiKeySaved ? 'Saved!' : 'Save'}
            </button>
          </div>
          <p className="text-[10px] text-zinc-400 mt-1">
            Stored locally in your iPhone browser. Uses pre-configured server router if blank.
          </p>
        </div>
      </div>

      {/* HOW TO INSTALL AS IPHONE WEB APP BUTTON */}
      <button
        onClick={() => setShowInstallGuide(true)}
        className="w-full py-4 px-5 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center justify-between shadow-xl shadow-blue-500/20 transition-all"
      >
        <div className="flex items-center gap-3">
          <Smartphone className="w-5 h-5" />
          <div className="text-left">
            <p className="leading-tight">Install on iPhone Home Screen</p>
            <p className="text-[11px] text-blue-200 font-normal">Add as standalone iOS Web App</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 opacity-80" />
      </button>

      {/* DATA MANAGEMENT: BACKUP & RESTORE */}
      <div className="bg-zinc-900/60 border border-white/5 rounded-3xl p-5 backdrop-blur-md space-y-3">
        <h4 className="font-bold text-xs text-zinc-400 uppercase tracking-wider">Data & Storage</h4>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-all border border-white/5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Backup</span>
          </button>

          <label className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-all border border-white/5 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Import Backup</span>
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>

        <button
          onClick={() => {
            if (confirm('Reset all logged meals and goals back to default demo data?')) {
              resetAll();
              alert('Reset complete.');
            }
          }}
          className="w-full py-2 text-center text-xs text-red-400/80 hover:text-red-400 transition-colors"
        >
          Reset to Factory Defaults
        </button>
      </div>

      {/* IPHONE WEB APP INSTALL GUIDE MODAL */}
      {showInstallGuide && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6 pb-safe shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white text-base">Install on your iPhone</h3>
              </div>
              <button
                onClick={() => setShowInstallGuide(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-zinc-300">
              <div className="flex items-start gap-3 bg-zinc-800/60 p-3 rounded-2xl">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  <p className="font-bold text-white">Open in Safari</p>
                  <p className="text-zinc-400 text-[11px] mt-0.5">
                    Make sure you open your hosted URL (on Vercel, Netlify, or GitHub Pages) inside iOS <strong>Safari</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-zinc-800/60 p-3 rounded-2xl">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <p className="font-bold text-white flex items-center gap-1.5">
                    <span>Tap the Share Button</span>
                    <Share2 className="w-3.5 h-3.5 text-blue-400" />
                  </p>
                  <p className="text-zinc-400 text-[11px] mt-0.5">
                    Look at the bottom navigation bar of Safari and tap the square icon with an upward arrow.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-zinc-800/60 p-3 rounded-2xl">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0">
                  3
                </div>
                <div>
                  <p className="font-bold text-white">Select "Add to Home Screen"</p>
                  <p className="text-zinc-400 text-[11px] mt-0.5">
                    Scroll down the options list and select <strong>"Add to Home Screen"</strong> with the [+] icon.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-zinc-800/60 p-3 rounded-2xl">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">
                  ✓
                </div>
                <div>
                  <p className="font-bold text-emerald-400">Launch Full Screen</p>
                  <p className="text-zinc-400 text-[11px] mt-0.5">
                    Tap <strong>Add</strong> in the top right. MacroTrack will now appear as an app icon with standalone native iOS UI!
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowInstallGuide(false)}
              className="w-full mt-5 py-3 rounded-2xl bg-white text-black font-bold text-xs"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
