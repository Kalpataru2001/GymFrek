'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import {
  calculateDailyGrowthScore,
  DailyGrowthBreakdown,
  getDayHealthStatus,
  DayHealthVisual,
  calculateDayWorkoutNutrients,
  WorkoutNutrientImpact,
} from '@/lib/calculations';
import {
  POPULAR_FOODS_DATABASE,
  FoodEntry,
  searchLocalFoods,
  calculateFoodNutrition,
} from '@/lib/food-database';
import { WorkoutPlan, WorkoutDay } from '@/lib/workout-engine';
import type { ParsedFoodResult } from '@/lib/ai-nutrition-engine';
import type { DailyLog, WorkoutAttendance, DayFoodItem } from '@/lib/types';
import Modal from '@/components/ui/Modal';
import ProgressBar from '@/components/ui/ProgressBar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Toast from '@/components/ui/Toast';
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Moon,
  XCircle,
  Plus,
  Trash2,
  CalendarDays,
  Target,
  Trophy,
  Sparkles,
  Search,
  Check,
  Utensils,
  Leaf,
  Scale,
  Edit3,
  Bot,
  Loader2,
  AlertTriangle,
  Zap,
  Info,
  Dumbbell,
  Layers,
  Activity,
} from 'lucide-react';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
type EntryMode = 'smart_search' | 'ai_assistant' | 'manual';

function formatToLocalDateString(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function CalendarPage() {
  const { user } = useAuth();
  const { profile } = useUser();
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [logs, setLogs] = useState<Record<string, DailyLog>>({});
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Modal & Entry Mode State
  const [showAddFood, setShowAddFood] = useState(false);
  const [entryMode, setEntryMode] = useState<EntryMode>('smart_search');
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');

  // Mode 1: Smart Search State
  const [foodSearchQuery, setFoodSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodEntry>(POPULAR_FOODS_DATABASE[0]);
  const [foodQuantity, setFoodQuantity] = useState<number>(100);
  const [selectedUnitIndex, setSelectedUnitIndex] = useState<number>(0);

  // Mode 2: AI Assistant State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<ParsedFoodResult | null>(null);

  // Mode 3: Manual Custom Inputs
  const [manualName, setManualName] = useState('');
  const [manualCalories, setManualCalories] = useState(150);
  const [manualProtein, setManualProtein] = useState(10);
  const [manualCarbs, setManualCarbs] = useState(20);
  const [manualFat, setManualFat] = useState(3);
  const [manualFiber, setManualFiber] = useState(2);

  // Month navigation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const jumpToday = () => setCurrentDate(new Date());

  const storageKey = user ? `gymfrek_logs_${user.uid}` : null;
  const workoutPlanStorageKey = user ? `gymfrek_workout_plan_${user.uid}` : null;

  // Load workout plan
  const loadWorkoutPlan = useCallback(async () => {
    if (!user) return;
    if (workoutPlanStorageKey) {
      try {
        const cached = localStorage.getItem(workoutPlanStorageKey);
        if (cached) setWorkoutPlan(JSON.parse(cached));
      } catch (e) {
        console.warn('Could not read cached workout plan:', e);
      }
    }

    try {
      const snap = await getDoc(doc(db, 'workoutPlans', user.uid));
      if (snap.exists()) {
        const data = snap.data() as WorkoutPlan;
        setWorkoutPlan(data);
        if (workoutPlanStorageKey) {
          localStorage.setItem(workoutPlanStorageKey, JSON.stringify(data));
        }
      }
    } catch (e) {
      console.error('Failed to load workout plan for calendar:', e);
    }
  }, [user, workoutPlanStorageKey]);

  useEffect(() => {
    loadWorkoutPlan();
  }, [loadWorkoutPlan]);

  // Fetch monthly logs
  const fetchMonthLogs = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    if (storageKey) {
      try {
        const cached = localStorage.getItem(storageKey);
        if (cached) {
          setLogs(JSON.parse(cached));
        }
      } catch (err) {
        console.warn('Could not read local cache:', err);
      }
    }

    try {
      const q = query(
        collection(db, 'dailyLogs'),
        where('uid', '==', user.uid)
      );

      const snap = await getDocs(q);
      const logMap: Record<string, DailyLog> = {};
      snap.forEach(d => {
        const data = d.data() as DailyLog;
        if (data.date) {
          logMap[data.date] = data;
        }
      });

      setLogs(prev => {
        const merged = { ...prev, ...logMap };
        if (storageKey) {
          try {
            localStorage.setItem(storageKey, JSON.stringify(merged));
          } catch (e) {
            console.warn(e);
          }
        }
        return merged;
      });
    } catch (e) {
      console.error('Failed to fetch calendar logs from Firestore:', e);
    } finally {
      setLoading(false);
    }
  }, [user, storageKey]);

  useEffect(() => {
    fetchMonthLogs();
  }, [fetchMonthLogs]);

  // Target base macros
  const targets = useMemo(() => ({
    calories: profile?.macros?.calories ?? 2000,
    protein: profile?.macros?.protein ?? 140,
    carbs: profile?.macros?.carbs ?? 200,
    fat: profile?.macros?.fat ?? 60,
    fiber: profile?.macros?.fiber ?? 30,
  }), [profile]);

  // Calendar math
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  const todayStr = useMemo(() => formatToLocalDateString(new Date()), []);

  // Helper to get scheduled workout day for a given date
  const getScheduledDayForDate = useCallback((dateStr: string): WorkoutDay | null => {
    if (!workoutPlan || !workoutPlan.schedule || workoutPlan.schedule.length === 0) return null;
    const parts = dateStr.split('-');
    if (parts.length !== 3) return null;
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    const dayOfWeek = d.getDay(); // 0 is Sun, 1 is Mon, ... 6 is Sat
    const scheduleIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 0=Mon, ..., 6=Sun
    return workoutPlan.schedule[scheduleIndex] || null;
  }, [workoutPlan]);

  const filteredFoods = useMemo(() => {
    return searchLocalFoods(foodSearchQuery);
  }, [foodSearchQuery]);

  const calculatedNutrition = useMemo(() => {
    if (!selectedFood) return null;
    return calculateFoodNutrition(selectedFood, foodQuantity, selectedUnitIndex);
  }, [selectedFood, foodQuantity, selectedUnitIndex]);

  // Month Statistics
  const monthStats = useMemo(() => {
    const entries = Object.values(logs);
    const completedWorkouts = entries.filter(l => l.attendance === 'completed').length;
    const restDays = entries.filter(l => l.attendance === 'rest').length;
    const activeEntries = entries.filter(l => l.attendance === 'completed' || l.attendance === 'rest' || (l.foods && l.foods.length > 0));
    const avgScore = activeEntries.length > 0
      ? Math.round(activeEntries.reduce((acc, l) => acc + (l.growthScore || 0), 0) / activeEntries.length)
      : 0;

    return {
      completedWorkouts,
      restDays,
      trackedDays: activeEntries.length,
      avgScore,
    };
  }, [logs]);

  // Active day log
  const activeLog = useMemo((): DailyLog => {
    if (!selectedDate) {
      return {
        id: '',
        uid: user?.uid ?? '',
        date: '',
        attendance: 'none',
        foods: [],
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        totalFiber: 0,
        growthScore: 0,
      };
    }
    return logs[selectedDate] || {
      id: `${user?.uid}_${selectedDate}`,
      uid: user?.uid ?? '',
      date: selectedDate,
      attendance: 'none',
      foods: [],
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      totalFiber: 0,
      growthScore: 0,
    };
  }, [selectedDate, logs, user]);

  // Active day dynamic nutrient requirements
  const selectedScheduledDay = selectedDate ? getScheduledDayForDate(selectedDate) : null;
  const selectedDayNutrients: WorkoutNutrientImpact = useMemo(() => {
    return calculateDayWorkoutNutrients(selectedScheduledDay, targets, profile?.weightKg);
  }, [selectedScheduledDay, targets, profile?.weightKg]);

  const activeBreakdown: DailyGrowthBreakdown = useMemo(() => {
    return calculateDailyGrowthScore(
      { calories: selectedDayNutrients.targetMacros.calories, protein: selectedDayNutrients.targetMacros.protein },
      { calories: activeLog.totalCalories, protein: activeLog.totalProtein },
      activeLog.attendance
    );
  }, [activeLog, selectedDayNutrients]);

  const activeDayVisual: DayHealthVisual = useMemo(() => {
    return getDayHealthStatus(
      { calories: selectedDayNutrients.targetMacros.calories, protein: selectedDayNutrients.targetMacros.protein, fat: selectedDayNutrients.targetMacros.fat },
      { calories: activeLog.totalCalories, protein: activeLog.totalProtein, fat: activeLog.totalFat },
      activeLog.attendance,
      activeBreakdown.score
    );
  }, [selectedDayNutrients, activeLog, activeBreakdown]);

  // Save log update
  const saveLogUpdate = async (updated: DailyLog) => {
    if (!user || !updated.date) return;
    const dayNutrients = calculateDayWorkoutNutrients(getScheduledDayForDate(updated.date), targets, profile?.weightKg);
    const breakdown = calculateDailyGrowthScore(
      { calories: dayNutrients.targetMacros.calories, protein: dayNutrients.targetMacros.protein },
      { calories: updated.totalCalories, protein: updated.totalProtein },
      updated.attendance
    );
    const docData: DailyLog = {
      ...updated,
      growthScore: breakdown.score,
      updatedAt: new Date().toISOString(),
    };

    setLogs(prev => {
      const nextMap = { ...prev, [updated.date]: docData };
      if (storageKey) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(nextMap));
        } catch (e) {
          console.warn(e);
        }
      }
      return nextMap;
    });

    try {
      const docRef = doc(db, 'dailyLogs', `${user.uid}_${updated.date}`);
      await setDoc(docRef, docData, { merge: true });
    } catch (e) {
      console.error('Failed to sync dailyLog to Firestore:', e);
    }
  };

  const setAttendance = async (att: WorkoutAttendance) => {
    if (!selectedDate) return;
    const updated: DailyLog = {
      ...activeLog,
      attendance: att,
    };
    await saveLogUpdate(updated);
    setToast({ message: `Attendance marked as ${att}!`, type: 'success' });
  };

  const handleSelectFood = (food: FoodEntry) => {
    setSelectedFood(food);
    setSelectedUnitIndex(0);
    if (food.portionType === 'weight') {
      setFoodQuantity(food.quickPortions[1] || 100);
    } else {
      setFoodQuantity(food.quickPortions[1] || 2);
    }
    setFoodSearchQuery('');
  };

  const handlePortionUnitChange = (unitIdx: number) => {
    setSelectedUnitIndex(unitIdx);
    const unit = selectedFood.servingUnits[unitIdx];
    if (unit.grams > 1 && foodQuantity > 10) {
      setFoodQuantity(1);
    } else if (unit.grams === 1 && foodQuantity <= 5) {
      setFoodQuantity(selectedFood.quickPortions[1] || 100);
    }
  };

  const handleQuickPortionClick = (qty: number) => {
    setSelectedUnitIndex(0);
    setFoodQuantity(qty);
  };

  const startCustomFood = (name: string) => {
    setManualName(name);
    setEntryMode('manual');
    setFoodSearchQuery('');
  };

  // Run AI Nutrition calculation
  const handleCalculateWithAI = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai-nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: aiPrompt }),
      });
      const data = await res.json();
      if (data.success) {
        setAiResult(data);
        setToast({ message: 'AI calculated meal nutrition successfully!', type: 'success' });
      } else {
        setToast({ message: data.error || 'AI could not parse meal', type: 'error' });
      }
    } catch (e) {
      console.error(e);
      setToast({ message: 'Failed to contact AI nutrition service', type: 'error' });
    } finally {
      setAiLoading(false);
    }
  };

  // Add Logged Food Item
  const handleAddFoodToDay = async () => {
    if (!selectedDate) return;

    let itemsToAdd: DayFoodItem[] = [];

    if (entryMode === 'ai_assistant') {
      if (!aiResult) return;
      if (aiResult.items && aiResult.items.length > 0) {
        itemsToAdd = aiResult.items.map(item => ({
          id: `ai_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          mealType: selectedMealType,
          name: item.name,
          servingG: item.quantity,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fat: item.fat,
          fiber: item.fiber,
        }));
      } else {
        itemsToAdd = [{
          id: `ai_${Date.now()}`,
          mealType: selectedMealType,
          name: aiResult.summaryTitle || aiPrompt,
          servingG: aiResult.totalGrams || 150,
          calories: aiResult.totalCalories,
          protein: aiResult.totalProtein,
          carbs: aiResult.totalCarbs,
          fat: aiResult.totalFat,
          fiber: aiResult.totalFiber,
        }];
      }
    } else if (entryMode === 'smart_search') {
      if (!calculatedNutrition) return;
      const unit = selectedFood.servingUnits[selectedUnitIndex] || selectedFood.servingUnits[0];
      const name = `${foodQuantity}x ${unit.label.split(' (')[0]} ${selectedFood.name.split(' /')[0]}`;
      itemsToAdd = [{
        id: `food_${Date.now()}`,
        mealType: selectedMealType,
        name,
        servingG: calculatedNutrition.totalGrams,
        calories: calculatedNutrition.calories,
        protein: calculatedNutrition.protein,
        carbs: calculatedNutrition.carbs,
        fat: calculatedNutrition.fat,
        fiber: calculatedNutrition.fiber,
      }];
    } else {
      if (!manualName.trim()) return;
      itemsToAdd = [{
        id: `manual_${Date.now()}`,
        mealType: selectedMealType,
        name: manualName.trim(),
        calories: Number(manualCalories) || 0,
        protein: Number(manualProtein) || 0,
        carbs: Number(manualCarbs) || 0,
        fat: Number(manualFat) || 0,
        fiber: Number(manualFiber) || 0,
      }];
    }

    const nextFoods = [...activeLog.foods, ...itemsToAdd];
    const totalCalories = nextFoods.reduce((acc, f) => acc + f.calories, 0);
    const totalProtein = Math.round(nextFoods.reduce((acc, f) => acc + f.protein, 0) * 10) / 10;
    const totalCarbs = Math.round(nextFoods.reduce((acc, f) => acc + f.carbs, 0) * 10) / 10;
    const totalFat = Math.round(nextFoods.reduce((acc, f) => acc + f.fat, 0) * 10) / 10;
    const totalFiber = Math.round(nextFoods.reduce((acc, f) => acc + f.fiber, 0) * 10) / 10;

    const updated: DailyLog = {
      ...activeLog,
      foods: nextFoods,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      totalFiber,
    };

    await saveLogUpdate(updated);
    setToast({ message: `Added ${itemsToAdd.length} food item(s)!`, type: 'success' });
    setShowAddFood(false);
    setAiPrompt('');
    setAiResult(null);
  };

  // Remove Food Item
  const handleRemoveFood = async (foodId: string) => {
    if (!selectedDate) return;
    const nextFoods = activeLog.foods.filter(f => f.id !== foodId);
    const totalCalories = nextFoods.reduce((acc, f) => acc + f.calories, 0);
    const totalProtein = Math.round(nextFoods.reduce((acc, f) => acc + f.protein, 0) * 10) / 10;
    const totalCarbs = Math.round(nextFoods.reduce((acc, f) => acc + f.carbs, 0) * 10) / 10;
    const totalFat = Math.round(nextFoods.reduce((acc, f) => acc + f.fat, 0) * 10) / 10;
    const totalFiber = Math.round(nextFoods.reduce((acc, f) => acc + f.fiber, 0) * 10) / 10;

    const updated: DailyLog = {
      ...activeLog,
      foods: nextFoods,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      totalFiber,
    };

    await saveLogUpdate(updated);
    setToast({ message: 'Removed food item', type: 'info' });
  };

  const formattedSelectedDate = useMemo(() => {
    if (!selectedDate) return '';
    const parts = selectedDate.split('-');
    if (parts.length !== 3) return selectedDate;
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }, [selectedDate]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* --- PAGE HEADER & STATS BAR ----------------------------------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <CalendarDays className="w-7 h-7 text-orange-400" />
            Dynamic Workout & Nutrition Calendar
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Dynamic calorie & protein targets adjusted per day based on your scheduled exercises.
          </p>
        </div>

        {/* Quick Month Metrics */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-gray-850 border border-gray-750 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <div>
              <span className="text-[10px] text-gray-400 block leading-none">Workouts</span>
              <span className="text-xs font-bold text-white">{monthStats.completedWorkouts} Done</span>
            </div>
          </div>

          <div className="bg-gray-850 border border-gray-750 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <Moon className="w-4 h-4 text-sky-400" />
            <div>
              <span className="text-[10px] text-gray-400 block leading-none">Rest Days</span>
              <span className="text-xs font-bold text-white">{monthStats.restDays} Logged</span>
            </div>
          </div>

          <div className="bg-gray-850 border border-gray-750 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <Trophy className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-[10px] text-gray-400 block leading-none">Avg Growth</span>
              <span className="text-xs font-bold text-emerald-400">{monthStats.avgScore}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- MONTH NAVIGATION & CALENDAR GRID --------------------------------- */}
      <div className="bg-gray-850 rounded-2xl border border-gray-750 p-5 space-y-4 shadow-xl">
        {/* Month Header Controller */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">
              {monthNames[month]} {year}
            </h2>
            <button
              type="button"
              onClick={jumpToday}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-gray-750 hover:bg-gray-700 text-orange-400 border border-gray-700 transition-colors"
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={prevMonth}
              className="p-2 rounded-xl bg-gray-750 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={nextMonth}
              className="p-2 rounded-xl bg-gray-750 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-gray-400 border-b border-gray-750 pb-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
            <div key={d} className="uppercase tracking-wider text-[11px]">
              {d}
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-24"><LoadingSpinner size="lg" /></div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: startOffset }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-28 rounded-xl bg-gray-900/30 border border-gray-800/40 opacity-30" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const log = logs[dateStr];
              const isToday = dateStr === todayStr;
              const hasCompleted = log?.attendance === 'completed';
              const isRest = log?.attendance === 'rest';
              const isMissed = log?.attendance === 'missed';
              const score = log?.growthScore ?? 0;

              // Calculate that specific day's scheduled workout & dynamic targets
              const scheduledDay = getScheduledDayForDate(dateStr);
              const dayNutrients = calculateDayWorkoutNutrients(scheduledDay, targets, profile?.weightKg);
              const dayTargets = dayNutrients.targetMacros;

              // Dynamic Health Visual Status
              const dayVisual = getDayHealthStatus(
                { calories: dayTargets.calories, protein: dayTargets.protein, fat: dayTargets.fat },
                { calories: log?.totalCalories || 0, protein: log?.totalProtein || 0, fat: log?.totalFat || 0 },
                log?.attendance || 'none',
                score
              );

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`relative flex flex-col justify-between h-28 p-2 rounded-xl border text-left transition-all duration-200 group hover:scale-[1.02] ${
                    isToday
                      ? `${dayVisual.tileClass} ring-2 ring-orange-500/80 ring-offset-2 ring-offset-gray-900`
                      : dayVisual.tileClass
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-xs font-bold flex items-center gap-1 ${isToday ? 'text-orange-400' : 'text-white'}`}>
                      {dayNum}
                      {isToday && <span className="text-[9px] font-semibold text-orange-400">Today</span>}
                    </span>

                    {/* Status Pill Badge */}
                    {hasCompleted && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-orange-400 bg-orange-500/20 px-1 py-0.2 rounded border border-orange-500/30">
                        <Flame className="w-2.5 h-2.5" /> Done
                      </span>
                    )}
                    {isRest && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-sky-400 bg-sky-500/20 px-1 py-0.2 rounded border border-sky-500/30">
                        <Moon className="w-2.5 h-2.5" /> Rest
                      </span>
                    )}
                    {isMissed && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-rose-400 bg-rose-500/20 px-1 py-0.2 rounded border border-rose-500/30">
                        <XCircle className="w-2.5 h-2.5" /> Missed
                      </span>
                    )}
                    {!hasCompleted && !isRest && !isMissed && dayVisual.type === 'high_fat_warning' && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-purple-300 bg-purple-500/20 px-1 py-0.2 rounded border border-purple-500/30">
                        <AlertTriangle className="w-2.5 h-2.5" /> Fat Spike
                      </span>
                    )}
                    {!hasCompleted && !isRest && !isMissed && dayVisual.type !== 'high_fat_warning' && scheduledDay && !scheduledDay.isRestDay && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-medium text-gray-400 bg-gray-800/80 px-1 py-0.2 rounded border border-gray-700/60 truncate max-w-[65px]">
                        <Dumbbell className="w-2.5 h-2.5 text-orange-400 flex-shrink-0" />
                        <span className="truncate">{scheduledDay.focus.split(' ')[0]}</span>
                      </span>
                    )}
                  </div>

                  <div className="w-full space-y-0.5 my-auto">
                    {log && log.totalCalories > 0 ? (
                      <>
                        <p className="text-[10px] font-semibold text-gray-200 truncate">
                          {log.totalCalories} / <span className="text-gray-400 font-normal">{dayTargets.calories}k</span>
                        </p>
                        <p className="text-[10px] text-orange-300 font-bold truncate">
                          {log.totalProtein}g / <span className="text-gray-400 font-normal">{dayTargets.protein}g P</span>
                        </p>
                      </>
                    ) : (
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-gray-400 font-medium truncate">
                          {scheduledDay?.isRestDay ? 'Recovery Day' : scheduledDay?.focus || 'Scheduled Plan'}
                        </p>
                        <p className="text-[9px] text-gray-500 truncate flex items-center gap-0.5">
                          {dayNutrients.estimatedBurnKcal > 0 ? (
                            <>
                              <Flame className="w-2.5 h-2.5 text-orange-400 flex-shrink-0" />
                              <span>~{dayNutrients.estimatedBurnKcal} kcal burn</span>
                            </>
                          ) : (
                            <span>Target: {dayTargets.calories} kcal</span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="w-full flex items-center justify-between pt-1 border-t border-gray-700/50">
                    <span className="text-[9px] text-gray-400 font-medium flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${dayVisual.dotColor}`} />
                      Growth
                    </span>
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-md ${dayVisual.growthColor}`}>
                      {score > 0 ? `${score}%` : '-'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* --- DYNAMIC HEALTH & COLOR CODING LEGEND --------------------------- */}
        <div className="pt-4 border-t border-gray-700/60">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-300 mb-3">
            <Info className="w-4 h-4 text-orange-400" />
            Calendar Color Coding & Motivation Guide:
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {/* Legend 1: Champion */}
            <div className="bg-emerald-950/30 border border-emerald-500/50 p-2.5 rounded-xl text-left">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                <span className="text-xs font-bold text-emerald-300">Champion Day</span>
              </div>
              <p className="text-[10px] text-gray-300 leading-tight">
                Workout done + protein & calorie goals met (Score &ge; 75%).
              </p>
            </div>

            {/* Legend 2: Solid Progress */}
            <div className="bg-amber-950/30 border border-amber-500/50 p-2.5 rounded-xl text-left">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />
                <span className="text-xs font-bold text-amber-300">Solid Progress</span>
              </div>
              <p className="text-[10px] text-gray-300 leading-tight">
                Good workout consistency or steady nutrition progress.
              </p>
            </div>

            {/* Legend 3: Clean Rest */}
            <div className="bg-sky-950/30 border border-sky-500/50 p-2.5 rounded-xl text-left">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-sm shadow-sky-400" />
                <span className="text-xs font-bold text-sky-300">Clean Rest Day</span>
              </div>
              <p className="text-[10px] text-gray-300 leading-tight">
                Active recovery day with clean diet for muscle repair.
              </p>
            </div>

            {/* Legend 4: High Fat/Calorie Spike */}
            <div className="bg-purple-950/30 border border-purple-500/50 p-2.5 rounded-xl text-left">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-sm shadow-purple-400" />
                <span className="text-xs font-bold text-purple-300">Fat / Calorie Spike</span>
              </div>
              <p className="text-[10px] text-gray-300 leading-tight">
                Crossed fat or calorie limits (&gt;25% surplus) without exercise.
              </p>
            </div>

            {/* Legend 5: Needs Focus */}
            <div className="bg-rose-950/30 border border-rose-500/50 p-2.5 rounded-xl text-left">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-sm shadow-rose-400" />
                <span className="text-xs font-bold text-rose-300">Needs Focus</span>
              </div>
              <p className="text-[10px] text-gray-300 leading-tight">
                Missed workout or under-eating. Time to bounce back!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- DAY INSPECTOR MODAL --------------------------------------------- */}
      <Modal
        isOpen={!!selectedDate}
        onClose={() => { setSelectedDate(null); setShowAddFood(false); }}
        title={selectedDate ? `Daily Log : ${formattedSelectedDate}` : ''}
        size="lg"
      >
        <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
          {/* Day Status Banner */}
          <div className={`p-3.5 rounded-xl border flex items-center justify-between ${activeDayVisual.tileClass}`}>
            <div className="flex items-center gap-2.5">
              <span className={`w-3 h-3 rounded-full ${activeDayVisual.dotColor} shadow-md`} />
              <div>
                <h4 className="text-xs font-bold text-white">{activeDayVisual.label}</h4>
                <p className="text-[11px] text-gray-300">{activeDayVisual.description}</p>
              </div>
            </div>
            <span className={`text-xs font-extrabold px-2.5 py-1 rounded-lg ${activeDayVisual.badgeClass}`}>
              {activeDayVisual.shortTag}
            </span>
          </div>

          {/* Dedicated Section: Scheduled Workout & Dynamic Nutrition Needs */}
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 space-y-3.5 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-700/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-lg ${selectedDayNutrients.isRestDay ? 'bg-sky-500/20 text-sky-400' : 'bg-orange-500/20 text-orange-400'}`}>
                  {selectedDayNutrients.isRestDay ? <Moon className="w-5 h-5" /> : <Dumbbell className="w-5 h-5" />}
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Scheduled Routine</span>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    {selectedDayNutrients.primaryFocus}
                  </h4>
                </div>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border self-start sm:self-auto ${selectedDayNutrients.intensityColor}`}>
                {selectedDayNutrients.intensityLabel}
              </span>
            </div>

            {/* Dynamic Nutrients Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-gray-900/60 p-2.5 rounded-xl border border-gray-750">
                <span className="text-[10px] text-gray-400 block">Est. Workout Burn</span>
                <span className="text-sm font-extrabold text-orange-400 flex items-center gap-1 mt-0.5">
                  <Flame className="w-3.5 h-3.5" />
                  {selectedDayNutrients.estimatedBurnKcal > 0 ? `~${selectedDayNutrients.estimatedBurnKcal} kcal` : '0 kcal'}
                </span>
              </div>

              <div className="bg-gray-900/60 p-2.5 rounded-xl border border-gray-750">
                <span className="text-[10px] text-gray-400 block">Day Calorie Goal</span>
                <span className="text-sm font-extrabold text-white mt-0.5 block">
                  {selectedDayNutrients.targetMacros.calories} <span className="text-[10px] font-normal text-gray-400">kcal</span>
                </span>
              </div>

              <div className="bg-gray-900/60 p-2.5 rounded-xl border border-gray-750">
                <span className="text-[10px] text-gray-400 block">Target Protein (MPS)</span>
                <span className="text-sm font-extrabold text-emerald-400 mt-0.5 block">
                  {selectedDayNutrients.targetMacros.protein}g <span className="text-[10px] font-normal text-gray-400">({selectedDayNutrients.proteinAdjustmentGrams >= 0 ? `+${selectedDayNutrients.proteinAdjustmentGrams}g` : 'Base'})</span>
                </span>
              </div>

              <div className="bg-gray-900/60 p-2.5 rounded-xl border border-gray-750">
                <span className="text-[10px] text-gray-400 block">Carbs & Fats</span>
                <span className="text-sm font-extrabold text-sky-300 mt-0.5 block">
                  {selectedDayNutrients.targetMacros.carbs}g <span className="text-[10px] font-normal text-gray-400">C</span> / {selectedDayNutrients.targetMacros.fat}g <span className="text-[10px] font-normal text-gray-400">F</span>
                </span>
              </div>
            </div>

            <p className="text-[11px] text-gray-300 leading-relaxed bg-gray-900/40 p-2.5 rounded-lg border border-gray-750/70 flex items-start gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-orange-400 mt-0.5 flex-shrink-0" />
              <span>{selectedDayNutrients.explanation}</span>
            </p>

            {/* Scheduled Exercises Chips Preview */}
            {selectedScheduledDay && selectedScheduledDay.exercises && selectedScheduledDay.exercises.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">
                  Programmed Exercises ({selectedScheduledDay.exercises.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedScheduledDay.exercises.map((ex, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-medium bg-gray-750 text-gray-200 border border-gray-700 px-2 py-0.5 rounded-md flex items-center gap-1"
                    >
                      <Check className="w-2.5 h-2.5 text-orange-400" />
                      {ex.name} <span className="text-gray-400">({ex.sets}x{ex.reps})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 1: Workout Attendance */}
          <div className="bg-gray-750 p-4 rounded-xl border border-gray-700 space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-orange-400" />
              Workout Attendance Check-In
            </h3>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { val: 'completed', label: 'Workout Done', Icon: Flame, activeCls: 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20' },
                { val: 'rest', label: 'Rest Day', Icon: Moon, activeCls: 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' },
                { val: 'missed', label: 'Missed', Icon: XCircle, activeCls: 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-500/20' },
              ].map(opt => {
                const IconComponent = opt.Icon;
                return (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setAttendance(opt.val as WorkoutAttendance)}
                    className={`py-2.5 px-3 rounded-lg text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                      activeLog.attendance === opt.val
                        ? opt.activeCls
                        : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Daily Growth Score Card */}
          <div className={`p-4 rounded-xl border ${activeBreakdown.badgeColor}`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-300">Daily Growth Score</span>
                <h4 className="text-2xl font-extrabold text-white mt-0.5">
                  {activeBreakdown.score}% <span className="text-sm font-semibold text-gray-200">({activeBreakdown.grade})</span>
                </h4>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-300 block">Workout: {activeBreakdown.workoutScore}/40</span>
                <span className="text-xs text-gray-300 block">Protein: {activeBreakdown.proteinScore}/35</span>
                <span className="text-xs text-gray-300 block">Calories: {activeBreakdown.calorieScore}/25</span>
              </div>
            </div>

            <p className="text-xs text-gray-200 mb-3">{activeBreakdown.summary}</p>

            <div className="space-y-1.5 pt-1 border-t border-gray-700/50">
              <ProgressBar
                label={`Protein: ${activeLog.totalProtein}g / ${selectedDayNutrients.targetMacros.protein}g target`}
                value={activeLog.totalProtein}
                max={selectedDayNutrients.targetMacros.protein}
                color="orange"
                height="sm"
              />
              <ProgressBar
                label={`Calories: ${activeLog.totalCalories} kcal / ${selectedDayNutrients.targetMacros.calories} kcal budget`}
                value={activeLog.totalCalories}
                max={selectedDayNutrients.targetMacros.calories}
                color="blue"
                height="sm"
              />
            </div>
          </div>

          {/* Section 3: Smart Auto-Nutrient Food Logger */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Utensils className="w-4 h-4 text-orange-400" />
                Foods Eaten on This Day
              </h3>
              <button
                type="button"
                onClick={() => { setShowAddFood(s => !s); setAiResult(null); }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddFood ? 'Close Form' : 'Add Food'}</span>
              </button>
            </div>

            {/* Smart Auto-Calculation Form Container */}
            {showAddFood && (
              <div className="bg-gray-750 p-4 rounded-xl border border-orange-500/50 space-y-4 shadow-lg">
                {/* Mode Selector Tabs */}
                <div className="flex items-center bg-gray-800 p-1 rounded-xl border border-gray-700">
                  <button
                    type="button"
                    onClick={() => setEntryMode('smart_search')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      entryMode === 'smart_search'
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Instant Search</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEntryMode('ai_assistant')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      entryMode === 'ai_assistant'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <Bot className="w-3.5 h-3.5 text-purple-200" />
                    <span>AI Assistant</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEntryMode('manual')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      entryMode === 'manual'
                        ? 'bg-gray-700 text-white shadow-md'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Manual</span>
                  </button>
                </div>

                {/* Meal Time Selector */}
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">Select Meal</label>
                  <div className="grid grid-cols-4 gap-2">
                    {MEAL_TYPES.map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setSelectedMealType(m)}
                        className={`py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all ${
                          selectedMealType === m
                            ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                            : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* --- MODE 1: INSTANT LOCAL FOOD DATABASE SEARCH --- */}
                {entryMode === 'smart_search' && (
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="Search food by name, Hindi/English alias (e.g. Bhindi, Paneer, Rice, Dal)..."
                        value={foodSearchQuery}
                        onChange={e => setFoodSearchQuery(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    {/* Results Dropdown / Suggestions */}
                    {foodSearchQuery.trim().length > 0 && (
                      <div className="bg-gray-800 rounded-xl border border-gray-700 max-h-48 overflow-y-auto divide-y divide-gray-700/50">
                        {filteredFoods.length === 0 ? (
                          <div className="p-3 text-center">
                            <p className="text-xs text-gray-400">No food found with that name.</p>
                            <button
                              type="button"
                              onClick={() => startCustomFood(foodSearchQuery)}
                              className="mt-1 text-xs text-orange-400 hover:underline font-semibold"
                            >
                              + Add &quot;{foodSearchQuery}&quot; as custom food
                            </button>
                          </div>
                        ) : (
                          filteredFoods.map(f => (
                            <button
                              key={f.id}
                              type="button"
                              onClick={() => handleSelectFood(f)}
                              className="w-full p-2.5 text-left hover:bg-gray-700/50 flex items-center justify-between transition-colors"
                            >
                              <div>
                                <span className="text-xs font-semibold text-white block">{f.name}</span>
                                <span className="text-[10px] text-gray-400 block">{f.category}</span>
                              </div>
                              <span className="text-xs font-bold text-orange-400">
                                {f.per100g.calories} kcal/100g
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    )}

                    {/* Active Selected Food Auto-Calculator Box */}
                    {selectedFood && calculatedNutrition && (
                      <div className="bg-gray-800 p-3.5 rounded-xl border border-gray-700 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-white block">{selectedFood.name}</span>
                            <span className="text-[10px] text-gray-400">{selectedFood.category}</span>
                          </div>
                          <span className="text-xs font-extrabold text-orange-400 bg-orange-500/10 px-2 py-1 rounded-lg border border-orange-500/30">
                            {calculatedNutrition.calories} kcal
                          </span>
                        </div>

                        {/* Portion / Unit Chooser */}
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-medium text-gray-300">Portion Unit & Quantity</label>
                          <div className="grid grid-cols-2 gap-2">
                            <select
                              value={selectedUnitIndex}
                              onChange={e => handlePortionUnitChange(Number(e.target.value))}
                              className="bg-gray-700 border border-gray-600 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
                            >
                              {selectedFood.servingUnits.map((u, i) => (
                                <option key={i} value={i}>{u.label}</option>
                              ))}
                            </select>

                            <input
                              type="number"
                              min="0.1"
                              step="0.5"
                              value={foodQuantity}
                              onChange={e => setFoodQuantity(parseFloat(e.target.value) || 0)}
                              className="bg-gray-700 border border-gray-600 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500 text-center font-bold"
                            />
                          </div>
                        </div>

                        {/* Quick Portion Chips */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] text-gray-400 mr-1">Quick:</span>
                          {selectedFood.quickPortions.map(qty => (
                            <button
                              key={qty}
                              type="button"
                              onClick={() => handleQuickPortionClick(qty)}
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded border transition-colors ${
                                foodQuantity === qty && selectedUnitIndex === 0
                                  ? 'bg-orange-500 border-orange-500 text-white'
                                  : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                              }`}
                            >
                              {qty}{selectedFood.portionType === 'weight' ? 'g' : 'x'}
                            </button>
                          ))}
                        </div>

                        {/* Auto-Calculated Macro Cards */}
                        <div className="grid grid-cols-4 gap-2 pt-1 border-t border-gray-700/60 text-center">
                          <div className="bg-gray-900/60 p-1.5 rounded-lg">
                            <span className="text-[9px] text-gray-400 block">Protein</span>
                            <span className="text-xs font-bold text-orange-400">{calculatedNutrition.protein}g</span>
                          </div>
                          <div className="bg-gray-900/60 p-1.5 rounded-lg">
                            <span className="text-[9px] text-gray-400 block">Carbs</span>
                            <span className="text-xs font-bold text-blue-400">{calculatedNutrition.carbs}g</span>
                          </div>
                          <div className="bg-gray-900/60 p-1.5 rounded-lg">
                            <span className="text-[9px] text-gray-400 block">Fat</span>
                            <span className="text-xs font-bold text-yellow-400">{calculatedNutrition.fat}g</span>
                          </div>
                          <div className="bg-gray-900/60 p-1.5 rounded-lg">
                            <span className="text-[9px] text-gray-400 block">Fiber</span>
                            <span className="text-xs font-bold text-emerald-400">{calculatedNutrition.fiber}g</span>
                          </div>
                        </div>

                        {/* Ingredients Breakdown */}
                        {calculatedNutrition.ingredients && calculatedNutrition.ingredients.length > 0 && (
                          <div className="text-[10px] text-gray-400 bg-gray-900/40 p-2 rounded-lg border border-gray-750 flex items-start gap-1.5">
                            <Leaf className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                            <span><strong>Ingredients:</strong> {calculatedNutrition.ingredients.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* --- MODE 2: AI NATURAL LANGUAGE MEAL ASSISTANT --- */}
                {entryMode === 'ai_assistant' && (
                  <div className="space-y-3">
                    <div>
                      <p className="text-[11px] text-gray-300 mb-1.5">
                        Type anything you ate in natural words (e.g. <em>&quot;2 butter rotis with 1 bowl dal makhani and 100g paneer&quot;</em> or <em>&quot;1 plate chicken biryani + 1 glass lassi&quot;</em>).
                      </p>
                      <textarea
                        rows={3}
                        placeholder="Allu bhojia, 2 rotis with dal, 3 boiled eggs, etc."
                        value={aiPrompt}
                        onChange={e => setAiPrompt(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleCalculateWithAI}
                      disabled={aiLoading || !aiPrompt.trim()}
                      className="w-full py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md shadow-purple-600/20"
                    >
                      {aiLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>AI Analyzing Ingredients & Nutrition...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Calculate with AI</span>
                        </>
                      )}
                    </button>

                    {/* AI Calculated Result Card */}
                    {aiResult && (
                      <div className="bg-gray-800 p-3.5 rounded-xl border border-purple-500/50 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block">AI Meal Breakdown</span>
                            <span className="text-xs font-bold text-white">{aiResult.summaryTitle}</span>
                          </div>
                          <span className="text-sm font-extrabold text-orange-400 flex items-center gap-1">
                            <Flame className="w-4 h-4" /> {aiResult.totalCalories} kcal
                          </span>
                        </div>

                        <div className="grid grid-cols-4 gap-2 text-center">
                          <div className="bg-gray-900/60 p-1.5 rounded-lg">
                            <span className="text-[9px] text-gray-400 block">Protein</span>
                            <span className="text-xs font-bold text-orange-400">{aiResult.totalProtein}g</span>
                          </div>
                          <div className="bg-gray-900/60 p-1.5 rounded-lg">
                            <span className="text-[9px] text-gray-400 block">Carbs</span>
                            <span className="text-xs font-bold text-blue-400">{aiResult.totalCarbs}g</span>
                          </div>
                          <div className="bg-gray-900/60 p-1.5 rounded-lg">
                            <span className="text-[9px] text-gray-400 block">Fat</span>
                            <span className="text-xs font-bold text-yellow-400">{aiResult.totalFat}g</span>
                          </div>
                          <div className="bg-gray-900/60 p-1.5 rounded-lg">
                            <span className="text-[9px] text-gray-400 block">Fiber</span>
                            <span className="text-xs font-bold text-emerald-400">{aiResult.totalFiber}g</span>
                          </div>
                        </div>

                        {/* Individual Items List */}
                        {aiResult.items && aiResult.items.length > 0 && (
                          <div className="space-y-1 pt-1 border-t border-gray-700/50">
                            {aiResult.items.map((it, idx) => (
                              <div key={idx} className="flex items-center justify-between text-[11px] text-gray-300">
                                <span>{it.name}</span>
                                <span className="font-semibold text-gray-200">{it.calories} kcal ({it.protein}g P)</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {aiResult.ingredients && aiResult.ingredients.length > 0 && (
                          <div className="text-[10px] text-gray-400 bg-gray-900/40 p-2 rounded-lg border border-gray-750 flex items-start gap-1.5">
                            <Leaf className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                            <span><strong>Ingredients:</strong> {aiResult.ingredients.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* --- MODE 3: MANUAL CUSTOM ENTRY --- */}
                {entryMode === 'manual' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">Food / Dish Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Homemade Poha, Protein Shake"
                        value={manualName}
                        onChange={e => setManualName(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <label className="block text-[10px] text-gray-400 mb-1">Calories (kcal)</label>
                        <input
                          type="number"
                          value={manualCalories}
                          onChange={e => setManualCalories(Number(e.target.value))}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white text-center font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-400 mb-1">Protein (g)</label>
                        <input
                          type="number"
                          value={manualProtein}
                          onChange={e => setManualProtein(Number(e.target.value))}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white text-center font-bold text-orange-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-400 mb-1">Carbs (g)</label>
                        <input
                          type="number"
                          value={manualCarbs}
                          onChange={e => setManualCarbs(Number(e.target.value))}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white text-center font-bold text-blue-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-400 mb-1">Fat (g)</label>
                        <input
                          type="number"
                          value={manualFat}
                          onChange={e => setManualFat(Number(e.target.value))}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white text-center font-bold text-yellow-400"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit / Add Button */}
                <button
                  type="button"
                  onClick={handleAddFoodToDay}
                  disabled={entryMode === 'ai_assistant' && !aiResult}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white flex items-center justify-center gap-1.5 transition-all shadow-md shadow-orange-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {entryMode === 'ai_assistant'
                      ? `+ Add AI Analyzed Meal to ${selectedMealType}`
                      : `+ Add to ${selectedMealType}`}
                  </span>
                </button>
              </div>
            )}

            {/* List of Logged Foods */}
            {activeLog.foods.length === 0 ? (
              <div className="bg-gray-800/60 p-6 rounded-xl border border-gray-750 text-center space-y-1">
                <Utensils className="w-6 h-6 text-gray-500 mx-auto mb-2" />
                <p className="text-xs text-gray-400">No meals logged for this day yet.</p>
                <p className="text-[10px] text-gray-500">Click &quot;Add Food&quot; to search our 80+ item Indian database or let AI auto-calculate your macros!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {activeLog.foods.map(f => (
                  <div
                    key={f.id}
                    className="bg-gray-800 p-3 rounded-xl border border-gray-750 flex items-center justify-between group hover:border-gray-600 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{f.name}</span>
                        <span className="text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded bg-gray-700 text-gray-300 border border-gray-600">
                          {f.mealType}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                        <span className="font-semibold text-orange-400">{f.calories} kcal</span>
                        <span className="text-gray-600">&bull;</span>
                        <span>{f.protein}g Protein</span>
                        <span className="text-gray-600">&bull;</span>
                        <span>{f.carbs}g Carbs</span>
                        <span className="text-gray-600">&bull;</span>
                        <span>{f.fat}g Fat</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveFood(f.id)}
                      className="text-gray-500 hover:text-red-400 p-1.5 rounded-lg transition-colors"
                      title="Delete food entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}