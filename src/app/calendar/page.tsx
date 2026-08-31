'use client';
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { calculateDailyGrowthScore, DailyGrowthBreakdown } from '@/lib/calculations';
import {
  POPULAR_FOODS_DATABASE,
  FoodEntry,
  searchLocalFoods,
  calculateFoodNutrition,
} from '@/lib/food-database';
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
} from 'lucide-react';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

export default function CalendarPage() {
  const { user } = useAuth();
  const { profile } = useUser();
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [logs, setLogs] = useState<Record<string, DailyLog>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Smart Food Entry State
  const [showAddFood, setShowAddFood] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [foodSearchQuery, setFoodSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodEntry>(POPULAR_FOODS_DATABASE[0]);
  const [foodQuantity, setFoodQuantity] = useState<number>(50);
  const [selectedUnitIndex, setSelectedUnitIndex] = useState<number>(0);
  const [isManualOverride, setIsManualOverride] = useState(false);

  // Manual custom inputs
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

  // Fetch monthly logs
  const fetchMonthLogs = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const monthStart = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const monthEnd = `${year}-${String(month + 1).padStart(2, '0')}-31`;

      const q = query(
        collection(db, 'dailyLogs'),
        where('uid', '==', user.uid),
        where('date', '>=', monthStart),
        where('date', '<=', monthEnd)
      );

      const snap = await getDocs(q);
      const logMap: Record<string, DailyLog> = {};
      snap.forEach(d => {
        const data = d.data() as DailyLog;
        logMap[data.date] = data;
      });
      setLogs(logMap);
    } catch (e) {
      console.error('Failed to fetch calendar logs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthLogs();
  }, [user, year, month]);

  // Target macros
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
  const todayStr = new Date().toISOString().slice(0, 10);

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
    const activeEntries = entries.filter(l => l.attendance !== 'none' || l.foods?.length > 0);
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

  const activeBreakdown: DailyGrowthBreakdown = useMemo(() => {
    return calculateDailyGrowthScore(
      { calories: targets.calories, protein: targets.protein },
      { calories: activeLog.totalCalories, protein: activeLog.totalProtein },
      activeLog.attendance
    );
  }, [activeLog, targets]);

  const saveLogUpdate = async (updated: DailyLog) => {
    if (!user || !updated.date) return;
    const breakdown = calculateDailyGrowthScore(
      { calories: targets.calories, protein: targets.protein },
      { calories: updated.totalCalories, protein: updated.totalProtein },
      updated.attendance
    );
    const docData: DailyLog = {
      ...updated,
      growthScore: breakdown.score,
      updatedAt: new Date().toISOString(),
    };

    setLogs(prev => ({ ...prev, [updated.date]: docData }));

    const docRef = doc(db, 'dailyLogs', `${user.uid}_${updated.date}`);
    await setDoc(docRef, docData, { merge: true });
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
    setSelectedUnitIndex(food.defaultUnitIndex);
    // Set smart initial quantity based on portion type
    if (food.portionType === 'weight') {
      setFoodQuantity(food.quickPortions[1] || 50); // e.g. 50g for soya, 150g for rice
    } else {
      setFoodQuantity(food.quickPortions[1] || 2); // e.g. 2 for eggs/rotis
    }
    setFoodSearchQuery('');
  };

  const startCustomFood = (name: string) => {
    setManualName(name);
    setIsManualOverride(true);
    setFoodSearchQuery('');
  };

  const handleAddAutoFood = async () => {
    if (!selectedDate) return;

    let item: DayFoodItem;

    if (isManualOverride) {
      if (!manualName.trim()) return;
      item = {
        id: `food_${Date.now()}`,
        mealType: selectedMealType,
        name: manualName,
        calories: Number(manualCalories),
        protein: Number(manualProtein),
        carbs: Number(manualCarbs),
        fat: Number(manualFat),
        fiber: Number(manualFiber),
      };
    } else {
      if (!calculatedNutrition) return;
      const unitText = selectedFood.servingUnits[selectedUnitIndex]?.label || '';
      const displayTitle = selectedFood.portionType === 'weight'
        ? `${calculatedNutrition.totalGrams}g ${selectedFood.name}`
        : `${foodQuantity}x ${selectedFood.name} (${unitText})`;

      item = {
        id: `food_${Date.now()}`,
        mealType: selectedMealType,
        name: displayTitle,
        servingG: calculatedNutrition.totalGrams,
        calories: calculatedNutrition.calories,
        protein: calculatedNutrition.protein,
        carbs: calculatedNutrition.carbs,
        fat: calculatedNutrition.fat,
        fiber: calculatedNutrition.fiber,
      };
    }

    const newFoods = [...(activeLog.foods || []), item];
    const totalCalories = newFoods.reduce((sum, f) => sum + (f.calories || 0), 0);
    const totalProtein = Math.round(newFoods.reduce((sum, f) => sum + (f.protein || 0), 0) * 10) / 10;
    const totalCarbs = Math.round(newFoods.reduce((sum, f) => sum + (f.carbs || 0), 0) * 10) / 10;
    const totalFat = Math.round(newFoods.reduce((sum, f) => sum + (f.fat || 0), 0) * 10) / 10;
    const totalFiber = Math.round(newFoods.reduce((sum, f) => sum + (f.fiber || 0), 0) * 10) / 10;

    const updated: DailyLog = {
      ...activeLog,
      foods: newFoods,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      totalFiber,
    };

    await saveLogUpdate(updated);
    setShowAddFood(false);
    setIsManualOverride(false);
    setToast({ message: `Added ${item.name} to ${item.mealType}!`, type: 'success' });
  };

  const handleRemoveFood = async (foodId: string) => {
    const newFoods = (activeLog.foods || []).filter(f => f.id !== foodId);
    const totalCalories = newFoods.reduce((sum, f) => sum + (f.calories || 0), 0);
    const totalProtein = Math.round(newFoods.reduce((sum, f) => sum + (f.protein || 0), 0) * 10) / 10;
    const totalCarbs = Math.round(newFoods.reduce((sum, f) => sum + (f.carbs || 0), 0) * 10) / 10;
    const totalFat = Math.round(newFoods.reduce((sum, f) => sum + (f.fat || 0), 0) * 10) / 10;
    const totalFiber = Math.round(newFoods.reduce((sum, f) => sum + (f.fiber || 0), 0) * 10) / 10;

    const updated: DailyLog = {
      ...activeLog,
      foods: newFoods,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      totalFiber,
    };
    await saveLogUpdate(updated);
    setToast({ message: 'Food entry removed', type: 'info' });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <CalendarDays className="w-7 h-7 text-orange-500" />
            Attendance & Daily Growth Tracker
          </h1>
          <p className="text-gray-400 mt-1">
            Log foods and workouts with instant smart ingredient & calorie auto-calculation
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={jumpToday}
            className="px-3.5 py-2 text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 rounded-lg transition-colors"
          >
            Today
          </button>
          <div className="flex items-center bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors" aria-label="Previous Month">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-4 py-2 text-sm font-semibold text-white min-w-[140px] text-center">
              {monthNames[month]} {year}
            </span>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors" aria-label="Next Month">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Monthly Summary Stats Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800/80 border border-gray-700 rounded-xl p-4 flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-orange-500/20 text-orange-400">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Workouts Done</p>
            <p className="text-2xl font-bold text-white">{monthStats.completedWorkouts} <span className="text-xs text-gray-400 font-normal">days</span></p>
          </div>
        </div>

        <div className="bg-gray-800/80 border border-gray-700 rounded-xl p-4 flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-blue-500/20 text-blue-400">
            <Moon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Rest & Recovery</p>
            <p className="text-2xl font-bold text-white">{monthStats.restDays} <span className="text-xs text-gray-400 font-normal">days</span></p>
          </div>
        </div>

        <div className="bg-gray-800/80 border border-gray-700 rounded-xl p-4 flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-green-500/20 text-green-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Avg Growth Score</p>
            <p className="text-2xl font-bold text-white">{monthStats.avgScore}%</p>
          </div>
        </div>

        <div className="bg-gray-800/80 border border-gray-700 rounded-xl p-4 flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-purple-500/20 text-purple-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Days Tracked</p>
            <p className="text-2xl font-bold text-white">{monthStats.trackedDays} / {daysInMonth}</p>
          </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-gray-800 rounded-2xl border border-gray-700 p-5 shadow-xl">
        <div className="grid grid-cols-7 gap-2 mb-2 text-center">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
            <div key={d} className="text-xs font-bold text-gray-400 uppercase py-2">
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
              const hasData = hasCompleted || isRest || isMissed || (log?.foods && log.foods.length > 0);

              let scoreColor = 'text-gray-500 bg-gray-700/50';
              if (score >= 80) scoreColor = 'text-green-400 bg-green-500/20';
              else if (score >= 60) scoreColor = 'text-orange-400 bg-orange-500/20';
              else if (score > 0) scoreColor = 'text-yellow-400 bg-yellow-500/20';

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`relative flex flex-col justify-between h-28 p-2.5 rounded-xl border text-left transition-all duration-200 group hover:scale-[1.02] hover:border-orange-500/60 ${
                    isToday
                      ? 'border-orange-500 bg-orange-500/5 shadow-md shadow-orange-500/10'
                      : 'border-gray-700 bg-gray-850 hover:bg-gray-750'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-sm font-bold ${isToday ? 'text-orange-400' : 'text-white'}`}>
                      {dayNum}
                      {isToday && <span className="ml-1 text-[10px] font-normal text-orange-400">Today</span>}
                    </span>

                    {hasCompleted && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-400 bg-orange-500/20 px-1.5 py-0.5 rounded">
                        <Flame className="w-3 h-3" /> Done
                      </span>
                    )}
                    {isRest && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-400 bg-blue-500/20 px-1.5 py-0.5 rounded">
                        <Moon className="w-3 h-3" /> Rest
                      </span>
                    )}
                    {isMissed && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-400 bg-red-500/20 px-1.5 py-0.5 rounded">
                        <XCircle className="w-3 h-3" /> Missed
                      </span>
                    )}
                  </div>

                  <div className="w-full space-y-0.5">
                    {log && log.totalCalories > 0 ? (
                      <>
                        <p className="text-[11px] font-medium text-gray-300 truncate">
                          {log.totalCalories} <span className="text-[9px] text-gray-400">kcal</span>
                        </p>
                        <p className="text-[10px] text-orange-300 font-semibold truncate">
                          {log.totalProtein}g <span className="text-[9px] text-gray-400">protein</span>
                        </p>
                      </>
                    ) : (
                      <p className="text-[10px] text-gray-500 italic group-hover:text-gray-400">Click to log</p>
                    )}
                  </div>

                  <div className="w-full flex items-center justify-between pt-1 border-t border-gray-700/50">
                    <span className="text-[9px] text-gray-400 font-medium">Growth</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${hasData ? scoreColor : 'text-gray-500'}`}>
                      {hasData ? `${score}%` : 'â€”'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Day Inspector & Log Modal */}
      <Modal
        isOpen={!!selectedDate}
        onClose={() => { setSelectedDate(null); setShowAddFood(false); setIsManualOverride(false); }}
        title={selectedDate ? `Daily Log â€” ${new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}` : ''}
        size="lg"
      >
        <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
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
              <ProgressBar label={`Protein: ${activeLog.totalProtein}g / ${targets.protein}g target`} value={activeLog.totalProtein} max={targets.protein} color="orange" height="sm" />
              <ProgressBar label={`Calories: ${activeLog.totalCalories} kcal / ${targets.calories} kcal budget`} value={activeLog.totalCalories} max={targets.calories} color="blue" height="sm" />
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
                onClick={() => { setShowAddFood(s => !s); setIsManualOverride(false); }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                {showAddFood ? 'Close Form' : '+ Add Food'}
              </button>
            </div>

            {/* Smart Auto-Calculation Form */}
            {showAddFood && (
              <div className="bg-gray-750 p-4 rounded-xl border border-orange-500/50 space-y-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-gray-700 pb-2.5">
                  <span className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Smart Auto-Nutrient Calculator
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsManualOverride(s => !s)}
                    className="text-[11px] text-gray-400 hover:text-orange-300 underline flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    {isManualOverride ? 'Switch to Smart Search' : 'Manual Entry'}
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
                        className={`py-1.5 rounded-lg text-xs font-medium capitalize border transition-all ${
                          selectedMealType === m
                            ? 'bg-orange-500 border-orange-500 text-white font-semibold'
                            : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {!isManualOverride ? (
                  <>
                    {/* Food Search Box */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-gray-300">
                        Type Food Name (e.g. Soya Chunks, Roti, Egg, Rice, Chicken, Paneer, Oats, Banana)
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search food (e.g. soyab, roti, paneer, egg, rice)..."
                          value={foodSearchQuery}
                          onChange={e => setFoodSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg text-xs focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      {/* Dropdown Suggestions */}
                      {foodSearchQuery.trim() !== '' && (
                        <div className="max-h-48 overflow-y-auto bg-gray-800 border border-gray-600 rounded-lg p-1.5 space-y-1 shadow-xl">
                          {filteredFoods.length > 0 ? (
                            filteredFoods.map(f => (
                              <button
                                key={f.id}
                                type="button"
                                onClick={() => handleSelectFood(f)}
                                className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-700 text-xs text-white flex items-center justify-between transition-colors"
                              >
                                <span className="font-medium">{f.name}</span>
                                <span className="text-[10px] text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">
                                  {f.category}
                                </span>
                              </button>
                            ))
                          ) : (
                            <div className="p-3 text-center space-y-2">
                              <p className="text-xs text-gray-400">No exact match for &quot;{foodSearchQuery}&quot;</p>
                              <button
                                type="button"
                                onClick={() => startCustomFood(foodSearchQuery)}
                                className="inline-flex items-center gap-1 text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                Add &quot;{foodSearchQuery}&quot; as Custom Food
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Quick Popular Food Chips */}
                    <div className="space-y-1">
                      <span className="text-[11px] text-gray-400">Quick Picks:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          'soya_chunks', 'roti_wheat', 'roti_maida', 'egg_boiled_whole',
                          'rice_white_cooked', 'paneer_raw', 'chicken_breast_cooked',
                          'banana_fresh', 'dal_yellow_cooked', 'oats_cooked'
                        ].map(foodId => {
                          const food = POPULAR_FOODS_DATABASE.find(f => f.id === foodId);
                          if (!food) return null;
                          const isCurrent = selectedFood?.id === food.id;
                          return (
                            <button
                              key={food.id}
                              type="button"
                              onClick={() => handleSelectFood(food)}
                              className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                                isCurrent
                                  ? 'bg-orange-500 border-orange-500 text-white font-semibold'
                                  : 'bg-gray-700/80 border-gray-600 text-gray-300 hover:border-gray-500'
                              }`}
                            >
                              {food.name.split(' /')[0]}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Selected Food & Dynamic Quantity / Portion Controls */}
                    <div className="bg-gray-700/60 p-4 rounded-xl border border-gray-600 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-orange-400" />
                          {selectedFood.name}
                        </span>
                        <span className="text-[10px] text-gray-400 bg-gray-800 px-2 py-0.5 rounded">
                          {selectedFood.category}
                        </span>
                      </div>

                      {/* Quick Quantity Chips (e.g. 50g, 100g, or 1, 2, 3 pieces) */}
                      <div>
                        <span className="text-[11px] text-gray-300 block mb-1">
                          {selectedFood.portionType === 'weight' ? 'Select Weight:' : 'Select Count / Pieces:'}
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {selectedFood.quickPortions.map(qty => (
                            <button
                              key={qty}
                              type="button"
                              onClick={() => setFoodQuantity(qty)}
                              className={`text-xs font-semibold px-3 py-1 rounded-lg border transition-all ${
                                foodQuantity === qty
                                  ? 'bg-orange-500 border-orange-500 text-white'
                                  : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500'
                              }`}
                            >
                              {selectedFood.portionType === 'weight' ? `${qty}g` : `${qty} pc`}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block text-[11px] font-medium text-gray-300 mb-1 flex items-center gap-1">
                            <Scale className="w-3 h-3 text-orange-400" />
                            {selectedFood.portionType === 'weight' ? 'Exact Grams (g)' : 'Number of Pieces'}
                          </label>
                          <input
                            type="number"
                            min={1}
                            step={selectedFood.portionType === 'weight' ? 5 : 1}
                            value={foodQuantity}
                            onChange={e => setFoodQuantity(Math.max(1, Number(e.target.value)))}
                            className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-orange-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-gray-300 mb-1">
                            Portion Unit
                          </label>
                          <select
                            value={selectedUnitIndex}
                            onChange={e => setSelectedUnitIndex(Number(e.target.value))}
                            className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-orange-500"
                          >
                            {selectedFood.servingUnits.map((u, i) => (
                              <option key={i} value={i}>{u.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Live Auto-Calculated Nutrition & Ingredients Display */}
                      {calculatedNutrition && (
                        <div className="bg-gray-800/90 rounded-lg p-3.5 border border-orange-500/30 space-y-2.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-300">
                              Total Serving: <strong className="text-white">{calculatedNutrition.totalGrams}g</strong>
                            </span>
                            <span className="text-orange-400 font-extrabold text-sm flex items-center gap-1">
                              <Flame className="w-4 h-4" /> {calculatedNutrition.calories} kcal
                            </span>
                          </div>

                          <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
                            <div className="bg-orange-500/20 rounded p-1.5">
                              <p className="text-[10px] text-gray-400">Protein</p>
                              <p className="font-bold text-white text-xs">{calculatedNutrition.protein}g</p>
                            </div>
                            <div className="bg-blue-500/20 rounded p-1.5">
                              <p className="text-[10px] text-gray-400">Carbs</p>
                              <p className="font-bold text-white text-xs">{calculatedNutrition.carbs}g</p>
                            </div>
                            <div className="bg-yellow-500/20 rounded p-1.5">
                              <p className="text-[10px] text-gray-400">Fat</p>
                              <p className="font-bold text-white text-xs">{calculatedNutrition.fat}g</p>
                            </div>
                            <div className="bg-green-500/20 rounded p-1.5">
                              <p className="text-[10px] text-gray-400">Fiber</p>
                              <p className="font-bold text-white text-xs">{calculatedNutrition.fiber}g</p>
                            </div>
                          </div>

                          {calculatedNutrition.ingredients.length > 0 && (
                            <div className="pt-2 border-t border-gray-700 text-[11px] text-gray-300 flex items-start gap-1.5">
                              <Leaf className="w-3.5 h-3.5 text-green-400 flex-shrink-0 mt-0.5" />
                              <span><strong>Ingredients:</strong> {calculatedNutrition.ingredients.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  /* Custom / Manual Food Entry */
                  <div className="space-y-3 bg-gray-750 p-4 rounded-xl border border-orange-500/40">
                    <h4 className="text-xs font-bold text-orange-400 uppercase tracking-wider">Custom Food Details</h4>
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">Food Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Homemade Chicken Roll, Veg Momos"
                        value={manualName}
                        onChange={e => setManualName(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div>
                        <label className="text-gray-300 mb-0.5 block">Estimated Calories (kcal)</label>
                        <input
                          type="number"
                          value={manualCalories}
                          onChange={e => setManualCalories(Number(e.target.value))}
                          className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2.5 py-1.5"
                        />
                      </div>
                      <div>
                        <label className="text-gray-300 mb-0.5 block">Protein (g)</label>
                        <input
                          type="number"
                          value={manualProtein}
                          onChange={e => setManualProtein(Number(e.target.value))}
                          className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2.5 py-1.5"
                        />
                      </div>
                      <div>
                        <label className="text-gray-300 mb-0.5 block">Carbs (g)</label>
                        <input
                          type="number"
                          value={manualCarbs}
                          onChange={e => setManualCarbs(Number(e.target.value))}
                          className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2.5 py-1.5"
                        />
                      </div>
                      <div>
                        <label className="text-gray-300 mb-0.5 block">Fat (g)</label>
                        <input
                          type="number"
                          value={manualFat}
                          onChange={e => setManualFat(Number(e.target.value))}
                          className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2.5 py-1.5"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAddAutoFood}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-orange-500/20"
                >
                  <Plus className="w-4 h-4" />
                  {isManualOverride
                    ? `Add "${manualName || 'Custom Food'}" to ${selectedMealType}`
                    : `Add ${selectedFood.portionType === 'weight' ? `${foodQuantity}g` : `${foodQuantity}x`} ${selectedFood.name.split(' /')[0]} to ${selectedMealType}`}
                </button>
              </div>
            )}

            {/* List of Logged Foods */}
            {activeLog.foods && activeLog.foods.length > 0 ? (
              <div className="space-y-2">
                {activeLog.foods.map(food => (
                  <div key={food.id} className="flex items-center justify-between bg-gray-700/70 p-3 rounded-lg border border-gray-600/60">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded">
                          {food.mealType}
                        </span>
                        <p className="text-xs font-semibold text-white">{food.name}</p>
                      </div>
                      <p className="text-[11px] text-gray-300 mt-1">
                        <strong>{food.calories} kcal</strong> Â· <span className="text-orange-300 font-semibold">{food.protein}g Protein</span> Â· {food.carbs}g Carbs Â· {food.fat}g Fat
                      </p>
                    </div>

                    <button
                      onClick={() => handleRemoveFood(food.id)}
                      className="text-gray-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-gray-600 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 bg-gray-700/30 p-4 rounded-lg text-center border border-gray-700">
                No meals logged for this day yet. Click <strong>+ Add Food</strong> above to log your food!
              </p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}