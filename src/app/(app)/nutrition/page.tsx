'use client';
import { useUser } from '@/contexts/UserContext';
import Link from 'next/link';
import ProgressBar from '@/components/ui/ProgressBar';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function NutritionPage() {
  const { profile } = useUser();
  const m = profile?.macros;

  const pieData = m ? [
    { name: 'Protein', value: m.protein * 4, color: '#F97316' },
    { name: 'Carbs', value: m.carbs * 4, color: '#3B82F6' },
    { name: 'Fat', value: m.fat * 9, color: '#EAB308' },
  ] : [];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">🥗 Nutrition Planner</h1>
        <p className="text-gray-400 mt-1">Your personalized daily macro targets</p>
      </div>

      {!m ? (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center">
          <p className="text-gray-400 mb-4">Complete your profile to see nutrition targets.</p>
          <Link href="/onboarding" className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2.5 rounded-lg transition-colors">Complete Profile</Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Macro targets */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 sm:p-6 space-y-4 sm:space-y-5">
            <h2 className="text-base sm:text-lg font-semibold text-white">Daily Targets</h2>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
              {[
                {label:'Calories',value:m.calories,unit:'kcal',color:'orange'},
                {label:'Protein',value:m.protein,unit:'g',color:'orange'},
                {label:'Carbs',value:m.carbs,unit:'g',color:'blue'},
                {label:'Fat',value:m.fat,unit:'g',color:'yellow'},
                {label:'Fiber',value:m.fiber,unit:'g',color:'green'},
                {label:'Water',value:m.water,unit:'ml',color:'blue'},
              ].map(s=>(
                <div key={s.label} className="bg-gray-700 rounded-lg p-2.5 sm:p-3 text-center">
                  <p className="text-[11px] sm:text-xs text-gray-400 mb-0.5 sm:mb-1">{s.label}</p>
                  <p className="text-lg sm:text-xl font-bold text-white">{s.value}<span className="text-[10px] sm:text-xs text-gray-400 ml-1">{s.unit}</span></p>
                </div>
              ))}
            </div>
            <div className="space-y-2.5 sm:space-y-3 pt-2">
              <ProgressBar label={`Protein ${m.protein}g`} value={0} max={m.protein} color="orange" showLabel/>
              <ProgressBar label={`Carbs ${m.carbs}g`} value={0} max={m.carbs} color="blue" showLabel/>
              <ProgressBar label={`Fat ${m.fat}g`} value={0} max={m.fat} color="yellow" showLabel/>
            </div>
          </div>

          {/* Pie chart */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Calorie Distribution</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={85} dataKey="value"
                  label={({ name, percent }: { name?: string; percent?: number }) =>
                    `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }>
                  {pieData.map((entry,i)=><Cell key={i} fill={entry.color}/>)}
                </Pie>
                <Tooltip formatter={(v) => [`${v} kcal`]} contentStyle={{backgroundColor:'#1F2937',border:'1px solid #374151',borderRadius:'8px',color:'#fff'}}/>
                <Legend/>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* BMR/TDEE info */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 sm:p-6 lg:col-span-2">
            <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Your Metabolic Stats</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
              {[
                {label:'BMR',value:profile.bmr,unit:'kcal/day',desc:'Calories burned at rest'},
                {label:'TDEE',value:profile.tdee,unit:'kcal/day',desc:'Total daily expenditure'},
                {label:'Activity',value:profile.activityLevel?.replace('_',' '),unit:'',desc:'Your activity level'},
                {label:'Goal',value:profile.goal?.replace('_',' '),unit:'',desc:'Current fitness goal'},
              ].map(s=>(
                <div key={s.label} className="bg-gray-700 rounded-lg p-3 sm:p-4">
                  <p className="text-[11px] sm:text-xs text-gray-400">{s.label}</p>
                  <p className="text-base sm:text-lg font-bold text-white mt-0.5 sm:mt-1 capitalize">{s.value} <span className="text-[10px] sm:text-xs text-gray-400 font-normal">{s.unit}</span></p>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <Link href="/nutrition/food-calculator" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2.5 rounded-lg transition-colors text-sm">
          🔍 Search Foods & Log Meals
        </Link>
      </div>
    </div>
  );
}
