/**
 * GymFrek â€” AI Natural Language Nutrition Engine
 * Parses natural food logs (English, Hindi, Hinglish) and calculates macros, calories, and ingredients.
 * Uses Gemini API if configured, with built-in heuristic NLP fallback.
 */

import { POPULAR_FOODS_DATABASE, FoodEntry, searchLocalFoods } from './food-database';

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

  for (const seg of rawSegments) {
    // Extract numbers (e.g. "2 rotis", "150g rice", "1.5 scoops whey", "half plate")
    let count = 1;
    let weightGrams: number | null = null;

    const gramMatch = seg.match(/(\d+(?:\.\d+)?)\s*(?:g|gm|gms|gram|grams)\b/i);
    const countMatch = seg.match(/^(\d+(?:\.\d+)?)\s+/i) || seg.match(/\b(\d+(?:\.\d+)?)\s+(?:piece|pieces|pc|pcs|roti|rotis|egg|eggs|cup|cups|plate|plates|bowl|bowls|katori|glass|glasses|scoop|scoops)\b/i);
    const halfMatch = seg.match(/\b(?:half|1\/2)\b/i);

    if (gramMatch) {
      weightGrams = parseFloat(gramMatch[1]);
    } else if (countMatch) {
      count = parseFloat(countMatch[1]);
    } else if (halfMatch) {
      count = 0.5;
    }

    // Clean segment to match food database
    const cleanName = seg
      .replace(/\d+(?:\.\d+)?\s*(?:g|gm|gms|gram|grams|ml|kg)\b/gi, '')
      .replace(/^\d+(?:\.\d+)?\s*/gi, '')
      .replace(/\b(?:piece|pieces|pc|pcs|bowl|bowls|katori|cup|cups|plate|plates|glass|glasses|scoop|scoops|plate of|serving of|spoon of|tablespoon of)\b/gi, '')
      .replace(/\b(?:cooked|raw|boiled|steamed|fried|roasted|homemade|fresh)\b/gi, '')
      .trim();

    const matches = searchLocalFoods(cleanName);
    const matchedFood: FoodEntry = matches[0] || POPULAR_FOODS_DATABASE[0];

    // Calculate portions
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
      // Weight or volume food with count (e.g. 1 bowl or 2 plates)
      const unit = matchedFood.servingUnits.find(u => u.grams > 1) || matchedFood.servingUnits[0];
      itemGrams = count * (unit.grams > 1 ? unit.grams : 150);
      unitLabel = `${count}x ${unit.label.split(' (')[0]}`;
    }

    const factor = itemGrams / 100;
    const itemCalories = Math.round(matchedFood.per100g.calories * factor);
    const itemProtein = Math.round(matchedFood.per100g.protein * factor * 10) / 10;
    const itemCarbs = Math.round(matchedFood.per100g.carbs * factor * 10) / 10;
    const itemFat = Math.round(matchedFood.per100g.fat * factor * 10) / 10;
    const itemFiber = Math.round(matchedFood.per100g.fiber * factor * 10) / 10;

    matchedFood.ingredients.forEach(ing => collectedIngredients.add(ing));

    parsedItems.push({
      name: `${unitLabel} ${matchedFood.name.split(' /')[0]}`,
      quantity: count,
      unit: unitLabel,
      calories: itemCalories,
      protein: itemProtein,
      carbs: itemCarbs,
      fat: itemFat,
      fiber: itemFiber,
    });
  }

  const totalCalories = parsedItems.reduce((acc, i) => acc + i.calories, 0);
  const totalProtein = Math.round(parsedItems.reduce((acc, i) => acc + i.protein, 0) * 10) / 10;
  const totalCarbs = Math.round(parsedItems.reduce((acc, i) => acc + i.carbs, 0) * 10) / 10;
  const totalFat = Math.round(parsedItems.reduce((acc, i) => acc + i.fat, 0) * 10) / 10;
  const totalFiber = Math.round(parsedItems.reduce((acc, i) => acc + i.fiber, 0) * 10) / 10;
  const totalGrams = parsedItems.length * 150;

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