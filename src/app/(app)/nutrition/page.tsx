'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { DailyLog, DayFoodItem } from '@/lib/types';
import ProgressBar from '@/components/ui/ProgressBar';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Apple, Utensils, Droplets, Flame, Sparkles, ArrowRight, Plus } from 'lucide-react';

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function NutritionPage() {
  const { user } = useAuth();
  const { profile } = useUser();
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);
  const [loaded, setLoaded] = useState(false);

  const m = profile?.macros;

  // Load today's log
  useEffect(() => {
    if (!user) return;
    const today = todayStr();
    try {
      const cached = localStorage.getItem(`gymfrek_logs_${user.uid}`);
      if (cached) {
        const map = JSON.parse(cached) as Record<string, DailyLog>;
        if (map[today]) {
          setTodayLog(map[today]);
          setLoaded(true);
        }
      }
    } catch { /* */ }

    getDoc(doc(db, 'dailyLogs', `${user.uid}_${today}`))
      .then(snap => {
        if (snap.exists()) setTodayLog(snap.data() as DailyLog);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [user]);

  const handleAddWater = async (ml: number) => {
    if (!user) return;
    const today = todayStr();
    const currentWater = todayLog?.waterMl ?? 0;
    const newWater = Math.max(0, currentWater + ml);
    const updated: DailyLog = {
      id: `${user.uid}_${today}`,
      uid: user.uid,
      date: today,
      attendance: todayLog?.attendance || 'none',
      foods: todayLog?.foods || [],
      totalCalories: todayLog?.totalCalories || 0,
      totalProtein: todayLog?.totalProtein || 0,
      totalCarbs: todayLog?.totalCarbs || 0,
      totalFat: todayLog?.totalFat || 0,
      totalFiber: todayLog?.totalFiber || 0,
      growthScore: todayLog?.growthScore || 0,
      waterMl: newWater,
      updatedAt: new Date().toISOString(),
    };

    setTodayLog(updated);

    try {
      const cacheKey = `gymfrek_logs_${user.uid}`;
      const cached = localStorage.getItem(cacheKey);
      const map = cached ? JSON.parse(cached) : {};
      map[today] = updated;
      localStorage.setItem(cacheKey, JSON.stringify(map));
    } catch { /* */ }

    try {
      await setDoc(doc(db, 'dailyLogs', `${user.uid}_${today}`), updated, { merge: true });
    } catch (e) {
      console.error(e);
    }
  };

  const pieData = m
    ? [
        { name: 'Protein', value: m.protein * 4, color: '#F97316' },
        { name: 'Carbs', value: m.carbs * 4, color: '#3B82F6' },
        { name: 'Fat', value: m.fat * 9, color: '#EAB308' },
      ]
    : [];

  const todayKcal = todayLog?.totalCalories ?? 0;
  const todayProtein = todayLog?.totalProtein ?? 0;
  const todayCarbs = todayLog?.totalCarbs ?? 0;
  const todayFat = todayLog?.totalFat ?? 0;
  const todayFiber = todayLog?.totalFiber ?? 0;
  const todayWater = todayLog?.waterMl ?? 0;

  // Group meals
  const mealGroups: Record<'breakfast' | 'lunch' | 'dinner' | 'snack', DayFoodItem[]> = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  };

  if (todayLog?.foods) {
    todayLog.foods.forEach(f => {
      if (mealGroups[f.mealType]) mealGroups[f.mealType].push(f);
      else mealGroups.snack.push(f);
    });
  }

  const mealOrder = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Apple className="w-7 h-7 text-orange-500" />
            Nutrition Planner &amp; Macro Tracker
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Personalized daily macro targets with live tracking of today&apos;s food &amp; hydration.
          </p>
        </div>

        <Link
          href="/nutrition/food-calculator"
          className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-xs shadow-md shadow-orange-500/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log Food via AI Calculator</span>
        </Link>
      </div>

      {!m ? (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center">
          <p className="text-gray-400 mb-4">Complete your profile to see nutrition targets.</p>
          <Link
            href="/onboarding"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
          >
            Complete Profile
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Today's Intake vs Targets */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 sm:p-6 space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-400" />
                Today&apos;s Intake vs Daily Targets
              </h2>
              {todayKcal > 0 && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-orange-500/15 text-orange-300 border border-orange-500/30">
                  {todayKcal} / {m.calories} kcal
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
              {[
                { label: 'Calories', current: todayKcal, target: m.calories, unit: 'kcal', color: 'text-orange-400' },
                { label: 'Protein', current: todayProtein, target: m.protein, unit: 'g', color: 'text-blue-400' },
                { label: 'Carbs', current: todayCarbs, target: m.carbs, unit: 'g', color: 'text-yellow-400' },
                { label: 'Fat', current: todayFat, target: m.fat, unit: 'g', color: 'text-purple-400' },
                { label: 'Fiber', current: todayFiber, target: m.fiber, unit: 'g', color: 'text-emerald-400' },
                { label: 'Water', current: todayWater, target: m.water, unit: 'ml', color: 'text-sky-400' },
              ].map(s => (
                <div key={s.label} className="bg-gray-700/80 border border-gray-650 rounded-xl p-2.5 sm:p-3 text-center">
                  <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider font-semibold">{s.label}</p>
                  <p className={`text-base sm:text-lg font-extrabold ${s.color} mt-0.5`}>
                    {s.current}
                    <span className="text-[10px] sm:text-xs text-gray-400 font-normal"> / {s.target} {s.unit}</span>
                  </p>
                </div>
              ))}
            </div>

            {/* Live Progress Bars */}
            <div className="space-y-2.5 sm:space-y-3 pt-2">
              <ProgressBar label={`Protein: ${todayProtein}g / ${m.protein}g target`} value={todayProtein} max={m.protein} color="orange" showLabel />
              <ProgressBar label={`Carbs: ${todayCarbs}g / ${m.carbs}g target`} value={todayCarbs} max={m.carbs} color="blue" showLabel />
              <ProgressBar label={`Fat: ${todayFat}g / ${m.fat}g target`} value={todayFat} max={m.fat} color="yellow" showLabel />
              <ProgressBar label={`Fiber: ${todayFiber}g / ${m.fiber}g target`} value={todayFiber} max={m.fiber} color="green" showLabel />
              <ProgressBar label={`Water: ${todayWater}ml / ${m.water}ml target`} value={todayWater} max={m.water} color="blue" showLabel />
            </div>

            {/* Quick 1-Tap Water Logging */}
            <div className="flex items-center justify-between gap-2 p-2.5 bg-gray-750/70 rounded-xl border border-gray-700">
              <span className="text-[11px] text-gray-300 font-semibold flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-sky-400" /> Quick Add Water:
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAddWater(250)}
                  className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 transition-colors"
                >
                  +250ml
                </button>
                <button
                  type="button"
                  onClick={() => handleAddWater(500)}
                  className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-200 transition-colors"
                >
                  +500ml
                </button>
                <button
                  type="button"
                  onClick={() => handleAddWater(1000)}
                  className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-sky-500/25 hover:bg-sky-500/35 border border-sky-500/50 text-white transition-colors"
                >
                  +1L
                </button>
                {todayWater > 0 && (
                  <button
                    type="button"
                    onClick={() => handleAddWater(-250)}
                    className="text-[10px] text-gray-400 hover:text-white px-2 py-1 rounded-lg bg-gray-700 hover:bg-gray-650 transition-colors"
                    title="Undo 250ml"
                  >
                    -250ml
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Calorie Distribution Chart */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 sm:p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white mb-1 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-400" />
                Target Calorie Macro Distribution
              </h2>
              <p className="text-xs text-gray-400 mb-3">Optimal breakdown calculated based on your profile goals.</p>
            </div>

            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }: { name?: string; percent?: number }) =>
                    `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={v => [`${v} kcal`]}
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>

            <div className="pt-2 border-t border-gray-700/60 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-1.5 bg-gray-900/40 rounded-lg">
                <span className="text-orange-400 font-bold block">{m.protein * 4} kcal</span>
                <span className="text-[10px] text-gray-400">Protein (4 kcal/g)</span>
              </div>
              <div className="p-1.5 bg-gray-900/40 rounded-lg">
                <span className="text-blue-400 font-bold block">{m.carbs * 4} kcal</span>
                <span className="text-[10px] text-gray-400">Carbs (4 kcal/g)</span>
              </div>
              <div className="p-1.5 bg-gray-900/40 rounded-lg">
                <span className="text-yellow-400 font-bold block">{m.fat * 9} kcal</span>
                <span className="text-[10px] text-gray-400">Fat (9 kcal/g)</span>
              </div>
            </div>
          </div>

          {/* Today's Logged Foods List */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 sm:p-6 lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-orange-400" />
                  Today&apos;s Meal Breakdown
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Summary of food and calories recorded for today.</p>
              </div>

              <Link
                href="/calendar"
                className="text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1"
              >
                <span>Edit on Calendar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {(!todayLog || !todayLog.foods || todayLog.foods.length === 0) ? (
              <div className="bg-gray-750/70 rounded-xl p-8 text-center space-y-3 border border-gray-700">
                <Utensils className="w-8 h-8 text-gray-500 mx-auto" />
                <h4 className="text-sm font-semibold text-gray-200">No meals logged today yet</h4>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Log your meals using our Indian food database or natural language AI search to see your real-time breakdown here.
                </p>
                <Link
                  href="/nutrition/food-calculator"
                  className="inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Search &amp; Log Foods
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {mealOrder.map(meal => {
                  const items = mealGroups[meal];
                  const mealKcal = items.reduce((acc, f) => acc + f.calories, 0);
                  const mealProtein = Math.round(items.reduce((acc, f) => acc + f.protein, 0) * 10) / 10;

                  return (
                    <div key={meal} className="bg-gray-750/60 border border-gray-700 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between border-b border-gray-700/60 pb-1.5">
                        <span className="text-xs font-bold text-white capitalize">{meal}</span>
                        <span className="text-[11px] font-extrabold text-orange-400">{mealKcal} kcal</span>
                      </div>

                      {items.length === 0 ? (
                        <p className="text-[11px] text-gray-500 italic py-2">Nothing logged</p>
                      ) : (
                        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                          {items.map(item => (
                            <div key={item.id} className="text-[11px] bg-gray-800/80 p-2 rounded-lg border border-gray-700/50">
                              <p className="font-semibold text-gray-200 truncate">{item.name}</p>
                              <div className="flex items-center justify-between text-[10px] text-gray-400 mt-0.5">
                                <span className="text-orange-300 font-bold">{item.calories} kcal</span>
                                <span>{item.protein}g protein</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {items.length > 0 && (
                        <p className="text-[10px] text-gray-400 pt-1 border-t border-gray-700/40 text-right">
                          Total Protein: <strong className="text-blue-300">{mealProtein}g</strong>
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* BMR/TDEE Info */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 sm:p-6 lg:col-span-2">
            <h2 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">Your Metabolic Stats</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
              {[
                { label: 'BMR', value: profile.bmr, unit: 'kcal/day', desc: 'Basal metabolic burn at complete rest' },
                { label: 'TDEE', value: profile.tdee, unit: 'kcal/day', desc: 'Total daily expenditure with activity' },
                { label: 'Activity', value: profile.activityLevel?.replace('_', ' '), unit: '', desc: 'Activity multiplier' },
                { label: 'Goal', value: profile.goal?.replace('_', ' '), unit: '', desc: 'Strategy direction' },
              ].map(s => (
                <div key={s.label} className="bg-gray-700/70 border border-gray-650 rounded-xl p-3 sm:p-4">
                  <p className="text-[11px] sm:text-xs text-gray-400 font-medium">{s.label}</p>
                  <p className="text-base sm:text-lg font-bold text-white mt-0.5 sm:mt-1 capitalize">
                    {s.value} <span className="text-[10px] sm:text-xs text-gray-400 font-normal">{s.unit}</span>
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
