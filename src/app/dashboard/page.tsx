'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { getBMIColor } from '@/lib/calculations';
import StatCard from '@/components/ui/StatCard';
import ProgressBar from '@/components/ui/ProgressBar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import { Dumbbell, Apple, Weight, Flame, Droplets, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface WeightEntry { date: string; weightKg: number; }

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUser();
  const router = useRouter();
  const [weightLogs, setWeightLogs] = useState<WeightEntry[]>([]);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'weightLogs'), where('uid', '==', user.uid), orderBy('date', 'desc'), limit(14));
    getDocs(q).then(snap => {
      const data = snap.docs.map(d => d.data() as WeightEntry).reverse();
      setWeightLogs(data);
    });
  }, [user]);

  if (authLoading || profileLoading) return <div className="flex items-center justify-center h-full"><LoadingSpinner size="lg"/></div>;
  if (!user) return null;
  if (!profile?.onboardingComplete) { router.push('/onboarding'); return null; }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const name = profile?.displayName?.split(' ')[0] || user.displayName?.split(' ')[0] || 'Champ';
  const bmi = profile?.bmi ?? 0;
  const macros = profile?.macros;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">{greeting}, {name}! 💪</h1>
        <p className="text-gray-400 mt-1">{new Date().toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="BMI" value={bmi.toFixed(1)} unit={profile?.bmiCategory} icon={<Target className="w-5 h-5"/>} color={bmi < 18.5 ? 'blue' : bmi < 25 ? 'green' : bmi < 30 ? 'orange' : 'purple'}/>
        <StatCard title="Daily Calories" value={macros?.calories ?? '—'} unit="kcal" icon={<Flame className="w-5 h-5"/>} color="orange"/>
        <StatCard title="Current Weight" value={profile?.weightKg ?? '—'} unit="kg" icon={<Weight className="w-5 h-5"/>} color="blue"/>
        <StatCard title="Water Goal" value={macros?.water ?? '—'} unit="ml" icon={<Droplets className="w-5 h-5"/>} color="blue"/>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Macro Targets */}
        {macros && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Apple className="w-5 h-5 text-orange-400"/>Daily Nutrition Goals</h2>
            <div className="space-y-3">
              <ProgressBar label={`Protein — ${macros.protein}g target`} value={0} max={macros.protein} color="orange" showLabel/>
              <ProgressBar label={`Carbs — ${macros.carbs}g target`} value={0} max={macros.carbs} color="blue" showLabel/>
              <ProgressBar label={`Fat — ${macros.fat}g target`} value={0} max={macros.fat} color="yellow" showLabel/>
              <ProgressBar label={`Fiber — ${macros.fiber}g target`} value={0} max={macros.fiber} color="green" showLabel/>
            </div>
            <Link href="/nutrition" className="block text-center text-sm text-orange-400 hover:text-orange-300 font-medium mt-2">Log Today&apos;s Meals →</Link>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Dumbbell className="w-5 h-5 text-orange-400"/>Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              {label:'View Workout Plan',href:'/workout',emoji:'🏋️'},
              {label:'Log a Meal',href:'/nutrition/food-calculator',emoji:'🥗'},
              {label:'Track Progress',href:'/progress',emoji:'📊'},
              {label:'Exercise Library',href:'/exercises',emoji:'💪'},
            ].map(a=>(
              <Link key={a.href} href={a.href} className="flex flex-col items-center justify-center gap-2 p-4 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors text-center">
                <span className="text-2xl">{a.emoji}</span>
                <span className="text-sm font-medium text-gray-200">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Weight Chart */}
      {weightLogs.length > 0 && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Weight Trend (Last 14 Days)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weightLogs}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151"/>
              <XAxis dataKey="date" stroke="#9CA3AF" tick={{fontSize:12}}/>
              <YAxis stroke="#9CA3AF" tick={{fontSize:12}} domain={['auto','auto']}/>
              <Tooltip contentStyle={{backgroundColor:'#1F2937',border:'1px solid #374151',borderRadius:'8px',color:'#fff'}}/>
              <Line type="monotone" dataKey="weightKg" stroke="#F97316" strokeWidth={2} dot={{r:4,fill:'#F97316'}}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* No weight logs CTA */}
      {weightLogs.length === 0 && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center">
          <p className="text-gray-400 mb-4">📊 Start tracking your weight to see your progress chart!</p>
          <Link href="/progress" className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2.5 rounded-lg transition-colors">Log Your Weight</Link>
        </div>
      )}
    </div>
  );
}
