'use client';
import { useState, useMemo } from 'react';
import { generateWorkoutPlan, Exercise } from '@/lib/workout-engine';
import Badge from '@/components/ui/Badge';
import ExerciseVisualModal from '@/components/exercises/ExerciseVisualModal';
import { Search, Play, Dumbbell, Sparkles, Filter } from 'lucide-react';

const getAllExercises = (): Exercise[] => {
  const plans = ['beginner', 'intermediate', 'advanced'].flatMap(level =>
    ['full_gym', 'dumbbells_only', 'no_equipment'].map(eq =>
      generateWorkoutPlan(
        level as 'beginner' | 'intermediate' | 'advanced',
        'maintain',
        eq as 'full_gym' | 'dumbbells_only' | 'no_equipment'
      )
    )
  );
  const seen = new Set<string>();
  return plans.flatMap(p => p.schedule.flatMap(d => d.exercises)).filter(e => {
    if (seen.has(e.name)) return false;
    seen.add(e.name);
    return true;
  });
};

const EXERCISES = getAllExercises();
const MUSCLES = ['All', ...Array.from(new Set(EXERCISES.map(e => e.muscleGroup)))];
const DIFFICULTIES: string[] = ['All', 'beginner', 'intermediate', 'advanced'];

const diffColor: Record<string, 'green' | 'yellow' | 'red' | 'gray'> = {
  beginner: 'green',
  intermediate: 'yellow',
  advanced: 'red',
};

export default function ExercisesPage() {
  const [search, setSearch] = useState('');
  const [muscle, setMuscle] = useState('All');
  const [diff, setDiff] = useState('All');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const filtered = useMemo(() => EXERCISES.filter(e =>
    (muscle === 'All' || e.muscleGroup === muscle) &&
    (diff === 'All' || e.difficulty === diff) &&
    (search === '' || e.name.toLowerCase().includes(search.toLowerCase()) || e.muscleGroup.toLowerCase().includes(search.toLowerCase()))
  ), [search, muscle, diff]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Dumbbell className="w-7 h-7 text-orange-500" />
            Exercise Library & Video Form Guides
          </h1>
          <p className="text-gray-400 mt-1">
            Watch HD exercise demonstrations, learn proper technique, and target the right muscles.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 bg-gray-800 border border-gray-700 px-3.5 py-1.5 rounded-xl text-xs text-orange-400 font-semibold">
          <Play className="w-3.5 h-3.5" />
          Click any card to watch video guide
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-gray-800/80 p-4 rounded-xl border border-gray-700">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search exercise by name or muscle (e.g. bench press, squat, lats)..."
            className="w-full bg-gray-700/80 border border-gray-600 text-white placeholder-gray-400 rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-orange-500"
          />
        </div>

        <select
          value={muscle}
          onChange={e => setMuscle(e.target.value)}
          className="bg-gray-700/80 border border-gray-600 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-orange-500"
        >
          {MUSCLES.map(m => (
            <option key={m} value={m}>{m === 'All' ? 'All Muscle Groups' : m}</option>
          ))}
        </select>

        <select
          value={diff}
          onChange={e => setDiff(e.target.value)}
          className="bg-gray-700/80 border border-gray-600 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-orange-500 capitalize"
        >
          {DIFFICULTIES.map(d => (
            <option key={d} value={d} className="capitalize">{d === 'All' ? 'All Experience Levels' : d}</option>
          ))}
        </select>
      </div>

      <p className="text-xs text-gray-400">{filtered.length} exercise{filtered.length !== 1 ? 's' : ''} found</p>

      {/* Exercise Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((ex, i) => (
          <button
            key={i}
            onClick={() => setSelectedExercise(ex)}
            className="bg-gray-800 rounded-xl border border-gray-700 hover:border-orange-500/70 p-5 text-left transition-all duration-200 group hover:scale-[1.01] hover:shadow-lg hover:shadow-orange-500/10 flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <h3 className="font-bold text-white text-sm leading-tight group-hover:text-orange-400 transition-colors">
                  {ex.name}
                </h3>
                <Badge variant={diffColor[ex.difficulty] || 'gray'} className="capitalize flex-shrink-0 text-[10px]">
                  {ex.difficulty}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-2">
                <Badge variant="blue" className="text-[10px]">{ex.muscleGroup}</Badge>
                {ex.equipment && (
                  <span className="text-[10px] text-gray-400 bg-gray-700/60 px-2 py-0.5 rounded">
                    {ex.equipment}
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                {ex.instructions}
              </p>
            </div>

            <div className="w-full flex items-center justify-between pt-3 border-t border-gray-700/60 text-xs">
              <span className="text-gray-400 font-medium">
                {ex.sets} sets x {ex.reps}
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-orange-400 group-hover:text-orange-300 transition-colors">
                <Play className="w-3.5 h-3.5 fill-orange-500 text-orange-500" /> Watch Video
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Exercise Video & Masterclass Modal */}
      <ExerciseVisualModal
        exercise={selectedExercise}
        isOpen={!!selectedExercise}
        onClose={() => setSelectedExercise(null)}
      />
    </div>
  );
}