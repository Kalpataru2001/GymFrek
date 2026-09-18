'use client';
import { useState, useMemo } from 'react';
import type { DailyLog } from '@/lib/types';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  logsMap: Record<string, DailyLog>;
  allDates: string[]; // all 30 days, oldest first
  targets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

type MacroKey = 'calories' | 'protein' | 'carbs' | 'fat';

interface MacroConfig {
  key: MacroKey;
  label: string;
  logKey: keyof Pick<DailyLog, 'totalCalories' | 'totalProtein' | 'totalCarbs' | 'totalFat'>;
  color: string;
  unit: string;
}

const MACROS: MacroConfig[] = [
  { key: 'calories', label: 'Calories', logKey: 'totalCalories', color: '#f97316', unit: 'kcal' },
  { key: 'protein',  label: 'Protein',  logKey: 'totalProtein',  color: '#3b82f6', unit: 'g' },
  { key: 'carbs',    label: 'Carbs',    logKey: 'totalCarbs',    color: '#eab308', unit: 'g' },
  { key: 'fat',      label: 'Fat',      logKey: 'totalFat',      color: '#a855f7', unit: 'g' },
];

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-3 shadow-xl text-xs space-y-1">
      <p className="text-gray-400 font-medium mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-gray-300">{p.name}</span>
          </span>
          <span className="font-bold text-white">{Math.round(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Card ────────────────────────────────────────────────────────────────

export default function MacroTrendCard({ logsMap, allDates, targets }: Props) {
  const [range, setRange] = useState<7 | 30>(7);
  const [visibleMacros, setVisibleMacros] = useState<Set<MacroKey>>(
    new Set(['calories', 'protein'])
  );

  const toggleMacro = (key: MacroKey) => {
    setVisibleMacros(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 1) next.delete(key); // keep at least 1
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Build chart data
  const chartData = useMemo(() => {
    const dates = allDates.slice(-range);
    return dates.map(date => {
      const log = logsMap[date];
      const parts = date.split('-');
      const label = parts.length === 3
        ? new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
            .toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : date;
      return {
        date: label,
        calories: log?.totalCalories ?? 0,
        protein:  log?.totalProtein  ?? 0,
        carbs:    log?.totalCarbs    ?? 0,
        fat:      log?.totalFat      ?? 0,
      };
    });
  }, [logsMap, allDates, range]);

  // For secondary Y-axis: calories on left, macros in g on right
  // We use a single Y-axis but scale. Simpler: use two separate charts stacked.
  // Best UX: show one selected macro at a time with reference line, or show all with normalized.
  // Decision: Show all selected macros, calories on its own scale (left), others on right.
  // recharts supports dual Y-axis.

  const hasCalories = visibleMacros.has('calories');
  const hasGrams = ['protein', 'carbs', 'fat'].some(k => visibleMacros.has(k as MacroKey));

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-orange-400" />
          Macro Trends
        </h2>
        {/* Range toggle */}
        <div className="flex items-center gap-1 bg-gray-900 rounded-lg p-0.5 border border-gray-700">
          {([7, 30] as const).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${
                range === r
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {r} Days
            </button>
          ))}
        </div>
      </div>

      {/* Macro toggle buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {MACROS.map(m => {
          const active = visibleMacros.has(m.key);
          return (
            <button
              key={m.key}
              onClick={() => toggleMacro(m.key)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                active
                  ? 'border-transparent text-white'
                  : 'border-gray-700 text-gray-500 bg-transparent hover:border-gray-500'
              }`}
              style={active ? { backgroundColor: m.color + '33', borderColor: m.color + '66', color: m.color } : {}}
            >
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: active ? m.color : '#4b5563' }}
              />
              {m.label}
              <span className="text-[10px] opacity-70">({m.unit})</span>
            </button>
          );
        })}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={chartData} margin={{ top: 8, right: hasGrams && hasCalories ? 40 : 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="date"
            stroke="#6b7280"
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            interval={range === 7 ? 0 : Math.floor(chartData.length / 6)}
          />

          {/* Left Y-axis: calories */}
          {hasCalories && (
            <YAxis
              yAxisId="left"
              stroke="#6b7280"
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              domain={['auto', 'auto']}
              width={40}
            />
          )}

          {/* Right Y-axis: grams */}
          {hasGrams && (
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#6b7280"
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              domain={['auto', 'auto']}
              width={36}
            />
          )}

          {/* Fallback single Y-axis if only grams or only calories */}
          {!hasCalories && !hasGrams && (
            <YAxis yAxisId="left" stroke="#6b7280" tick={{ fontSize: 10, fill: '#9ca3af' }} width={40} />
          )}

          <Tooltip content={<CustomTooltip />} />

          {/* Reference lines for targets */}
          {visibleMacros.has('calories') && (
            <ReferenceLine
              yAxisId="left"
              y={targets.calories}
              stroke="#f97316"
              strokeDasharray="4 3"
              strokeOpacity={0.5}
            />
          )}
          {visibleMacros.has('protein') && (
            <ReferenceLine
              yAxisId="right"
              y={targets.protein}
              stroke="#3b82f6"
              strokeDasharray="4 3"
              strokeOpacity={0.5}
            />
          )}
          {visibleMacros.has('carbs') && (
            <ReferenceLine
              yAxisId="right"
              y={targets.carbs}
              stroke="#eab308"
              strokeDasharray="4 3"
              strokeOpacity={0.5}
            />
          )}
          {visibleMacros.has('fat') && (
            <ReferenceLine
              yAxisId="right"
              y={targets.fat}
              stroke="#a855f7"
              strokeDasharray="4 3"
              strokeOpacity={0.5}
            />
          )}

          {/* Lines */}
          {visibleMacros.has('calories') && (
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="calories"
              stroke="#f97316"
              strokeWidth={2}
              dot={{ r: range === 7 ? 4 : 2, fill: '#f97316' }}
              activeDot={{ r: 5 }}
              name="Calories"
              connectNulls={false}
            />
          )}
          {visibleMacros.has('protein') && (
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="protein"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: range === 7 ? 4 : 2, fill: '#3b82f6' }}
              activeDot={{ r: 5 }}
              name="Protein"
              connectNulls={false}
            />
          )}
          {visibleMacros.has('carbs') && (
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="carbs"
              stroke="#eab308"
              strokeWidth={2}
              dot={{ r: range === 7 ? 4 : 2, fill: '#eab308' }}
              activeDot={{ r: 5 }}
              name="Carbs"
              connectNulls={false}
            />
          )}
          {visibleMacros.has('fat') && (
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="fat"
              stroke="#a855f7"
              strokeWidth={2}
              dot={{ r: range === 7 ? 4 : 2, fill: '#a855f7' }}
              activeDot={{ r: 5 }}
              name="Fat"
              connectNulls={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      {/* Target legend */}
      <div className="flex items-center gap-4 flex-wrap text-[10px] text-gray-500">
        <span className="flex items-center gap-1">
          <span className="inline-block w-5 border-t border-dashed border-gray-500" />
          Dashed = daily target
        </span>
        {MACROS.filter(m => visibleMacros.has(m.key)).map(m => (
          <span key={m.key} className="flex items-center gap-1" style={{ color: m.color }}>
            <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
            Target: {m.key === 'calories' ? targets.calories : targets[m.key]}{m.unit}
          </span>
        ))}
      </div>
    </div>
  );
}
