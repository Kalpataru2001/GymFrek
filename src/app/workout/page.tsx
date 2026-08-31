'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { generateWorkoutPlan, WorkoutPlan, FitnessLevel, Goal, Equipment } from '@/lib/workout-engine';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Badge from '@/components/ui/Badge';
import { RefreshCw, Dumbbell } from 'lucide-react';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

export default function WorkoutPage() {
  const { user } = useAuth();
  const { profile } = useUser();
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeDay, setActiveDay] = useState(0);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [level, setLevel] = useState<FitnessLevel>('beginner');
  const [goal, setGoal] = useState<Goal>('maintain');
  const [equipment, setEquipment] = useState<Equipment>('full_gym');

  useEffect(() => {
    if (!user) return;
    const today = new Date().getDay();
    setActiveDay(today === 0 ? 6 : today - 1);
    getDoc(doc(db, 'workoutPlans', user.uid)).then(snap => {
      if (snap.exists()) setPlan(snap.data() as WorkoutPlan);
      setLoading(false);
    });
    if (profile) {
      setLevel((profile.fitnessLevel as FitnessLevel) || 'beginner');
      setGoal((profile.goal as Goal) || 'maintain');
      setEquipment((profile.equipment as Equipment) || 'full_gym');
    }
  }, [user, profile]);

  const generate = async () => {
    if (!user) return;
    setGenerating(true);
    const newPlan = generateWorkoutPlan(level, goal, equipment);
    await setDoc(doc(db, 'workoutPlans', user.uid), newPlan);
    setPlan(newPlan);
    setGenerating(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg"/></div>;

  const workoutDays = plan?.schedule.filter(d => !d.isRestDay) ?? [];
  const allDays = plan?.schedule ?? [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Dumbbell className="w-7 h-7 text-orange-400"/>Workout Plan</h1>
          {plan && <p className="text-gray-400 mt-1">{plan.planType} · {plan.daysPerWeek} days/week · <span className="capitalize">{plan.level}</span></p>}
        </div>
        {plan && (
          <button onClick={generate} disabled={generating} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white border border-gray-600 hover:border-gray-500 px-3 py-2 rounded-lg transition-colors disabled:opacity-50">
            <RefreshCw className="w-4 h-4"/>{generating ? 'Generating...' : 'Regenerate'}
          </button>
        )}
      </div>

      {!plan ? (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 max-w-lg mx-auto space-y-6">
          <h2 className="text-xl font-semibold text-white text-center">Generate Your Workout Plan</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Experience Level</label>
              <div className="grid grid-cols-3 gap-2">
                {(['beginner','intermediate','advanced'] as FitnessLevel[]).map(l=>(
                  <button key={l} onClick={()=>setLevel(l)} className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors capitalize ${level===l?'bg-orange-500 border-orange-500 text-white':'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'}`}>{l}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Your Goal</label>
              <select value={goal} onChange={e=>setGoal(e.target.value as Goal)} className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500">
                <option value="lose_weight">Lose Weight</option>
                <option value="maintain">Maintain Fitness</option>
                <option value="gain_muscle">Gain Muscle</option>
                <option value="improve_fitness">Improve Fitness</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Available Equipment</label>
              <div className="grid grid-cols-1 gap-2">
                {([['full_gym','🏋️ Full Gym'],['dumbbells_only','🪙 Dumbbells Only'],['no_equipment','🧘 Bodyweight Only']] as [Equipment,string][]).map(([v,l])=>(
                  <button key={v} onClick={()=>setEquipment(v)} className={`py-2.5 px-4 rounded-lg text-sm font-medium border transition-colors text-left ${equipment===v?'bg-orange-500 border-orange-500 text-white':'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'}`}>{l}</button>
                ))}
              </div>
            </div>
          </div>
          <button onClick={generate} disabled={generating} className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors">
            {generating ? 'Generating Your Plan...' : '⚡ Generate My Workout Plan'}
          </button>
        </div>
      ) : (
        <>
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg px-4 py-3">
            <p className="text-sm text-orange-300">💡 <strong>Weekly Tip:</strong> {plan.weeklyProgressionNote}</p>
          </div>
          {/* Day tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {allDays.map((day, idx) => (
              <button key={day.day} onClick={()=>setActiveDay(idx)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${day.isRestDay?'opacity-50':''} ${activeDay===idx?'bg-orange-500 text-white':'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'}`}>
                {day.day.slice(0,3)}
                {!day.isRestDay && <span className="block text-xs opacity-70">{day.focus.split('/')[0]}</span>}
                {day.isRestDay && <span className="block text-xs opacity-70">Rest</span>}
              </button>
            ))}
          </div>

          {/* Day detail */}
          {allDays[activeDay] && (
            allDays[activeDay].isRestDay ? (
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-10 text-center">
                <div className="text-5xl mb-4">😴</div>
                <h3 className="text-xl font-semibold text-white">Rest Day</h3>
                <p className="text-gray-400 mt-2">Recovery is just as important as training. Rest, hydrate, and stretch!</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-white">{allDays[activeDay].day} — {allDays[activeDay].focus}</h3>
                  <Badge variant="orange">{allDays[activeDay].exercises.length} exercises</Badge>
                </div>
                {allDays[activeDay].exercises.map((ex, i) => (
                  <div key={i} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                    <button onClick={()=>setExpandedExercise(expandedExercise===`${activeDay}-${i}`?null:`${activeDay}-${i}`)}
                      className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-750 transition-colors">
                      <div className="flex items-center gap-4">
                        <span className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-sm font-bold">{i+1}</span>
                        <div>
                          <p className="font-semibold text-white">{ex.name}</p>
                          <p className="text-sm text-gray-400">{ex.sets} sets × {ex.reps} reps · Rest: {ex.rest}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="blue">{ex.muscleGroup}</Badge>
                        <span className="text-gray-500 text-lg">{expandedExercise===`${activeDay}-${i}`?'▲':'▼'}</span>
                      </div>
                    </button>
                    {expandedExercise===`${activeDay}-${i}` && (
                      <div className="px-5 pb-5 border-t border-gray-700 pt-4">
                        <p className="text-sm text-gray-300 leading-relaxed">{ex.instructions}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}
