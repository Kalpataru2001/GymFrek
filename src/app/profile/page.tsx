'use client';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { calculateBMI, calculateBMR, calculateTDEE, calculateMacros, getBMIColor } from '@/lib/calculations';
import type { ActivityLevel, UserGoal } from '@/lib/types';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Toast from '@/components/ui/Toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { profile, updateProfile, loading } = useUser();
  const [toast, setToast] = useState<{message:string;type:'success'|'error'|'info'}|null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    age: profile?.age ?? 25, heightCm: profile?.heightCm ?? 170, weightKg: profile?.weightKg ?? 70,
    activityLevel: profile?.activityLevel ?? 'moderate', goal: profile?.goal ?? 'maintain',
  });

  const recalculate = async () => {
    setSaving(true);
    const gender = (profile?.gender || 'male') as 'male'|'female';
    const {bmi, category} = calculateBMI(form.weightKg, form.heightCm);
    const bmr = calculateBMR(form.weightKg, form.heightCm, form.age, gender);
    const tdee = calculateTDEE(bmr, form.activityLevel as ActivityLevel);
    const macros = calculateMacros(tdee, form.goal as UserGoal, form.weightKg);
    await updateProfile({...form, bmi, bmiCategory: category, bmr, tdee, macros});
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
          <p className="text-xs text-gray-500 mt-1">Member since {user?.metadata.creationTime?.slice(0,16)}</p>
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
              <p className={`text-2xl font-bold ${s.color}`}>{s.value??'—'}</p>
              <p className="text-xs text-gray-500 mt-1 capitalize">{s.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Edit form */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white">Update Body Metrics</h3>
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
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Goal</label>
            <select value={form.goal} onChange={e=>setForm(p=>({...p, goal: e.target.value as UserGoal}))}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500">
              {[['lose_weight','Lose Weight'],['maintain','Maintain'],['gain_muscle','Gain Muscle'],['improve_fitness','Improve Fitness']].map(([v,l])=>(
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
        </div>
        <button onClick={recalculate} disabled={saving} className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors">
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
