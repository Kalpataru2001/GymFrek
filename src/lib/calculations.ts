/**
 * GymFrek — Health & Fitness Calculation Utilities
 * Provides BMI, BMR, TDEE, Macro, and color-coding helpers.
 */

// ─── BMI ─────────────────────────────────────────────────────────────────────

/**
 * Calculates Body Mass Index and returns the value + category label.
 * @param weightKg  Body weight in kilograms
 * @param heightCm  Height in centimetres
 */
export function calculateBMI(
  weightKg: number,
  heightCm: number
): { bmi: number; category: string } {
  const heightM = heightCm / 100;
  const bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1));

  let category: string;
  if (bmi < 18.5) {
    category = 'Underweight';
  } else if (bmi < 25) {
    category = 'Normal';
  } else if (bmi < 30) {
    category = 'Overweight';
  } else {
    category = 'Obese';
  }

  return { bmi, category };
}

// ─── BMR ─────────────────────────────────────────────────────────────────────

/**
 * Calculates Basal Metabolic Rate using the Mifflin-St Jeor equation.
 * @param weightKg  Body weight in kilograms
 * @param heightCm  Height in centimetres
 * @param age       Age in years
 * @param gender    'male' | 'female'
 * @returns         BMR in kcal/day (rounded integer)
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: 'male' | 'female'
): number {
  // Mifflin-St Jeor: (10 × weight kg) + (6.25 × height cm) − (5 × age) + S
  // S = +5 for male, −161 for female
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const bmr = gender === 'male' ? base + 5 : base - 161;
  return Math.round(bmr);
}

// ─── TDEE ────────────────────────────────────────────────────────────────────

/** Activity multipliers (Harris-Benedict standard) */
const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,    // little or no exercise
  light: 1.375,      // light exercise 1-3 days/week
  moderate: 1.55,    // moderate exercise 3-5 days/week
  active: 1.725,     // hard exercise 6-7 days/week
  very_active: 1.9,  // very hard exercise + physical job
};

/**
 * Calculates Total Daily Energy Expenditure.
 * @param bmr           Basal Metabolic Rate in kcal
 * @param activityLevel Activity level key
 * @returns             TDEE in kcal/day (rounded integer)
 */
export function calculateTDEE(
  bmr: number,
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

// ─── MACROS ──────────────────────────────────────────────────────────────────

export interface MacroResult {
  calories: number;
  protein: number; // grams
  carbs: number;   // grams
  fat: number;     // grams
  fiber: number;   // grams
  water: number;   // ml
}

/**
 * Calculates daily macro targets based on TDEE and goal.
 *
 * Goal calorie adjustments:
 *  - lose_weight  : −500 kcal deficit (floor: 1200 kcal)
 *  - maintain     : TDEE as-is
 *  - gain_muscle  : +300 kcal surplus
 *
 * Macro split (protein % / fat % / carbs %):
 *  - lose_weight  : 35 / 30 / 35
 *  - maintain     : 30 / 30 / 40
 *  - gain_muscle  : 30 / 25 / 45
 *
 * Fiber  : ~14g per 1000 kcal, clamped to 25–38g
 * Water  : 35ml × bodyweight kg; fallback 2500ml when weight is absent
 *
 * @param tdee      Total Daily Energy Expenditure in kcal
 * @param goal      Fitness goal
 * @param weightKg  Optional body weight used for water calculation
 */
/**
 * Returns a human-friendly strategy title for single or combined goals.
 */
export function getGoalStrategyLabel(goals: string | string[]): { title: string; description: string; emoji: string } {
  const list = Array.isArray(goals) ? goals : [goals];
  const hasLose = list.includes('lose_weight');
  const hasGain = list.includes('gain_muscle');
  const hasFitness = list.includes('improve_fitness');
  const hasMaintain = list.includes('maintain');

  if (hasLose && hasGain) {
    return {
      title: 'Body Recomposition',
      description: 'Burn fat while building lean muscle with high protein & slight deficit',
      emoji: '⚡',
    };
  }
  if (hasGain && hasFitness) {
    return {
      title: 'Athletic Hypertrophy',
      description: 'Build muscle size and power while maximizing endurance and agility',
      emoji: '🚀',
    };
  }
  if (hasLose && hasFitness) {
    return {
      title: 'Fat Loss & Conditioning',
      description: 'Drop body fat, boost cardiovascular endurance, and improve stamina',
      emoji: '🔥',
    };
  }
  if (hasGain) {
    return {
      title: 'Muscle Growth (Lean Bulk)',
      description: 'Calorie surplus with high protein to maximize hypertrophy',
      emoji: '💪',
    };
  }
  if (hasLose) {
    return {
      title: 'Fat Loss & Cutting',
      description: 'Controlled calorie deficit to shed body fat while preserving muscle',
      emoji: '🔥',
    };
  }
  if (hasFitness) {
    return {
      title: 'Functional Fitness & Stamina',
      description: 'Optimized energy for performance, mobility, and cardiovascular health',
      emoji: '🏃',
    };
  }
  return {
    title: 'Weight & Health Maintenance',
    description: 'Maintain body composition with balanced nutrition',
    emoji: '⚖️',
  };
}

/**
 * Calculates daily macro targets based on TDEE and single or multiple goals.
 *
 * Multi-goal intelligent strategies:
 *  - lose_weight + gain_muscle : Body Recomp (−250 kcal deficit, 38% protein, 37% carbs, 25% fat)
 *  - gain_muscle + improve_fitness : Athletic Build (+250 kcal surplus, 30% protein, 45% carbs, 25% fat)
 *  - lose_weight + improve_fitness : Conditioning Deficit (−400 kcal deficit, 35% protein, 40% carbs, 25% fat)
 *  - lose_weight : Deficit (−500 kcal, 35% protein, 35% carbs, 30% fat)
 *  - gain_muscle : Surplus (+300 kcal, 30% protein, 45% carbs, 25% fat)
 *  - maintain / improve_fitness : Balanced (TDEE, 30% protein, 40% carbs, 30% fat)
 */
export function calculateMacros(
  tdee: number,
  goal: string | string[],
  weightKg?: number
): MacroResult {
  const list = Array.isArray(goal) ? goal : [goal];
  const hasLose = list.includes('lose_weight');
  const hasGain = list.includes('gain_muscle');
  const hasFitness = list.includes('improve_fitness');

  let targetCalories: number;
  let proteinPct: number;
  let fatPct: number;
  let carbPct: number;

  if (hasLose && hasGain) {
    // Body Recomposition
    targetCalories = tdee - 250;
    proteinPct = 0.38;
    fatPct = 0.25;
    carbPct = 0.37;
  } else if (hasGain && hasFitness) {
    // Athletic Hypertrophy
    targetCalories = tdee + 250;
    proteinPct = 0.30;
    fatPct = 0.25;
    carbPct = 0.45;
  } else if (hasLose && hasFitness) {
    // Fat Loss + Conditioning
    targetCalories = tdee - 400;
    proteinPct = 0.35;
    fatPct = 0.25;
    carbPct = 0.40;
  } else if (hasLose) {
    // Pure Fat Loss
    targetCalories = tdee - 500;
    proteinPct = 0.35;
    fatPct = 0.30;
    carbPct = 0.35;
  } else if (hasGain) {
    // Pure Hypertrophy
    targetCalories = tdee + 300;
    proteinPct = 0.30;
    fatPct = 0.25;
    carbPct = 0.45;
  } else {
    // Maintain / General Fitness
    targetCalories = tdee;
    proteinPct = 0.30;
    fatPct = 0.30;
    carbPct = 0.40;
  }

  // Enforce a safe calorie floor
  targetCalories = Math.max(targetCalories, 1200);

  // Protein & Carbs = 4 kcal/g, Fat = 9 kcal/g
  const protein = Math.round((targetCalories * proteinPct) / 4);
  const fat = Math.round((targetCalories * fatPct) / 9);
  const carbs = Math.round((targetCalories * carbPct) / 4);

  // Fiber: ~14g per 1000 kcal, clamped between 25g and 45g
  const rawFiber = Math.round((targetCalories / 1000) * 14);
  const fiber = Math.min(Math.max(rawFiber, 25), 45);

  // Water: 35ml/kg body weight (or 38ml for high protein / athletes); default 2500ml
  const waterMultiplier = (hasGain || hasFitness) ? 38 : 35;
  const water = weightKg ? Math.round(weightKg * waterMultiplier) : 2500;

  return { calories: targetCalories, protein, carbs, fat, fiber, water };
}

// ─── BMI COLOR ───────────────────────────────────────────────────────────────

/**
 * Returns a Tailwind CSS text-color class based on BMI value.
 * @param bmi  BMI value
 */
export function getBMIColor(bmi: number): string {
  if (bmi < 18.5) return 'text-blue-500';   // Underweight
  if (bmi < 25)   return 'text-green-500';  // Normal
  if (bmi < 30)   return 'text-yellow-500'; // Overweight
  return 'text-red-500';                     // Obese
}

// ─── DAILY GROWTH SCORE ───────────────────────────────────────────────────────

export interface DailyGrowthBreakdown {
  score: number; // 0 to 100
  workoutScore: number; // 0 to 40
  proteinScore: number; // 0 to 35
  calorieScore: number; // 0 to 25
  grade: 'Elite' | 'Great' | 'Good' | 'Fair' | 'Needs Focus';
  badgeColor: string;
  summary: string;
}

/**
 * Calculates a 0–100% daily fitness growth & consistency score.
 * Combines 3 core pillars:
 *  - Workout / Recovery consistency (40%)
 *  - Protein target adherence (35%)
 *  - Calorie target precision (25%)
 */
export function calculateDailyGrowthScore(
  targets: { calories: number; protein: number },
  actuals: { calories: number; protein: number },
  attendance: 'completed' | 'rest' | 'missed' | 'none'
): DailyGrowthBreakdown {
  // 1. Workout / Rest Consistency (40 pts)
  let workoutScore = 0;
  if (attendance === 'completed' || attendance === 'rest') {
    workoutScore = 40;
  } else if (attendance === 'none') {
    workoutScore = 10;
  } else {
    workoutScore = 0;
  }

  // 2. Protein Target Adherence (35 pts)
  let proteinScore = 0;
  if (targets.protein > 0 && actuals.protein > 0) {
    const pRatio = actuals.protein / targets.protein;
    if (pRatio >= 0.9 && pRatio <= 1.2) {
      proteinScore = 35;
    } else if (pRatio > 1.2) {
      proteinScore = 32;
    } else {
      proteinScore = Math.round(Math.min(35, (pRatio / 0.9) * 35));
    }
  }

  // 3. Calorie Precision (25 pts)
  let calorieScore = 0;
  if (targets.calories > 0 && actuals.calories > 0) {
    const diffPct = Math.abs(actuals.calories - targets.calories) / targets.calories;
    if (diffPct <= 0.08) {
      calorieScore = 25;
    } else if (diffPct <= 0.15) {
      calorieScore = 20;
    } else if (diffPct <= 0.25) {
      calorieScore = 14;
    } else if (diffPct <= 0.40) {
      calorieScore = 8;
    } else {
      calorieScore = 4;
    }
  }

  const score = Math.min(100, Math.max(0, workoutScore + proteinScore + calorieScore));

  let grade: DailyGrowthBreakdown['grade'] = 'Needs Focus';
  let badgeColor = 'text-red-400 bg-red-500/10 border-red-500/30';
  let summary = 'Keep pushing! Log your full meals and check in your workout to boost your score.';

  if (score >= 90) {
    grade = 'Elite';
    badgeColor = 'text-green-400 bg-green-500/10 border-green-500/30';
    summary = 'Outstanding day! Workout and nutrition are dialed in for peak muscle & fat progress.';
  } else if (score >= 75) {
    grade = 'Great';
    badgeColor = 'text-orange-400 bg-orange-500/10 border-orange-500/30';
    summary = 'Solid progress! High consistency driving real results.';
  } else if (score >= 60) {
    grade = 'Good';
    badgeColor = 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    summary = 'Good effort. Hit your protein target to maximize your daily growth.';
  } else if (score >= 40) {
    grade = 'Fair';
    badgeColor = 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    summary = 'Partial tracking logged. Make sure to complete today\'s meal logs.';
  }

  return {
    score,
    workoutScore,
    proteinScore,
    calorieScore,
    grade,
    badgeColor,
    summary,
  };
}
