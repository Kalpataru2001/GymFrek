/**
 * GymFrek â€” Comprehensive Indian & Global Food Nutrition Database
 * Full support for English, Hindi, and regional food names with accurate household portions.
 */

export type FoodPortionType = 'count' | 'weight' | 'volume';

export interface FoodServingUnit {
  label: string; // e.g. "Grams (g)", "Piece / Roti (35g)", "Bowl (150g)"
  grams: number; // weight in grams
}

export interface FoodEntry {
  id: string;
  name: string;
  aliases: string[];
  category: 'Indian Sabzi & Veg' | 'Dals & Curries' | 'Grains, Roti & Rice' | 'Protein & Meat' | 'Dairy & Vegetarian' | 'Breakfast & Snacks' | 'Fruits & Nuts' | 'Fitness Supplements' | 'Beverages';
  portionType: FoodPortionType;
  servingUnits: FoodServingUnit[];
  defaultUnitIndex: number;
  quickPortions: number[];
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
  // â”€â”€â”€ Indian Sabzis & Vegetables â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id: 'bhindi_masala',
    name: 'Bhindi Masala / Okra / Ladies Finger',
    aliases: ['bhindi', 'okra', 'ladies finger', 'lady finger', 'bhindi fry', 'bhendi', 'bhindi ki sabzi', 'stir fry okra'],
    category: 'Indian Sabzi & Veg',
    portionType: 'weight',
    servingUnits: [
      { label: 'Grams (g)', grams: 1 },
      { label: 'Katori / Bowl (150g)', grams: 150 },
      { label: 'Small Bowl (100g)', grams: 100 },
      { label: 'Large Plate (250g)', grams: 250 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [100, 150, 200, 250],
    ingredients: ['Fresh Okra (Bhindi)', 'Onion', 'Tomato', 'Turmeric, Coriander & Cumin Spices', 'Mustard / Cooking Oil'],
    per100g: { calories: 88, protein: 2.2, carbs: 9.5, fat: 4.8, fiber: 3.2 },
  },
  {
    id: 'aloo_gobi',
    name: 'Aloo Gobi (Potato & Cauliflower Sabzi)',
    aliases: ['aloo gobi', 'alu gobi', 'gobi aloo', 'cauliflower potato', 'aloo gobhi', 'gobi ki sabzi'],
    category: 'Indian Sabzi & Veg',
    portionType: 'weight',
    servingUnits: [
      { label: 'Grams (g)', grams: 1 },
      { label: 'Katori / Bowl (150g)', grams: 150 },
      { label: 'Large Bowl (200g)', grams: 200 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [100, 150, 200],
    ingredients: ['Cauliflower Florets', 'Boiled Potato', 'Ginger & Garlic', 'Indian Spices', 'Light Oil'],
    per100g: { calories: 92, protein: 2.4, carbs: 14.5, fat: 3.2, fiber: 2.8 },
  },
  {
    id: 'baingan_bharta',
    name: 'Baingan Bharta (Roasted Eggplant/Brinjal)',
    aliases: ['baingan', 'baingan bharta', 'eggplant', 'brinjal', 'aubergine', 'baigan ka bharta'],
    category: 'Indian Sabzi & Veg',
    portionType: 'weight',
    servingUnits: [
      { label: 'Grams (g)', grams: 1 },
      { label: 'Katori / Bowl (150g)', grams: 150 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [100, 150, 200],
    ingredients: ['Fire-Roasted Eggplant', 'Green Chillies', 'Tomato', 'Onion', 'Spices'],
    per100g: { calories: 76, protein: 1.8, carbs: 8.5, fat: 4.0, fiber: 3.5 },
  },
  {
    id: 'palak_paneer',
    name: 'Palak Paneer',
    aliases: ['palak paneer', 'spinach paneer', 'palak', 'saag paneer', 'spinach cottage cheese'],
    category: 'Indian Sabzi & Veg',
    portionType: 'weight',
    servingUnits: [
      { label: 'Grams (g)', grams: 1 },
      { label: 'Katori / Bowl (150g)', grams: 150 },
      { label: 'Large Bowl (200g)', grams: 200 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [150, 200, 250],
    ingredients: ['Fresh Spinach Puree (Palak)', 'Paneer Cubes', 'Garlic', 'Ghee/Oil', 'Spices'],
    per100g: { calories: 150, protein: 8.5, carbs: 4.5, fat: 11.0, fiber: 2.5 },
  },
  {
    id: 'lauki_sabzi',
    name: 'Lauki / Bottle Gourd / Dudhi Sabzi',
    aliases: ['lauki', 'bottle gourd', 'dudhi', 'ghiya', 'lauki ki sabzi', 'kaddu'],
    category: 'Indian Sabzi & Veg',
    portionType: 'weight',
    servingUnits: [
      { label: 'Grams (g)', grams: 1 },
      { label: 'Katori / Bowl (150g)', grams: 150 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [100, 150, 200],
    ingredients: ['Bottle Gourd (Lauki)', 'Cumin Seeds', 'Turmeric', 'Green Chilli', 'Light Ghee/Oil'],
    per100g: { calories: 45, protein: 1.1, carbs: 5.0, fat: 2.2, fiber: 2.0 },
  },
  {
    id: 'mix_veg_curry',
    name: 'Mixed Vegetable Curry / Sabzi',
    aliases: ['mix veg', 'mix vegetable', 'vegetable curry', 'subzi', 'sabzi', 'mixed veg'],
    category: 'Indian Sabzi & Veg',
    portionType: 'weight',
    servingUnits: [
      { label: 'Grams (g)', grams: 1 },
      { label: 'Katori / Bowl (150g)', grams: 150 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [100, 150, 200],
    ingredients: ['Carrot', 'Green Beans', 'Peas', 'Cauliflower', 'Potato', 'Onion-Tomato Masala'],
    per100g: { calories: 85, protein: 2.6, carbs: 11.5, fat: 3.5, fiber: 3.4 },
  },
  {
    id: 'cabbage_sabzi',
    name: 'Patta Gobi / Cabbage Sabzi',
    aliases: ['cabbage', 'patta gobi', 'bandh gobi', 'cabbage matar', 'patta gobhi'],
    category: 'Indian Sabzi & Veg',
    portionType: 'weight',
    servingUnits: [
      { label: 'Grams (g)', grams: 1 },
      { label: 'Katori / Bowl (150g)', grams: 150 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [100, 150, 200],
    ingredients: ['Shredded Cabbage', 'Green Peas', 'Mustard Seeds', 'Turmeric', 'Light Oil'],
    per100g: { calories: 60, protein: 1.8, carbs: 8.0, fat: 2.5, fiber: 2.8 },
  },

  // â”€â”€â”€ Dals & Legumes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id: 'dal_yellow_cooked',
    name: 'Cooked Yellow Dal (Moong / Toor / Arhar Tadka)',
    aliases: ['dal', 'daal', 'toor dal', 'moong dal', 'tadka dal', 'yellow dal', 'arhar dal', 'dal fry', 'peeli dal'],
    category: 'Dals & Curries',
    portionType: 'weight',
    servingUnits: [
      { label: 'Grams (g)', grams: 1 },
      { label: 'Katori / Bowl (150g)', grams: 150 },
      { label: 'Large Bowl (200g)', grams: 200 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [150, 200, 250],
    ingredients: ['Toor / Moong Split Lentils', 'Water', 'Turmeric', 'Cumin & Garlic Tadka', 'Ghee/Oil'],
    per100g: { calories: 95, protein: 5.5, carbs: 14.0, fat: 2.2, fiber: 3.5 },
  },
  {
    id: 'rajma_masala',
    name: 'Rajma Masala (Kidney Beans Curry)',
    aliases: ['rajma', 'rajma masala', 'kidney beans', 'rajma chawal', 'red kidney beans'],
    category: 'Dals & Curries',
    portionType: 'weight',
    servingUnits: [
      { label: 'Grams (g)', grams: 1 },
      { label: 'Katori / Bowl (150g)', grams: 150 },
      { label: 'Large Bowl (200g)', grams: 200 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [150, 200, 250],
    ingredients: ['Red Kidney Beans (Rajma)', 'Onion', 'Tomato Puree', 'Ginger Garlic', 'Spices'],
    per100g: { calories: 125, protein: 6.8, carbs: 19.5, fat: 2.8, fiber: 5.5 },
  },
  {
    id: 'chole_masala',
    name: 'Chole / Chickpeas Curry (Kabuli Chana)',
    aliases: ['chole', 'chana masala', 'chickpeas', 'kabuli chana', 'chhole', 'chana curry'],
    category: 'Dals & Curries',
    portionType: 'weight',
    servingUnits: [
      { label: 'Grams (g)', grams: 1 },
      { label: 'Katori / Bowl (150g)', grams: 150 },
      { label: 'Large Bowl (200g)', grams: 200 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [150, 200, 250],
    ingredients: ['White Chickpeas (Chole)', 'Onion-Tomato Gravy', 'Chole Masala Spices'],
    per100g: { calories: 135, protein: 7.2, carbs: 21.0, fat: 3.2, fiber: 5.8 },
  },
  {
    id: 'kala_chana_curry',
    name: 'Kala Chana / Black Chickpeas (Boiled / Curry)',
    aliases: ['kala chana', 'black chana', 'black chickpeas', 'desi chana', 'boiled chana'],
    category: 'Dals & Curries',
    portionType: 'weight',
    servingUnits: [
      { label: 'Grams (g)', grams: 1 },
      { label: 'Katori / Bowl (150g)', grams: 150 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [100, 150, 200],
    ingredients: ['Desi Black Chickpeas', 'Spices', 'Green Chillies', 'Lemon'],
    per100g: { calories: 140, protein: 8.5, carbs: 22.0, fat: 2.5, fiber: 6.5 },
  },
  {
    id: 'sambar',
    name: 'South Indian Sambar',
    aliases: ['sambar', 'sambhar', 'south indian sambar'],
    category: 'Dals & Curries',
    portionType: 'weight',
    servingUnits: [
      { label: 'Grams (g)', grams: 1 },
      { label: 'Bowl (150g)', grams: 150 },
      { label: 'Large Bowl (200g)', grams: 200 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [150, 200, 250],
    ingredients: ['Toor Dal', 'Drumstick, Pumpkin, Shallots', 'Tamarind Pulp', 'Sambar Masala'],
    per100g: { calories: 65, protein: 3.2, carbs: 10.5, fat: 1.4, fiber: 2.5 },
  },

  // â”€â”€â”€ Grains, Roti & Rice â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id: 'roti_wheat',
    name: 'Wheat Roti / Chapati / Phulka',
    aliases: ['roti', 'chapati', 'phulka', 'wheat roti', 'roti wheat', 'atta roti', 'rotli', 'fulka'],
    category: 'Grains, Roti & Rice',
    portionType: 'count',
    servingUnits: [
      { label: 'Roti / Piece (35g)', grams: 35 },
      { label: 'Large Roti (50g)', grams: 50 },
      { label: 'Grams (g)', grams: 1 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [1, 2, 3, 4, 5],
    ingredients: ['Whole Wheat Flour (Atta)', 'Water', 'Pinch of Salt'],
    per100g: { calories: 297, protein: 9.5, carbs: 60, fat: 1.5, fiber: 9.0 },
  },
  {
    id: 'roti_maida',
    name: 'Maida Roti / Parotta / Rumali Roti',
    aliases: ['maida roti', 'maide roti', 'rumali roti', 'parotta', 'maida', 'paratha maida', 'malabar parotta', 'rumali'],
    category: 'Grains, Roti & Rice',
    portionType: 'count',
    servingUnits: [
      { label: 'Roti / Piece (45g)', grams: 45 },
      { label: 'Large Parotta (80g)', grams: 80 },
      { label: 'Grams (g)', grams: 1 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [1, 2, 3, 4],
    ingredients: ['Refined Wheat Flour (Maida)', 'Oil / Ghee', 'Water', 'Salt'],
    per100g: { calories: 340, protein: 8.0, carbs: 68, fat: 4.5, fiber: 2.5 },
  },
  {
    id: 'rice_white_cooked',
    name: 'Cooked White Rice',
    aliases: ['rice', 'white rice', 'cooked rice', 'chawal', 'plain rice', 'bhat', 'steamed rice', 'basmati rice'],
    category: 'Grains, Roti & Rice',
    portionType: 'weight',
    servingUnits: [
      { label: 'Grams (g)', grams: 1 },
      { label: 'Small Katori / Bowl (100g)', grams: 100 },
      { label: 'Standard Plate (150g)', grams: 150 },
      { label: 'Large Plate (250g)', grams: 250 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [100, 150, 200, 250],
    ingredients: ['White Basmati / Sona Masoori Rice', 'Water'],
    per100g: { calories: 130, protein: 2.7, carbs: 28.2, fat: 0.3, fiber: 0.4 },
  },
  {
    id: 'chicken_biryani',
    name: 'Chicken Biryani (Hyderabadi / Dum)',
    aliases: ['biryani', 'chicken biryani', 'dum biryani', 'murgh biryani', 'hyderabadi biryani'],
    category: 'Grains, Roti & Rice',
    portionType: 'weight',
    servingUnits: [
      { label: 'Grams (g)', grams: 1 },
      { label: 'Standard Plate (250g)', grams: 250 },
      { label: 'Half Plate (150g)', grams: 150 },
      { label: 'Large Plate (350g)', grams: 350 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [150, 200, 250, 300],
    ingredients: ['Basmati Rice', 'Chicken Pieces', 'Ghee / Oil', 'Yogurt', 'Biryani Spices', 'Fried Onions'],
    per100g: { calories: 195, protein: 9.5, carbs: 22.0, fat: 8.0, fiber: 1.2 },
  },
  {
    id: 'paratha_aloo',
    name: 'Aloo Paratha (Stuffed Potato Paratha)',
    aliases: ['aloo paratha', 'paratha', 'aloo ka paratha', 'stuffed paratha', 'alu paratha'],
    category: 'Grains, Roti & Rice',
    portionType: 'count',
    servingUnits: [
      { label: 'Paratha (100g)', grams: 100 },
      { label: 'Large Paratha (150g)', grams: 150 },
      { label: 'Grams (g)', grams: 1 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [1, 2, 3],
    ingredients: ['Wheat Flour', 'Boiled Potato', 'Onion', 'Spices', 'Ghee/Oil'],
    per100g: { calories: 240, protein: 4.5, carbs: 36, fat: 9.0, fiber: 3.5 },
  },
  {
    id: 'khichdi_moong',
    name: 'Moong Dal Khichdi',
    aliases: ['khichdi', 'khichri', 'moong khichdi', 'dal khichdi'],
    category: 'Grains, Roti & Rice',
    portionType: 'weight',
    servingUnits: [
      { label: 'Grams (g)', grams: 1 },
      { label: 'Bowl / Plate (200g)', grams: 200 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [150, 200, 250],
    ingredients: ['Rice', 'Moong Dal', 'Ghee', 'Cumin Seeds', 'Turmeric'],
    per100g: { calories: 120, protein: 4.5, carbs: 22.0, fat: 2.0, fiber: 2.5 },
  },

  // â”€â”€â”€ Protein & Meat â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id: 'soya_chunks',
    name: 'Soya Chunks / Soyabean / Nutrela',
    aliases: ['soya', 'soyabean', 'soybean', 'soya chunks', 'nutrela', 'meal maker', 'soya bean', 'soyabeans', 'soy', 'soya badi'],
    category: 'Protein & Meat',
    portionType: 'weight',
    servingUnits: [
      { label: 'Grams (raw weight)', grams: 1 },
      { label: 'Standard Serving (50g raw)', grams: 50 },
      { label: 'Cooked Bowl (150g)', grams: 150 },
      { label: 'Small Bowl (100g)', grams: 100 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [30, 50, 75, 100],
    ingredients: ['Defatted Soya Flour (52% Plant Protein, Essential Amino Acids)'],
    per100g: { calories: 345, protein: 52.0, carbs: 33.0, fat: 0.5, fiber: 13.0 },
  },
  {
    id: 'egg_boiled_whole',
    name: 'Whole Boiled Egg',
    aliases: ['egg', 'boiled egg', 'eggs', 'anda', 'dim', 'boiled eggs', 'whole egg', 'boiled anda'],
    category: 'Protein & Meat',
    portionType: 'count',
    servingUnits: [
      { label: 'Piece / Egg (50g)', grams: 50 },
      { label: 'Grams (g)', grams: 1 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [1, 2, 3, 4, 6],
    ingredients: ['Whole Egg (Albumin Protein + Choline & Healthy Fat Yolk)'],
    per100g: { calories: 155, protein: 13.0, carbs: 1.1, fat: 11.0, fiber: 0 },
  },
  {
    id: 'egg_white_boiled',
    name: 'Boiled Egg White',
    aliases: ['egg white', 'egg whites', 'anda safed', 'whites', 'boiled egg white', 'dim er sada'],
    category: 'Protein & Meat',
    portionType: 'count',
    servingUnits: [
      { label: 'Piece / White (33g)', grams: 33 },
      { label: 'Grams (g)', grams: 1 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [2, 3, 4, 5, 6],
    ingredients: ['Pure Egg Albumin (100% Bioavailable Lean Protein)'],
    per100g: { calories: 52, protein: 11.0, carbs: 0.7, fat: 0.2, fiber: 0 },
  },
  {
    id: 'egg_omelet',
    name: 'Egg Omelette / Bhurji',
    aliases: ['omelet', 'omelette', 'egg bhurji', 'anda bhurji', 'fried egg', 'scrambled egg'],
    category: 'Protein & Meat',
    portionType: 'count',
    servingUnits: [
      { label: '2-Egg Omelette (120g)', grams: 120 },
      { label: '1-Egg Omelette (60g)', grams: 60 },
      { label: 'Grams (g)', grams: 1 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [1, 2],
    ingredients: ['Eggs', 'Onion', 'Green Chilli', 'Coriander', '1 tsp Oil'],
    per100g: { calories: 185, protein: 12.0, carbs: 2.5, fat: 14.0, fiber: 0.5 },
  },
  {
    id: 'chicken_breast_cooked',
    name: 'Chicken Breast (Grilled / Boiled)',
    aliases: ['chicken', 'chicken breast', 'grilled chicken', 'boiled chicken', 'murgh', 'boneless chicken', 'gym chicken'],
    category: 'Protein & Meat',
    portionType: 'weight',
    servingUnits: [
      { label: 'Grams (g)', grams: 1 },
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
    name: 'Chicken Curry (Home Style Gravy)',
    aliases: ['chicken curry', 'chicken gravy', 'curry chicken', 'murgh curry', 'tari chicken'],
    category: 'Protein & Meat',
    portionType: 'weight',
    servingUnits: [
      { label: 'Grams (g)', grams: 1 },
      { label: 'Katori / Bowl (150g)', grams: 150 },
      { label: 'Large Plate (250g)', grams: 250 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [150, 200, 250],
    ingredients: ['Chicken Pieces', 'Onion', 'Tomato', 'Ginger Garlic', 'Indian Spices', 'Oil'],
    per100g: { calories: 175, protein: 18.0, carbs: 4.5, fat: 9.5, fiber: 1.2 },
  },
  {
    id: 'fish_curry',
    name: 'Fish Curry / Macher Jhol',
    aliases: ['fish', 'fish curry', 'machli', 'macher jhol', 'rohu curry', 'katla curry', 'fish fry'],
    category: 'Protein & Meat',
    portionType: 'weight',
    servingUnits: [
      { label: 'Grams (g)', grams: 1 },
      { label: '1 Piece with Gravy (120g)', grams: 120 },
      { label: '2 Pieces with Gravy (220g)', grams: 220 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [120, 200, 250],
    ingredients: ['Fish Pieces', 'Mustard / Tomato Gravy', 'Turmeric', 'Green Chilli', 'Mustard Oil'],
    per100g: { calories: 135, protein: 16.5, carbs: 3.0, fat: 6.5, fiber: 0.5 },
  },

  // â”€â”€â”€ Dairy & Vegetarian â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id: 'paneer_raw',
    name: 'Paneer (Raw / Cottage Cheese)',
    aliases: ['paneer', 'cottage cheese', 'panir', 'raw paneer', 'fresh paneer', 'malai paneer'],
    category: 'Dairy & Vegetarian',
    portionType: 'weight',
    servingUnits: [
      { label: 'Grams (g)', grams: 1 },
      { label: 'Standard Block (100g)', grams: 100 },
      { label: 'Small Portion (50g)', grams: 50 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [50, 100, 150, 200],
    ingredients: ['Fresh Cow / Buffalo Milk', 'Lemon Juice / Citric Acid'],
    per100g: { calories: 290, protein: 18.3, carbs: 3.5, fat: 22.0, fiber: 0 },
  },
  {
    id: 'paneer_bhurji',
    name: 'Paneer Bhurji (Scrambled Paneer)',
    aliases: ['paneer bhurji', 'paneer burji', 'scrambled paneer'],
    category: 'Dairy & Vegetarian',
    portionType: 'weight',
    servingUnits: [
      { label: 'Grams (g)', grams: 1 },
      { label: 'Katori / Bowl (150g)', grams: 150 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [100, 150, 200],
    ingredients: ['Crumbled Paneer', 'Onion', 'Tomato', 'Green Chilli', '1 tsp Ghee/Oil'],
    per100g: { calories: 210, protein: 14.0, carbs: 5.0, fat: 15.0, fiber: 1.2 },
  },
  {
    id: 'curd_dahi',
    name: 'Curd / Plain Dahi / Yogurt',
    aliases: ['dahi', 'curd', 'yogurt', 'plain curd', 'homemade curd', 'doi', 'tok doi'],
    category: 'Dairy & Vegetarian',
    portionType: 'weight',
    servingUnits: [
      { label: 'Grams (g)', grams: 1 },
      { label: 'Katori / Bowl (100g)', grams: 100 },
      { label: 'Cup (150g)', grams: 150 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [100, 150, 200],
    ingredients: ['Pasteurized Milk', 'Live Probiotic Cultures'],
    per100g: { calories: 65, protein: 3.8, carbs: 5.0, fat: 3.5, fiber: 0 },
  },
  {
    id: 'chaas_buttermilk',
    name: 'Chaas / Buttermilk',
    aliases: ['chaas', 'buttermilk', 'chach', 'matha', 'mattha', 'masala chaas'],
    category: 'Dairy & Vegetarian',
    portionType: 'volume',
    servingUnits: [
      { label: 'Glass (250ml)', grams: 250 },
      { label: 'Milliliters (ml)', grams: 1 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [1, 2],
    ingredients: ['Diluted Curd', 'Roasted Cumin', 'Mint', 'Black Salt', 'Water'],
    per100g: { calories: 28, protein: 1.8, carbs: 2.6, fat: 1.1, fiber: 0 },
  },
  {
    id: 'milk_toned',
    name: 'Toned Milk (Cow / Buffalo)',
    aliases: ['milk', 'doodh', 'toned milk', 'cow milk', 'chai milk'],
    category: 'Dairy & Vegetarian',
    portionType: 'volume',
    servingUnits: [
      { label: 'Glass / Mug (250ml)', grams: 250 },
      { label: 'Small Cup (150ml)', grams: 150 },
      { label: 'Milliliters (ml)', grams: 1 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [1, 2],
    ingredients: ['Pasteurized Toned Milk (Calcium, Vitamin D, Casein Protein)'],
    per100g: { calories: 58, protein: 3.2, carbs: 4.8, fat: 3.0, fiber: 0 },
  },

  // â”€â”€â”€ Breakfast & Snacks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id: 'oats_cooked',
    name: 'Rolled Oats (Raw / Cooked)',
    aliases: ['oats', 'oatmeal', 'rolled oats', 'quaker oats', 'masala oats', 'oat'],
    category: 'Breakfast & Snacks',
    portionType: 'weight',
    servingUnits: [
      { label: 'Grams (raw dry weight)', grams: 1 },
      { label: 'Standard Scoop (40g raw)', grams: 40 },
      { label: 'Cooked Bowl (150g)', grams: 150 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [40, 50, 80, 100],
    ingredients: ['100% Wholegrain Rolled Oats (Beta-Glucan Fiber, Complex Carbs)'],
    per100g: { calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, fiber: 10.6 },
  },
  {
    id: 'poha_cooked',
    name: 'Poha (Flattened Rice with Peanuts & Veggies)',
    aliases: ['poha', 'flattened rice', 'kanda poha', 'pohe', 'chivda'],
    category: 'Breakfast & Snacks',
    portionType: 'weight',
    servingUnits: [
      { label: 'Grams (g)', grams: 1 },
      { label: 'Standard Plate (150g)', grams: 150 },
      { label: 'Small Bowl (100g)', grams: 100 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [100, 150, 200],
    ingredients: ['Flattened Rice (Poha)', 'Roasted Peanuts', 'Onion', 'Mustard Seeds', 'Turmeric', 'Light Oil'],
    per100g: { calories: 160, protein: 3.5, carbs: 27.0, fat: 4.5, fiber: 2.0 },
  },
  {
    id: 'idli_steamed',
    name: 'Steamed Rice Idli',
    aliases: ['idli', 'idlis', 'steamed idli', 'rice idli', 'idly'],
    category: 'Breakfast & Snacks',
    portionType: 'count',
    servingUnits: [
      { label: 'Piece / Idli (35g)', grams: 35 },
      { label: 'Plate of 2 (70g)', grams: 70 },
      { label: 'Grams (g)', grams: 1 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [1, 2, 3, 4],
    ingredients: ['Fermented Rice & Urad Dal Batter', 'Salt'],
    per100g: { calories: 140, protein: 4.5, carbs: 29.0, fat: 0.5, fiber: 1.5 },
  },
  {
    id: 'dosa_plain',
    name: 'Plain / Masala Dosa',
    aliases: ['dosa', 'masala dosa', 'plain dosa', 'crispy dosa', 'dosai'],
    category: 'Breakfast & Snacks',
    portionType: 'count',
    servingUnits: [
      { label: 'Dosa (80g)', grams: 80 },
      { label: 'Masala Dosa with Potato (150g)', grams: 150 },
      { label: 'Grams (g)', grams: 1 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [1, 2],
    ingredients: ['Fermented Rice & Urad Dal Batter', 'Oil / Ghee'],
    per100g: { calories: 170, protein: 4.0, carbs: 30.0, fat: 4.0, fiber: 1.8 },
  },
  {
    id: 'peanut_butter',
    name: 'Peanut Butter',
    aliases: ['peanut butter', 'pb', 'mungfali butter', 'roasted peanut butter'],
    category: 'Breakfast & Snacks',
    portionType: 'weight',
    servingUnits: [
      { label: 'Grams (g)', grams: 1 },
      { label: 'Tablespoon (16g)', grams: 16 },
      { label: '2 Tablespoons (32g)', grams: 32 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [16, 32, 50],
    ingredients: ['100% Roasted Peanuts', 'Pinch of Salt'],
    per100g: { calories: 588, protein: 25.0, carbs: 20.0, fat: 50.0, fiber: 8.0 },
  },

  // â”€â”€â”€ Fruits & Nuts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id: 'banana_fresh',
    name: 'Fresh Banana (Kela)',
    aliases: ['banana', 'kela', 'bananas', 'ripe banana'],
    category: 'Fruits & Nuts',
    portionType: 'count',
    servingUnits: [
      { label: 'Medium Banana (110g)', grams: 110 },
      { label: 'Large Banana (140g)', grams: 140 },
      { label: 'Small Banana (80g)', grams: 80 },
      { label: 'Grams (g)', grams: 1 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [1, 2, 3],
    ingredients: ['Fresh Natural Banana (Potassium, Vitamin B6, Fast Digesting Energy)'],
    per100g: { calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fiber: 2.6 },
  },
  {
    id: 'apple_fresh',
    name: 'Fresh Apple (Seb)',
    aliases: ['apple', 'seb', 'apples', 'green apple', 'red apple'],
    category: 'Fruits & Nuts',
    portionType: 'count',
    servingUnits: [
      { label: 'Medium Apple (150g)', grams: 150 },
      { label: 'Large Apple (200g)', grams: 200 },
      { label: 'Grams (g)', grams: 1 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [1, 2],
    ingredients: ['Fresh Apple (Pectin Fiber, Vitamin C)'],
    per100g: { calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2, fiber: 2.4 },
  },
  {
    id: 'almonds_badam',
    name: 'Almonds (Badam)',
    aliases: ['almonds', 'badam', 'soaked badam', 'raw almonds'],
    category: 'Fruits & Nuts',
    portionType: 'count',
    servingUnits: [
      { label: 'Handful / 10-12 Nuts (15g)', grams: 15 },
      { label: '20 Nuts (28g)', grams: 28 },
      { label: 'Grams (g)', grams: 1 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [1, 2],
    ingredients: ['100% Whole Almonds (Vitamin E, Healthy Monounsaturated Fats)'],
    per100g: { calories: 579, protein: 21.0, carbs: 22.0, fat: 50.0, fiber: 12.5 },
  },

  // â”€â”€â”€ Fitness Supplements â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
      { label: 'Grams (g)', grams: 1 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [1, 2],
    ingredients: ['Microfiltered Whey Protein Isolate (24g Pure Protein per scoop, 5.5g BCAAs)'],
    per100g: { calories: 390, protein: 80.0, carbs: 5.0, fat: 3.0, fiber: 1.0 },
  },
  {
    id: 'creatine_monohydrate',
    name: 'Creatine Monohydrate',
    aliases: ['creatine', 'creatine mono', 'creapure'],
    category: 'Fitness Supplements',
    portionType: 'count',
    servingUnits: [
      { label: 'Standard Scoop (5g)', grams: 5 },
      { label: 'Grams (g)', grams: 1 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [1, 2],
    ingredients: ['100% Micronized Pure Creatine Monohydrate'],
    per100g: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  },

  // â”€â”€â”€ Beverages â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id: 'indian_chai',
    name: 'Indian Chai / Milk Tea (with 1 tsp Sugar)',
    aliases: ['chai', 'tea', 'milk tea', 'indian tea', 'masala chai'],
    category: 'Beverages',
    portionType: 'volume',
    servingUnits: [
      { label: 'Standard Cup (150ml)', grams: 150 },
      { label: 'Small Cutting Chai (80ml)', grams: 80 },
    ],
    defaultUnitIndex: 0,
    quickPortions: [1, 2],
    ingredients: ['Black Tea Leaves', 'Boiled Milk', 'Water', 'Ginger & Cardamom', '1 tsp Sugar'],
    per100g: { calories: 60, protein: 2.0, carbs: 8.5, fat: 2.0, fiber: 0 },
  },
];

/**
 * Searches the preloaded food database with fuzzy matching and alias normalization.
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
 * Calculates exact nutrition for a food item given its quantity and chosen serving unit.
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