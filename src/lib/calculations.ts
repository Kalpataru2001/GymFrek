/**
 * GymFrek - Health & Fitness Calculation Utilities
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
 * Fiber  : ~14g per 1000 kcal, clamped to 25-38g
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
 * Calculates a 0-100% daily fitness growth & consistency score.
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

// ─── DYNAMIC CALENDAR COLOR CODING & HEALTH STATUS ──────────────────────────

export type DayHealthStatusType =
  | 'champion'         // Emerald Green: Workout Done + On Target Nutrition
  | 'good_effort'      // Amber / Gold: Solid effort & consistency
  | 'recovery_clean'   // Sky Blue: Rest Day with clean nutrition
  | 'high_fat_warning' // Purple / Fuchsia: Fat/Calorie border crossed without workout
  | 'missed_warning'   // Rose / Red: Missed workout or under-fueled
  | 'unlogged';        // Slate Gray: No activity logged

export interface DayHealthVisual {
  type: DayHealthStatusType;
  label: string;
  shortTag: string;
  tileClass: string;
  badgeClass: string;
  growthColor: string;
  dotColor: string;
  description: string;
}

export function getDayHealthStatus(
  targets: { calories: number; protein: number; fat?: number },
  actuals: { calories: number; protein: number; fat?: number },
  attendance: 'completed' | 'rest' | 'missed' | 'none',
  score: number
): DayHealthVisual {
  const hasLoggedFood = (actuals.calories || 0) > 0;
  const hasLoggedWorkout = attendance === 'completed' || attendance === 'rest' || attendance === 'missed';

  if (!hasLoggedFood && !hasLoggedWorkout) {
    return {
      type: 'unlogged',
      label: 'Unlogged',
      shortTag: 'Unlogged',
      tileClass: 'border-gray-750 bg-gray-850/60 hover:bg-gray-800 hover:border-gray-600',
      badgeClass: 'text-gray-400 bg-gray-700/50',
      growthColor: 'text-gray-500',
      dotColor: 'bg-gray-600',
      description: 'No activity logged for this day yet.',
    };
  }

  // 1. Check for High Calorie / Fat Surplus Spike (exceeded border without workout)
  const targetCal = targets.calories || 2000;
  const targetFat = targets.fat || (targetCal * 0.25) / 9; // ~25% fat target in grams
  const isHighCalorieSpike = (actuals.calories || 0) > targetCal * 1.25; // >25% over calorie budget
  const isHighFatSpike = (actuals.fat || 0) > targetFat * 1.30; // >30% over fat target

  if ((isHighCalorieSpike || isHighFatSpike) && attendance !== 'completed') {
    return {
      type: 'high_fat_warning',
      label: 'High Fat / Surplus Spike',
      shortTag: 'Fat / Calorie Spike',
      tileClass: 'border-purple-500/80 bg-purple-950/25 hover:border-purple-400 hover:bg-purple-950/35 shadow-sm shadow-purple-500/15',
      badgeClass: 'text-purple-300 bg-purple-500/20 border border-purple-500/40',
      growthColor: 'text-purple-300 bg-purple-500/20',
      dotColor: 'bg-purple-500',
      description: 'Calorie or fat limit exceeded significantly without an exercise session.',
    };
  }

  // 2. Clean Rest Day
  if (attendance === 'rest') {
    return {
      type: 'recovery_clean',
      label: 'Clean Rest & Recovery',
      shortTag: 'Rest Day',
      tileClass: 'border-sky-500/70 bg-sky-950/25 hover:border-sky-400 hover:bg-sky-950/35 shadow-sm shadow-sky-500/15',
      badgeClass: 'text-sky-300 bg-sky-500/20 border border-sky-500/40',
      growthColor: 'text-sky-300 bg-sky-500/20',
      dotColor: 'bg-sky-500',
      description: 'Active recovery with muscle regeneration and balanced nutrition.',
    };
  }

  // 3. Champion / Optimal Growth Day (Workout completed + on-target nutrition >= 75%)
  if (attendance === 'completed' && score >= 75) {
    return {
      type: 'champion',
      label: 'Champion Day (Optimal Growth)',
      shortTag: 'Optimal Growth',
      tileClass: 'border-emerald-500/80 bg-emerald-950/25 hover:border-emerald-400 hover:bg-emerald-950/35 shadow-sm shadow-emerald-500/20',
      badgeClass: 'text-emerald-300 bg-emerald-500/20 border border-emerald-500/40',
      growthColor: 'text-emerald-300 bg-emerald-500/20',
      dotColor: 'bg-emerald-500',
      description: 'Workout crushed and protein & calorie targets dialed in for maximum growth!',
    };
  }

  // 4. Good Effort Day (Moderate progress)
  if (score >= 50 || attendance === 'completed') {
    return {
      type: 'good_effort',
      label: 'Solid Progress',
      shortTag: 'Solid Effort',
      tileClass: 'border-amber-500/70 bg-amber-950/25 hover:border-amber-400 hover:bg-amber-950/35 shadow-sm shadow-amber-500/15',
      badgeClass: 'text-amber-300 bg-amber-500/20 border border-amber-500/40',
      growthColor: 'text-amber-300 bg-amber-500/20',
      dotColor: 'bg-amber-500',
      description: 'Good consistency! A few tweaks to protein or calories will unlock top tier growth.',
    };
  }

  // 5. Missed or Inactive Warning
  return {
    type: 'missed_warning',
    label: 'Needs Focus / Inactive',
    shortTag: 'Needs Focus',
    tileClass: 'border-rose-500/70 bg-rose-950/25 hover:border-rose-400 hover:bg-rose-950/35 shadow-sm shadow-rose-500/15',
    badgeClass: 'text-rose-300 bg-rose-500/20 border border-rose-500/40',
    growthColor: 'text-rose-300 bg-rose-500/20',
    dotColor: 'bg-rose-500',
    description: 'Missed workout or under-fueled nutrition. Time to bounce back tomorrow!',
  };
}

// ─── DYNAMIC EXERCISE & WORKOUT DAY NUTRITION ENGINE ────────────────────────

export interface WorkoutExerciseLike {
  name?: string;
  muscleGroup?: string;
  sets?: number;
  reps?: string;
}

export interface WorkoutDayLike {
  day?: string;
  focus?: string;
  isRestDay?: boolean;
  exercises?: WorkoutExerciseLike[];
}

export interface WorkoutNutrientImpact {
  isRestDay: boolean;
  primaryFocus: string;
  exerciseCount: number;
  totalSets: number;
  estimatedBurnKcal: number;
  intensityLabel: 'Rest Day' | 'Light Activity' | 'Moderate Training' | 'Heavy Resistance' | 'Extreme Intensity';
  intensityColor: string;
  calorieAdjustment: number;
  proteinAdjustmentGrams: number;
  carbAdjustmentGrams: number;
  fatAdjustmentGrams: number;
  targetMacros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  explanation: string;
}

/**
 * Calculates dynamic daily calorie and protein needs based on the specific exercises
 * scheduled for that workout day vs a rest day.
 */
export function calculateDayWorkoutNutrients(
  day: WorkoutDayLike | null | undefined,
  baseMacros: { calories: number; protein: number; carbs: number; fat: number; fiber: number },
  weightKg?: number
): WorkoutNutrientImpact {
  const isRest = !day || day.isRestDay || !day.exercises || day.exercises.length === 0;

  const exercises = day?.exercises || [];
  if (isRest || exercises.length === 0) {
    // Rest / Recovery Day: baseline maintenance/recovery nutrition
    const restCalories = Math.max(1200, Math.round(baseMacros.calories - 150));
    const restCarbs = Math.max(40, Math.round(baseMacros.carbs - 25));
    const restFat = Math.round(baseMacros.fat + 4);

    return {
      isRestDay: true,
      primaryFocus: day?.focus || 'Rest & Recovery',
      exerciseCount: 0,
      totalSets: 0,
      estimatedBurnKcal: 0,
      intensityLabel: 'Rest Day',
      intensityColor: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
      calorieAdjustment: -150,
      proteinAdjustmentGrams: 0,
      carbAdjustmentGrams: -25,
      fatAdjustmentGrams: 4,
      targetMacros: {
        calories: restCalories,
        protein: baseMacros.protein,
        carbs: restCarbs,
        fat: restFat,
        fiber: baseMacros.fiber,
      },
      explanation: 'Active recovery day. Baseline protein for muscle tissue repair with lower carbs and healthy fats.',
    };
  }

  // Active Training Day: Calculate volume & energy expenditure
  let rawBurn = 0;
  let totalSets = 0;
  let heavyMuscleVolume = 0;
  let cardioCount = 0;

  exercises.forEach(ex => {
    const sets = typeof ex.sets === 'number' && ex.sets > 0 ? ex.sets : 3;
    totalSets += sets;
    const text = `${ex.name || ''} ${ex.muscleGroup || ''} ${day?.focus || ''}`.toLowerCase();

    if (
      text.includes('cardio') ||
      text.includes('treadmill') ||
      text.includes('tiredmill') ||
      text.includes('running') ||
      text.includes('cycling') ||
      text.includes('bike') ||
      text.includes('cross trainer') ||
      text.includes('crosstrainer') ||
      text.includes('elliptical') ||
      text.includes('hiit') ||
      text.includes('burpee') ||
      text.includes('jump')
    ) {
      rawBurn += sets * 32;
      cardioCount++;
    } else if (
      text.includes('leg') ||
      text.includes('squat') ||
      text.includes('quad') ||
      text.includes('glute') ||
      text.includes('hamstring') ||
      text.includes('deadlift') ||
      text.includes('lunge') ||
      text.includes('calf')
    ) {
      rawBurn += sets * 22;
      heavyMuscleVolume += sets;
    } else if (
      text.includes('back') ||
      text.includes('row') ||
      text.includes('lat') ||
      text.includes('pull')
    ) {
      rawBurn += sets * 18;
      heavyMuscleVolume += sets;
    } else if (
      text.includes('chest') ||
      text.includes('bench') ||
      text.includes('press') ||
      text.includes('push') ||
      text.includes('pec') ||
      text.includes('fly')
    ) {
      rawBurn += sets * 16;
      heavyMuscleVolume += sets;
    } else if (text.includes('shoulder') || text.includes('delt') || text.includes('raise')) {
      rawBurn += sets * 14;
    } else if (
      text.includes('arm') ||
      text.includes('bicep') ||
      text.includes('tricep') ||
      text.includes('core') ||
      text.includes('abs') ||
      text.includes('crunch') ||
      text.includes('plank') ||
      text.includes('leg raise')
    ) {
      rawBurn += sets * 12;
    } else if (text.includes('stretch') || text.includes('mobility') || text.includes('yoga')) {
      rawBurn += sets * 6;
    } else {
      rawBurn += sets * 14;
    }
  });

  // Base warm-up / EPOC metabolic cost
  rawBurn += 60;

  // Scale by body weight (heavier athletes burn more mechanical work per movement)
  const weightFactor = weightKg ? Math.min(1.45, Math.max(0.75, weightKg / 70)) : 1.0;
  const estimatedBurnKcal = Math.round(Math.min(750, Math.max(160, rawBurn * weightFactor)));

  // Intensity classification
  let intensityLabel: WorkoutNutrientImpact['intensityLabel'] = 'Moderate Training';
  let intensityColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  let proteinBonus = 12;

  if (estimatedBurnKcal >= 450 || heavyMuscleVolume >= 12 || cardioCount >= 2) {
    intensityLabel = 'Extreme Intensity';
    intensityColor = 'text-red-400 bg-red-500/10 border-red-500/30';
    proteinBonus = 25;
  } else if (estimatedBurnKcal >= 320 || heavyMuscleVolume >= 8) {
    intensityLabel = 'Heavy Resistance';
    intensityColor = 'text-orange-400 bg-orange-500/10 border-orange-500/30';
    proteinBonus = 20;
  } else if (estimatedBurnKcal < 220) {
    intensityLabel = 'Light Activity';
    intensityColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    proteinBonus = 8;
  }

  // Refueling allocation:
  const calorieAdjustment = Math.round(estimatedBurnKcal * 0.85); // 85% expenditure replenishment
  const carbAdjustmentGrams = Math.round((calorieAdjustment * 0.60) / 4); // 60% of extra energy from carbs for glycogen
  const fatAdjustmentGrams = Math.round((calorieAdjustment * 0.15) / 9);  // 15% from fats

  const dynamicCalories = Math.round(baseMacros.calories + calorieAdjustment);
  const dynamicProtein = Math.round(baseMacros.protein + proteinBonus);
  const dynamicCarbs = Math.round(baseMacros.carbs + carbAdjustmentGrams);
  const dynamicFat = Math.round(baseMacros.fat + fatAdjustmentGrams);

  return {
    isRestDay: false,
    primaryFocus: day?.focus || 'Training Session',
    exerciseCount: exercises.length,
    totalSets,
    estimatedBurnKcal,
    intensityLabel,
    intensityColor,
    calorieAdjustment,
    proteinAdjustmentGrams: proteinBonus,
    carbAdjustmentGrams,
    fatAdjustmentGrams,
    targetMacros: {
      calories: dynamicCalories,
      protein: dynamicProtein,
      carbs: dynamicCarbs,
      fat: dynamicFat,
      fiber: baseMacros.fiber,
    },
    explanation: `${intensityLabel} (${exercises.length} exercises, ${totalSets} sets). +${calorieAdjustment} kcal & +${proteinBonus}g protein to maximize muscle hypertrophy and glycogen recovery.`,
  };
}

// ─── DAILY SUMMARY REPORT ─────────────────────────────────────────────────────

export interface NutritionGap {
  nutrient: string;
  actual: number;
  target: number;
  unit: string;
  gap: number;          // positive = deficit, negative = surplus
  gapPct: number;       // absolute percent from target
  severity: 'ok' | 'warn' | 'critical';
  direction: 'deficit' | 'surplus' | 'on_track';
}

export interface DailySuggestion {
  priority: 'high' | 'medium' | 'low';
  icon: string;         // emoji
  title: string;
  detail: string;
  category: 'nutrition' | 'workout' | 'recovery' | 'habit';
}

export interface DailySummaryReport {
  date: string;
  scoreBreakdown: DailyGrowthBreakdown;
  nutritionGaps: NutritionGap[];
  suggestions: DailySuggestion[];
  highlights: string[];
  workoutStatus: 'completed' | 'missed' | 'rest' | 'none';
  workoutFocus: string;
  estimatedBurnKcal: number;
  totalFoodLogged: number;
  mealBreakdown: Record<string, number>; // mealType -> calories
}

/**
 * Generates a comprehensive end-of-day performance report with gaps and suggestions.
 */
export function generateDailySummaryReport(
  log: {
    date: string;
    attendance: 'completed' | 'rest' | 'missed' | 'none';
    foods?: Array<{ mealType?: string; calories: number; protein: number; carbs: number; fat: number; fiber: number }>;
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    totalFiber: number;
    workoutTitle?: string;
  },
  targets: { calories: number; protein: number; carbs: number; fat: number; fiber: number },
  dayImpact: WorkoutNutrientImpact,
  userGoal?: string
): DailySummaryReport {
  const dynTargets = dayImpact.targetMacros;

  // --- Nutrition Gaps ---
  const nutritionGaps: NutritionGap[] = (['calories', 'protein', 'carbs', 'fat', 'fiber'] as const).map(key => {
    const actual = Number(log[`total${key.charAt(0).toUpperCase() + key.slice(1)}` as 'totalCalories' | 'totalProtein' | 'totalCarbs' | 'totalFat' | 'totalFiber'] ?? 0);
    const target = dynTargets[key];
    const gap = target - actual;
    const gapPct = target > 0 ? Math.round((Math.abs(gap) / target) * 100) : 0;
    const unit = key === 'calories' ? 'kcal' : 'g';
    const direction: NutritionGap['direction'] = gapPct <= 10 ? 'on_track' : gap > 0 ? 'deficit' : 'surplus';
    let severity: NutritionGap['severity'] = 'ok';
    if (direction !== 'on_track') {
      severity = gapPct >= 25 ? 'critical' : 'warn';
    }
    return { nutrient: key, actual, target, unit, gap, gapPct, severity, direction };
  });

  // --- Score ---
  const scoreBreakdown = calculateDailyGrowthScore(
    { calories: dynTargets.calories, protein: dynTargets.protein },
    { calories: log.totalCalories, protein: log.totalProtein },
    log.attendance
  );

  // --- Highlights (what user did well) ---
  const highlights: string[] = [];
  if (log.attendance === 'completed') highlights.push('Workout completed — great job!');
  if (log.attendance === 'rest') highlights.push('Planned rest day taken — muscles are recovering.');
  const calorieGap = nutritionGaps.find(g => g.nutrient === 'calories');
  const proteinGap = nutritionGaps.find(g => g.nutrient === 'protein');
  const fiberGap = nutritionGaps.find(g => g.nutrient === 'fiber');
  if (calorieGap && calorieGap.severity === 'ok') highlights.push('Calories well within target range.');
  if (proteinGap && proteinGap.severity === 'ok') highlights.push('Protein target hit — muscle synthesis supported.');
  if ((log.foods?.length ?? 0) >= 3) highlights.push('Good meal diversity — food logged across multiple meal types.');
  if (fiberGap && fiberGap.severity === 'ok') highlights.push('Fiber intake on track — gut health is good.');

  // --- Suggestions (ranked by priority) ---
  const suggestions: DailySuggestion[] = [];

  // Workout suggestions
  if (log.attendance === 'missed') {
    suggestions.push({
      priority: 'high', icon: '🏃', category: 'workout',
      title: 'Missed workout detected',
      detail: 'Schedule your session for tomorrow. Even a 20-min light workout beats skipping entirely.',
    });
  } else if (log.attendance === 'none' && !dayImpact.isRestDay) {
    suggestions.push({
      priority: 'high', icon: '💪', category: 'workout',
      title: 'Mark your workout attendance',
      detail: 'Check in on the Calendar tab to log your workout status and unlock your Growth Score.',
    });
  }

  // Protein suggestions (most impactful for goals)
  if (proteinGap && proteinGap.direction === 'deficit') {
    const grams = Math.round(proteinGap.gap);
    const foodSuggestions = grams >= 30
      ? `100g chicken breast (+31g), 2 eggs (+12g), or a protein shake (+25g).`
      : `a boiled egg (+6g), 50g paneer (+9g), or 100ml Greek yogurt (+10g).`;
    suggestions.push({
      priority: proteinGap.severity === 'critical' ? 'high' : 'medium',
      icon: '🥩', category: 'nutrition',
      title: `Need ${grams}g more protein`,
      detail: `Try ${foodSuggestions}`,
    });
  } else if (proteinGap && proteinGap.direction === 'surplus' && proteinGap.gapPct > 20) {
    suggestions.push({
      priority: 'low', icon: '⚖️', category: 'nutrition',
      title: `Protein slightly high (+${Math.abs(Math.round(proteinGap.gap))}g over target)`,
      detail: 'Extra protein is generally fine for muscle building, but balance with complex carbs.',
    });
  }

  // Calorie suggestions
  if (calorieGap && calorieGap.direction === 'deficit' && calorieGap.gapPct >= 15) {
    const kcal = Math.round(calorieGap.gap);
    const goalContext = userGoal === 'lose_weight'
      ? 'Your deficit is larger than planned — eat a small snack to avoid muscle catabolism.'
      : `Add ${kcal} kcal more — a banana + nut butter, or a bowl of rice, would cover this.`;
    suggestions.push({
      priority: calorieGap.severity === 'critical' ? 'high' : 'medium',
      icon: '🔥', category: 'nutrition',
      title: `${kcal} kcal below your daily target`,
      detail: goalContext,
    });
  } else if (calorieGap && calorieGap.direction === 'surplus' && calorieGap.gapPct >= 15) {
    const kcal = Math.abs(Math.round(calorieGap.gap));
    suggestions.push({
      priority: userGoal === 'lose_weight' ? 'high' : 'medium',
      icon: '📉', category: 'nutrition',
      title: `${kcal} kcal above target today`,
      detail: userGoal === 'lose_weight'
        ? 'Consider reducing portion sizes tomorrow and add 10 min extra cardio.'
        : 'Slight surplus is fine for muscle gain — ensure carbs came from quality sources.',
    });
  }

  // Fiber suggestions
  if (fiberGap && fiberGap.direction === 'deficit' && fiberGap.gapPct >= 25) {
    suggestions.push({
      priority: 'medium', icon: '🥦', category: 'nutrition',
      title: `Fiber ${Math.round(fiberGap.gap)}g short`,
      detail: 'Add a large salad, an apple, a cup of lentils (+16g), or oats for tomorrow\'s breakfast.',
    });
  }

  // Fat suggestions
  const fatGap = nutritionGaps.find(g => g.nutrient === 'fat');
  if (fatGap && fatGap.direction === 'surplus' && fatGap.gapPct >= 30 && log.attendance !== 'completed') {
    suggestions.push({
      priority: 'medium', icon: '🧈', category: 'nutrition',
      title: `High fat intake without a workout (${Math.abs(Math.round(fatGap.gap))}g over)`,
      detail: 'Reduce fried foods and oils. Choose lean proteins and steamed/grilled options.',
    });
  }

  // Hydration / habit
  if (log.totalCalories > 0 && log.totalFiber < 10) {
    suggestions.push({
      priority: 'low', icon: '💧', category: 'habit',
      title: 'Drink more water today',
      detail: 'Low fiber + training = higher dehydration risk. Aim for 8–10 glasses (2–2.5L) daily.',
    });
  }

  // Recovery
  if (log.attendance === 'completed' && scoreBreakdown.score >= 75) {
    suggestions.push({
      priority: 'low', icon: '😴', category: 'recovery',
      title: 'Great session! Prioritize sleep tonight',
      detail: '7–9 hours of sleep is when 90% of muscle repair and growth hormone release happens.',
    });
  }

  // Sort: high → medium → low
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  // Meal breakdown
  const mealBreakdown: Record<string, number> = {};
  (log.foods ?? []).forEach(f => {
    const meal = (f as { mealType?: string }).mealType || 'other';
    mealBreakdown[meal] = (mealBreakdown[meal] || 0) + f.calories;
  });

  return {
    date: log.date,
    scoreBreakdown,
    nutritionGaps,
    suggestions,
    highlights,
    workoutStatus: log.attendance,
    workoutFocus: dayImpact.primaryFocus,
    estimatedBurnKcal: dayImpact.estimatedBurnKcal,
    totalFoodLogged: log.foods?.length ?? 0,
    mealBreakdown,
  };
}

