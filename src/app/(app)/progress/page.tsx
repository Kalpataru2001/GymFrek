'use client';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { db } from '@/lib/firebase';
import {
  collection, query, where, orderBy, limit,
  getDocs, addDoc, doc, getDoc, serverTimestamp,
} from 'firebase/firestore';
import {
  calculateBMI,
  getBMIColor,
  calculateDayWorkoutNutrients,
  generateDailySummaryReport,
  DailySummaryReport,
} from '@/lib/calculations';
import { WorkoutPlan, WorkoutDay } from '@/lib/workout-engine';
import type { DailyLog } from '@/lib/types';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import Toast from '@/components/ui/Toast';
import {
  Activity, TrendingUp, Flame, Target, Dumbbell,
  Utensils, CheckCircle2, XCircle, Moon, Clock,
  Layers, Trophy, Info, Sparkles,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateLabel(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function last7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreRing({ score, grade, badgeColor }: { score: number; grade: string; badgeColor: string }) {
  const radius = 44;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const ringColor = score >= 90 ? '#10b981' : score >= 75 ? '#f97316' : score >= 60 ? '#eab308' : score >= 40 ? '#3b82f6' : '#ef4444';
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#374151" strokeWidth="8" />
          <circle cx="50" cy="50" r={radius} fill="none" stroke={ringColor} strokeWidth="8"
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold text-white">{score}</span>
          <span className="text-[10px] text-gray-400 font-medium">/ 100</span>
        </div>
      </div>
      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${badgeColor}`}>{grade}</span>
    </div>
  );
}

function MacroBar({ label, actual, target, unit, color }: {
  label: string; actual: number; target: number; unit: string; color: string;
}) {
  const pct = target > 0 ? Math.min(100, Math.round((actual / target) * 100)) : 0;
  const gap = target - actual;
  const isOver = gap < 0;
  const gapAbs = Math.abs(Math.round(gap));
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-300 font-medium capitalize">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-white font-semibold">{Math.round(actual)}</span>
          <span className="text-gray-500">/ {Math.round(target)} {unit}</span>
          {gapAbs > 0 ? (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isOver ? 'text-orange-300 bg-orange-500/15' : 'text-gray-400 bg-gray-700'}`}>
              {isOver ? `+${gapAbs}` : `-${gapAbs}`} {unit}
            </span>
          ) : (
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded">On target</span>
          )}
        </div>
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color} ${isOver ? 'opacity-70' : ''}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function SuggestionCard({ s }: { s: DailySummaryReport['suggestions'][0] }) {
  const border = { high: 'border-red-500/40 bg-red-950/20', medium: 'border-amber-500/40 bg-amber-950/20', low: 'border-emerald-500/40 bg-emerald-950/20' };
  const dot = { high: 'bg-red-500', medium: 'bg-amber-400', low: 'bg-emerald-400' };
  return (
    <div className={`flex gap-3 p-3 rounded-xl border ${border[s.priority]}`}>
      <span className="text-xl flex-shrink-0 mt-0.5">{s.icon}</span>
      <div>
        <p className="text-sm font-semibold text-white flex items-center gap-2">
          <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${dot[s.priority]}`} />
          {s.title}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{s.detail}</p>
      </div>
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface WeightLog { id: string; date: string; weightKg: number; }

const ACHIEVEMENTS = [
  { id: 'first_log', name: 'First Step', desc: 'Log your weight for the first time', icon: '👟', threshold: 1 },
  { id: 'ten_logs', name: 'Weight Watcher', desc: 'Log weight 10 times', icon: '📊', threshold: 10 },
  { id: 'twenty_logs', name: 'Consistency King', desc: 'Log weight 20 times', icon: '👑', threshold: 20 },
];

const MACRO_BARS = [
  { key: 'calories' as const, label: 'Calories', color: 'bg-orange-500', unit: 'kcal', logKey: 'totalCalories' as const },
  { key: 'protein'  as const, label: 'Protein',  color: 'bg-blue-500',   unit: 'g',    logKey: 'totalProtein'  as const },
  { key: 'carbs'    as const, label: 'Carbs',    color: 'bg-amber-400',  unit: 'g',    logKey: 'totalCarbs'    as const },
  { key: 'fat'      as const, label: 'Fat',      color: 'bg-purple-400', unit: 'g',    logKey: 'totalFat'      as const },
  { key: 'fiber'    as const, label: 'Fiber',    color: 'bg-emerald-400',unit: 'g',    logKey: 'totalFiber'    as const },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProgressPage() {
  const { user } = useAuth();
  const { profile } = useUser();

  // Weight log
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [date, setDate] = useState(todayStr());
  const [weight, setWeight] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Daily report
  const [selectedDate, setSelectedDate] = useState<string>(todayStr());
  const [dailyLog, setDailyLog] = useState<DailyLog | null>(null);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const recentDays = useMemo(() => last7Days(), []);

  // ── Fetch weight logs ──────────────────────────────────────────────────────
  const fetchLogs = useCallback(async () => {
    if (!user) return;
    const snap = await getDocs(query(
      collection(db, 'weightLogs'),
      where('uid', '==', user.uid),
      orderBy('date', 'asc'),
      limit(30)
    ));
    setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() } as WeightLog)));
  }, [user]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  // ── Fetch workout plan ─────────────────────────────────────────────────────
  const fetchWorkoutPlan = useCallback(async () => {
    if (!user) return;
    const cacheKey = `gymfrek_workout_plan_${user.uid}`;
    try { const c = localStorage.getItem(cacheKey); if (c) setWorkoutPlan(JSON.parse(c)); } catch { /* */ }
    try {
      const snap = await getDoc(doc(db, 'workoutPlans', user.uid));
      if (snap.exists()) {
        const data = snap.data() as WorkoutPlan;
        setWorkoutPlan(data);
        try { localStorage.setItem(cacheKey, JSON.stringify(data)); } catch { /* */ }
      }
    } catch { /* */ }
  }, [user]);

  useEffect(() => { fetchWorkoutPlan(); }, [fetchWorkoutPlan]);

  // ── Fetch daily log for selected date ─────────────────────────────────────
  const fetchDailyLog = useCallback(async (dateStr: string) => {
    if (!user) return;
    setReportLoading(true);
    try {
      // Try cache first for speed
      const cacheKey = `gymfrek_logs_${user.uid}`;
      try {
        const c = localStorage.getItem(cacheKey);
        if (c) {
          const m = JSON.parse(c) as Record<string, DailyLog>;
          if (m[dateStr]) setDailyLog(m[dateStr]);
        }
      } catch { /* */ }
      // Always verify with Firestore
      const snap = await getDoc(doc(db, 'dailyLogs', `${user.uid}_${dateStr}`));
      setDailyLog(snap.exists() ? (snap.data() as DailyLog) : null);
    } catch { setDailyLog(null); }
    finally { setReportLoading(false); }
  }, [user]);

  useEffect(() => { fetchDailyLog(selectedDate); }, [fetchDailyLog, selectedDate]);

  // ── Derive scheduled workout day ───────────────────────────────────────────
  const scheduledDay: WorkoutDay | null = useMemo(() => {
    if (!workoutPlan?.schedule?.length) return null;
    const parts = selectedDate.split('-');
    if (parts.length !== 3) return null;
    const dow = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])).getDay();
    return workoutPlan.schedule[dow === 0 ? 6 : dow - 1] || null;
  }, [workoutPlan, selectedDate]);

  const baseMacros = useMemo(() => ({
    calories: profile?.macros?.calories ?? 2000,
    protein:  profile?.macros?.protein  ?? 140,
    carbs:    profile?.macros?.carbs    ?? 200,
    fat:      profile?.macros?.fat      ?? 60,
    fiber:    profile?.macros?.fiber    ?? 30,
  }), [profile]);

  const dayImpact = useMemo(() =>
    calculateDayWorkoutNutrients(scheduledDay, baseMacros, profile?.weightKg),
    [scheduledDay, baseMacros, profile?.weightKg]);

  const report: DailySummaryReport | null = useMemo(() => {
    const logData = dailyLog ?? {
      date: selectedDate, attendance: 'none' as const, foods: [],
      totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0, totalFiber: 0,
    };
    if (!dailyLog && reportLoading) return null;
    return generateDailySummaryReport(logData, baseMacros, dayImpact, profile?.goal);
  }, [dailyLog, baseMacros, dayImpact, profile?.goal, selectedDate, reportLoading]);

  // ── Save weight ────────────────────────────────────────────────────────────
  const saveWeight = async () => {
    if (!user || !weight) return;
    setSaving(true);
    await addDoc(collection(db, 'weightLogs'), {
      uid: user.uid, date, weightKg: parseFloat(weight), createdAt: serverTimestamp(),
    });
    setToast({ message: 'Weight logged successfully!', type: 'success' });
    setWeight(''); fetchLogs(); setSaving(false);
  };

  const bmiData = profile ? calculateBMI(profile.weightKg ?? 0, profile.heightCm ?? 1) : null;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* PAGE HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <Activity className="w-7 h-7 text-orange-400" />
          Progress &amp; Daily Report
        </h1>
        <p className="text-gray-400 mt-1 text-sm">
          End-of-day performance analysis with smart suggestions based on your food and workout logs.
        </p>
      </div>

      {/* ─── DAILY REPORT ─────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-400" />
            Daily Performance Report
          </h2>
          {/* 7-day date picker */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none w-full sm:w-auto">
            {recentDays.map((d) => {
              const isToday = d === todayStr();
              const isSelected = d === selectedDate;
              const parts = d.split('-');
              const label = isToday ? 'Today' :
                new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
                  .toLocaleDateString('en-US', { weekday: 'short' });
              return (
                <button key={d} onClick={() => setSelectedDate(d)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg font-medium border flex-shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-orange-500 border-orange-500 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white'
                  }`}>
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-gray-500">
          Showing: <span className="text-orange-300 font-medium">{formatDateLabel(selectedDate)}</span>
        </p>

        {reportLoading ? (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-10 text-center">
            <div className="animate-spin w-7 h-7 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Loading report...</p>
          </div>
        ) : report ? (
          <div className="grid gap-4">

            {/* ── Card 1: Score + Status + Highlights ── */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 grid md:grid-cols-3 gap-5">

              {/* Score Ring */}
              <div className="flex flex-col items-center justify-center gap-2 border-b md:border-b-0 md:border-r border-gray-700 pb-4 md:pb-0 md:pr-5">
                <ScoreRing score={report.scoreBreakdown.score} grade={report.scoreBreakdown.grade} badgeColor={report.scoreBreakdown.badgeColor} />
                <p className="text-[11px] text-gray-400 text-center max-w-[140px]">{report.scoreBreakdown.summary}</p>
              </div>

              {/* Quick stats */}
              <div className="flex flex-col justify-center gap-3 md:border-r border-gray-700 md:pr-5">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Activity Summary</h3>
                {[
                  {
                    icon: report.workoutStatus === 'completed' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> :
                          report.workoutStatus === 'rest'      ? <Moon className="w-4 h-4 text-sky-400" /> :
                          report.workoutStatus === 'missed'    ? <XCircle className="w-4 h-4 text-red-400" /> :
                                                                 <Clock className="w-4 h-4 text-gray-500" />,
                    bg:   report.workoutStatus === 'completed' ? 'bg-emerald-500/20' :
                          report.workoutStatus === 'rest'      ? 'bg-sky-500/20' :
                          report.workoutStatus === 'missed'    ? 'bg-red-500/20' : 'bg-gray-700',
                    label: 'Workout',
                    value: report.workoutStatus === 'none' ? 'Not marked' : report.workoutStatus,
                  },
                  { icon: <Flame className="w-4 h-4 text-orange-400" />, bg: 'bg-orange-500/20', label: 'Est. Burn', value: report.estimatedBurnKcal > 0 ? `~${report.estimatedBurnKcal} kcal` : 'Rest day' },
                  { icon: <Utensils className="w-4 h-4 text-blue-400" />, bg: 'bg-blue-500/20', label: 'Food logged', value: `${report.totalFoodLogged} items` },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center flex-shrink-0`}>{stat.icon}</div>
                    <div>
                      <p className="text-xs text-gray-400">{stat.label}</p>
                      <p className="text-sm font-semibold text-white capitalize">{stat.value}</p>
                    </div>
                  </div>
                ))}

                {/* Meal breakdown */}
                {Object.keys(report.mealBreakdown).length > 0 && (
                  <div className="pt-1 space-y-1 border-t border-gray-700">
                    {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map(meal => {
                      const kcal = report.mealBreakdown[meal];
                      if (!kcal) return null;
                      return (
                        <div key={meal} className="flex items-center justify-between text-xs">
                          <span className="text-gray-500 capitalize">{meal}</span>
                          <span className="text-gray-300 font-medium">{Math.round(kcal)} kcal</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Highlights */}
              <div className="flex flex-col justify-center gap-2">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">What You Did Well</h3>
                {report.highlights.length > 0 ? (
                  report.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-gray-300">{h}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500">Log meals and mark your workout on the Calendar to see highlights.</p>
                )}
              </div>
            </div>

            {/* ── Card 2: Nutrition + Workout ── */}
            <div className="grid md:grid-cols-2 gap-4">

              {/* Nutrition breakdown */}
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Target className="w-4 h-4 text-orange-400" />
                    Nutrition vs Targets
                  </h3>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${dayImpact.isRestDay ? 'text-sky-400 bg-sky-500/10 border-sky-500/30' : dayImpact.intensityColor}`}>
                    {dayImpact.isRestDay ? 'Rest Day' : dayImpact.intensityLabel}
                  </span>
                </div>

                <div className="space-y-3">
                  {MACRO_BARS.map(cfg => (
                    <MacroBar
                      key={cfg.key}
                      label={cfg.label}
                      actual={dailyLog?.[cfg.logKey] ?? 0}
                      target={dayImpact.targetMacros[cfg.key]}
                      unit={cfg.unit}
                      color={cfg.color}
                    />
                  ))}
                </div>

                {/* Score pillar breakdown */}
                <div className="pt-2 border-t border-gray-700">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 font-semibold">Score Pillars</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Workout', score: report.scoreBreakdown.workoutScore, max: 40, color: 'text-orange-400' },
                      { label: 'Protein',  score: report.scoreBreakdown.proteinScore,  max: 35, color: 'text-blue-400' },
                      { label: 'Calories', score: report.scoreBreakdown.calorieScore, max: 25, color: 'text-amber-400' },
                    ].map(p => (
                      <div key={p.label} className="text-center bg-gray-900/50 rounded-lg p-2">
                        <p className={`text-base font-bold ${p.color}`}>{p.score}</p>
                        <p className="text-[10px] text-gray-500">/ {p.max}</p>
                        <p className="text-[10px] text-gray-400 font-medium mt-0.5">{p.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Workout exercises */}
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 space-y-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-orange-400" />
                  {scheduledDay?.focus || 'Scheduled Workout'}
                </h3>

                {scheduledDay && !scheduledDay.isRestDay && scheduledDay.exercises?.length > 0 ? (
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {scheduledDay.exercises.map((ex, idx) => (
                      <div key={idx} className="flex items-start gap-2 py-1.5 border-b border-gray-700/50 last:border-0">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          report.workoutStatus === 'completed' ? 'bg-emerald-500/20' :
                          report.workoutStatus === 'missed'    ? 'bg-red-500/20' : 'bg-gray-700'
                        }`}>
                          {report.workoutStatus === 'completed' ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> :
                           report.workoutStatus === 'missed'    ? <XCircle className="w-3 h-3 text-red-400" /> :
                           <span className="text-[9px] text-gray-500 font-bold">{idx + 1}</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-white truncate">{ex.name}</p>
                          <p className="text-[10px] text-gray-500">{ex.sets} sets &times; {ex.reps} &bull; {ex.muscleGroup}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : scheduledDay?.isRestDay ? (
                  <div className="flex flex-col items-center py-4 gap-2">
                    <Moon className="w-8 h-8 text-sky-400" />
                    <p className="text-sm font-semibold text-sky-300">Rest &amp; Recovery Day</p>
                    <p className="text-xs text-gray-500 text-center">Focus on light stretching and quality sleep.</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-4 gap-2">
                    <Layers className="w-8 h-8 text-gray-600" />
                    <p className="text-xs text-gray-500 text-center">No plan loaded. Go to the Workout tab to generate or load your 6-day routine.</p>
                  </div>
                )}

                {/* Attendance status banner */}
                <div className={`flex items-center gap-2 p-2.5 rounded-lg mt-auto ${
                  report.workoutStatus === 'completed' ? 'bg-emerald-500/10 border border-emerald-500/20' :
                  report.workoutStatus === 'rest'      ? 'bg-sky-500/10 border border-sky-500/20' :
                  report.workoutStatus === 'missed'    ? 'bg-red-500/10 border border-red-500/20' :
                  'bg-gray-700/40 border border-gray-700'
                }`}>
                  {report.workoutStatus === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                  {report.workoutStatus === 'rest'      && <Moon className="w-4 h-4 text-sky-400 flex-shrink-0" />}
                  {report.workoutStatus === 'missed'    && <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                  {report.workoutStatus === 'none'      && <Info className="w-4 h-4 text-gray-500 flex-shrink-0" />}
                  <p className="text-xs text-gray-300">
                    {report.workoutStatus === 'completed' && 'Workout complete! Great discipline.'}
                    {report.workoutStatus === 'rest'      && 'Rest day logged. Muscles are recovering.'}
                    {report.workoutStatus === 'missed'    && 'Workout missed. Bounce back tomorrow!'}
                    {report.workoutStatus === 'none'      && 'Mark attendance on the Calendar tab.'}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Card 3: Improvement Suggestions ── */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-400" />
                Improvement Suggestions
                {report.suggestions.filter(s => s.priority === 'high').length > 0 && (
                  <span className="ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                    {report.suggestions.filter(s => s.priority === 'high').length} urgent
                  </span>
                )}
              </h3>

              {report.suggestions.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-2.5">
                  {report.suggestions.map((s, i) => <SuggestionCard key={i} s={s} />)}
                </div>
              ) : (
                <div className="flex flex-col items-center py-6 gap-2">
                  <Trophy className="w-10 h-10 text-emerald-400" />
                  <p className="text-sm font-semibold text-emerald-300">Perfect day — no improvements needed!</p>
                  <p className="text-xs text-gray-500">Nutrition and workout are both dialed in. Keep the streak going!</p>
                </div>
              )}

              {profile?.goal && (
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-orange-500/5 border border-orange-500/15 text-xs text-orange-300">
                  <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span>
                    Personalised for goal: <strong className="capitalize">{profile.goal.replace('_', ' ')}</strong>.
                    {' '}Update your goal in Profile settings for better recommendations.
                  </span>
                </div>
              )}
            </div>

          </div>
        ) : null}
      </section>

      {/* ─── WEIGHT LOG + BMI ─────────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-orange-400" />
          Weight Tracker
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
            <h3 className="text-base font-semibold text-white">Log Today&apos;s Weight</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Weight (kg)</label>
                <input type="number" value={weight} onChange={e => setWeight(e.target.value)}
                  placeholder="e.g. 72.5" step="0.1" min="20" max="300"
                  className="w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500" />
              </div>
              <button onClick={saveWeight} disabled={saving || !weight}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors">
                {saving ? 'Saving...' : 'Log Weight'}
              </button>
            </div>
          </div>

          {bmiData && (
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-base font-semibold text-white mb-4">Current BMI</h3>
              <div className="text-center py-4">
                <p className={`text-6xl font-bold ${getBMIColor(bmiData.bmi)}`}>{bmiData.bmi}</p>
                <p className={`text-xl font-semibold mt-2 ${getBMIColor(bmiData.bmi)}`}>{bmiData.category}</p>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-4">
                <span>Underweight<br />&lt;18.5</span>
                <span>Normal<br />18.5–24.9</span>
                <span>Overweight<br />25–29.9</span>
                <span>Obese<br />&ge;30</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-red-500" />
            </div>
          )}
        </div>
      </section>

      {/* ─── WEIGHT CHART ──────────────────────────────────────────────── */}
      {logs.length > 1 && (
        <section className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h3 className="text-base font-semibold text-white mb-4">Weight History</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={logs}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
              <YAxis stroke="#9CA3AF" tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
              <Line type="monotone" dataKey="weightKg" stroke="#F97316" strokeWidth={2.5} dot={{ r: 4, fill: '#F97316' }} name="Weight (kg)" />
            </LineChart>
          </ResponsiveContainer>
        </section>
      )}

      {/* ─── ACHIEVEMENTS ─────────────────────────────────────────────── */}
      <section className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-orange-400" />
          Achievements
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ACHIEVEMENTS.map(a => {
            const earned = logs.length >= a.threshold;
            return (
              <div key={a.id} className={`rounded-xl border p-4 text-center transition-all ${earned ? 'border-orange-500 bg-orange-500/10' : 'border-gray-700 opacity-50'}`}>
                <div className="text-3xl mb-2">{a.icon}</div>
                <p className="font-semibold text-white text-sm">{a.name}</p>
                <p className="text-xs text-gray-400 mt-1">{a.desc}</p>
                {earned && <p className="text-xs text-orange-400 mt-2 font-semibold">&#10003; Earned!</p>}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
