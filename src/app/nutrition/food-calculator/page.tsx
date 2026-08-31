'use client';
import { useState } from 'react';
import { searchFoods, FoodItem } from '@/lib/food-api';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Toast from '@/components/ui/Toast';
import { Search } from 'lucide-react';

const QUICK_SEARCHES = ['Chicken Breast','Brown Rice','Eggs','Oats','Banana','Broccoli','Almonds','Whole Milk'];
const MEAL_TYPES = ['breakfast','lunch','dinner','snack'] as const;

export default function FoodCalculatorPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [serving, setServing] = useState(100);
  const [mealType, setMealType] = useState<typeof MEAL_TYPES[number]>('lunch');
  const [toast, setToast] = useState<{message:string;type:'success'|'error'|'info'}|null>(null);

  const doSearch = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    const apiKey = process.env.NEXT_PUBLIC_USDA_API_KEY || 'DEMO_KEY';
    const data = await searchFoods(q, apiKey);
    setResults(data);
    setLoading(false);
  };

  const scale = (val: number | null) => val == null ? null : Math.round((val * serving / 100) * 10) / 10;

  const addToLog = async () => {
    if (!user || !selectedFood) return;
    const n = selectedFood.nutrients;
    await addDoc(collection(db, 'mealLogs'), {
      uid: user.uid, date: new Date().toISOString().slice(0,10), mealType,
      food: { fdcId: selectedFood.fdcId, name: selectedFood.description, servingG: serving,
        nutrients: { calories: scale(n.calories), protein: scale(n.protein), carbs: scale(n.carbs), fat: scale(n.fat), fiber: scale(n.fiber) }
      }, createdAt: serverTimestamp()
    });
    setToast({ message: `Added ${selectedFood.description} to ${mealType}!`, type: 'success' });
    setSelectedFood(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)}/>}
      <div>
        <h1 className="text-2xl font-bold text-white">🔍 Food Nutrition Calculator</h1>
        <p className="text-gray-400 mt-1">Search 300,000+ foods from the USDA database</p>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
          <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&doSearch(query)}
            placeholder="Search for any food..." className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-orange-500"/>
        </div>
        <button onClick={()=>doSearch(query)} disabled={loading} className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 rounded-lg transition-colors disabled:opacity-50">
          {loading ? '...' : 'Search'}
        </button>
      </div>

      {/* Quick searches */}
      <div className="flex flex-wrap gap-2">
        {QUICK_SEARCHES.map(q=>(
          <button key={q} onClick={()=>{setQuery(q);doSearch(q);}} className="text-sm bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 px-3 py-1.5 rounded-full transition-colors">{q}</button>
        ))}
      </div>

      {/* Loading */}
      {loading && <div className="flex justify-center py-12"><LoadingSpinner size="lg"/></div>}

      {/* Results */}
      {!loading && results.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          {results.map(food=>(
            <div key={food.fdcId} className="bg-gray-800 rounded-xl border border-gray-700 p-5 hover:border-gray-600 transition-colors">
              <h3 className="font-semibold text-white text-sm leading-tight mb-3 line-clamp-2">{food.description}</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="orange">{food.nutrients.calories?.toFixed(0) ?? '—'} kcal</Badge>
                <Badge variant="blue">P: {food.nutrients.protein?.toFixed(1) ?? '—'}g</Badge>
                <Badge variant="gray">C: {food.nutrients.carbs?.toFixed(1) ?? '—'}g</Badge>
                <Badge variant="yellow">F: {food.nutrients.fat?.toFixed(1) ?? '—'}g</Badge>
              </div>
              <p className="text-xs text-gray-500 mb-3">Per 100g</p>
              <button onClick={()=>{setSelectedFood(food);setServing(100);}} className="w-full bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 font-medium py-2 rounded-lg text-sm transition-colors">
                View Details & Add
              </button>
            </div>
          ))}
        </div>
      )}

      {!loading && results.length === 0 && query && (
        <div className="text-center py-12 text-gray-400">No results found. Try a different search term.</div>
      )}

      {/* Food Detail Modal */}
      <Modal isOpen={!!selectedFood} onClose={()=>setSelectedFood(null)} title={selectedFood?.description ?? ''} size="lg">
        {selectedFood && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-300 whitespace-nowrap">Serving size (g):</label>
              <input type="number" value={serving} onChange={e=>setServing(Number(e.target.value))} min={1} max={2000}
                className="w-28 bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"/>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                {label:'Calories',value:scale(selectedFood.nutrients.calories),unit:'kcal'},
                {label:'Protein',value:scale(selectedFood.nutrients.protein),unit:'g'},
                {label:'Carbohydrates',value:scale(selectedFood.nutrients.carbs),unit:'g'},
                {label:'Total Fat',value:scale(selectedFood.nutrients.fat),unit:'g'},
                {label:'Dietary Fiber',value:scale(selectedFood.nutrients.fiber),unit:'g'},
                {label:'Sugar',value:scale(selectedFood.nutrients.sugar),unit:'g'},
                {label:'Sodium',value:scale(selectedFood.nutrients.sodium),unit:'mg'},
                {label:'Vitamin C',value:scale(selectedFood.nutrients.vitaminC),unit:'mg'},
              ].map(n=>(
                <div key={n.label} className="bg-gray-700 rounded-lg px-4 py-3">
                  <p className="text-xs text-gray-400">{n.label}</p>
                  <p className="text-lg font-semibold text-white">{n.value ?? '—'}<span className="text-xs text-gray-400 ml-1">{n.unit}</span></p>
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Add to meal:</label>
              <div className="flex gap-2">
                {MEAL_TYPES.map(t=>(
                  <button key={t} onClick={()=>setMealType(t)} className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${mealType===t?'bg-orange-500 text-white':'bg-gray-700 text-gray-400 hover:text-white'}`}>{t}</button>
                ))}
              </div>
            </div>
            <button onClick={addToLog} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors">
              ✓ Add to {mealType.charAt(0).toUpperCase()+mealType.slice(1)} Log
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
