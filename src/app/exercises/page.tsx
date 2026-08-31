'use client';
import { useState, useMemo } from 'react';
import { generateWorkoutPlan, Exercise } from '@/lib/workout-engine';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { Search } from 'lucide-react';

// Extract all unique exercises from all plans
const getAllExercises = (): Exercise[] => {
  const plans = ['beginner','intermediate','advanced'].flatMap(level=>
    ['full_gym','dumbbells_only','no_equipment'].map(eq=>
      generateWorkoutPlan(level as 'beginner'|'intermediate'|'advanced', 'maintain', eq as 'full_gym'|'dumbbells_only'|'no_equipment')
    )
  );
  const seen = new Set<string>();
  return plans.flatMap(p=>p.schedule.flatMap(d=>d.exercises)).filter(e=>{
    if(seen.has(e.name))return false;
    seen.add(e.name);return true;
  });
};

const EXERCISES = getAllExercises();
const MUSCLES = ['All',...new Set(EXERCISES.map(e=>e.muscleGroup))];
const DIFFICULTIES: string[] = ['All','beginner','intermediate','advanced'];

const diffColor: Record<string,string> = {beginner:'green',intermediate:'yellow',advanced:'red'};

export default function ExercisesPage() {
  const [search,setSearch]=useState('');
  const [muscle,setMuscle]=useState('All');
  const [diff,setDiff]=useState('All');
  const [selected,setSelected]=useState<Exercise|null>(null);

  const filtered=useMemo(()=>EXERCISES.filter(e=>
    (muscle==='All'||e.muscleGroup===muscle)&&
    (diff==='All'||e.difficulty===diff)&&
    (search===''||e.name.toLowerCase().includes(search.toLowerCase()))
  ),[search,muscle,diff]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">💪 Exercise Library</h1>
        <p className="text-gray-400 mt-1">{EXERCISES.length}+ exercises with instructions</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search exercises..."
            className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-400 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-orange-500"/>
        </div>
        <select value={muscle} onChange={e=>setMuscle(e.target.value)} className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500">
          {MUSCLES.map(m=><option key={m} value={m}>{m}</option>)}
        </select>
        <select value={diff} onChange={e=>setDiff(e.target.value)} className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500">
          {DIFFICULTIES.map(d=><option key={d} value={d} className="capitalize">{d==='All'?'All Levels':d}</option>)}
        </select>
      </div>

      <p className="text-sm text-gray-400">{filtered.length} exercise{filtered.length!==1?'s':''} found</p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((ex,i)=>(
          <button key={i} onClick={()=>setSelected(ex)} className="bg-gray-800 rounded-xl border border-gray-700 hover:border-orange-500/50 p-5 text-left transition-all group">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-white text-sm leading-tight group-hover:text-orange-400 transition-colors">{ex.name}</h3>
              <Badge variant={(diffColor[ex.difficulty]||'gray') as 'green'|'yellow'|'red'} className="ml-2 flex-shrink-0 capitalize">{ex.difficulty}</Badge>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="blue">{ex.muscleGroup}</Badge>
            </div>
            <p className="text-xs text-gray-400">{ex.sets} sets × {ex.reps} reps · Rest {ex.rest}</p>
          </button>
        ))}
      </div>

      <Modal isOpen={!!selected} onClose={()=>setSelected(null)} title={selected?.name??''} size="lg">
        {selected&&(
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="blue">{selected.muscleGroup}</Badge>
              <Badge variant={(diffColor[selected.difficulty]||'gray') as 'green'|'yellow'|'red'} className="capitalize">{selected.difficulty}</Badge>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-700 rounded-lg p-3 text-center"><p className="text-xs text-gray-400">Sets</p><p className="text-xl font-bold text-white">{selected.sets}</p></div>
              <div className="bg-gray-700 rounded-lg p-3 text-center"><p className="text-xs text-gray-400">Reps</p><p className="text-xl font-bold text-white">{selected.reps}</p></div>
              <div className="bg-gray-700 rounded-lg p-3 text-center"><p className="text-xs text-gray-400">Rest</p><p className="text-xl font-bold text-white">{selected.rest}</p></div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-2">How to perform:</h4>
              <p className="text-sm text-gray-300 leading-relaxed">{selected.instructions}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
