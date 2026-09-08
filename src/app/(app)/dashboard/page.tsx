'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import { getBMIColor } from '@/lib/calculations';
import StatCard from '@/components/ui/StatCard';
import ProgressBar from '@/components/ui/ProgressBar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import { Dumbbell, Apple, Weight, Flame, Droplets, Target, CheckCircle2, XCircle, Moon, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { DailyLog, WorkoutAttendance } from '@/lib/types';

interface WeightEntry { date: string; weightKg: number; }

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function AttendanceBadge({ status }: { status: WorkoutAttendance | null }) {
  if (!status || status === 'none') return <span className="text-[10px] text-gray-500 font-medium">Not marked</span>;
  const cfg = {
    completed: { icon: <CheckCircle2 className="w-3 h-3" />, text: 'Done!', cls: 'text-emerald-400' },
    rest:      { icon: <Moon className="w-3 h-3" />,         text: 'Rest',  cls: 'text-sky-400' },
    missed:    { icon: <XCircle className="w-3 h-3" />,      text: 'Missed',cls: 'text-red-400' },
  }[status];
  return (
    <span className={`flex items-center gap-1 text-[10px] font-semibold ${cfg.cls}`}>
      {cfg.icon}{cfg.text}
    </span>
  );
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUser();
  const router = useRouter();
  const [weightLogs, setWeightLogs] = useState<WeightEntry[]>([]);
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);
  const [todayLogLoaded, setTodayLogLoaded] = useState(false);

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

  // Fetch today's daily log for live dashboard status
  useEffect(() => {
    if (!user) return;
    const today = todayStr();
    // Try cache first
    try {
      const cacheKey = `gymfrek_logs_${user.uid}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const map = JSON.parse(cached) as Record<string, DailyLog>;
        if (map[today]) { setTodayLog(map[today]); setTodayLogLoaded(true); }
      }
    } catch { /* */ }
    // Always verify with Firestore
    getDoc(doc(db, 'dailyLogs', `${user.uid}_${today}`)).then(snap => {
      setTodayLog(snap.exists() ? (snap.data() as DailyLog) : null);
      setTodayLogLoaded(true);
    }).catch(() => setTodayLogLoaded(true));
  }, [user]);

  if (authLoading || profileLoading) return <div className="flex items-center justify-center h-full"><LoadingSpinner size="lg"/></div>;
  if (!user) return null;
  if (!profile?.onboardingComplete) { router.push('/onboarding'); return null; }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const name = profile?.displayName?.split(' ')[0] || user.displayName?.split(' ')[0] || 'Champ';
  const bmi = profile?.bmi ?? 0;
  const macros = profile?.macros;

  const todayKcal = todayLog?.totalCalories ?? 0;
  const todayProtein = todayLog?.totalProtein ?? 0;
  const todayScore = todayLog?.growthScore ?? 0;
  const attendance = todayLog?.attendance ?? null;
  const kcalTarget = macros?.calories ?? 2000;

  const quickActions = [
    {
      label: 'Mark Attendance',
      href: '/calendar',
      emoji: '&#128197;',
      badge: todayLogLoaded ? <AttendanceBadge status={attendance} /> : <Clock className="w-3 h-3 text-gray-500 animate-spin" />,
    },
    {
      label: 'View Workout Plan',
      href: '/workout',
      emoji: '&#127947;',
      badge: null,
    },
    {
      label: 'Log a Meal',
      href: '/nutrition/food-calculator',
      emoji: '&#129367;',
      badge: todayLogLoaded
        ? <span className={`text-[10px] font-semibold ${todayKcal > 0 ? 'text-orange-400' : 'text-gray-500'}`}>
            {todayKcal > 0 ? `${todayKcal} kcal` : 'Not logged'}
          </span>
        : null,
    },
    {
      label: 'Growth Score',
      href: '/progress',
      emoji: '&#9889;',
      badge: todayLogLoaded
        ? <span className={`text-[10px] font-bold ${todayScore >= 75 ? 'text-emerald-400' : todayScore >= 50 ? 'text-orange-400' : 'text-gray-500'}`}>
            {todayScore > 0 ? `${todayScore}/100` : 'Not set'}
          </span>
        : null,
    },
    {
      label: 'Track Progress',
      href: '/progress',
      emoji: '&#128202;',
      badge: null,
    },
    {
      label: 'Exercise Library',
      href: '/exercises',
      emoji: '&#128170;',
      badge: null,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">{greeting}, {name}! &#128170;</h1>
        <p className="text-gray-400 mt-1">{new Date().toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="BMI" value={bmi.toFixed(1)} unit={profile?.bmiCategory} icon={<Target className="w-5 h-5"/>} color={bmi < 18.5 ? 'blue' : bmi < 25 ? 'green' : bmi < 30 ? 'orange' : 'purple'}/>
        <StatCard title="Daily Calories" value={macros?.calories ?? '-'} unit="kcal" icon={<Flame className="w-5 h-5"/>} color="orange"/>
        <StatCard title="Current Weight" value={profile?.weightKg ?? '-'} unit="kg" icon={<Weight className="w-5 h-5"/>} color="blue"/>
        <StatCard title="Water Goal" value={macros?.water ?? '-'} unit="ml" icon={<Droplets className="w-5 h-5"/>} color="blue"/>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Macro Targets — now with real today data */}
        {macros && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Apple className="w-5 h-5 text-orange-400"/>Today&apos;s Nutrition</h2>
              {todayLogLoaded && todayKcal > 0 && (
                <span className="text-xs text-orange-300 font-semibold bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
                  {todayKcal} / {kcalTarget} kcal
                </span>
              )}
            </div>
            <div className="space-y-3">
              <ProgressBar label={`Protein — ${macros.protein}g target`} value={todayProtein} max={macros.protein} color="orange" showLabel/>
              <ProgressBar label={`Carbs — ${macros.carbs}g target`} value={todayLog?.totalCarbs ?? 0} max={macros.carbs} color="blue" showLabel/>
              <ProgressBar label={`Fat — ${macros.fat}g target`} value={todayLog?.totalFat ?? 0} max={macros.fat} color="yellow" showLabel/>
              <ProgressBar label={`Fiber — ${macros.fiber}g target`} value={todayLog?.totalFiber ?? 0} max={macros.fiber} color="green" showLabel/>
            </div>
            {(!todayLogLoaded || todayKcal === 0) && (
              <p className="text-xs text-gray-500 text-center">No meals logged today yet.</p>
            )}
            <Link href="/nutrition" className="block text-center text-sm text-orange-400 hover:text-orange-300 font-medium mt-2">Log Today&apos;s Meals &#8594;</Link>
          </div>
        )}

        {/* Quick Actions with live badges */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Dumbbell className="w-5 h-5 text-orange-400"/>Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {quickActions.map(a => (
              <Link key={a.label} href={a.href} className="flex flex-col items-center justify-center gap-1.5 p-3.5 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors text-center">
                <span className="text-2xl" dangerouslySetInnerHTML={{ __html: a.emoji }} />
                <span className="text-xs font-medium text-gray-200 leading-tight">{a.label}</span>
                {a.badge && <div className="mt-0.5">{a.badge}</div>}
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
          <p className="text-gray-400 mb-4">&#128202; Start tracking your weight to see your progress chart!</p>
          <Link href="/progress" className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2.5 rounded-lg transition-colors">Log Your Weight</Link>
        </div>
      )}
    </div>
  );
}
