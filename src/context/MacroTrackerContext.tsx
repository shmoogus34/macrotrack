'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { DayLog, MealEntry, UserAccount, UserGoals, UserProfile, WeightLogEntry } from '@/lib/types';
import {
  DEFAULT_GOALS,
  DEFAULT_PROFILE,
  getActiveUser,
  getDayLog,
  getStoredUsers,
  getStoredWeightLogs,
  getTodayString,
  saveDayLog,
  saveWeightLog,
  setActiveUserId,
  createNewAccount,
  updateStoredUser,
} from '@/lib/storage';
import { triggerHaptic, celebrateGoal } from '@/lib/haptics';

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
  currentUser: UserAccount | null;
  allUsers: UserAccount[];

  // Meal inspection detail modal
  selectedMealDetails: MealEntry | null;
  setSelectedMealDetails: (meal: MealEntry | null) => void;

  // Auth & Onboarding
  signupWithProvider: (
    provider: 'apple' | 'google' | 'email',
    email: string,
    name: string,
    customGoals?: Partial<UserGoals>,
    customProfile?: Partial<UserProfile>
  ) => void;
  loginUser: (userId: string) => void;
  logout: () => void;

  // Actions
  addMeal: (meal: Omit<MealEntry, 'id' | 'timestamp'> & { timestamp?: string }) => void;
  deleteMeal: (mealId: string) => void;
  updateMeal: (meal: MealEntry) => void;
  addWater: (amountMl: number) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  updateGoals: (goals: Partial<UserGoals>) => void;
  logWeight: (weight: number, dateStr?: string) => void;

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
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [allUsers, setAllUsers] = useState<UserAccount[]>([]);
  const [activeTab, setActiveTabState] = useState<TabType>('log');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [dayLog, setDayLog] = useState<DayLog>({ date: getTodayString(), waterIntakeMl: 0, meals: [] });
  const [weightLogs, setWeightLogsState] = useState<WeightLogEntry[]>([]);
  const [selectedMealDetails, setSelectedMealDetails] = useState<MealEntry | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Initialize active user
  useEffect(() => {
    setIsMounted(true);
    const users = getStoredUsers();
    setAllUsers(users);

    const active = getActiveUser();
    if (active) {
      setCurrentUser(active);
      const d = getDayLog(getTodayString(), active.id);
      setDayLog(d);
      setWeightLogsState(getStoredWeightLogs(active.id));
    }
  }, []);

  // Update dayLog when selectedDate or currentUser changes
  useEffect(() => {
    if (!isMounted || !currentUser) return;
    const log = getDayLog(selectedDate, currentUser.id);
    setDayLog(log);
  }, [selectedDate, currentUser, isMounted]);

  const profile = currentUser?.profile || DEFAULT_PROFILE;
  const goals = currentUser?.goals || DEFAULT_GOALS;

  const setActiveTab = (tab: TabType) => {
    triggerHaptic('light');
    setActiveTabState(tab);
  };

  const signupWithProvider = (
    provider: 'apple' | 'google' | 'email',
    email: string,
    name: string,
    customGoals?: Partial<UserGoals>,
    customProfile?: Partial<UserProfile>
  ) => {
    triggerHaptic('success');
    celebrateGoal();
    const account = createNewAccount(provider, email, name, customGoals, customProfile);
    setCurrentUser(account);
    setAllUsers(getStoredUsers());

    // Completely clean slate: zero meals
    const freshLog = { date: getTodayString(), waterIntakeMl: 0, meals: [] };
    setDayLog(freshLog);
    setWeightLogsState([]);
  };

  const loginUser = (userId: string) => {
    triggerHaptic('light');
    setActiveUserId(userId);
    const users = getStoredUsers();
    const found = users.find((u) => u.id === userId) || null;
    setCurrentUser(found);
    if (found) {
      setDayLog(getDayLog(selectedDate, found.id));
      setWeightLogsState(getStoredWeightLogs(found.id));
    }
  };

  const logout = () => {
    triggerHaptic('light');
    setActiveUserId(null);
    setCurrentUser(null);
    setDayLog({ date: getTodayString(), waterIntakeMl: 0, meals: [] });
    setWeightLogsState([]);
  };

  const addMeal = (newMealData: Omit<MealEntry, 'id' | 'timestamp'> & { timestamp?: string }) => {
    if (!currentUser) return;
    const meal: MealEntry = {
      id: `m_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: newMealData.timestamp || new Date().toISOString(),
      ...newMealData,
    };

    const updated: DayLog = {
      ...dayLog,
      meals: [meal, ...dayLog.meals],
    };

    setDayLog(updated);
    saveDayLog(updated, currentUser.id);
    triggerHaptic('medium');

    const newProtein = updated.meals.reduce((sum, m) => sum + m.protein, 0);
    if (newProtein >= goals.dailyProtein && dayLog.meals.reduce((sum, m) => sum + m.protein, 0) < goals.dailyProtein) {
      celebrateGoal();
    }
  };

  const deleteMeal = (mealId: string) => {
    if (!currentUser) return;
    triggerHaptic('medium');
    const updated: DayLog = {
      ...dayLog,
      meals: dayLog.meals.filter((m) => m.id !== mealId),
    };
    setDayLog(updated);
    saveDayLog(updated, currentUser.id);
    if (selectedMealDetails?.id === mealId) {
      setSelectedMealDetails(null);
    }
  };

  const updateMeal = (meal: MealEntry) => {
    if (!currentUser) return;
    triggerHaptic('light');
    const updated: DayLog = {
      ...dayLog,
      meals: dayLog.meals.map((m) => (m.id === meal.id ? meal : m)),
    };
    setDayLog(updated);
    saveDayLog(updated, currentUser.id);
    if (selectedMealDetails?.id === meal.id) {
      setSelectedMealDetails(meal);
    }
  };

  const addWater = (amountMl: number) => {
    if (!currentUser) return;
    triggerHaptic('light');
    const current = dayLog.waterIntakeMl || 0;
    const updatedWater = Math.max(0, current + amountMl);
    const updated: DayLog = {
      ...dayLog,
      waterIntakeMl: updatedWater,
    };
    setDayLog(updated);
    saveDayLog(updated, currentUser.id);
  };

  const updateProfile = (partial: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updatedUser: UserAccount = {
      ...currentUser,
      profile: { ...currentUser.profile, ...partial },
    };
    setCurrentUser(updatedUser);
    updateStoredUser(updatedUser);
  };

  const updateGoals = (partial: Partial<UserGoals>) => {
    if (!currentUser) return;
    const updatedUser: UserAccount = {
      ...currentUser,
      goals: { ...currentUser.goals, ...partial },
    };
    setCurrentUser(updatedUser);
    updateStoredUser(updatedUser);
  };

  const logWeight = (weight: number, dateStr?: string) => {
    if (!currentUser) return;
    triggerHaptic('medium');
    const updatedLogs = saveWeightLog(weight, dateStr || selectedDate, currentUser.id);
    setWeightLogsState([...updatedLogs]);
    updateProfile({ currentWeightLbs: weight });
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
        currentUser,
        allUsers,
        selectedMealDetails,
        setSelectedMealDetails,
        signupWithProvider,
        loginUser,
        logout,
        addMeal,
        deleteMeal,
        updateMeal,
        addWater,
        updateProfile,
        updateGoals,
        logWeight,
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
