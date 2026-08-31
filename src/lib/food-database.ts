/**
 * GymFrek — Smart Food & Ingredient Nutrition Database
 * Pre-loaded with popular everyday Indian & International foods with standard household units.
 */

export interface FoodServingUnit {
  label: string; // e.g. "Roti / Piece", "Cup", "Grams", "Tablespoon"
  grams: number; // weight in grams for 1 unit
}

export interface FoodEntry {
  id: string;
  name: string;
  category: 'Grains & Breads' | 'Protein & Meat' | 'Dairy & Vegetarian' | 'Breakfast & Snacks' | 'Fruits & Veggies' | 'Fitness Supplements' | 'Beverages';
  servingUnits: FoodServingUnit[];
  defaultUnitIndex: number;
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
  // ─── Grains & Breads ────────────────────────────────────────────────────────
  {
    id: 'roti_wheat',
    name: 'Wheat Roti / Chapati',
    category: 'Grains & Breads',
    servingUnits: [
      { label: 'Roti / Piece (35g)', grams: 35 },
      { label: 'Large Roti (50g)', grams: 50 },
      { label: 'Grams', grams: 1 },
    ],
    defaultUnitIndex: 0,
    ingredients: ['Whole Wheat Flour (Atta)', 'Water', 'Pinch of Salt'],
    per100g: { calories: 297, protein: 9.5, carbs: 60, fat: 1.5, fiber: 9.0 },
  },
  {
    id: 'roti_maida',
    name: 'Maida Roti / Parotta / Rumali',
    category: 'Grains & Breads',
    servingUnits: [
      { label: 'Roti / Piece (45g)', grams: 45 },
      { label: 'Large Parotta (80g)', grams: 80 },
      { label: 'Grams', grams: 1 },
    ],
    defaultUnitIndex: 0,
    ingredients: ['Refined Wheat Flour (Maida)', 'Oil / Ghee', 'Water', 'Salt'],
    per100g: { calories: 340, protein: 8.0, carbs: 68, fat: 4.5, fiber: 2.5 },
  },
  {
    id: 'rice_white_cooked',
    name: 'Cooked White Rice',
    category: 'Grains & Breads',
    servingUnits: [
      { label: 'Small Katori / Bowl (100g)', grams: 100 },
      { label: 'Standard Cup / Plate (150g)', grams: 150 },
      { label: 'Large Plate (250g)', grams: 250 },
      { label: 'Grams', grams: 1 },
    ],
    defaultUnitIndex: 1,
    ingredients: ['White Rice Grains', 'Water'],
    per100g: { calories: 130, protein: 2.7, carbs: 28.2, fat: 0.3, fiber: 0.4 },
  },
  {
    id: 'rice_brown_cooked',
    name: 'Cooked Brown Rice',
    category: 'Grains & Breads',
    servingUnits: [
      { label: 'Standard Cup (150g)', grams: 150 },
      { label: 'Small Bowl (100g)', grams: 100 },
      { label: 'Grams', grams: 1 },
    ],
    defaultUnitIndex: 0,
    ingredients: ['Whole Grain Brown Rice', 'Water'],
    per100g: { calories: 111, protein: 2.6, carbs: 23, fat: 0.9, fiber: 1.8 },
  },
  {
    id: 'bread_brown',
    name: 'Brown Bread / Whole Wheat Bread',
    category: 'Grains & Breads',
    servingUnits: [
      { label: 'Slice (30g)', grams: 30 },
      { label: '2 Slices (60g)', grams: 60 },
      { label: 'Grams', grams: 1 },
    ],
    defaultUnitIndex: 0,
    ingredients: ['Whole Wheat Flour', 'Yeast', 'Water', 'Pinch of Sugar'],
    per100g: { calories: 250, protein: 9.0, carbs: 46, fat: 3.2, fiber: 6.0 },
  },
  {
    id: 'bread_white',
    name: 'White Bread',
    category: 'Grains & Breads',
    servingUnits: [
      { label: 'Slice (25g)', grams: 25 },
      { label: '2 Slices (50g)', grams: 50 },
      { label: 'Grams', grams: 1 },
    ],
    defaultUnitIndex: 0,
    ingredients: ['Refined Flour (Maida)', 'Yeast', 'Sugar', 'Vegetable Oil'],
    per100g: { calories: 265, protein: 7.5, carbs: 50, fat: 3.0, fiber: 2.0 },
  },
  {
    id: 'paratha_plain',
    name: 'Plain Tawa Paratha (with Ghee/Oil)',
    category: 'Grains & Breads',
    servingUnits: [
      { label: 'Paratha (60g)', grams: 60 },
      { label: 'Large Paratha (90g)', grams: 90 },
      { label: 'Grams', grams: 1 },
    ],
    defaultUnitIndex: 0,
    ingredients: ['Wheat Flour', 'Ghee / Oil', 'Salt', 'Water'],
    per100g: { calories: 330, protein: 6.5, carbs: 48, fat: 13.0, fiber: 4.5 },
  },
  {
    id: 'paratha_aloo',
    name: 'Aloo Paratha',
    category: 'Grains & Breads',
    servingUnits: [
      { label: 'Paratha (100g)', grams: 100 },
      { label: 'Large Stuffed (150g)', grams: 150 },
      { label: 'Grams', grams: 1 },
    ],
    defaultUnitIndex: 0,
    ingredients: ['Wheat Flour', 'Boiled Potato', 'Onion', 'Spices', 'Ghee/Oil'],
    per100g: { calories: 240, protein: 4.5, carbs: 36, fat: 9.0, fiber: 3.5 },
  },

  // ─── Protein & Meat ──────────────────────────────────────────────────────────
  {
    id: 'egg_boiled_whole',
    name: 'Whole Boiled Egg',
    category: 'Protein & Meat',
    servingUnits: [
      { label: 'Large Egg (50g)', grams: 50 },
      { label: '2 Eggs (100g)', grams: 100 },
      { label: 'Grams', grams: 1 },
    ],
    defaultUnitIndex: 0,
    ingredients: ['Whole Egg (Yolk + White)'],
    per100g: { calories: 155, protein: 13.0, carbs: 1.1, fat: 11.0, fiber: 0 },
  },
  {
    id: 'egg_white_boiled',
    name: 'Boiled Egg White',
    category: 'Protein & Meat',
    servingUnits: [
      { label: 'Egg White (33g)', grams: 33 },
      { label: '2 Egg Whites (66g)', grams: 66 },
      { label: 'Grams', grams: 1 },
    ],
    defaultUnitIndex: 0,
    ingredients: ['Pure Egg Albumin'],
    per100g: { calories: 52, protein: 11.0, carbs: 0.7, fat: 0.2, fiber: 0 },
  },
  {
    id: 'chicken_breast_cooked',
    name: 'Cooked Chicken Breast (Grilled / Boiled)',
    category: 'Protein & Meat',
    servingUnits: [
      { label: 'Medium Breast (120g)', grams: 120 },
      { label: '100 Grams', grams: 100 },
      { label: 'Small Portion (80g)', grams: 80 },
      { label: 'Grams', grams: 1 },
    ],
    defaultUnitIndex: 1,
    ingredients: ['Lean Chicken Breast', 'Salt & Pepper'],
    per100g: { calories: 165, protein: 31.0, carbs: 0, fat: 3.6, fiber: 0 },
  },
  {
    id: 'chicken_curry',
    name: 'Chicken Curry (Home Style)',
    category: 'Protein & Meat',
    servingUnits: [
      { label: 'Standard Bowl / Katori (150g)', grams: 150 },
      { label: 'Large Serving (250g)', grams: 250 },
      { label: 'Grams', grams: 1 },
    ],
    defaultUnitIndex: 0,
    ingredients: ['Chicken Pieces', 'Onion', 'Tomato', 'Spices', 'Cooking Oil'],
    per100g: { calories: 175, protein: 18.0, carbs: 4.5, fat: 9.5, fiber: 1.2 },
  },
  {
    id: 'soya_chunks_cooked',
    name: 'Cooked Soya Chunks',
    category: 'Protein & Meat',
    servingUnits: [
      { label: 'Cup Cooked (100g)', grams: 100 },
      { label: 'Bowl (150g)', grams: 150 },
      { label: 'Grams', grams: 1 },
    ],
    defaultUnitIndex: 0,
    ingredients: ['Defatted Soya Flour', 'Water', 'Indian Spices'],
    per100g: { calories: 150, protein: 17.5, carbs: 12.0, fat: 0.5, fiber: 5.0 },
  },

  // ─── Dairy & Vegetarian ─────────────────────────────────────────────────────
  {
    id: 'paneer_raw',
    name: 'Paneer (Cottage Cheese)',
    category: 'Dairy & Vegetarian',
    servingUnits: [
      { label: 'Cubed Portion (50g)', grams: 50 },
      { label: 'Standard Block (100g)', grams: 100 },
      { label: 'Grams', grams: 1 },
    ],
    defaultUnitIndex: 1,
    ingredients: ['Full Cream Cow / Buffalo Milk', 'Lemon Juice / Citric Acid'],
    per100g: { calories: 290, protein: 18.3, carbs: 3.5, fat: 22.0, fiber: 0 },
  },
  {
    id: 'paneer_low_fat',
    name: 'Low-Fat / Toned Milk Paneer',
    category: 'Dairy & Vegetarian',
    servingUnits: [
      { label: 'Standard Portion (100g)', grams: 100 },
      { label: 'Small Portion (50g)', grams: 50 },
      { label: 'Grams', grams: 1 },
    ],
    defaultUnitIndex: 0,
    ingredients: ['Toned Skimmed Milk', 'Natural Coagulant'],
    per100g: { calories: 170, protein: 24.0, carbs: 4.0, fat: 6.5, fiber: 0 },
  },
  {
    id: 'dal_yellow_cooked',
    name: 'Cooked Yellow Dal (Moong / Toor Tadka)',
    category: 'Dairy & Vegetarian',
    servingUnits: [
      { label: 'Katori / Bowl (150g)', grams: 150 },
      { label: 'Large Bowl (200g)', grams: 200 },
      { label: 'Grams', grams: 1 },
    ],
    defaultUnitIndex: 0,
    ingredients: ['Toor / Moong Lentils', 'Water', 'Turmeric', 'Cumin & Mustard Tadka', 'Ghee/Oil'],
    per100g: { calories: 95, protein: 5.5, carbs: 14.0, fat: 2.2, fiber: 3.5 },
  },
  {
    id: 'dal_chana_cooked',
    name: 'Cooked Chana Dal / Chole',
    category: 'Dairy & Vegetarian',
    servingUnits: [
      { label: 'Katori / Bowl (150g)', grams: 150 },
      { label: 'Large Bowl (200g)', grams: 200 },
      { label: 'Grams', grams: 1 },
    ],
    defaultUnitIndex: 0,
    ingredients: ['Chickpeas / Bengal Gram', 'Tomato', 'Onion', 'Spices'],
    per100g: { calories: 130, protein: 7.0, carbs: 20.0, fat: 3.0, fiber: 5.0 },
  },
  {
    id: 'curd_dahi',
    name: 'Curd / Plain Dahi / Yogurt',
    category: 'Dairy & Vegetarian',
    servingUnits: [
      { label: 'Small Katori (100g)', grams: 100 },
      { label: 'Cup (150g)', grams: 150 },
      { label: 'Grams', grams: 1 },
    ],
    defaultUnitIndex: 1,
    ingredients: ['Milk', 'Live Probiotic Cultures'],
    per100g: { calories: 65, protein: 3.8, carbs: 5.0, fat: 3.5, fiber: 0 },
  },
  {
    id: 'milk_toned',
    name: 'Toned Milk (3% Fat)',
    category: 'Dairy & Vegetarian',
    servingUnits: [
      { label: 'Glass / Mug (250ml / 250g)', grams: 250 },
      { label: 'Small Cup (150ml / 150g)', grams: 150 },
      { label: 'Grams', grams: 1 },
    ],
    defaultUnitIndex: 0,
    ingredients: ['Pasteurized Toned Cow Milk'],
    per100g: { calories: 58, protein: 3.2, carbs: 4.8, fat: 3.0, fiber: 0 },
  },

  // ─── Breakfast & Snacks ─────────────────────────────────────────────────────
  {
    id: 'oats_cooked',
    name: 'Rolled Oats (Cooked in Water/Milk)',
    category: 'Breakfast & Snacks',
    servingUnits: [
      { label: 'Cooked Bowl (150g)', grams: 150 },
      { label: 'Dry Scoop (40g)', grams: 40 },
      { label: 'Grams', grams: 1 },
    ],
    defaultUnitIndex: 0,
    ingredients: ['100% Wholegrain Rolled Oats', 'Water / Milk'],
    per100g: { calories: 110, protein: 4.5, carbs: 19.5, fat: 2.0, fiber: 3.0 },
  },
  {
    id: 'idli_steamed',
    name: 'Steamed Rice Idli',
    category: 'Breakfast & Snacks',
    servingUnits: [
      { label: 'Medium Idli (35g)', grams: 35 },
      { label: '2 Idlis (70g)', grams: 70 },
      { label: 'Plate of 3 Idlis (105g)', grams: 105 },
      { label: 'Grams', grams: 1 },
    ],
    defaultUnitIndex: 1,
    ingredients: ['Fermented Rice', 'Urad Dal (Black Gram)', 'Fenugreek', 'Salt'],
    per100g: { calories: 140, protein: 4.5, carbs: 29.0, fat: 0.5, fiber: 1.5 },
  },
  {
    id: 'dosa_plain',
    name: 'Plain Dosa',
    category: 'Breakfast & Snacks',
    servingUnits: [
      { label: 'Standard Dosa (80g)', grams: 80 },
      { label: 'Large Masala Dosa (150g)', grams: 150 },
      { label: 'Grams', grams: 1 },
    ],
    defaultUnitIndex: 0,
    ingredients: ['Fermented Rice & Urad Dal Batter', 'Oil / Ghee'],
    per100g: { calories: 170, protein: 4.0, carbs: 30.0, fat: 4.0, fiber: 1.8 },
  },
  {
    id: 'poha_cooked',
    name: 'Poha (Flattened Rice with Veggies)',
    category: 'Breakfast & Snacks',
    servingUnits: [
      { label: 'Plate / Bowl (150g)', grams: 150 },
      { label: 'Small Bowl (100g)', grams: 100 },
      { label: 'Grams', grams: 1 },
    ],
    defaultUnitIndex: 0,
    ingredients: ['Flattened Rice (Poha)', 'Peanuts', 'Onion', 'Mustard Seeds', 'Turmeric', 'Oil'],
    per100g: { calories: 160, protein: 3.5, carbs: 27.0, fat: 4.5, fiber: 2.0 },
  },
  {
    id: 'peanut_butter',
    name: 'Peanut Butter (100% Roasted Peanuts)',
    category: 'Breakfast & Snacks',
    servingUnits: [
      { label: 'Tablespoon (16g)', grams: 16 },
      { label: '2 Tablespoons (32g)', grams: 32 },
      { label: 'Grams', grams: 1 },
    ],
    defaultUnitIndex: 0,
    ingredients: ['Roasted Peanuts', 'Pinch of Salt'],
    per100g: { calories: 588, protein: 25.0, carbs: 20.0, fat: 50.0, fiber: 8.0 },
  },
  {
    id: 'almonds_raw',
    name: 'Almonds (Badam)',
    category: 'Breakfast & Snacks',
    servingUnits: [
      { label: 'Handful / 10-12 nuts (15g)', grams: 15 },
      { label: '20 Nuts (28g)', grams: 28 },
      { label: 'Grams', grams: 1 },
    ],
    defaultUnitIndex: 0,
    ingredients: ['100% Whole California / Indian Almonds'],
    per100g: { calories: 579, protein: 21.0, carbs: 22.0, fat: 50.0, fiber: 12.5 },
  },

  // ─── Fruits & Veggies ───────────────────────────────────────────────────────
  {
    id: 'banana_fresh',
    name: 'Banana',
    category: 'Fruits & Veggies',
    servingUnits: [
      { label: 'Medium Banana (110g)', grams: 110 },
      { label: 'Large Banana (140g)', grams: 140 },
      { label: 'Small Banana (80g)', grams: 80 },
      { label: 'Grams', grams: 1 },
    ],
    defaultUnitIndex: 0,
    ingredients: ['Fresh Natural Banana (Potassium, B6, Natural Glucose)'],
    per100g: { calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fiber: 2.6 },
  },
  {
    id: 'apple_fresh',
    name: 'Apple',
    category: 'Fruits & Veggies',
    servingUnits: [
      { label: 'Medium Apple (150g)', grams: 150 },
      { label: 'Large Apple (200g)', grams: 200 },
      { label: 'Grams', grams: 1 },
    ],
    defaultUnitIndex: 0,
    ingredients: ['Fresh Apple (Pectin Fiber, Vitamin C)'],
    per100g: { calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2, fiber: 2.4 },
  },
  {
    id: 'broccoli_steamed',
    name: 'Broccoli (Steamed / Sautéed)',
    category: 'Fruits & Veggies',
    servingUnits: [
      { label: 'Cup (90g)', grams: 90 },
      { label: '100 Grams', grams: 100 },
      { label: 'Grams', grams: 1 },
    ],
    defaultUnitIndex: 0,
    ingredients: ['Fresh Green Broccoli (Sulforaphane, Vitamin K)'],
    per100g: { calories: 35, protein: 2.8, carbs: 7.0, fat: 0.4, fiber: 2.6 },
  },

  // ─── Fitness Supplements ───────────────────────────────────────────────────
  {
    id: 'whey_protein_isolate',
    name: 'Whey Protein Powder (100% Isolate / Concentrate)',
    category: 'Fitness Supplements',
    servingUnits: [
      { label: '1 Level Scoop (30g)', grams: 30 },
      { label: '1.5 Scoops (45g)', grams: 45 },
      { label: '2 Scoops (60g)', grams: 60 },
      { label: 'Grams', grams: 1 },
    ],
    defaultUnitIndex: 0,
    ingredients: ['Cross-Flow Microfiltered Whey Protein Isolate', 'BCAAs', 'EAAs'],
    per100g: { calories: 390, protein: 80.0, carbs: 5.0, fat: 3.0, fiber: 1.0 },
  },
];

/**
 * Searches the preloaded food database with fuzzy matching.
 */
export function searchLocalFoods(query: string): FoodEntry[] {
  if (!query || !query.trim()) return POPULAR_FOODS_DATABASE.slice(0, 15);
  const q = query.toLowerCase().trim();

  return POPULAR_FOODS_DATABASE.filter(f =>
    f.name.toLowerCase().includes(q) ||
    f.category.toLowerCase().includes(q) ||
    f.ingredients.some(ing => ing.toLowerCase().includes(q))
  );
}

/**
 * Automatically calculates exact nutrition for a food item given its quantity and chosen serving unit.
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