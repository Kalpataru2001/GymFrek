'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { generateWorkoutPlan, WorkoutPlan, FitnessLevel, Goal, Equipment, Exercise } from '@/lib/workout-engine';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Badge from '@/components/ui/Badge';
import ExerciseVisualModal from '@/components/exercises/ExerciseVisualModal';
import { RefreshCw, Dumbbell, Play, ChevronDown, ChevronUp, Layers, Repeat, Clock } from 'lucide-react';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

export default function WorkoutPage() {
  const { user } = useAuth();
  const { profile } = useUser();
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeDay, setActiveDay] = useState(0);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [selectedDemoExercise, setSelectedDemoExercise] = useState<Exercise | null>(null);
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

  const allDays = plan?.schedule ?? [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Dumbbell className="w-7 h-7 text-orange-400" />
            Workout Routine & Video Form
          </h1>
          {plan && (
            <p className="text-gray-400 mt-1">
              {plan.planType} Â· {plan.daysPerWeek} days/week Â· <span className="capitalize">{plan.level}</span>
            </p>
          )}
        </div>
        {plan && (
          <button
            onClick={generate}
            disabled={generating}
            className="flex items-center gap-2 text-xs font-semibold text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 px-3.5 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" />
            {generating ? 'Generating...' : 'Regenerate'}
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
                    ['full_gym', 'ðŸ‹ï¸ Full Gym'],
                    ['dumbbells_only', 'ðŸª™ Dumbbells Only'],
                    ['no_equipment', 'ðŸ§˜ Bodyweight Only'],
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
            {generating ? 'Generating Your Plan...' : 'âš¡ Generate My Workout Plan'}
          </button>
        </div>
      ) : (
        <>
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl px-4 py-3">
            <p className="text-xs text-orange-300">
              ðŸ’¡ <strong>Weekly Progression:</strong> {plan.weeklyProgressionNote}
            </p>
          </div>

          {/* Day tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {allDays.map((day, idx) => (
              <button
                key={day.day}
                onClick={() => setActiveDay(idx)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  day.isRestDay ? 'opacity-60' : ''
                } ${
                  activeDay === idx
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
                }`}
              >
                {day.day.slice(0, 3)}
                {!day.isRestDay && <span className="block text-[10px] opacity-80">{day.focus.split(' (')[0]}</span>}
                {day.isRestDay && <span className="block text-[10px] opacity-80">Rest</span>}
              </button>
            ))}
          </div>

          {/* Day detail */}
          {allDays[activeDay] &&
            (allDays[activeDay].isRestDay ? (
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-10 text-center space-y-2">
                <div className="text-5xl mb-2">ðŸ˜´</div>
                <h3 className="text-lg font-bold text-white">Active Recovery / Rest Day</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Muscles grow during recovery. Eat high protein meals, stay hydrated, and stretch!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    {allDays[activeDay].day} â€” {allDays[activeDay].focus}
                  </h3>
                  <Badge variant="orange" className="text-xs">
                    {allDays[activeDay].exercises.length} exercises
                  </Badge>
                </div>

                {allDays[activeDay].exercises.map((ex, i) => {
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
                            <p className="text-xs text-gray-400">
                              {ex.sets} sets Ã— {ex.reps} Â· Rest: {ex.rest}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {/* Watch Demo Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedDemoExercise(ex)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-orange-500/20 hover:bg-orange-500 text-orange-300 hover:text-white border border-orange-500/40 px-3 py-1.5 rounded-lg transition-all"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Video Demo</span>
                          </button>

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
                          <p className="leading-relaxed">{ex.instructions}</p>
                          {ex.tips && ex.tips.length > 0 && (
                            <div className="pt-1 text-emerald-400 flex items-start gap-1.5">
                              <span>ðŸ’¡</span>
                              <span><strong>Pro Tip:</strong> {ex.tips[0]}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
        </>
      )}

      {/* Exercise Video Masterclass Modal */}
      <ExerciseVisualModal
        exercise={selectedDemoExercise}
        isOpen={!!selectedDemoExercise}
        onClose={() => setSelectedDemoExercise(null)}
      />
    </div>
  );
}