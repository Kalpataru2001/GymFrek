'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { calculateBMI, getBMIColor } from '@/lib/calculations';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Toast from '@/components/ui/Toast';

interface WeightLog { id: string; date: string; weightKg: number; }
const ACHIEVEMENTS = [
  {id:'first_log',name:'First Step',desc:'Log your weight for the first time',icon:'👟',threshold:1},
  {id:'ten_logs',name:'Weight Watcher',desc:'Log weight 10 times',icon:'📊',threshold:10},
  {id:'twenty_logs',name:'Consistency King',desc:'Log weight 20 times',icon:'👑',threshold:20},
];

export default function ProgressPage() {
  const { user } = useAuth();
  const { profile, updateProfile } = useUser();
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [weight, setWeight] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{message:string;type:'success'|'error'}|null>(null);

  const fetchLogs = async () => {
    if (!user) return;
    const q = query(collection(db,'weightLogs'), where('uid','==',user.uid), orderBy('date','asc'), limit(30));
    const snap = await getDocs(q);
    setLogs(snap.docs.map(d=>({id:d.id,...d.data()} as WeightLog)));
  };

  useEffect(()=>{ fetchLogs(); },[user]);

  const saveWeight = async () => {
    if (!user||!weight) return;
    setSaving(true);
    await addDoc(collection(db,'weightLogs'),{uid:user.uid,date,weightKg:parseFloat(weight),createdAt:serverTimestamp()});
    // update profile weight
    await updateProfile({weightKg:parseFloat(weight)});
    setToast({message:'Weight logged successfully!',type:'success'});
    setWeight('');
    fetchLogs();
    setSaving(false);
  };

  const bmiData = profile ? calculateBMI(profile.weightKg??0, profile.heightCm??1) : null;
  const earnedCount = logs.length;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={()=>setToast(null)}/>}
      <div>
        <h1 className="text-2xl font-bold text-white">📊 Progress Tracker</h1>
        <p className="text-gray-400 mt-1">Track your weight and see how far you have come</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Log weight */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Log Today&apos;s Weight</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Date</label>
              <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Weight (kg)</label>
              <input type="number" value={weight} onChange={e=>setWeight(e.target.value)} placeholder="e.g. 72.5" step="0.1" min="20" max="300" className="w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500"/>
            </div>
            <button onClick={saveWeight} disabled={saving||!weight} className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors">
              {saving ? 'Saving...' : 'Log Weight'}
            </button>
          </div>
        </div>

        {/* BMI card */}
        {bmiData && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Current BMI</h2>
            <div className="text-center py-4">
              <p className={`text-6xl font-bold ${getBMIColor(bmiData.bmi)}`}>{bmiData.bmi}</p>
              <p className={`text-xl font-semibold mt-2 ${getBMIColor(bmiData.bmi)}`}>{bmiData.category}</p>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-4">
              <span>Underweight<br/>&lt;18.5</span><span>Normal<br/>18.5–24.9</span><span>Overweight<br/>25–29.9</span><span>Obese<br/>&ge;30</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-red-500"/>
          </div>
        )}
      </div>

      {/* Weight chart */}
      {logs.length > 1 && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Weight History</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={logs}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151"/>
              <XAxis dataKey="date" stroke="#9CA3AF" tick={{fontSize:11}}/>
              <YAxis stroke="#9CA3AF" tick={{fontSize:11}} domain={['auto','auto']}/>
              <Tooltip contentStyle={{backgroundColor:'#1F2937',border:'1px solid #374151',borderRadius:'8px',color:'#fff'}}/>
              <Line type="monotone" dataKey="weightKg" stroke="#F97316" strokeWidth={2.5} dot={{r:4,fill:'#F97316'}} name="Weight (kg)"/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Achievements */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">🏅 Achievements</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ACHIEVEMENTS.map(a=>{
            const earned = earnedCount >= a.threshold;
            return (
              <div key={a.id} className={`rounded-xl border p-4 text-center transition-all ${earned?'border-orange-500 bg-orange-500/10':'border-gray-700 opacity-50'}`}>
                <div className="text-3xl mb-2">{a.icon}</div>
                <p className="font-semibold text-white text-sm">{a.name}</p>
                <p className="text-xs text-gray-400 mt-1">{a.desc}</p>
                {earned&&<p className="text-xs text-orange-400 mt-2 font-semibold">✓ Earned!</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
