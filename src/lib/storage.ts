import { DayLog, MealEntry, UserAccount, UserGoals, UserProfile, WeightLogEntry } from './types';

export const DEFAULT_GOALS: UserGoals = {
  dailyCalories: 2200,
  dailyProtein: 175,
  dailyCarbs: 220,
  dailyFat: 60,
  dailyWaterMl: 3000,
};

export const DEFAULT_PROFILE: UserProfile = {
  name: '',
  goalMode: 'bulk',
  currentWeightLbs: 175,
  targetWeightLbs: 180,
  heightInches: 70,
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
  USERS: 'macrotrack_users_v2',
  ACTIVE_USER_ID: 'macrotrack_active_user_id_v2',
  DAY_LOGS_PREFIX: 'macrotrack_day_logs_v2_',
  WEIGHT_LOGS_PREFIX: 'macrotrack_weight_logs_v2_',
};

export function getStoredUsers(): UserAccount[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveUsersList(users: UserAccount[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users:', e);
  }
}

export function getActiveUser(): UserAccount | null {
  if (typeof window === 'undefined') return null;
  try {
    const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID);
    if (!activeId) return null;
    const users = getStoredUsers();
    return users.find((u) => u.id === activeId) || null;
  } catch {
    return null;
  }
}

export function setActiveUserId(userId: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (userId) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, userId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER_ID);
    }
  } catch (e) {
    console.error('Failed to set active user:', e);
  }
}

export function createNewAccount(
  provider: 'apple' | 'google' | 'email',
  email: string,
  name: string,
  customGoals?: Partial<UserGoals>,
  customProfile?: Partial<UserProfile>
): UserAccount {
  const users = getStoredUsers();
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    setActiveUserId(existing.id);
    return existing;
  }

  const id = `${provider}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newAccount: UserAccount = {
    id,
    email,
    name: name || (provider === 'apple' ? 'Apple User' : 'Google User'),
    provider,
    createdAt: new Date().toISOString(),
    profile: {
      ...DEFAULT_PROFILE,
      name: name || (provider === 'apple' ? 'Apple User' : 'Google User'),
      ...customProfile,
    },
    goals: {
      ...DEFAULT_GOALS,
      ...customGoals,
    },
  };

  users.push(newAccount);
  saveUsersList(users);
  setActiveUserId(id);

  // Initialize with zero meals (completely clean slate for the user)
  if (typeof window !== 'undefined') {
    localStorage.setItem(`${STORAGE_KEYS.DAY_LOGS_PREFIX}${id}`, JSON.stringify({}));
    localStorage.setItem(`${STORAGE_KEYS.WEIGHT_LOGS_PREFIX}${id}`, JSON.stringify([]));
  }

  return newAccount;
}

export function updateStoredUser(updatedUser: UserAccount): void {
  const users = getStoredUsers();
  const index = users.findIndex((u) => u.id === updatedUser.id);
  if (index >= 0) {
    users[index] = updatedUser;
    saveUsersList(users);
  }
}

// User-scoped Day Logs
export function getStoredDayLogs(userId?: string): Record<string, DayLog> {
  if (typeof window === 'undefined') return {};
  const uid = userId || getActiveUser()?.id;
  if (!uid) return {};
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.DAY_LOGS_PREFIX}${uid}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getDayLog(dateStr: string, userId?: string): DayLog {
  const allLogs = getStoredDayLogs(userId);
  if (allLogs[dateStr]) {
    return allLogs[dateStr];
  }
  return {
    date: dateStr,
    waterIntakeMl: 0,
    meals: [],
  };
}

export function saveDayLog(dayLog: DayLog, userId?: string): void {
  if (typeof window === 'undefined') return;
  const uid = userId || getActiveUser()?.id;
  if (!uid) return;
  const allLogs = getStoredDayLogs(uid);
  allLogs[dayLog.date] = dayLog;
  try {
    localStorage.setItem(`${STORAGE_KEYS.DAY_LOGS_PREFIX}${uid}`, JSON.stringify(allLogs));
  } catch (e) {
    console.error('Failed to save day log:', e);
  }
}

// User-scoped Weight Logs
export function getStoredWeightLogs(userId?: string): WeightLogEntry[] {
  if (typeof window === 'undefined') return [];
  const uid = userId || getActiveUser()?.id;
  if (!uid) return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.WEIGHT_LOGS_PREFIX}${uid}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveWeightLog(weight: number, dateStr?: string, userId?: string): WeightLogEntry[] {
  if (typeof window === 'undefined') return [];
  const uid = userId || getActiveUser()?.id;
  if (!uid) return [];

  const logs = getStoredWeightLogs(uid);
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
    localStorage.setItem(`${STORAGE_KEYS.WEIGHT_LOGS_PREFIX}${uid}`, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save weight log:', e);
  }
  return logs;
}
