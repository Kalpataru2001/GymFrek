'use client';
import { useEffect, useState, useCallback } from 'react';
import type { UserProfile, DailyLog } from '@/lib/types';
import type { WorkoutPlan } from '@/lib/workout-engine';
import type { CoachMessage } from '@/app/api/ai-coach/route';
import { Sparkles, RefreshCw, ChevronRight } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  profile: UserProfile;
  yesterdayLog: DailyLog | null;
  workoutPlan: WorkoutPlan | null;
  todayDow: number; // 0=Sun … 6=Sat
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function cacheKey(uid: string): string {
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return `gymfrek_coach_${uid}_${dateStr}`;
}

// ─── Tone styles ──────────────────────────────────────────────────────────────

const TONE_STYLES = {
  celebrate: {
    border: 'border-emerald-500/40',
    bg: 'bg-emerald-500/5',
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    dot: 'bg-emerald-400',
    badgeLabel: 'Great job!',
  },
  motivate: {
    border: 'border-orange-500/40',
    bg: 'bg-orange-500/5',
    badge: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
    dot: 'bg-orange-400',
    badgeLabel: 'Today\'s focus',
  },
  correct: {
    border: 'border-blue-500/40',
    bg: 'bg-blue-500/5',
    badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    dot: 'bg-blue-400',
    badgeLabel: 'Action needed',
  },
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 space-y-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-700 rounded-xl" />
        <div className="space-y-1.5 flex-1">
          <div className="h-4 bg-gray-700 rounded w-2/3" />
          <div className="h-3 bg-gray-700 rounded w-1/3" />
        </div>
      </div>
      <div className="space-y-2 pt-1">
        <div className="h-3 bg-gray-700 rounded w-full" />
        <div className="h-3 bg-gray-700 rounded w-5/6" />
        <div className="h-3 bg-gray-700 rounded w-4/5" />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DailyCoachCard({ profile, yesterdayLog, workoutPlan, todayDow }: Props) {
  const [message, setMessage] = useState<CoachMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Resolve today's scheduled workout
  const todayWorkout = (() => {
    if (!workoutPlan?.schedule?.length) return null;
    // schedule array is Mon-Sun indexed (0=Mon … 6=Sun), todayDow is 0=Sun…6=Sat
    const idx = todayDow === 0 ? 6 : todayDow - 1;
    const day = workoutPlan.schedule[idx] || null;
    if (!day) return null;
    return {
      focus: day.focus || 'Workout',
      isRest: day.isRestDay,
      exerciseCount: day.exercises?.length ?? 0,
    };
  })();

  const fetchCoach = useCallback(async (forceRefresh = false) => {
    if (!profile?.uid) return;
    setLoading(true);
    setError(false);

    const key = cacheKey(profile.uid);

    // Check cache unless forced
    if (!forceRefresh) {
      try {
        const cached = localStorage.getItem(key);
        if (cached) {
          setMessage(JSON.parse(cached) as CoachMessage);
          setLoading(false);
          return;
        }
      } catch { /* */ }
    }

    try {
      const goal = (profile.goals?.[0] || profile.goal || 'maintain');
      const proteinTarget = profile.macros?.protein ?? 140;
      const calorieTarget = profile.macros?.calories ?? 2000;

      const body = {
        yesterdayLog: yesterdayLog ? {
          totalCalories: yesterdayLog.totalCalories,
          totalProtein: yesterdayLog.totalProtein,
          totalCarbs: yesterdayLog.totalCarbs,
          totalFat: yesterdayLog.totalFat,
          waterMl: yesterdayLog.waterMl,
          attendance: yesterdayLog.attendance,
          foodCount: yesterdayLog.foods?.length ?? 0,
        } : null,
        todayWorkout,
        profile: {
          name: profile.displayName?.split(' ')[0] || 'Champion',
          goal,
          weightKg: profile.weightKg ?? 70,
          proteinTarget,
          calorieTarget,
        },
      };

      const res = await fetch('/api/ai-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('API error');
      const data = await res.json() as { success: boolean; message: CoachMessage };
      if (data.success && data.message) {
        setMessage(data.message);
        try { localStorage.setItem(key, JSON.stringify(data.message)); } catch { /* */ }
      } else {
        throw new Error('Invalid response');
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [profile, yesterdayLog, todayWorkout]);

  useEffect(() => {
    fetchCoach();
  }, [fetchCoach]);

  if (loading) return <Skeleton />;

  if (error || !message) {
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤖</span>
          <p className="text-sm text-gray-400">Could not load your daily tip. <button onClick={() => fetchCoach(true)} className="text-orange-400 underline">Try again</button></p>
        </div>
      </div>
    );
  }

  const tone = TONE_STYLES[message.tone] || TONE_STYLES.motivate;

  return (
    <div className={`rounded-xl border ${tone.border} ${tone.bg} p-5 space-y-4`}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gray-800 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 border border-gray-700">
            {message.emoji}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tone.badge}`}>
                {tone.badgeLabel}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-gray-500">
                <Sparkles className="w-3 h-3" />
                AI Coach
              </span>
            </div>
            <h3 className="text-sm font-bold text-white mt-1 leading-tight">{message.title}</h3>
          </div>
        </div>

        {/* Refresh button */}
        <button
          onClick={() => fetchCoach(true)}
          title="Refresh tip"
          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-700 transition-colors flex-shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Tips */}
      <div className="space-y-2">
        {message.tips.map((tip, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <span className={`inline-block w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${tone.dot}`} />
            <p className="text-xs text-gray-300 leading-relaxed">{tip}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-700/50">
        <p className="text-[10px] text-gray-600">Updated daily based on your logs</p>
        <a href="/progress" className="flex items-center gap-0.5 text-[10px] text-gray-500 hover:text-gray-300 transition-colors">
          View full report <ChevronRight className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
