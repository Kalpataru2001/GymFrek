/**
 * GymFrek â€” Smart Food & Ingredient Nutrition Database
 * Pre-loaded with popular everyday Indian & International foods with standard household units.
 */

export type FoodPortionType = 'count' | 'weight' | 'volume';

export interface FoodServingUnit {
  label: string; // e.g. "Piece / Roti (35g)", "50g", "100g", "Cup (150g)", "Tablespoon"
  grams: number; // weight in grams
}

export interface FoodEntry {
  id: string;
  name: string;
  aliases: string[];
  category: 'Grains & Breads' | 'Protein & Meat' | 'Dairy & Vegetarian' | 'Breakfast & Snacks' | 'Fruits & Veggies' | 'Fitness Supplements' | 'Beverages';
  portionType: FoodPortionType; // 'count' (like roti, egg) or 'weight' (like soya, rice, paneer, chicken)
  servingUnits: FoodServingUnit[];
  defaultUnitIndex: number;
  quickPortions: number[]; // e.g. [1, 2, 3, 4] for count or [30, 50, 100, 150, 200] for grams
  ingredients: string[];
  per100g: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
}

export const POPULAR_FOODS_DATABASE: FoodEntry[] = [
  // â”€â”€â”€ Protein & Meat â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id: 'soya_chunks',
    name: 'Soya Chunks / Soyabean / Nutrela',
    aliases: ['soya', 'soyabean', 'soybean', 'soya chunks', 'nutrela', 'meal maker', 'soya bean', 'soyabeans', 'soy'],
    category: 'Protein & Meat',
    portionType: 'weight',
    servingUnits: [
      { label: 'Grams (raw/dry weight)', grams: 1 },
      { label: 'Standard Portion (50g raw)', grams: 50 },
      { label: 'Cooked Bowl (150g)', grams: 150 },
      { label: 'Small Bowl (100g)', grams: 100 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [30, 50, 75, 100],
    ingredients: ['Defatted Soya Flour (52% Plant Protein, BCAAs, Glutamine)'],
    per100g: { calories: 345, protein: 52.0, carbs: 33.0, fat: 0.5, fiber: 13.0 },
  },
  {
    id: 'egg_boiled_whole',
    name: 'Whole Boiled Egg',
    aliases: ['egg', 'boiled egg', 'eggs', 'anda', 'dim', 'boiled eggs', 'whole egg'],
    category: 'Protein & Meat',
    portionType: 'count',
    servingUnits: [
      { label: 'Piece / Egg (50g)', grams: 50 },
      { label: 'Grams', grams: 1 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [1, 2, 3, 4, 6],
    ingredients: ['Whole Natural Egg (Egg White Albumin + Choline Yolk)'],
    per100g: { calories: 155, protein: 13.0, carbs: 1.1, fat: 11.0, fiber: 0 },
  },
  {
    id: 'egg_white_boiled',
    name: 'Boiled Egg White',
    aliases: ['egg white', 'egg whites', 'anda safed', 'whites', 'boiled egg white'],
    category: 'Protein & Meat',
    portionType: 'count',
    servingUnits: [
      { label: 'Piece / White (33g)', grams: 33 },
      { label: 'Grams', grams: 1 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [2, 3, 4, 5, 6],
    ingredients: ['Pure Egg Albumin (Zero Fat, Zero Cholesterol)'],
    per100g: { calories: 52, protein: 11.0, carbs: 0.7, fat: 0.2, fiber: 0 },
  },
  {
    id: 'chicken_breast_cooked',
    name: 'Chicken Breast (Grilled / Boiled)',
    aliases: ['chicken', 'chicken breast', 'grilled chicken', 'boiled chicken', 'murgh', 'boneless chicken'],
    category: 'Protein & Meat',
    portionType: 'weight',
    servingUnits: [
      { label: 'Grams', grams: 1 },
      { label: 'Medium Breast (150g)', grams: 150 },
      { label: 'Small Breast (100g)', grams: 100 },
      { label: 'Large Breast (200g)', grams: 200 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [100, 150, 200, 250],
    ingredients: ['Lean Boneless Skinless Chicken Breast', 'Salt & Pepper'],
    per100g: { calories: 165, protein: 31.0, carbs: 0, fat: 3.6, fiber: 0 },
  },
  {
    id: 'chicken_curry',
    name: 'Chicken Curry (Home Style)',
    aliases: ['chicken curry', 'chicken gravy', 'curry chicken', 'murgh curry'],
    category: 'Protein & Meat',
    portionType: 'weight',
    servingUnits: [
      { label: 'Grams', grams: 1 },
      { label: 'Bowl / Katori (150g)', grams: 150 },
      { label: 'Large Plate (250g)', grams: 250 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [150, 200, 250],
    ingredients: ['Chicken Pieces', 'Onion', 'Tomato', 'Spices', 'Cooking Oil'],
    per100g: { calories: 175, protein: 18.0, carbs: 4.5, fat: 9.5, fiber: 1.2 },
  },
  {
    id: 'fish_grilled',
    name: 'Fish (Rohu / Katla / Salmon / Pomfret)',
    aliases: ['fish', 'machli', 'grilled fish', 'fried fish', 'salmon', 'rohu', 'fish curry'],
    category: 'Protein & Meat',
    portionType: 'weight',
    servingUnits: [
      { label: 'Grams', grams: 1 },
      { label: 'Fillet / Piece (100g)', grams: 100 },
      { label: 'Large Fillet (150g)', grams: 150 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [100, 150, 200],
    ingredients: ['Fresh Fish Fillet (Omega-3 Fatty Acids, Lean Protein)', 'Spices'],
    per100g: { calories: 145, protein: 22.0, carbs: 0, fat: 6.0, fiber: 0 },
  },

  // â”€â”€â”€ Grains & Breads â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id: 'roti_wheat',
    name: 'Wheat Roti / Chapati / Phulka',
    aliases: ['roti', 'chapati', 'phulka', 'wheat roti', 'roti wheat', 'atta roti', 'rotli'],
    category: 'Grains & Breads',
    portionType: 'count',
    servingUnits: [
      { label: 'Roti / Piece (35g)', grams: 35 },
      { label: 'Large Roti (50g)', grams: 50 },
      { label: 'Grams', grams: 1 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [1, 2, 3, 4, 5],
    ingredients: ['Whole Wheat Flour (Atta)', 'Water', 'Pinch of Salt'],
    per100g: { calories: 297, protein: 9.5, carbs: 60, fat: 1.5, fiber: 9.0 },
  },
  {
    id: 'roti_maida',
    name: 'Maida Roti / Parotta / Rumali Roti',
    aliases: ['maida roti', 'maide roti', 'rumali roti', 'parotta', 'maida', 'paratha maida', 'malabar parotta'],
    category: 'Grains & Breads',
    portionType: 'count',
    servingUnits: [
      { label: 'Roti / Piece (45g)', grams: 45 },
      { label: 'Large Parotta (80g)', grams: 80 },
      { label: 'Grams', grams: 1 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [1, 2, 3, 4],
    ingredients: ['Refined Wheat Flour (Maida)', 'Oil / Ghee', 'Water', 'Salt'],
    per100g: { calories: 340, protein: 8.0, carbs: 68, fat: 4.5, fiber: 2.5 },
  },
  {
    id: 'rice_white_cooked',
    name: 'Cooked White Rice',
    aliases: ['rice', 'white rice', 'cooked rice', 'chawal', 'plain rice', 'bhat', 'steamed rice'],
    category: 'Grains & Breads',
    portionType: 'weight',
    servingUnits: [
      { label: 'Grams', grams: 1 },
      { label: 'Small Katori / Bowl (100g)', grams: 100 },
      { label: 'Standard Plate / Cup (150g)', grams: 150 },
      { label: 'Large Plate (250g)', grams: 250 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [100, 150, 200, 250],
    ingredients: ['White Rice Grains', 'Water'],
    per100g: { calories: 130, protein: 2.7, carbs: 28.2, fat: 0.3, fiber: 0.4 },
  },
  {
    id: 'rice_brown_cooked',
    name: 'Cooked Brown Rice',
    aliases: ['brown rice', 'cooked brown rice', 'brown chawal'],
    category: 'Grains & Breads',
    portionType: 'weight',
    servingUnits: [
      { label: 'Grams', grams: 1 },
      { label: 'Standard Cup (150g)', grams: 150 },
      { label: 'Small Bowl (100g)', grams: 100 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [100, 150, 200],
    ingredients: ['Whole Grain Brown Rice', 'Water'],
    per100g: { calories: 111, protein: 2.6, carbs: 23, fat: 0.9, fiber: 1.8 },
  },
  {
    id: 'bread_brown',
    name: 'Brown Bread / Whole Wheat Bread',
    aliases: ['brown bread', 'wheat bread', 'bread', 'slice bread', 'whole wheat bread'],
    category: 'Grains & Breads',
    portionType: 'count',
    servingUnits: [
      { label: 'Slice (30g)', grams: 30 },
      { label: '2 Slices (60g)', grams: 60 },
      { label: 'Grams', grams: 1 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [1, 2, 3, 4],
    ingredients: ['Whole Wheat Flour', 'Yeast', 'Water', 'Pinch of Sugar'],
    per100g: { calories: 250, protein: 9.0, carbs: 46, fat: 3.2, fiber: 6.0 },
  },
  {
    id: 'paratha_aloo',
    name: 'Aloo Paratha',
    aliases: ['aloo paratha', 'paratha', 'aloo ka paratha', 'stuffed paratha'],
    category: 'Grains & Breads',
    portionType: 'count',
    servingUnits: [
      { label: 'Paratha (100g)', grams: 100 },
      { label: 'Large Paratha (150g)', grams: 150 },
      { label: 'Grams', grams: 1 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [1, 2, 3],
    ingredients: ['Wheat Flour', 'Boiled Potato', 'Onion', 'Spices', 'Ghee/Oil'],
    per100g: { calories: 240, protein: 4.5, carbs: 36, fat: 9.0, fiber: 3.5 },
  },

  // â”€â”€â”€ Dairy & Vegetarian â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id: 'paneer_raw',
    name: 'Paneer (Cottage Cheese)',
    aliases: ['paneer', 'cottage cheese', 'panir', 'raw paneer', 'fresh paneer'],
    category: 'Dairy & Vegetarian',
    portionType: 'weight',
    servingUnits: [
      { label: 'Grams', grams: 1 },
      { label: 'Standard Block (100g)', grams: 100 },
      { label: 'Small Portion (50g)', grams: 50 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [50, 100, 150, 200],
    ingredients: ['Fresh Cow / Buffalo Milk', 'Citric Acid / Lemon Coagulant'],
    per100g: { calories: 290, protein: 18.3, carbs: 3.5, fat: 22.0, fiber: 0 },
  },
  {
    id: 'dal_yellow_cooked',
    name: 'Cooked Yellow Dal (Moong / Toor Tadka)',
    aliases: ['dal', 'daal', 'toor dal', 'moong dal', 'tadka dal', 'yellow dal', 'arhar dal', 'dal fry'],
    category: 'Dairy & Vegetarian',
    portionType: 'weight',
    servingUnits: [
      { label: 'Grams', grams: 1 },
      { label: 'Bowl / Katori (150g)', grams: 150 },
      { label: 'Large Bowl (200g)', grams: 200 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [150, 200, 250],
    ingredients: ['Toor / Moong Lentils', 'Water', 'Turmeric', 'Cumin Tadka', 'Ghee/Oil'],
    per100g: { calories: 95, protein: 5.5, carbs: 14.0, fat: 2.2, fiber: 3.5 },
  },
  {
    id: 'curd_dahi',
    name: 'Curd / Plain Dahi / Yogurt',
    aliases: ['dahi', 'curd', 'yogurt', 'plain curd', 'homemade curd', 'doi'],
    category: 'Dairy & Vegetarian',
    portionType: 'weight',
    servingUnits: [
      { label: 'Grams', grams: 1 },
      { label: 'Katori / Bowl (100g)', grams: 100 },
      { label: 'Cup (150g)', grams: 150 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [100, 150, 200],
    ingredients: ['Pasteurized Milk', 'Live Probiotic Cultures'],
    per100g: { calories: 65, protein: 3.8, carbs: 5.0, fat: 3.5, fiber: 0 },
  },
  {
    id: 'milk_toned',
    name: 'Toned Milk (Cow / Buffalo)',
    aliases: ['milk', 'doodh', 'toned milk', 'cow milk', 'chai milk', 'skimmed milk'],
    category: 'Dairy & Vegetarian',
    portionType: 'volume',
    servingUnits: [
      { label: 'Glass / Mug (250ml)', grams: 250 },
      { label: 'Small Cup (150ml)', grams: 150 },
      { label: 'Milliliters (ml)', grams: 1 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [150, 200, 250, 300],
    ingredients: ['Pasteurized Toned Milk (Calcium, Vitamin D, Casein & Whey)'],
    per100g: { calories: 58, protein: 3.2, carbs: 4.8, fat: 3.0, fiber: 0 },
  },

  // â”€â”€â”€ Breakfast & Snacks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id: 'oats_cooked',
    name: 'Rolled Oats (Cooked in Water/Milk)',
    aliases: ['oats', 'oatmeal', 'rolled oats', 'quaker oats', 'masala oats', 'oat'],
    category: 'Breakfast & Snacks',
    portionType: 'weight',
    servingUnits: [
      { label: 'Grams (dry oats)', grams: 1 },
      { label: 'Standard Scoop / Serving (40g dry)', grams: 40 },
      { label: 'Cooked Bowl (150g)', grams: 150 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [40, 50, 80, 100],
    ingredients: ['100% Wholegrain Rolled Oats (Beta-Glucan Fiber, Complex Carbs)'],
    per100g: { calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, fiber: 10.6 },
  },
  {
    id: 'banana_fresh',
    name: 'Fresh Banana',
    aliases: ['banana', 'kela', 'bananas', 'ripe banana'],
    category: 'Fruits & Veggies',
    portionType: 'count',
    servingUnits: [
      { label: 'Medium Banana (110g)', grams: 110 },
      { label: 'Large Banana (140g)', grams: 140 },
      { label: 'Small Banana (80g)', grams: 80 },
      { label: 'Grams', grams: 1 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [1, 2, 3],
    ingredients: ['Fresh Natural Banana (Potassium, Vitamin B6, Fast Digesting Energy)'],
    per100g: { calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fiber: 2.6 },
  },
  {
    id: 'apple_fresh',
    name: 'Fresh Apple',
    aliases: ['apple', 'seb', 'apples', 'green apple', 'red apple'],
    category: 'Fruits & Veggies',
    portionType: 'count',
    servingUnits: [
      { label: 'Medium Apple (150g)', grams: 150 },
      { label: 'Large Apple (200g)', grams: 200 },
      { label: 'Grams', grams: 1 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [1, 2],
    ingredients: ['Fresh Apple (Pectin Fiber, Polyphenols, Vitamin C)'],
    per100g: { calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2, fiber: 2.4 },
  },
  {
    id: 'peanut_butter',
    name: 'Peanut Butter',
    aliases: ['peanut butter', 'pb', 'mungfali butter', 'roasted peanut butter'],
    category: 'Breakfast & Snacks',
    portionType: 'weight',
    servingUnits: [
      { label: 'Tablespoon (16g)', grams: 16 },
      { label: '2 Tablespoons (32g)', grams: 32 },
      { label: 'Grams', grams: 1 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [16, 32, 50],
    ingredients: ['100% Roasted Peanuts', 'Pinch of Salt'],
    per100g: { calories: 588, protein: 25.0, carbs: 20.0, fat: 50.0, fiber: 8.0 },
  },
  {
    id: 'whey_protein_isolate',
    name: 'Whey Protein Powder',
    aliases: ['whey', 'protein powder', 'whey isolate', 'whey concentrate', 'isolate', 'protein shake', 'powder'],
    category: 'Fitness Supplements',
    portionType: 'count',
    servingUnits: [
      { label: 'Level Scoop (30g)', grams: 30 },
      { label: '1.5 Scoops (45g)', grams: 45 },
      { label: '2 Scoops (60g)', grams: 60 },
      { label: 'Grams', grams: 1 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [1, 2],
    ingredients: ['Microfiltered Whey Protein Isolate (24g Pure Protein per scoop, 5.5g BCAAs)'],
    per100g: { calories: 390, protein: 80.0, carbs: 5.0, fat: 3.0, fiber: 1.0 },
  },
];

/**
 * Enhanced Search with multi-word and alias matching.
 */
export function searchLocalFoods(query: string): FoodEntry[] {
  if (!query || !query.trim()) return POPULAR_FOODS_DATABASE.slice(0, 12);
  const q = query.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');

  return POPULAR_FOODS_DATABASE.filter(f => {
    const nameMatch = f.name.toLowerCase().includes(q);
    const categoryMatch = f.category.toLowerCase().includes(q);
    const aliasMatch = f.aliases.some(a => a.toLowerCase().includes(q) || q.includes(a.toLowerCase()));
    const ingredientMatch = f.ingredients.some(ing => ing.toLowerCase().includes(q));
    return nameMatch || categoryMatch || aliasMatch || ingredientMatch;
  });
}

/**
 * Calculates exact nutrition for a food given quantity and unit.
 */
export function calculateFoodNutrition(
  food: FoodEntry,
  quantity: number,
  selectedUnitIndex: number = 0
): {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  totalGrams: number;
  unitLabel: string;
  ingredients: string[];
} {
  const unit = food.servingUnits[selectedUnitIndex] || food.servingUnits[0];
  const safeQty = Math.max(0.1, quantity);
  const totalGrams = Math.round(safeQty * unit.grams * 10) / 10;
  const factor = totalGrams / 100;

  return {
    calories: Math.round(food.per100g.calories * factor),
    protein: Math.round(food.per100g.protein * factor * 10) / 10,
    carbs: Math.round(food.per100g.carbs * factor * 10) / 10,
    fat: Math.round(food.per100g.fat * factor * 10) / 10,
    fiber: Math.round(food.per100g.fiber * factor * 10) / 10,
    totalGrams,
    unitLabel: unit.label,
    ingredients: food.ingredients,
  };
}