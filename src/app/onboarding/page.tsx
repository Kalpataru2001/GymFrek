'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useAuth } from '@/contexts/AuthContext';
import { calculateBMI, calculateBMR, calculateTDEE, calculateMacros, getGoalStrategyLabel } from '@/lib/calculations';
import type { Gender, ActivityLevel, FitnessLevel, Equipment, UserGoal } from '@/lib/types';
import { Check } from 'lucide-react';

const TOTAL_STEPS = 4;

interface FormState {
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  fitnessLevel: FitnessLevel;
  goals: UserGoal[];
  equipment: Equipment;
  activityLevel: ActivityLevel;
}

const DEFAULTS: FormState = {
  age: 25,
  gender: 'male',
  heightCm: 170,
  weightKg: 70,
  fitnessLevel: 'beginner',
  goals: ['maintain'],
  equipment: 'full_gym',
  activityLevel: 'moderate',
};

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { updateProfile } = useUser();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const toggleGoal = (val: UserGoal) => {
    setForm(prev => {
      const exists = prev.goals.includes(val);
      if (exists) {
        // Keep at least one goal
        if (prev.goals.length === 1) return prev;
        return { ...prev, goals: prev.goals.filter(g => g !== val) };
      } else {
        // If selecting maintain, or selecting another while maintain is selected:
        if (val === 'maintain') {
          return { ...prev, goals: ['maintain'] };
        }
        const filtered = prev.goals.filter(g => g !== 'maintain');
        return { ...prev, goals: [...filtered, val] };
      }
    });
  };

  const next = () => setStep(s => Math.min(s + 1, TOTAL_STEPS));
  const back = () => setStep(s => Math.max(s - 1, 1));

  const preview = (() => {
    if (!form.age || !form.heightCm || !form.weightKg || form.goals.length === 0) return null;
    const { bmi, category } = calculateBMI(form.weightKg, form.heightCm);
    const bmr = calculateBMR(form.weightKg, form.heightCm, form.age, form.gender === 'other' ? 'male' : form.gender);
    const tdee = calculateTDEE(bmr, form.activityLevel);
    const macros = calculateMacros(tdee, form.goals, form.weightKg);
    return { bmi, category, bmr, tdee, macros };
  })();

  const strategy = getGoalStrategyLabel(form.goals);

  const handleSubmit = async () => {
    if (!user || !preview) return;
    setSaving(true);
    const gender = form.gender === 'other' ? 'male' : form.gender;
    const { bmi, category } = calculateBMI(form.weightKg, form.heightCm);
    const bmr = calculateBMR(form.weightKg, form.heightCm, form.age, gender);
    const tdee = calculateTDEE(bmr, form.activityLevel);
    const macros = calculateMacros(tdee, form.goals, form.weightKg);
    await updateProfile({
      ...form,
      goal: form.goals[0],
      goals: form.goals,
      bmi,
      bmiCategory: category,
      bmr,
      tdee,
      macros,
      onboardingComplete: true,
      displayName: user.displayName,
      email: user.email,
    });
    router.push('/dashboard');
  };

  const pct = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  const selCard = (active: boolean) =>
    `relative border-2 rounded-xl p-4 cursor-pointer transition-all ${active ? 'border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/10' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`;

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">💪 <span className="text-orange-400">GymFrek</span></h1>
          <p className="text-gray-400 mt-2">Let&apos;s set up your profile - Step {step} of {TOTAL_STEPS}</p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-700 rounded-full h-2 mb-8">
          <div className="bg-orange-500 h-2 rounded-full transition-all duration-500" style={{ width: pct + '%' }} />
        </div>

        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8">
          {/* ── Step 1: Personal Info ── */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white">Personal Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Age</label>
                  <input type="number" value={form.age} min={13} max={100}
                    onChange={e => set('age', Number(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Height (cm)</label>
                  <input type="number" value={form.heightCm} min={100} max={250}
                    onChange={e => set('heightCm', Number(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500"/>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Weight (kg)</label>
                  <input type="number" value={form.weightKg} min={20} max={300} step={0.1}
                    onChange={e => set('weightKg', Number(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500"/>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
                <div className="flex gap-3">
                  {(['male', 'female', 'other'] as Gender[]).map(g => (
                    <button key={g} onClick={() => set('gender', g)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium capitalize transition-colors border ${form.gender === g ? 'bg-orange-500 border-orange-500 text-white' : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'}`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Fitness Level ── */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-white">Experience Level</h2>
              {([
                { val: 'beginner', label: 'Beginner', desc: '0-6 months · Learning the basics', icon: '🌱' },
                { val: 'intermediate', label: 'Intermediate', desc: '6 months - 2 years · Building strength', icon: '⚡' },
                { val: 'advanced', label: 'Advanced', desc: '2+ years · Optimizing performance', icon: '🔥' },
              ] as { val: FitnessLevel; label: string; desc: string; icon: string }[]).map(opt => (
                <div key={opt.val} onClick={() => set('fitnessLevel', opt.val)} className={selCard(form.fitnessLevel === opt.val)}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{opt.icon}</span>
                    <div>
                      <p className="font-semibold text-white">{opt.label}</p>
                      <p className="text-sm text-gray-400">{opt.desc}</p>
                    </div>
                  </div>
                  {form.fitnessLevel === opt.val && (
                    <div className="absolute top-3 right-3 bg-orange-500 text-white rounded-full p-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── Step 3: Goal (Multi-Select) ── */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Your Goal</h2>
                  <span className="text-xs bg-orange-500/20 text-orange-400 font-medium px-2.5 py-1 rounded-full">
                    Select 1 or more
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Choose any combination that fits your fitness aspirations</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {([
                  { val: 'lose_weight', label: 'Lose Weight', icon: '🔥', hint: 'Burn fat & get lean' },
                  { val: 'maintain', label: 'Maintain', icon: '⚖️', hint: 'Keep current weight' },
                  { val: 'gain_muscle', label: 'Gain Muscle', icon: '💪', hint: 'Build strength & size' },
                  { val: 'improve_fitness', label: 'Improve Fitness', icon: '🏃', hint: 'Stamina & endurance' },
                ] as { val: UserGoal; label: string; icon: string; hint: string }[]).map(opt => {
                  const isSelected = form.goals.includes(opt.val);
                  return (
                    <div
                      key={opt.val}
                      onClick={() => toggleGoal(opt.val)}
                      className={selCard(isSelected) + ' text-center select-none'}
                    >
                      {isSelected && (
                        <div className="absolute top-2.5 right-2.5 bg-orange-500 text-white rounded-full p-0.5">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <div className="text-3xl mb-1.5">{opt.icon}</div>
                      <p className="font-semibold text-white text-sm">{opt.label}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{opt.hint}</p>
                    </div>
                  );
                })}
              </div>

              {/* Dynamic Goal Strategy Banner */}
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-3.5 mt-4">
                <div className="flex items-start gap-2.5">
                  <span className="text-xl">{strategy.emoji}</span>
                  <div>
                    <p className="text-sm font-semibold text-orange-400">{strategy.title}</p>
                    <p className="text-xs text-gray-300 mt-0.5">{strategy.description}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 4: Equipment & Activity ── */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white">Equipment & Activity</h2>
              <div>
                <p className="text-sm font-medium text-gray-300 mb-2">Available Equipment</p>
                {([
                  { val: 'full_gym', label: '🏋️ Full Gym', desc: 'Barbells, machines, cables' },
                  { val: 'dumbbells_only', label: '🪙 Dumbbells Only', desc: 'Free weights at home' },
                  { val: 'no_equipment', label: '🧘 No Equipment', desc: 'Bodyweight only' },
                ] as { val: Equipment; label: string; desc: string }[]).map(opt => (
                  <div key={opt.val} onClick={() => set('equipment', opt.val)} className={selCard(form.equipment === opt.val) + ' mb-2'}>
                    <p className="font-medium text-white">{opt.label}</p>
                    <p className="text-xs text-gray-400">{opt.desc}</p>
                    {form.equipment === opt.val && (
                      <div className="absolute top-3 right-3 bg-orange-500 text-white rounded-full p-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Activity Level</label>
                <select value={form.activityLevel} onChange={e => set('activityLevel', e.target.value as ActivityLevel)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500">
                  {([
                    ['sedentary', 'Sedentary (little/no exercise)'],
                    ['light', 'Lightly Active (1-3 days/week)'],
                    ['moderate', 'Moderately Active (3-5 days/week)'],
                    ['active', 'Very Active (6-7 days/week)'],
                    ['very_active', 'Extra Active (athlete/physical job)'],
                  ] as [ActivityLevel, string][]).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>

              {/* Preview */}
              {preview && (
                <div className="bg-gray-700/50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-orange-400">📊 Your Personalized Target Plan</p>
                    <span className="text-xs text-orange-300 bg-orange-500/20 px-2 py-0.5 rounded font-medium">
                      {strategy.title}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'BMI', value: preview.bmi.toFixed(1), sub: preview.category },
                      { label: 'BMR', value: preview.bmr, sub: 'kcal/day at rest' },
                      { label: 'TDEE', value: preview.tdee, sub: 'maintenance calories' },
                      { label: 'Daily Target', value: preview.macros.calories, sub: 'custom goal calories' },
                    ].map(s => (
                      <div key={s.label} className="bg-gray-700 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-400">{s.label}</p>
                        <p className="text-lg font-bold text-white">{s.value}</p>
                        <p className="text-xs text-gray-500 capitalize">{s.sub}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-orange-500/20 rounded-lg p-2"><p className="text-gray-400">Protein</p><p className="text-white font-semibold">{preview.macros.protein}g</p></div>
                    <div className="bg-blue-500/20 rounded-lg p-2"><p className="text-gray-400">Carbs</p><p className="text-white font-semibold">{preview.macros.carbs}g</p></div>
                    <div className="bg-yellow-500/20 rounded-lg p-2"><p className="text-gray-400">Fat</p><p className="text-white font-semibold">{preview.macros.fat}g</p></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Nav buttons */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button onClick={back} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2.5 rounded-lg transition-colors">
                ← Back
              </button>
            )}
            {step < TOTAL_STEPS ? (
              <button onClick={next} disabled={step === 3 && form.goals.length === 0}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors">
                Next →
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={saving || !preview}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors">
                {saving ? 'Setting up your plan...' : '🚀 Start My Journey!'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}