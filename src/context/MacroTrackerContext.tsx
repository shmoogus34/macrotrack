'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { DayLog, MealEntry, UserGoals, UserProfile, WeightLogEntry } from '@/lib/types';
import {
  DEFAULT_GOALS,
  DEFAULT_PROFILE,
  getDayLog,
  getStoredGoals,
  getStoredProfile,
  getStoredWeightLogs,
  getTodayString,
  saveDayLog,
  saveStoredGoals,
  saveStoredProfile,
  saveWeightLog,
} from '@/lib/storage';
import { celebrateGoal, triggerHaptic } from '@/lib/haptics';

export type TabType = 'log' | 'camera' | 'profile';

interface MacroTrackerContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  dayLog: DayLog;
  profile: UserProfile;
  goals: UserGoals;
  weightLogs: WeightLogEntry[];
  isDesktopFrame: boolean;
  setIsDesktopFrame: (val: boolean) => void;

  // Actions
  addMeal: (meal: Omit<MealEntry, 'id' | 'timestamp'> & { timestamp?: string }) => void;
  deleteMeal: (mealId: string) => void;
  updateMeal: (meal: MealEntry) => void;
  addWater: (amountMl: number) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  updateGoals: (goals: Partial<UserGoals>) => void;
  logWeight: (weight: number, dateStr?: string) => void;
  resetAll: () => void;

  // Computed summary
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    water: number;
  };
  targets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    water: number;
  };
  percentages: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    water: number;
  };
}

const MacroTrackerContext = createContext<MacroTrackerContextType | undefined>(undefined);

export function MacroTrackerProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTabState] = useState<TabType>('log');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [dayLog, setDayLog] = useState<DayLog>({ date: getTodayString(), waterIntakeMl: 0, meals: [] });
  const [profile, setProfileState] = useState<UserProfile>(DEFAULT_PROFILE);
  const [goals, setGoalsState] = useState<UserGoals>(DEFAULT_GOALS);
  const [weightLogs, setWeightLogsState] = useState<WeightLogEntry[]>([]);
  const [isDesktopFrame, setIsDesktopFrame] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState(false);

  // Initialize from client storage
  useEffect(() => {
    setIsMounted(true);
    const p = getStoredProfile();
    const g = getStoredGoals();
    const w = getStoredWeightLogs();
    const d = getDayLog(getTodayString());

    setProfileState(p);
    setGoalsState(g);
    setWeightLogsState(w);
    setDayLog(d);

    // Auto-detect mobile devices to default to true full-screen
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      setIsDesktopFrame(false);
    }
  }, []);

  // Update dayLog when selectedDate changes
  useEffect(() => {
    if (!isMounted) return;
    const log = getDayLog(selectedDate);
    setDayLog(log);
  }, [selectedDate, isMounted]);

  const setActiveTab = (tab: TabType) => {
    triggerHaptic('light');
    setActiveTabState(tab);
  };

  const addMeal = (newMealData: Omit<MealEntry, 'id' | 'timestamp'> & { timestamp?: string }) => {
    const meal: MealEntry = {
      id: `m_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: newMealData.timestamp || new Date().toISOString(),
      ...newMealData,
    };

    const updated: DayLog = {
      ...dayLog,
      meals: [meal, ...dayLog.meals],
    };

    setDayLog(updated);
    saveDayLog(updated);
    triggerHaptic('medium');

    // Check if protein or calorie goal hit
    const newProtein = updated.meals.reduce((sum, m) => sum + m.protein, 0);
    if (newProtein >= goals.dailyProtein && dayLog.meals.reduce((sum, m) => sum + m.protein, 0) < goals.dailyProtein) {
      celebrateGoal();
    }
  };

  const deleteMeal = (mealId: string) => {
    triggerHaptic('medium');
    const updated: DayLog = {
      ...dayLog,
      meals: dayLog.meals.filter((m) => m.id !== mealId),
    };
    setDayLog(updated);
    saveDayLog(updated);
  };

  const updateMeal = (meal: MealEntry) => {
    triggerHaptic('light');
    const updated: DayLog = {
      ...dayLog,
      meals: dayLog.meals.map((m) => (m.id === meal.id ? meal : m)),
    };
    setDayLog(updated);
    saveDayLog(updated);
  };

  const addWater = (amountMl: number) => {
    triggerHaptic('light');
    const current = dayLog.waterIntakeMl || 0;
    const updatedWater = Math.max(0, current + amountMl);
    const updated: DayLog = {
      ...dayLog,
      waterIntakeMl: updatedWater,
    };
    setDayLog(updated);
    saveDayLog(updated);

    if (updatedWater >= goals.dailyWaterMl && current < goals.dailyWaterMl) {
      celebrateGoal();
    }
  };

  const updateProfile = (partial: Partial<UserProfile>) => {
    const updated = { ...profile, ...partial };
    setProfileState(updated);
    saveStoredProfile(updated);
  };

  const updateGoals = (partial: Partial<UserGoals>) => {
    const updated = { ...goals, ...partial };
    setGoalsState(updated);
    saveStoredGoals(updated);
  };

  const logWeight = (weight: number, dateStr?: string) => {
    triggerHaptic('medium');
    const updatedLogs = saveWeightLog(weight, dateStr || selectedDate);
    setWeightLogsState([...updatedLogs]);
    updateProfile({ currentWeightLbs: weight });
  };

  const resetAll = () => {
    localStorage.clear();
    setProfileState(DEFAULT_PROFILE);
    setGoalsState(DEFAULT_GOALS);
    setWeightLogsState([]);
    const freshToday = { date: getTodayString(), waterIntakeMl: 0, meals: [] };
    setDayLog(freshToday);
    saveDayLog(freshToday);
  };

  // Compute daily totals
  const totals = useMemo(() => {
    const meals = dayLog?.meals || [];
    const calories = Math.round(meals.reduce((sum, m) => sum + (m.calories || 0), 0));
    const protein = Math.round(meals.reduce((sum, m) => sum + (m.protein || 0), 0) * 10) / 10;
    const carbs = Math.round(meals.reduce((sum, m) => sum + (m.carbs || 0), 0) * 10) / 10;
    const fat = Math.round(meals.reduce((sum, m) => sum + (m.fat || 0), 0) * 10) / 10;
    const water = dayLog?.waterIntakeMl || 0;

    return { calories, protein, carbs, fat, water };
  }, [dayLog]);

  const targets = useMemo(() => {
    return {
      calories: goals.dailyCalories,
      protein: goals.dailyProtein,
      carbs: goals.dailyCarbs,
      fat: goals.dailyFat,
      water: goals.dailyWaterMl,
    };
  }, [goals]);

  const percentages = useMemo(() => {
    return {
      calories: Math.min(100, Math.round((totals.calories / Math.max(1, targets.calories)) * 100)),
      protein: Math.min(100, Math.round((totals.protein / Math.max(1, targets.protein)) * 100)),
      carbs: Math.min(100, Math.round((totals.carbs / Math.max(1, targets.carbs)) * 100)),
      fat: Math.min(100, Math.round((totals.fat / Math.max(1, targets.fat)) * 100)),
      water: Math.min(100, Math.round((totals.water / Math.max(1, targets.water)) * 100)),
    };
  }, [totals, targets]);

  return (
    <MacroTrackerContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedDate,
        setSelectedDate,
        dayLog,
        profile,
        goals,
        weightLogs,
        isDesktopFrame,
        setIsDesktopFrame,
        addMeal,
        deleteMeal,
        updateMeal,
        addWater,
        updateProfile,
        updateGoals,
        logWeight,
        resetAll,
        totals,
        targets,
        percentages,
      }}
    >
      {children}
    </MacroTrackerContext.Provider>
  );
}

export function useMacroTracker() {
  const context = useContext(MacroTrackerContext);
  if (!context) {
    throw new Error('useMacroTracker must be used within a MacroTrackerProvider');
  }
  return context;
}
