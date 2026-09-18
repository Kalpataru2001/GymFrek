'use client';
import { useMemo } from 'react';
import type { DailyLog } from '@/lib/types';
import { Flame, Dumbbell, Droplets, Trophy } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  logsMap: Record<string, DailyLog>;
  proteinTarget: number;
  recentDates: string[]; // last 30 days, oldest first
}

interface HabitDay {
  date: string;
  workout: boolean;
  protein: boolean;
  water: boolean;
  allHit: boolean;
  hasData: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function shortLabel(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return '';
  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── Ring ─────────────────────────────────────────────────────────────────────

function HabitRing({
  pct,
  color,
  bg,
  icon,
  label,
  sublabel,
}: {
  pct: number;
  color: string;
  bg: string;
  icon: React.ReactNode;
  label: string;
  sublabel: string;
}) {
  const r = 34;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(pct, 100) / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={r} fill="none" stroke="#1f2937" strokeWidth="8" />
          <circle
            cx="40" cy="40" r={r} fill="none"
            stroke={color} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.7s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center`}>
            {icon}
          </div>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-bold text-white">{Math.round(pct)}%</p>
        <p className="text-xs font-semibold text-gray-300">{label}</p>
        <p className="text-[10px] text-gray-500">{sublabel}</p>
      </div>
    </div>
  );
}

// ─── Main Card ────────────────────────────────────────────────────────────────

export default function StreakHabitCard({ logsMap, proteinTarget, recentDates }: Props) {
  const habitDays: HabitDay[] = useMemo(() =>
    recentDates.map(date => {
      const log = logsMap[date];
      if (!log) return { date, workout: false, protein: false, water: false, allHit: false, hasData: false };
      const workout = log.attendance === 'completed' || log.attendance === 'rest';
      const protein = proteinTarget > 0 && log.totalProtein >= proteinTarget * 0.8;
      const water = log.waterMl >= 1500;
      return { date, workout, protein, water, allHit: workout && protein && water, hasData: true };
    }),
    [logsMap, recentDates, proteinTarget]
  );

  // Streak calculation (from today backwards)
  const { currentStreak, longestStreak } = useMemo(() => {
    const reversed = [...habitDays].reverse();
    let cur = 0;
    for (const d of reversed) {
      if (!d.hasData) break;
      if (d.allHit) cur++;
      else break;
    }
    let longest = 0;
    let running = 0;
    for (const d of habitDays) {
      if (d.hasData && d.allHit) {
        running++;
        if (running > longest) longest = running;
      } else {
        running = 0;
      }
    }
    return { currentStreak: cur, longestStreak: longest };
  }, [habitDays]);

  // Ring percentages (days hit / total days with data)
  const { workoutPct, proteinPct, waterPct, hitCount } = useMemo(() => {
    const total = habitDays.filter(d => d.hasData).length || 1;
    const workoutHit = habitDays.filter(d => d.workout).length;
    const proteinHit = habitDays.filter(d => d.protein).length;
    const waterHit = habitDays.filter(d => d.water).length;
    const allHit = habitDays.filter(d => d.allHit).length;
    return {
      workoutPct: (workoutHit / total) * 100,
      proteinPct: (proteinHit / total) * 100,
      waterPct: (waterHit / total) * 100,
      hitCount: allHit,
    };
  }, [habitDays]);

  // Grid: show last 30 days in 5 rows x 6 cols (oldest at top-left)
  const gridDays = recentDates.slice(-30);
  // Pad to multiple of 6
  const padded: (HabitDay | null)[] = [];
  const offset30 = (6 - (gridDays.length % 6)) % 6;
  for (let i = 0; i < offset30; i++) padded.push(null);
  gridDays.forEach(d => padded.push(habitDays.find(h => h.date === d) ?? null));

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-400" />
          Streak &amp; Habit Rings
        </h2>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-lg">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-orange-300 font-bold">{currentStreak}</span>
            <span className="text-gray-400">day streak</span>
          </div>
          {longestStreak > 0 && (
            <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-lg">
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-yellow-300 font-bold">{longestStreak}</span>
              <span className="text-gray-400">best</span>
            </div>
          )}
        </div>
      </div>

      {/* Rings */}
      <div className="grid grid-cols-3 gap-4 py-2">
        <HabitRing
          pct={workoutPct}
          color="#f97316"
          bg="bg-orange-500/20"
          icon={<Dumbbell className="w-4 h-4 text-orange-400" />}
          label="Workout"
          sublabel="Trained or rested"
        />
        <HabitRing
          pct={proteinPct}
          color="#3b82f6"
          bg="bg-blue-500/20"
          icon={<span className="text-sm">&#127829;</span>}
          label="Protein"
          sublabel="&#8805;80% of target"
        />
        <HabitRing
          pct={waterPct}
          color="#06b6d4"
          bg="bg-cyan-500/20"
          icon={<Droplets className="w-4 h-4 text-cyan-400" />}
          label="Hydration"
          sublabel="&#8805;1500 ml"
        />
      </div>

      {/* Divider */}
      <div className="border-t border-gray-700" />

      {/* 30-day Calendar Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">30-Day Calendar</p>
          <div className="flex items-center gap-3 text-[10px] text-gray-500">
            <span className="flex items-center gap-1">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-orange-500" />
              All habits
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-gray-600" />
              Partial
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-gray-800 border border-gray-700" />
              No data
            </span>
          </div>
        </div>

        <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(6, minmax(0, 1fr))' }}>
          {padded.map((day, i) => {
            if (!day) {
              return <div key={`pad-${i}`} className="aspect-square rounded-md" />;
            }
            const today = day.date === recentDates[recentDates.length - 1];
            const bg = !day.hasData
              ? 'bg-gray-800 border border-gray-700'
              : day.allHit
              ? 'bg-orange-500'
              : day.workout || day.protein || day.water
              ? 'bg-gray-600'
              : 'bg-gray-700';
            return (
              <div
                key={day.date}
                title={`${shortLabel(day.date)}: ${
                  !day.hasData ? 'No data' :
                  day.allHit ? 'All habits hit!' :
                  [day.workout && 'Workout', day.protein && 'Protein', day.water && 'Water']
                    .filter(Boolean).join(', ') || 'None'
                }`}
                className={`aspect-square rounded-md ${bg} ${today ? 'ring-2 ring-white/60' : ''} transition-opacity`}
              />
            );
          })}
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          <span>{recentDates[0] ? shortLabel(recentDates[0]) : ''}</span>
          <span className="text-gray-400 font-medium">
            {hitCount} / {Math.min(30, recentDates.length)} perfect days
          </span>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}
