// ─── User / Profile ───────────────────────────────────────────────────────────

export type Gender = 'male' | 'female' | 'other';
export type UserGoal = 'lose_weight' | 'maintain' | 'gain_muscle' | 'improve_fitness';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';
export type Equipment = 'full_gym' | 'dumbbells_only' | 'no_equipment';

export interface MacroTargets {
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  water: number;
  calories: number;
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL?: string | null;

  // Personal info
  age?: number;
  gender?: Gender;
  heightCm?: number;
  weightKg?: number;

  // Fitness
  fitnessLevel?: FitnessLevel;
  goal?: UserGoal;
  goals?: UserGoal[];
  equipment?: Equipment;
  activityLevel?: ActivityLevel;

  // Calculated
  bmi?: number;
  bmiCategory?: string;
  bmr?: number;
  tdee?: number;
  macros?: MacroTargets;

  onboardingComplete?: boolean;
  createdAt: string;
  updatedAt?: string;
}

// ─── Workout Plan ─────────────────────────────────────────────────────────────

export type MuscleGroup =
  | 'Chest'
  | 'Back'
  | 'Shoulders'
  | 'Biceps'
  | 'Triceps'
  | 'Legs'
  | 'Core'
  | 'Glutes'
  | 'Cardio'
  | 'Full Body';

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string; // e.g. "8-12" or "15"
  restSeconds: number;
  muscleGroup: MuscleGroup;
  instructions: string;
  equipment: Equipment;
}

export interface WorkoutDay {
  day: string; // e.g. "Monday"
  label: string; // e.g. "Push Day" or "Rest"
  isRest: boolean;
  exercises: Exercise[];
}

export interface WorkoutPlan {
  id: string;
  uid: string;
  fitnessLevel: FitnessLevel;
  goal: UserGoal;
  equipment: Equipment;
  days: WorkoutDay[];
  createdAt: string;
  updatedAt: string;
}

// ─── Logs ─────────────────────────────────────────────────────────────────────

export interface WeightLog {
  id: string;
  uid: string;
  weightKg: number;
  date: string; // ISO date string YYYY-MM-DD
  createdAt: string;
}

export interface WorkoutLog {
  id: string;
  uid: string;
  date: string;
  planId: string;
  dayLabel: string;
  exercises: {
    exerciseId: string;
    name: string;
    setsCompleted: number;
    repsCompleted: string;
  }[];
  createdAt: string;
}

export interface MealLog {
  id: string;
  uid: string;
  date: string;
  mealName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  createdAt: string;
}
