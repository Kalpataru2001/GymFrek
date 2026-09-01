/**
 * GymFrek - AI Natural Language Nutrition Engine
 * Parses natural food logs (English, Hindi, Hinglish) and calculates macros, calories, and ingredients.
 * Uses Gemini API if configured, with built-in heuristic NLP fallback.
 */

import { FoodEntry, searchLocalFoods } from './food-database';

export interface ParsedFoodResult {
  summaryTitle: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  totalGrams: number;
  ingredients: string[];
  items: Array<{
    name: string;
    quantity: number;
    unit: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  }>;
}

/**
 * Normalize phonetic / Hindi / Hinglish food names to canonical form
 * so the database search finds the correct match.
 */
function normalizeFoodQuery(input: string): string {
  let s = input.toLowerCase().trim();

  // Aloo / Alu / Allu -> aloo
  s = s.replace(/\ballu\b|\balu\b/g, 'aloo');

  // Bhujia / Bhojia / Bujia
  s = s.replace(/\bbhojia\b|\bbujia\b|\bbugia\b/g, 'bhujia');

  // Paneer spellings
  s = s.replace(/\bpaner\b|\bpanir\b|\bpanier\b/g, 'paneer');

  // Dal spellings
  s = s.replace(/\bdaal\b/g, 'dal');

  // Roti spellings
  s = s.replace(/\bchapati\b|\bchappati\b|\bchapatti\b/g, 'roti');

  // Biryani
  s = s.replace(/\bbiriani\b|\bbiryaani\b|\bbiriyani\b/g, 'biryani');

  // Chole / Chana
  s = s.replace(/\bchana masala\b|\bchhole\b|\bchhola\b/g, 'chole');

  // Rice
  s = s.replace(/\bchawal\b|\bchaaval\b/g, 'rice');

  // Poha
  s = s.replace(/\bpohe\b/g, 'poha');

  // Idli
  s = s.replace(/\bidly\b/g, 'idli');

  // Samosa
  s = s.replace(/\bsamose\b|\bsamossa\b/g, 'samosa');

  return s;
}

/**
 * Intelligent rule-based NLP parser that breaks down natural sentences like:
 * "2 butter rotis, 1 bowl dal makhani, 100g paneer, 1 glass lassi and 3 boiled eggs"
 */
export function parseMealQueryLocally(query: string): ParsedFoodResult {
  if (!query || !query.trim()) {
    return {
      summaryTitle: 'Empty Meal',
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      totalFiber: 0,
      totalGrams: 0,
      ingredients: [],
      items: [],
    };
  }

  // Split query by commas, "and", "+", "\n", "with"
  const rawSegments = query
    .split(/[,+\n]|(?:\band\b)|(?:\bwith\b)/i)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const parsedItems: ParsedFoodResult['items'] = [];
  const collectedIngredients = new Set<string>();
  const unmatchedItems: string[] = [];

  for (const seg of rawSegments) {
    let count = 1;
    let weightGrams: number | null = null;

    const gramMatch = seg.match(/(\d+(?:\.\d+)?)\s*(?:g|gm|gms|gram|grams)\b/i);
    const countMatch = seg.match(/^(\d+(?:\.\d+)?)\s+/i)
      || seg.match(/\b(\d+(?:\.\d+)?)\s+(?:piece|pieces|pc|pcs|roti|rotis|egg|eggs|cup|cups|plate|plates|bowl|bowls|katori|glass|glasses|scoop|scoops)\b/i);
    const halfMatch = seg.match(/\b(?:half|1\/2)\b/i);

    if (gramMatch) {
      weightGrams = parseFloat(gramMatch[1]);
    } else if (countMatch) {
      count = parseFloat(countMatch[1]);
    } else if (halfMatch) {
      count = 0.5;
    }

    const cleanName = seg
      .replace(/\d+(?:\.\d+)?\s*(?:g|gm|gms|gram|grams|ml|kg)\b/gi, '')
      .replace(/^\d+(?:\.\d+)?\s*/gi, '')
      .replace(/\b(?:piece|pieces|pc|pcs|bowl|bowls|katori|cup|cups|plate|plates|glass|glasses|scoop|scoops|plate of|serving of|spoon of|tablespoon of)\b/gi, '')
      .replace(/\b(?:cooked|raw|boiled|steamed|fried|roasted|homemade|fresh)\b/gi, '')
      .trim();

    const normalizedName = normalizeFoodQuery(cleanName);

    let matches = searchLocalFoods(normalizedName);
    if (matches.length === 0 && normalizedName !== cleanName) {
      matches = searchLocalFoods(cleanName);
    }

    // IMPORTANT: If no match found, DO NOT default to index 0 (wrong food).
    // Track as unmatched â€” let Gemini handle it via the API route.
    if (matches.length === 0) {
      unmatchedItems.push(cleanName || seg);
      continue;
    }

    const matchedFood: FoodEntry = matches[0];

    let itemGrams = 100;
    let unitLabel = 'serving';

    if (weightGrams !== null) {
      itemGrams = weightGrams;
      unitLabel = `${weightGrams}g`;
    } else if (matchedFood.portionType === 'count') {
      const unit = matchedFood.servingUnits[0];
      itemGrams = count * unit.grams;
      unitLabel = `${count}x piece`;
    } else {
      const unit = matchedFood.servingUnits.find(u => u.grams > 1) || matchedFood.servingUnits[0];
      itemGrams = count * (unit.grams > 1 ? unit.grams : 150);
      unitLabel = `${count}x ${unit.label.split(' (')[0]}`;
    }

    const factor = itemGrams / 100;
    matchedFood.ingredients.forEach(ing => collectedIngredients.add(ing));

    parsedItems.push({
      name: `${unitLabel} ${matchedFood.name.split(' /')[0]}`,
      quantity: count,
      unit: unitLabel,
      calories: Math.round(matchedFood.per100g.calories * factor),
      protein: Math.round(matchedFood.per100g.protein * factor * 10) / 10,
      carbs: Math.round(matchedFood.per100g.carbs * factor * 10) / 10,
      fat: Math.round(matchedFood.per100g.fat * factor * 10) / 10,
      fiber: Math.round(matchedFood.per100g.fiber * factor * 10) / 10,
    });
  }

  const totalCalories = parsedItems.reduce((acc, i) => acc + i.calories, 0);
  const totalProtein = Math.round(parsedItems.reduce((acc, i) => acc + i.protein, 0) * 10) / 10;
  const totalCarbs = Math.round(parsedItems.reduce((acc, i) => acc + i.carbs, 0) * 10) / 10;
  const totalFat = Math.round(parsedItems.reduce((acc, i) => acc + i.fat, 0) * 10) / 10;
  const totalFiber = Math.round(parsedItems.reduce((acc, i) => acc + i.fiber, 0) * 10) / 10;
  const totalGrams = parsedItems.length * 150;

  // If nothing matched locally, return a clear message (Gemini will handle it via API route)
  if (parsedItems.length === 0) {
    return {
      summaryTitle: unmatchedItems.length > 0
        ? `"${unmatchedItems.join(', ')}" not found locally - Gemini AI will calculate`
        : 'No food items recognized',
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      totalFiber: 0,
      totalGrams: 0,
      ingredients: [],
      items: [],
    };
  }

  return {
    summaryTitle: parsedItems.map(p => p.name).join(' + ') || query,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    totalFiber,
    totalGrams,
    ingredients: Array.from(collectedIngredients),
    items: parsedItems,
  };
}