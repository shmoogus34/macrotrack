export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface FoodItem {
  id: string;
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

export interface MealEntry {
  id: string;
  category: MealCategory;
  name: string;
  timestamp: string; // ISO string
  items: FoodItem[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  imageUrl?: string;
  aiAnalyzed?: boolean;
  aiConfidence?: number;
  healthTip?: string;
}

export interface UserGoals {
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
  dailyWaterMl: number;
}

export type GoalMode = 'cut' | 'maintain' | 'bulk' | 'performance';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very_active' | 'athlete';

export interface UserProfile {
  name: string;
  goalMode: GoalMode;
  currentWeightLbs: number;
  targetWeightLbs: number;
  heightInches: number;
  age: number;
  gender: 'male' | 'female' | 'other';
  activityLevel: ActivityLevel;
  customApiKey?: string;
  preferredModel: string;
}

export interface WeightLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number;
  timestamp: string;
}

export interface DayLog {
  date: string; // YYYY-MM-DD
  waterIntakeMl: number;
  meals: MealEntry[];
  notes?: string;
}

export interface AIAnalysisResult {
  mealName: string;
  suggestedCategory: MealCategory;
  items: Array<{
    name: string;
    portion: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
  }>;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  confidence: number;
  healthTip?: string;
  summaryText?: string;
}
