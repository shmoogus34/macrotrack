import { DayLog, MealEntry, UserGoals, UserProfile, WeightLogEntry } from './types';

export const DEFAULT_GOALS: UserGoals = {
  dailyCalories: 2400,
  dailyProtein: 180,
  dailyCarbs: 240,
  dailyFat: 65,
  dailyWaterMl: 3000,
};

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Athlete',
  goalMode: 'bulk',
  currentWeightLbs: 175,
  targetWeightLbs: 182,
  heightInches: 71,
  age: 24,
  gender: 'male',
  activityLevel: 'moderate',
  preferredModel: 'google/gemini-2.5-flash',
};

export function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const STORAGE_KEYS = {
  PROFILE: 'macrotrack_profile_v1',
  GOALS: 'macrotrack_goals_v1',
  DAY_LOGS: 'macrotrack_day_logs_v1',
  WEIGHT_LOGS: 'macrotrack_weight_logs_v1',
};

export function getStoredProfile(): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveStoredProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile:', e);
  }
}

export function getStoredGoals(): UserGoals {
  if (typeof window === 'undefined') return DEFAULT_GOALS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (!raw) return DEFAULT_GOALS;
    return { ...DEFAULT_GOALS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_GOALS;
  }
}

export function saveStoredGoals(goals: UserGoals): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  } catch (e) {
    console.error('Failed to save goals:', e);
  }
}

export function getStoredWeightLogs(): WeightLogEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WEIGHT_LOGS);
    if (!raw) {
      const today = getTodayString();
      const initial: WeightLogEntry[] = [
        { id: '1', date: '2026-09-25', weight: 174.2, timestamp: new Date(Date.now() - 4 * 86400000).toISOString() },
        { id: '2', date: '2026-09-27', weight: 174.8, timestamp: new Date(Date.now() - 2 * 86400000).toISOString() },
        { id: '3', date: today, weight: 175.2, timestamp: new Date().toISOString() },
      ];
      localStorage.setItem(STORAGE_KEYS.WEIGHT_LOGS, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveWeightLog(weight: number, dateStr?: string): WeightLogEntry[] {
  if (typeof window === 'undefined') return [];
  const logs = getStoredWeightLogs();
  const date = dateStr || getTodayString();
  const existingIdx = logs.findIndex((l) => l.date === date);
  const newEntry: WeightLogEntry = {
    id: `w_${Date.now()}`,
    date,
    weight,
    timestamp: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    logs[existingIdx] = newEntry;
  } else {
    logs.push(newEntry);
  }
  logs.sort((a, b) => a.date.localeCompare(b.date));

  try {
    localStorage.setItem(STORAGE_KEYS.WEIGHT_LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save weight log:', e);
  }
  return logs;
}

export function getStoredDayLogs(): Record<string, DayLog> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DAY_LOGS);
    if (!raw) {
      // Seed today's sample entries
      const today = getTodayString();
      const initialLogs: Record<string, DayLog> = {
        [today]: {
          date: today,
          waterIntakeMl: 1750,
          meals: [
            {
              id: 'm1',
              category: 'breakfast',
              name: 'Eggs, Avocado Toast & Coffee',
              timestamp: new Date(new Date().setHours(8, 30, 0, 0)).toISOString(),
              items: [
                { id: 'i1', name: '3 Scrambled Eggs', portion: '3 large (150g)', calories: 216, protein: 18.9, carbs: 1.2, fat: 14.4 },
                { id: 'i2', name: 'Sourdough Avocado Toast', portion: '1 slice with 50g avocado', calories: 195, protein: 5.2, carbs: 22, fat: 9.8 },
                { id: 'i3', name: 'Black Americano', portion: '1 cup (240ml)', calories: 5, protein: 0.3, carbs: 0, fat: 0 },
              ],
              calories: 416,
              protein: 24.4,
              carbs: 23.2,
              fat: 24.2,
              aiAnalyzed: true,
              aiConfidence: 0.96,
              healthTip: 'Clean morning protein with essential healthy fats.',
            },
            {
              id: 'm2',
              category: 'lunch',
              name: 'Grilled Chicken & Rice Bowl',
              timestamp: new Date(new Date().setHours(12, 45, 0, 0)).toISOString(),
              items: [
                { id: 'i4', name: 'Chicken Breast', portion: '220g grilled', calories: 363, protein: 68.2, carbs: 0, fat: 7.9 },
                { id: 'i5', name: 'Jasmine Rice', portion: '1.5 cups cooked (240g)', calories: 312, protein: 6.5, carbs: 67, fat: 0.8 },
                { id: 'i6', name: 'Steamed Broccoli & Olive Oil', portion: '150g', calories: 85, protein: 4.2, carbs: 8.5, fat: 4.5 },
              ],
              calories: 760,
              protein: 78.9,
              carbs: 75.5,
              fat: 13.2,
              aiAnalyzed: true,
              aiConfidence: 0.98,
              healthTip: 'High-protein anabolic midday meal for muscle recovery.',
            },
          ],
        },
      };
      localStorage.setItem(STORAGE_KEYS.DAY_LOGS, JSON.stringify(initialLogs));
      return initialLogs;
    }
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function getDayLog(dateStr: string): DayLog {
  const allLogs = getStoredDayLogs();
  if (allLogs[dateStr]) {
    return allLogs[dateStr];
  }
  return {
    date: dateStr,
    waterIntakeMl: 0,
    meals: [],
  };
}

export function saveDayLog(dayLog: DayLog): void {
  if (typeof window === 'undefined') return;
  const allLogs = getStoredDayLogs();
  allLogs[dayLog.date] = dayLog;
  try {
    localStorage.setItem(STORAGE_KEYS.DAY_LOGS, JSON.stringify(allLogs));
  } catch (e) {
    console.error('Failed to save day log:', e);
  }
}

export function addMealToDay(dateStr: string, meal: MealEntry): DayLog {
  const current = getDayLog(dateStr);
  const updated: DayLog = {
    ...current,
    meals: [meal, ...current.meals],
  };
  saveDayLog(updated);
  return updated;
}

export function deleteMealFromDay(dateStr: string, mealId: string): DayLog {
  const current = getDayLog(dateStr);
  const updated: DayLog = {
    ...current,
    meals: current.meals.filter((m) => m.id !== mealId),
  };
  saveDayLog(updated);
  return updated;
}

export function updateMealInDay(dateStr: string, meal: MealEntry): DayLog {
  const current = getDayLog(dateStr);
  const updated: DayLog = {
    ...current,
    meals: current.meals.map((m) => (m.id === meal.id ? meal : m)),
  };
  saveDayLog(updated);
  return updated;
}

export function updateWaterIntake(dateStr: string, deltaMl: number): DayLog {
  const current = getDayLog(dateStr);
  const newIntake = Math.max(0, (current.waterIntakeMl || 0) + deltaMl);
  const updated: DayLog = {
    ...current,
    waterIntakeMl: newIntake,
  };
  saveDayLog(updated);
  return updated;
}

export function exportAllData(): string {
  if (typeof window === 'undefined') return '{}';
  const exportPayload = {
    profile: getStoredProfile(),
    goals: getStoredGoals(),
    dayLogs: getStoredDayLogs(),
    weightLogs: getStoredWeightLogs(),
    exportedAt: new Date().toISOString(),
    version: '1.0',
  };
  return JSON.stringify(exportPayload, null, 2);
}

export function importAllData(jsonStr: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const data = JSON.parse(jsonStr);
    if (data.profile) localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(data.profile));
    if (data.goals) localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(data.goals));
    if (data.dayLogs) localStorage.setItem(STORAGE_KEYS.DAY_LOGS, JSON.stringify(data.dayLogs));
    if (data.weightLogs) localStorage.setItem(STORAGE_KEYS.WEIGHT_LOGS, JSON.stringify(data.weightLogs));
    return true;
  } catch (e) {
    console.error('Import failed:', e);
    return false;
  }
}

export function resetAllData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.PROFILE);
  localStorage.removeItem(STORAGE_KEYS.GOALS);
  localStorage.removeItem(STORAGE_KEYS.DAY_LOGS);
  localStorage.removeItem(STORAGE_KEYS.WEIGHT_LOGS);
}
