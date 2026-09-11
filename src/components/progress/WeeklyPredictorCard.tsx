'use client';
import { useMemo } from 'react';
import { Flame, TrendingDown, TrendingUp, Scale, Target, Sparkles, CheckCircle2, AlertCircle, Dumbbell, Moon, Info } from 'lucide-react';
import type { DailyLog, WorkoutAttendance } from '@/lib/types';
import type { WorkoutPlan, WorkoutDay } from '@/lib/workout-engine';
import { calculateDayWorkoutNutrients } from '@/lib/calculations';

interface DayBalance {
  dateStr: string;
  dayLabel: string;
  isToday: boolean;
  hasLog: boolean;
  caloriesIn: number;
  caloriesBurn: number;
  netDiff: number | null; // negative = deficit, positive = surplus
  attendance: WorkoutAttendance;
  isWorkoutDay: boolean;
}

interface WeeklyPredictorProps {
  logsMap: Record<string, DailyLog>;
  recentDates: string[]; // 7 dates ending today
  tdee: number;
  weightKg?: number;
  goals: string[];
  workoutPlan: WorkoutPlan | null;
}

export default function WeeklyPredictorCard({
  logsMap,
  recentDates,
  tdee,
  weightKg = 70,
  goals,
  workoutPlan,
}: WeeklyPredictorProps) {
  const isLoss = goals.includes('lose_weight');
  const isGain = goals.includes('gain_muscle');
  const isRecomp = isLoss && isGain;

  // Compute 7 days breakdown
  const daysData: DayBalance[] = useMemo(() => {
    return recentDates.map(dateStr => {
      const parts = dateStr.split('-');
      const d = parts.length === 3 ? new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])) : new Date();
      const today = new Date();
      const isToday = d.toDateString() === today.toDateString();
      const dayLabel = isToday ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' });

      // Workout scheduled for this day
      let scheduledDay: WorkoutDay | null = null;
      if (workoutPlan?.schedule?.length) {
        const dow = d.getDay();
        scheduledDay = workoutPlan.schedule[dow === 0 ? 6 : dow - 1] || null;
      }

      const log = logsMap[dateStr];
      const attendance = (log?.attendance || 'none') as WorkoutAttendance;
      const caloriesIn = log?.totalCalories ?? 0;
      const hasLog = (log?.foods && log.foods.length > 0) || caloriesIn > 0;

      // Calculate day burn
      let caloriesBurn = tdee;
      if (scheduledDay && !scheduledDay.isRestDay) {
        // Base workout burn estimation
        const baseMacros = { calories: tdee, protein: 140, carbs: 200, fat: 60, fiber: 30 };
        const impact = calculateDayWorkoutNutrients(scheduledDay, baseMacros, weightKg);
        caloriesBurn = tdee + (attendance === 'completed' ? impact.estimatedBurnKcal : Math.round(impact.estimatedBurnKcal * 0.7));
      }

      const netDiff = hasLog ? Math.round(caloriesIn - caloriesBurn) : null;

      return {
        dateStr,
        dayLabel,
        isToday,
        hasLog,
        caloriesIn,
        caloriesBurn,
        netDiff,
        attendance,
        isWorkoutDay: !!(scheduledDay && !scheduledDay.isRestDay),
      };
    });
  }, [recentDates, logsMap, tdee, weightKg, workoutPlan]);

  // Aggregate weekly statistics
  const stats = useMemo(() => {
    const loggedDays = daysData.filter(d => d.hasLog && d.netDiff !== null);
    const loggedCount = loggedDays.length;

    if (loggedCount === 0) {
      return {
        loggedCount: 0,
        totalNet: 0,
        avgDailyNet: 0,
        weeklyPaceKg: 0,
        monthlyPaceKg: 0,
        status: 'insufficient_data',
        statusColor: 'text-gray-400 bg-gray-700',
        statusTitle: 'Log Meals to Reveal Pace',
        advice: 'Log your meals on the Calendar to track your daily calorie balance and projected fat loss pace.',
      };
    }

    const totalNet = loggedDays.reduce((sum, d) => sum + (d.netDiff ?? 0), 0);
    const avgDailyNet = Math.round(totalNet / loggedCount);
    // Project across a 7-day week
    const projectedWeeklyNet = avgDailyNet * 7;
    // 7700 kcal ~= 1 kg of adipose tissue (body fat)
    const weeklyPaceKg = parseFloat((projectedWeeklyNet / 7700).toFixed(2));
    const monthlyPaceKg = parseFloat((weeklyPaceKg * 4).toFixed(2));

    // Determine status based on user goals
    let status = 'neutral';
    let statusColor = 'text-blue-400 bg-blue-500/15 border-blue-500/30';
    let statusTitle = 'Steady Maintenance Pace';
    let advice = '';

    if (isLoss || isRecomp) {
      if (weeklyPaceKg <= -0.25 && weeklyPaceKg >= -0.75) {
        status = 'optimal_loss';
        statusColor = 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';
        statusTitle = 'Optimal Fat Loss Pace';
        advice = `You are maintaining an average ${Math.abs(avgDailyNet)} kcal/day deficit. This rate strips body fat while keeping lean muscle intact.`;
      } else if (weeklyPaceKg < -0.75) {
        status = 'aggressive_loss';
        statusColor = 'text-amber-400 bg-amber-500/15 border-amber-500/30';
        statusTitle = 'Aggressive Deficit';
        advice = `Deficit of ${Math.abs(avgDailyNet)} kcal/day is steep (>0.8 kg/week). Consider adding 200 kcal of clean fuel to prevent fatigue and metabolic slowdown.`;
      } else if (weeklyPaceKg > 0) {
        status = 'surplus_loss_goal';
        statusColor = 'text-red-400 bg-red-500/15 border-red-500/30';
        statusTitle = 'Surplus Detected';
        advice = `Intake averaged +${avgDailyNet} kcal above maintenance. To burn fat, reduce portion sizes slightly or add 15 minutes of cardio.`;
      } else {
        status = 'mild_loss';
        statusColor = 'text-blue-400 bg-blue-500/15 border-blue-500/30';
        statusTitle = 'Mild Calorie Deficit';
        advice = `Gradual deficit of ~${Math.abs(avgDailyNet)} kcal/day. Consistent and easy to maintain long term.`;
      }
    } else if (isGain) {
      if (weeklyPaceKg >= 0.12 && weeklyPaceKg <= 0.35) {
        status = 'optimal_bulk';
        statusColor = 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';
        statusTitle = 'Optimal Lean Bulk Pace';
        advice = `You are in a calibrated +${avgDailyNet} kcal/day surplus. This fuels maximal hypertrophy while keeping fat accumulation low.`;
      } else if (weeklyPaceKg > 0.35) {
        status = 'high_bulk';
        statusColor = 'text-amber-400 bg-amber-500/15 border-amber-500/30';
        statusTitle = 'High Calorie Surplus';
        advice = `Surplus of +${avgDailyNet} kcal/day is higher than needed for muscle protein synthesis and may lead to fat gain. Aim for +250 kcal/day.`;
      } else {
        status = 'deficit_bulk_goal';
        statusColor = 'text-red-400 bg-red-500/15 border-red-500/30';
        statusTitle = 'In Deficit (Bulking Goal)';
        advice = `You are eating below maintenance (${avgDailyNet} kcal). Increase wholesome calorie density (peanut butter, oats, paneer, rice) to grow.`;
      }
    } else {
      advice = `Your intake is within ${Math.abs(avgDailyNet)} kcal of expenditure. Ideal for maintaining body composition and athletic stamina.`;
    }

    return {
      loggedCount,
      totalNet,
      avgDailyNet,
      weeklyPaceKg,
      monthlyPaceKg,
      status,
      statusColor,
      statusTitle,
      advice,
    };
  }, [daysData, isLoss, isGain, isRecomp]);

  const isDeficit = stats.avgDailyNet < 0;

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 space-y-5 shadow-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-750 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            <h3 className="text-base font-bold text-white">7-Day Calorie Balance &amp; Body Predictor</h3>
            <span className="text-[11px] font-bold text-gray-400 bg-gray-700/60 px-2 py-0.5 rounded-full">
              {stats.loggedCount} of 7 Days Logged
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Real-time energy expenditure vs. food logs to project your actual weekly fat loss or muscle gain pace.
          </p>
        </div>

        {stats.loggedCount > 0 && (
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full border self-start sm:self-auto flex items-center gap-1.5 ${stats.statusColor}`}>
            {isDeficit ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
            {stats.statusTitle}
          </span>
        )}
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Card 1: Net Calorie Balance */}
        <div className="bg-gray-900/70 border border-gray-750 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Weekly Net Balance</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="mt-2">
            <p className={`text-2xl font-extrabold ${stats.avgDailyNet < 0 ? 'text-emerald-400' : stats.avgDailyNet > 0 ? 'text-orange-400' : 'text-gray-300'}`}>
              {stats.avgDailyNet > 0 ? `+${stats.avgDailyNet}` : stats.avgDailyNet} <span className="text-xs font-normal text-gray-400">kcal/day</span>
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {stats.totalNet > 0 ? `+${stats.totalNet}` : stats.totalNet} kcal cumulative
            </p>
          </div>
        </div>

        {/* Card 2: Projected Weekly Change */}
        <div className="bg-gray-900/70 border border-gray-750 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Estimated Weekly Pace</span>
            <Scale className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-extrabold text-white">
              {stats.weeklyPaceKg > 0 ? `+${stats.weeklyPaceKg}` : stats.weeklyPaceKg} <span className="text-xs font-normal text-gray-400">kg / wk</span>
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {stats.weeklyPaceKg < 0 ? 'Burning body fat' : stats.weeklyPaceKg > 0 ? 'Gaining mass' : 'Weight stable'}
            </p>
          </div>
        </div>

        {/* Card 3: 4-Week Projection */}
        <div className="bg-gray-900/70 border border-gray-750 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">30-Day Projection</span>
            <Target className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2">
            <p className={`text-2xl font-extrabold ${stats.monthlyPaceKg < 0 ? 'text-emerald-400' : stats.monthlyPaceKg > 0 ? 'text-orange-400' : 'text-gray-300'}`}>
              {stats.monthlyPaceKg > 0 ? `+${stats.monthlyPaceKg}` : stats.monthlyPaceKg} <span className="text-xs font-normal text-gray-400">kg</span>
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Projected change in 4 weeks
            </p>
          </div>
        </div>
      </div>

      {/* 7-Day Day-by-Day Balance Strip */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">7-Day Calorie Expenditure &amp; Balance</h4>
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {daysData.map((d, i) => {
            const hasData = d.hasLog && d.netDiff !== null;
            const isDef = hasData && d.netDiff! < 0;
            const isSur = hasData && d.netDiff! > 0;

            return (
              <div
                key={i}
                className={`rounded-xl p-2 sm:p-2.5 flex flex-col items-center justify-between text-center border transition-all ${
                  d.isToday
                    ? 'bg-gray-900 border-orange-500/60 shadow-md ring-1 ring-orange-500/30'
                    : 'bg-gray-900/50 border-gray-750 hover:border-gray-700'
                }`}
              >
                {/* Day label */}
                <div className="flex items-center gap-1">
                  <span className={`text-[11px] font-bold ${d.isToday ? 'text-orange-400' : 'text-gray-300'}`}>
                    {d.dayLabel}
                  </span>
                  {d.attendance === 'completed' && (
                    <span title="Workout completed">
                      <Dumbbell className="w-3 h-3 text-orange-400" />
                    </span>
                  )}
                  {d.attendance === 'rest' && (
                    <span title="Rest day">
                      <Moon className="w-2.5 h-2.5 text-sky-400" />
                    </span>
                  )}
                </div>

                {/* Calorie in / out */}
                <div className="my-2 space-y-0.5">
                  <p className="text-xs font-bold text-white leading-none">
                    {hasData ? d.caloriesIn : '-'}
                  </p>
                  <p className="text-[9px] text-gray-500 leading-none">
                    / {d.caloriesBurn}
                  </p>
                </div>

                {/* Net pill */}
                {hasData ? (
                  <span
                    className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${
                      isDef
                        ? 'text-emerald-300 bg-emerald-500/20 border border-emerald-500/30'
                        : isSur
                        ? 'text-orange-300 bg-orange-500/20 border border-orange-500/30'
                        : 'text-gray-300 bg-gray-700'
                    }`}
                  >
                    {d.netDiff! > 0 ? `+${d.netDiff}` : d.netDiff}
                  </span>
                ) : (
                  <span className="text-[9px] text-gray-600 bg-gray-800 px-1 py-0.5 rounded">
                    No log
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Smart Coach Insight Banner */}
      <div className="bg-gray-900/60 border border-gray-750 rounded-xl p-3.5 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
        <div className="space-y-1 text-xs">
          <p className="font-semibold text-white">Smart Pace Analysis</p>
          <p className="text-gray-300 leading-relaxed">{stats.advice}</p>
        </div>
      </div>
    </div>
  );
}
