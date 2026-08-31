'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { calculateBMI, calculateBMR, calculateTDEE, calculateMacros, getBMIColor, getGoalStrategyLabel } from '@/lib/calculations';
import type { ActivityLevel, UserGoal } from '@/lib/types';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Toast from '@/components/ui/Toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Check } from 'lucide-react';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { profile, updateProfile, loading } = useUser();
  const [toast, setToast] = useState<{message:string;type:'success'|'error'|'info'}|null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    age: 25,
    heightCm: 170,
    weightKg: 70,
    activityLevel: 'moderate' as ActivityLevel,
    goals: ['maintain'] as UserGoal[],
  });

  useEffect(() => {
    if (profile) {
      setForm({
        age: profile.age ?? 25,
        heightCm: profile.heightCm ?? 170,
        weightKg: profile.weightKg ?? 70,
        activityLevel: (profile.activityLevel ?? 'moderate') as ActivityLevel,
        goals: (profile.goals && profile.goals.length > 0)
          ? profile.goals
          : (profile.goal ? [profile.goal] : ['maintain']),
      });
    }
  }, [profile]);

  const toggleGoal = (val: UserGoal) => {
    setForm(prev => {
      const exists = prev.goals.includes(val);
      if (exists) {
        if (prev.goals.length === 1) return prev;
        return { ...prev, goals: prev.goals.filter(g => g !== val) };
      } else {
        if (val === 'maintain') return { ...prev, goals: ['maintain'] };
        const filtered = prev.goals.filter(g => g !== 'maintain');
        return { ...prev, goals: [...filtered, val] };
      }
    });
  };

  const strategy = getGoalStrategyLabel(form.goals);

  const recalculate = async () => {
    setSaving(true);
    const gender = (profile?.gender || 'male') as 'male'|'female';
    const {bmi, category} = calculateBMI(form.weightKg, form.heightCm);
    const bmr = calculateBMR(form.weightKg, form.heightCm, form.age, gender);
    const tdee = calculateTDEE(bmr, form.activityLevel);
    const macros = calculateMacros(tdee, form.goals, form.weightKg);
    await updateProfile({
      age: form.age,
      heightCm: form.heightCm,
      weightKg: form.weightKg,
      activityLevel: form.activityLevel,
      goal: form.goals[0],
      goals: form.goals,
      bmi,
      bmiCategory: category,
      bmr,
      tdee,
      macros,
    });
    setToast({message:'Profile updated & stats recalculated!', type:'success'});
    setSaving(false);
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    await sendPasswordResetEmail(auth, user.email);
    setToast({message:'Password reset email sent!', type:'info'});
  };

  if (loading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg"/></div>;

  const initials = (user?.displayName||user?.email||'U').slice(0,2).toUpperCase();
  const bmiColor = getBMIColor(profile?.bmi??0);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={()=>setToast(null)}/>}
      <h1 className="text-2xl font-bold text-white">👤 My Profile</h1>

      {/* Avatar */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">{initials}</div>
        <div>
          <h2 className="text-xl font-semibold text-white">{user?.displayName || 'User'}</h2>
          <p className="text-gray-400">{user?.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs bg-orange-500/20 text-orange-400 font-semibold px-2.5 py-1 rounded-full">
              {strategy.emoji} {strategy.title}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      {profile && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {label:'BMI',value:profile.bmi?.toFixed(1),sub:profile.bmiCategory,color:bmiColor},
            {label:'BMR',value:profile.bmr,sub:'kcal/day',color:'text-blue-400'},
            {label:'TDEE',value:profile.tdee,sub:'kcal/day',color:'text-orange-400'},
            {label:'Daily Cal',value:profile.macros?.calories,sub:'target',color:'text-green-400'},
          ].map(s=>(
            <div key={s.label} className="bg-gray-800 rounded-xl border border-gray-700 p-4 text-center">
              <p className="text-xs text-gray-400 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value??'-'}</p>
              <p className="text-xs text-gray-500 mt-1 capitalize">{s.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Edit form */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-5">
        <h3 className="text-lg font-semibold text-white">Update Body Metrics & Goals</h3>
        <div className="grid grid-cols-2 gap-4">
          {[{label:'Age',key:'age',min:13,max:100},{label:'Height (cm)',key:'heightCm',min:100,max:250},{label:'Weight (kg)',key:'weightKg',min:20,max:300}].map(f=>(
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">{f.label}</label>
              <input type="number" value={form[f.key as keyof typeof form]} min={f.min} max={f.max}
                onChange={e=>setForm(prev=>({...prev,[f.key]:Number(e.target.value)}))}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500"/>
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Activity Level</label>
            <select value={form.activityLevel} onChange={e=>setForm(p=>({...p, activityLevel: e.target.value as ActivityLevel}))}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500">
              {[['sedentary','Sedentary'],['light','Lightly Active'],['moderate','Moderately Active'],['active','Very Active'],['very_active','Extra Active']].map(([v,l])=>(
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>

          {/* Goals Multi-Select */}
          <div className="col-span-2 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-300">Fitness Goals</label>
              <span className="text-xs text-gray-400">Select any combination</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {([
                { val: 'lose_weight', label: '🔥 Lose Weight' },
                { val: 'maintain', label: '⚖️ Maintain' },
                { val: 'gain_muscle', label: '💪 Gain Muscle' },
                { val: 'improve_fitness', label: '🏃 Improve Fitness' },
              ] as { val: UserGoal; label: string }[]).map(g => {
                const isSelected = form.goals.includes(g.val);
                return (
                  <button
                    key={g.val}
                    type="button"
                    onClick={() => toggleGoal(g.val)}
                    className={`flex items-center justify-between p-3 rounded-lg text-sm font-medium border transition-all ${
                      isSelected
                        ? 'bg-orange-500/20 border-orange-500 text-orange-300'
                        : 'bg-gray-700/60 border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <span>{g.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-orange-400" />}
                  </button>
                );
              })}
            </div>
            <div className="bg-gray-700/40 rounded-lg p-2.5 text-xs text-gray-300 flex items-center gap-2">
              <span>{strategy.emoji}</span>
              <span><strong>{strategy.title}:</strong> {strategy.description}</span>
            </div>
          </div>
        </div>

        <button onClick={recalculate} disabled={saving || form.goals.length === 0} className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors">
          {saving ? 'Saving...' : '🔄 Save & Recalculate Stats'}
        </button>
      </div>

      {/* Account actions */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-3">
        <h3 className="text-lg font-semibold text-white">Account</h3>
        <button onClick={handlePasswordReset} className="w-full text-left py-2.5 px-4 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors">
          📧 Send Password Reset Email
        </button>
        <button onClick={()=>signOut()} className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg transition-colors">
          Sign Out
        </button>
      </div>
    </div>
  );
}