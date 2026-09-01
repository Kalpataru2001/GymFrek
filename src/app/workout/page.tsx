'use client';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { calculateDayWorkoutNutrients } from '@/lib/calculations';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import {
  generateWorkoutPlan,
  WorkoutPlan,
  FitnessLevel,
  Goal,
  Equipment,
  Exercise,
  WorkoutDay,
} from '@/lib/workout-engine';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Badge from '@/components/ui/Badge';
import Toast from '@/components/ui/Toast';
import ExerciseVisualModal from '@/components/exercises/ExerciseVisualModal';
import EditExerciseModal from '@/components/workout/EditExerciseModal';
import Modal from '@/components/ui/Modal';
import {
  RefreshCw,
  Dumbbell,
  Play,
  ChevronDown,
  ChevronUp,
  Plus,
  Edit2,
  Trash2,
  Check,
  Sparkles,
  Moon,
  Flame,
  Clock,
  Layers,
  Repeat,
  Lightbulb,
} from 'lucide-react';

export default function WorkoutPage() {
  const { user } = useAuth();
  const { profile } = useUser();
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeDay, setActiveDay] = useState(0);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Modals state
  const [selectedDemoExercise, setSelectedDemoExercise] = useState<Exercise | null>(null);
  const [editingExerciseIndex, setEditingExerciseIndex] = useState<number | null>(null);
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [isEditingDay, setIsEditingDay] = useState(false);

  // Day editor state
  const [editDayFocus, setEditDayFocus] = useState('');
  const [editDayIsRest, setEditDayIsRest] = useState(false);

  // Plan generation parameters
  const [level, setLevel] = useState<FitnessLevel>('beginner');
  const [goal, setGoal] = useState<Goal>('maintain');
  const [equipment, setEquipment] = useState<Equipment>('full_gym');

  const storageKey = user ? `gymfrek_workout_plan_${user.uid}` : null;

  // Load workout plan
  const loadPlan = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    if (storageKey) {
      try {
        const cached = localStorage.getItem(storageKey);
        if (cached) setPlan(JSON.parse(cached));
      } catch (e) {
        console.warn(e);
      }
    }

    try {
      const snap = await getDoc(doc(db, 'workoutPlans', user.uid));
      if (snap.exists()) {
        const data = snap.data() as WorkoutPlan;
        setPlan(data);
        if (storageKey) localStorage.setItem(storageKey, JSON.stringify(data));
      }
    } catch (e) {
      console.error('Failed to load workout plan:', e);
    } finally {
      setLoading(false);
    }
  }, [user, storageKey]);

  useEffect(() => {
    if (!user) return;
    const today = new Date().getDay();
    setActiveDay(today === 0 ? 6 : today - 1);
    loadPlan();

    if (profile) {
      setLevel((profile.fitnessLevel as FitnessLevel) || 'beginner');
      setGoal((profile.goal as Goal) || 'maintain');
      setEquipment((profile.equipment as Equipment) || 'full_gym');
    }
  }, [user, profile, loadPlan]);

  // Save modified plan
  const savePlanToDatabase = async (updatedPlan: WorkoutPlan) => {
    if (!user) return;
    setSaving(true);
    setPlan(updatedPlan);

    if (storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(updatedPlan));
      } catch (e) {
        console.warn(e);
      }
    }

    try {
      await setDoc(doc(db, 'workoutPlans', user.uid), updatedPlan);
      setToast({ message: 'Workout plan saved successfully!', type: 'success' });
    } catch (e) {
      console.error('Failed to save plan:', e);
      setToast({ message: 'Failed to sync with cloud database', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Generate new default plan
  const generate = async () => {
    if (!user) return;
    setGenerating(true);
    const newPlan = generateWorkoutPlan(level, goal, equipment);
    await savePlanToDatabase(newPlan);
    setGenerating(false);
  };

  // Day Focus Edit handler
  const handleOpenEditDay = () => {
    if (!plan || !plan.schedule[activeDay]) return;
    setEditDayFocus(plan.schedule[activeDay].focus);
    setEditDayIsRest(plan.schedule[activeDay].isRestDay);
    setIsEditingDay(true);
  };

  const handleSaveDayDetails = async () => {
    if (!plan) return;
    const newSchedule = [...plan.schedule];
    newSchedule[activeDay] = {
      ...newSchedule[activeDay],
      focus: editDayFocus.trim() || 'Custom Workout Day',
      isRestDay: editDayIsRest,
    };
    const updatedPlan: WorkoutPlan = { ...plan, schedule: newSchedule };
    await savePlanToDatabase(updatedPlan);
    setIsEditingDay(false);
  };

  // Save exercise (Add or Edit)
  const handleSaveExercise = async (savedEx: Exercise) => {
    if (!plan) return;
    const currentDay = plan.schedule[activeDay];
    let newExercises = [...currentDay.exercises];

    if (editingExerciseIndex !== null) {
      // Editing existing exercise
      newExercises[editingExerciseIndex] = savedEx;
    } else {
      // Adding new exercise
      newExercises.push(savedEx);
    }

    const newSchedule = [...plan.schedule];
    newSchedule[activeDay] = {
      ...currentDay,
      exercises: newExercises,
      isRestDay: false, // Ensure day is active if adding exercise
    };

    const updatedPlan: WorkoutPlan = { ...plan, schedule: newSchedule };
    await savePlanToDatabase(updatedPlan);
    setEditingExerciseIndex(null);
    setIsAddingExercise(false);
  };

  // Delete exercise
  const handleDeleteExercise = async (indexToDelete: number) => {
    if (!plan) return;
    const currentDay = plan.schedule[activeDay];
    const newExercises = currentDay.exercises.filter((_, idx) => idx !== indexToDelete);

    const newSchedule = [...plan.schedule];
    newSchedule[activeDay] = {
      ...currentDay,
      exercises: newExercises,
    };

    const updatedPlan: WorkoutPlan = { ...plan, schedule: newSchedule };
    await savePlanToDatabase(updatedPlan);
    setEditingExerciseIndex(null);
    setToast({ message: 'Exercise removed from routine', type: 'info' });
  };

  const allDays = useMemo(() => plan?.schedule ?? [], [plan]);
  const currentDayData: WorkoutDay | undefined = allDays[activeDay];

  const baseMacros = useMemo(
    () => profile?.macros || { calories: 2000, protein: 140, carbs: 200, fat: 60, fiber: 30 },
    [profile]
  );

  const currentDayNutrients = useMemo(() => {
    return currentDayData
      ? calculateDayWorkoutNutrients(currentDayData, baseMacros, profile?.weightKg)
      : null;
  }, [currentDayData, baseMacros, profile?.weightKg]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header & Main Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Dumbbell className="w-7 h-7 text-orange-400" />
            Weekly Workout Plan & Form Videos
          </h1>
          {plan && (
            <p className="text-gray-400 mt-1">
              {plan.planType} - {plan.schedule.filter(d => !d.isRestDay).length} workout days / week
            </p>
          )}
        </div>

        {plan && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleOpenEditDay}
              className="flex items-center gap-1.5 text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 px-3.5 py-2 rounded-lg transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5 text-orange-400" />
              Edit This Day
            </button>

            <button
              onClick={generate}
              disabled={generating || saving}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 px-3.5 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {generating ? 'Regenerating...' : 'Regenerate'}
            </button>
          </div>
        )}
      </div>

      {!plan ? (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 max-w-lg mx-auto space-y-6">
          <h2 className="text-xl font-semibold text-white text-center">Generate Your Workout Plan</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Experience Level</label>
              <div className="grid grid-cols-3 gap-2">
                {(['beginner', 'intermediate', 'advanced'] as FitnessLevel[]).map(l => (
                  <button
                    key={l}
                    onClick={() => setLevel(l)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors capitalize ${
                      level === l
                        ? 'bg-orange-500 border-orange-500 text-white'
                        : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Your Goal</label>
              <select
                value={goal}
                onChange={e => setGoal(e.target.value as Goal)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500"
              >
                <option value="lose_weight">Lose Weight</option>
                <option value="maintain">Maintain Fitness</option>
                <option value="gain_muscle">Gain Muscle</option>
                <option value="improve_fitness">Improve Fitness</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Available Equipment</label>
              <div className="grid grid-cols-1 gap-2">
                {(
                  [
                    ['full_gym', 'Full Gym Equipment'],
                    ['dumbbells_only', 'Dumbbells Only'],
                    ['no_equipment', 'Bodyweight Only'],
                  ] as [Equipment, string][]
                ).map(([v, l]) => (
                  <button
                    key={v}
                    onClick={() => setEquipment(v)}
                    className={`py-2.5 px-4 rounded-lg text-sm font-medium border transition-colors text-left ${
                      equipment === v
                        ? 'bg-orange-500 border-orange-500 text-white'
                        : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={generate}
            disabled={generating}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {generating ? 'Generating Your Plan...' : 'Generate My Workout Plan'}
          </button>
        </div>
      ) : (
        <>
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl px-4 py-3 flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-orange-300">
              <strong>Weekly Progression:</strong> {plan.weeklyProgressionNote}
            </p>
          </div>

          {/* Day Navigation Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {allDays.map((day, idx) => (
              <button
                key={day.day}
                onClick={() => setActiveDay(idx)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  day.isRestDay ? 'opacity-60' : ''
                } ${
                  activeDay === idx
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                    : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
                }`}
              >
                <span className="font-bold text-sm block">{day.day.slice(0, 3)}</span>
                {!day.isRestDay && <span className="block text-[10px] opacity-90 truncate max-w-[90px]">{day.focus}</span>}
                {day.isRestDay && <span className="block text-[10px] opacity-80">Rest</span>}
              </button>
            ))}
          </div>

          {/* Day Content Area */}
          {currentDayData && (
            <div className="space-y-4">
              {/* Day Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-800 p-4 rounded-xl border border-gray-700">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${currentDayData.isRestDay ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                    {currentDayData.isRestDay ? <Moon className="w-5 h-5" /> : <Flame className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {currentDayData.day} - {currentDayData.focus}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {currentDayData.isRestDay
                        ? 'Scheduled recovery day'
                        : `${currentDayData.exercises.length} exercises programmed`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingExerciseIndex(null);
                      setIsAddingExercise(true);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white px-3.5 py-2 rounded-lg transition-colors shadow-md shadow-orange-500/20"
                  >
                    <Plus className="w-4 h-4" /> Add Exercise
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenEditDay}
                    className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors"
                    title="Edit Day Details"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Dynamic Exercise-Based Nutrition Needs Card */}
              {currentDayNutrients && (
                <div className="bg-gray-800/80 border border-gray-700/80 rounded-xl p-4 space-y-3 shadow-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-700/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-orange-400" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300">
                        Dynamic Daily Nutrition Target for this Workout
                      </h4>
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border self-start sm:self-auto ${currentDayNutrients.intensityColor}`}>
                      {currentDayNutrients.intensityLabel}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="bg-gray-900/60 p-2.5 rounded-lg border border-gray-750">
                      <span className="text-[10px] text-gray-400 block">Est. Session Burn</span>
                      <span className="text-sm font-extrabold text-orange-400 flex items-center gap-1 mt-0.5">
                        <Flame className="w-3.5 h-3.5" />
                        {currentDayNutrients.estimatedBurnKcal > 0 ? `~${currentDayNutrients.estimatedBurnKcal} kcal` : '0 kcal (Rest)'}
                      </span>
                    </div>

                    <div className="bg-gray-900/60 p-2.5 rounded-lg border border-gray-750">
                      <span className="text-[10px] text-gray-400 block">Day Calorie Target</span>
                      <span className="text-sm font-extrabold text-white mt-0.5 block">
                        {currentDayNutrients.targetMacros.calories} <span className="text-[10px] font-normal text-gray-400">kcal ({currentDayNutrients.calorieAdjustment >= 0 ? `+${currentDayNutrients.calorieAdjustment}` : currentDayNutrients.calorieAdjustment})</span>
                      </span>
                    </div>

                    <div className="bg-gray-900/60 p-2.5 rounded-lg border border-gray-750">
                      <span className="text-[10px] text-gray-400 block">Target Protein (MPS)</span>
                      <span className="text-sm font-extrabold text-emerald-400 mt-0.5 block">
                        {currentDayNutrients.targetMacros.protein}g <span className="text-[10px] font-normal text-gray-400">({currentDayNutrients.proteinAdjustmentGrams >= 0 ? `+${currentDayNutrients.proteinAdjustmentGrams}g` : 'Base'})</span>
                      </span>
                    </div>

                    <div className="bg-gray-900/60 p-2.5 rounded-lg border border-gray-750">
                      <span className="text-[10px] text-gray-400 block">Carbs & Fats</span>
                      <span className="text-sm font-extrabold text-sky-300 mt-0.5 block">
                        {currentDayNutrients.targetMacros.carbs}g <span className="text-[10px] font-normal text-gray-400">C</span> / {currentDayNutrients.targetMacros.fat}g <span className="text-[10px] font-normal text-gray-400">F</span>
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-300 italic bg-gray-900/40 p-2.5 rounded-lg border border-gray-750/70 flex items-start gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-orange-400 mt-0.5 flex-shrink-0" />
                    <span>{currentDayNutrients.explanation}</span>
                  </p>
                </div>
              )}

              {/* Day Rest State or Exercise List */}
              {currentDayData.isRestDay ? (
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-10 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
                    <Moon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Active Recovery / Rest Day</h3>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto">
                    Muscles repair and grow during rest days. Focus on hydration, high-protein nutrition, and mobility stretching.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setEditDayFocus('Custom Full Body');
                      setEditDayIsRest(false);
                      setIsEditingDay(true);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded-lg transition-colors mt-2"
                  >
                    <Flame className="w-3.5 h-3.5 text-orange-400" /> Switch to Workout Day
                  </button>
                </div>
              ) : currentDayData.exercises.length === 0 ? (
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center space-y-3">
                  <Dumbbell className="w-10 h-10 text-gray-500 mx-auto" />
                  <h4 className="text-sm font-semibold text-white">No Exercises in this routine yet</h4>
                  <p className="text-xs text-gray-400">Click &quot;Add Exercise&quot; above to customize this workout day.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingExerciseIndex(null);
                      setIsAddingExercise(true);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Your First Exercise
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentDayData.exercises.map((ex, i) => {
                    const isExpanded = expandedExercise === `${activeDay}-${i}`;
                    return (
                      <div
                        key={i}
                        className="bg-gray-800 rounded-xl border border-gray-700 hover:border-gray-600 transition-all overflow-hidden"
                      >
                        <div className="flex items-center justify-between p-4 gap-3">
                          <div className="flex items-center gap-3.5 flex-1 min-w-0">
                            <span className="w-7 h-7 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-extrabold flex-shrink-0">
                              {i + 1}
                            </span>
                            <div className="min-w-0">
                              <p className="font-bold text-white text-sm truncate">{ex.name}</p>
                              <p className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                                <span className="font-medium text-gray-300">{ex.sets} sets x {ex.reps}</span>
                                <span>-</span>
                                <span>Rest: {ex.rest}</span>
                                <span>-</span>
                                <span className="text-orange-400 font-medium">{ex.muscleGroup}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Watch Video Demo Button */}
                            <button
                              type="button"
                              onClick={() => setSelectedDemoExercise(ex)}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-orange-500/20 hover:bg-orange-500 text-orange-300 hover:text-white border border-orange-500/40 px-3 py-1.5 rounded-lg transition-all"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>Video Demo</span>
                            </button>

                            {/* Edit Exercise Button */}
                            <button
                              type="button"
                              onClick={() => setEditingExerciseIndex(i)}
                              className="p-1.5 text-gray-400 hover:text-orange-400 rounded-lg hover:bg-gray-700 transition-colors"
                              title="Edit Exercise"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {/* Delete Exercise Button */}
                            <button
                              type="button"
                              onClick={() => handleDeleteExercise(i)}
                              className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-gray-700 transition-colors"
                              title="Remove Exercise"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                            {/* Expand Instructions Button */}
                            <button
                              type="button"
                              onClick={() => setExpandedExercise(isExpanded ? null : `${activeDay}-${i}`)}
                              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="px-5 pb-4 border-t border-gray-700/60 pt-3 space-y-2 text-xs text-gray-300 bg-gray-750">
                            <p className="leading-relaxed whitespace-pre-line">{ex.instructions}</p>
                            {ex.tips && ex.tips.length > 0 && (
                              <div className="pt-1 text-emerald-400 flex items-start gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                                <span><strong>Pro Tip:</strong> {ex.tips[0]}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* --- MODAL 1: WATCH VIDEO DEMONSTRATION ---------------------------- */}
      <ExerciseVisualModal
        exercise={selectedDemoExercise}
        isOpen={!!selectedDemoExercise}
        onClose={() => setSelectedDemoExercise(null)}
      />

      {/* --- MODAL 2: ADD / EDIT EXERCISE WITH AUTO-VIDEO & YOUTUBE LINK --- */}
      <EditExerciseModal
        isOpen={isAddingExercise || editingExerciseIndex !== null}
        onClose={() => {
          setIsAddingExercise(false);
          setEditingExerciseIndex(null);
        }}
        onSave={handleSaveExercise}
        onDelete={
          editingExerciseIndex !== null
            ? () => handleDeleteExercise(editingExerciseIndex)
            : undefined
        }
        initialExercise={
          editingExerciseIndex !== null && currentDayData
            ? currentDayData.exercises[editingExerciseIndex]
            : null
        }
        dayName={currentDayData?.day || 'Today'}
      />

      {/* --- MODAL 3: EDIT DAY DETAILS (FOCUS & REST TOGGLE) ---------------- */}
      <Modal
        isOpen={isEditingDay}
        onClose={() => setIsEditingDay(false)}
        title={`Edit Routine : ${currentDayData?.day}`}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Workout Focus / Title
            </label>
            <input
              type="text"
              placeholder="e.g. Chest & Triceps, Heavy Leg Day, Full Body Power"
              value={editDayFocus}
              onChange={e => setEditDayFocus(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="bg-gray-750 p-3.5 rounded-xl border border-gray-700 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">Scheduled Rest Day</p>
              <p className="text-[11px] text-gray-400">Mark this day for active muscle recovery</p>
            </div>
            <input
              type="checkbox"
              checked={editDayIsRest}
              onChange={e => setEditDayIsRest(e.target.checked)}
              className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500 bg-gray-700 border-gray-600"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-700">
            <button
              type="button"
              onClick={() => setIsEditingDay(false)}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-300 hover:bg-gray-700 border border-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveDayDetails}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20 transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" /> Save Changes
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}