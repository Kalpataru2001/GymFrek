/**
 * GymFrek — USDA FoodData Central API Integration
 * Docs: https://fdc.nal.usda.gov/api-guide.html
 */

const BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

// ─── Nutrient ID Map ──────────────────────────────────────────────────────────

/** USDA FoodData Central nutrient IDs for the nutrients we care about */
const NUTRIENT_ID = {
  calories:  1008,
  protein:   1003,
  carbs:     1005,
  fat:       1004,
  fiber:     1079,
  sugar:     2000,
  sodium:    1093,
  vitaminC:  1162,
  calcium:   1087,
  iron:      1089,
} as const;

// ─── Public Interfaces ────────────────────────────────────────────────────────

export interface NutrientInfo {
  calories:  number | null;
  protein:   number | null;
  carbs:     number | null;
  fat:       number | null;
  fiber:     number | null;
  sugar:     number | null;
  sodium:    number | null;
  vitaminC:  number | null;
  calcium:   number | null;
  iron:      number | null;
}

export interface FoodItem {
  fdcId:           number;
  description:     string;
  nutrients:       NutrientInfo;
  servingSize:     number;
  servingSizeUnit: string;
}

// ─── Internal USDA Response Types ────────────────────────────────────────────

interface UsdaNutrient {
  nutrientId:    number;
  nutrientName:  string;
  value:         number;
  unitName:      string;
}

interface UsdaFoodSearchItem {
  fdcId:           number;
  description:     string;
  foodNutrients?:  UsdaNutrient[];
  servingSize?:    number;
  servingSizeUnit?: string;
}

interface UsdaSearchResponse {
  foods?: UsdaFoodSearchItem[];
}

interface UsdaDetailNutrient {
  nutrient: {
    id:   number;
    name: string;
  };
  amount: number;
}

interface UsdaFoodDetail {
  fdcId:           number;
  description:     string;
  foodNutrients?:  UsdaDetailNutrient[];
  servingSize?:    number;
  servingSizeUnit?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Extracts a nutrient value from a flat array of USDA food nutrients
 * (as returned by the /foods/search endpoint).
 */
function extractSearchNutrient(
  nutrients: UsdaNutrient[],
  id: number
): number | null {
  const found = nutrients.find((n) => n.nutrientId === id);
  return found !== undefined ? found.value : null;
}

/**
 * Extracts a nutrient value from a nested array of USDA food nutrients
 * (as returned by the /food/{fdcId} detail endpoint).
 */
function extractDetailNutrient(
  nutrients: UsdaDetailNutrient[],
  id: number
): number | null {
  const found = nutrients.find((n) => n.nutrient.id === id);
  return found !== undefined ? found.amount : null;
}

/** Maps a raw USDA search food item to our FoodItem shape */
function mapSearchItem(item: UsdaFoodSearchItem): FoodItem {
  const nutrients = item.foodNutrients ?? [];
  return {
    fdcId:           item.fdcId,
    description:     item.description,
    servingSize:     item.servingSize ?? 100,
    servingSizeUnit: item.servingSizeUnit ?? 'g',
    nutrients: {
      calories:  extractSearchNutrient(nutrients, NUTRIENT_ID.calories),
      protein:   extractSearchNutrient(nutrients, NUTRIENT_ID.protein),
      carbs:     extractSearchNutrient(nutrients, NUTRIENT_ID.carbs),
      fat:       extractSearchNutrient(nutrients, NUTRIENT_ID.fat),
      fiber:     extractSearchNutrient(nutrients, NUTRIENT_ID.fiber),
      sugar:     extractSearchNutrient(nutrients, NUTRIENT_ID.sugar),
      sodium:    extractSearchNutrient(nutrients, NUTRIENT_ID.sodium),
      vitaminC:  extractSearchNutrient(nutrients, NUTRIENT_ID.vitaminC),
      calcium:   extractSearchNutrient(nutrients, NUTRIENT_ID.calcium),
      iron:      extractSearchNutrient(nutrients, NUTRIENT_ID.iron),
    },
  };
}

/** Maps a raw USDA detail food item to our FoodItem shape */
function mapDetailItem(item: UsdaFoodDetail): FoodItem {
  const nutrients = item.foodNutrients ?? [];
  return {
    fdcId:           item.fdcId,
    description:     item.description,
    servingSize:     item.servingSize ?? 100,
    servingSizeUnit: item.servingSizeUnit ?? 'g',
    nutrients: {
      calories:  extractDetailNutrient(nutrients, NUTRIENT_ID.calories),
      protein:   extractDetailNutrient(nutrients, NUTRIENT_ID.protein),
      carbs:     extractDetailNutrient(nutrients, NUTRIENT_ID.carbs),
      fat:       extractDetailNutrient(nutrients, NUTRIENT_ID.fat),
      fiber:     extractDetailNutrient(nutrients, NUTRIENT_ID.fiber),
      sugar:     extractDetailNutrient(nutrients, NUTRIENT_ID.sugar),
      sodium:    extractDetailNutrient(nutrients, NUTRIENT_ID.sodium),
      vitaminC:  extractDetailNutrient(nutrients, NUTRIENT_ID.vitaminC),
      calcium:   extractDetailNutrient(nutrients, NUTRIENT_ID.calcium),
      iron:      extractDetailNutrient(nutrients, NUTRIENT_ID.iron),
    },
  };
}

// ─── Public API Functions ─────────────────────────────────────────────────────

/**
 * Searches the USDA FoodData Central database for foods matching the query.
 * Returns an empty array on network error or bad response (graceful degradation).
 *
 * @param query   Search term (e.g. "chicken breast")
 * @param apiKey  Your USDA FDC API key
 */
export async function searchFoods(
  query: string,
  apiKey: string
): Promise<FoodItem[]> {
  if (!query.trim()) return [];

  try {
    const url = new URL(`${BASE_URL}/foods/search`);
    url.searchParams.set('query', query);
    url.searchParams.set('api_key', apiKey);
    url.searchParams.set('pageSize', '20');
    url.searchParams.set('dataType', 'Foundation,SR Legacy,Branded');

    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 }, // Cache for 1 hour in Next.js
    } as RequestInit);

    if (!response.ok) {
      console.error(`[food-api] searchFoods failed: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = (await response.json()) as UsdaSearchResponse;
    return (data.foods ?? []).map(mapSearchItem);
  } catch (error) {
    console.error('[food-api] searchFoods error:', error);
    return [];
  }
}

/**
 * Fetches detailed nutritional information for a specific food by its FDC ID.
 * Returns null on error.
 *
 * @param fdcId   The FoodData Central ID of the food
 * @param apiKey  Your USDA FDC API key
 */
export async function getFoodDetails(
  fdcId: number,
  apiKey: string
): Promise<FoodItem | null> {
  try {
    const url = new URL(`${BASE_URL}/food/${fdcId}`);
    url.searchParams.set('api_key', apiKey);

    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 }, // Cache for 1 hour in Next.js
    } as RequestInit);

    if (!response.ok) {
      console.error(`[food-api] getFoodDetails(${fdcId}) failed: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = (await response.json()) as UsdaFoodDetail;
    return mapDetailItem(data);
  } catch (error) {
    console.error('[food-api] getFoodDetails error:', error);
    return null;
  }
}
