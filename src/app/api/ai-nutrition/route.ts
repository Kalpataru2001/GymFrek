import { NextRequest, NextResponse } from 'next/server';
import { parseMealQueryLocally } from '@/lib/ai-nutrition-engine';

// Models to try in order (most capable first)
const GEMINI_MODELS = [
  { apiVersion: 'v1', model: 'gemini-1.5-flash' },
  { apiVersion: 'v1', model: 'gemini-pro' },
  { apiVersion: 'v1beta', model: 'gemini-1.5-flash' },
  { apiVersion: 'v1beta', model: 'gemini-pro' },
];

async function callGemini(key: string, prompt: string): Promise<{ text: string; model: string } | null> {
  for (const { apiVersion, model } of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${key}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return { text, model: `${model} (${apiVersion})` };
      }
    } catch {
      // Try next model
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json({ error: 'Please enter a meal description' }, { status: 400 });
    }

    const geminiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (geminiKey) {
      const prompt = `You are an expert sports nutritionist and food scientist specializing in Indian, South Asian, and global cuisine.
A user has logged this meal: "${query}"

IMPORTANT: The user may use phonetic spellings, Hindi, or Hinglish names. For example:
- "Allu bhojia" or "alu bhujia" = Aloo Bhujia (fried potato sev snack, ~536 kcal/100g)
- "Daal" = Dal (lentil curry), "Chawal" = Rice, "Roti" / "Chapati" = Indian flatbread
- "Allu" / "alu" = Aloo (potato), "Panir" = Paneer, "Chole" / "Chhole" = Chickpea curry
Identify the CORRECT food item, not a random other food.

Return a STRICT JSON object (no markdown, just raw JSON):
{
  "summaryTitle": "Brief clean title with portions",
  "totalCalories": number,
  "totalProtein": number,
  "totalCarbs": number,
  "totalFat": number,
  "totalFiber": number,
  "totalGrams": number,
  "ingredients": ["ingredient1", "ingredient2"],
  "items": [
    {
      "name": "Correct food name with portion",
      "quantity": number,
      "unit": "string",
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number,
      "fiber": number
    }
  ]
}`;

      const result = await callGemini(geminiKey, prompt);
      if (result) {
        try {
          const parsed = JSON.parse(result.text);
          return NextResponse.json({ success: true, ...parsed, source: 'ai_gemini', modelUsed: result.model });
        } catch {
          // JSON parse failed, fall through
        }
      }
    }

    // Smart Local NLP Parser Fallback
    const localResult = parseMealQueryLocally(query);
    return NextResponse.json({
      success: true,
      ...localResult,
      source: 'ai_local',
      geminiStatus: geminiKey ? 'all_models_failed' : 'key_not_set',
    });
  } catch (error) {
    console.error('AI Nutrition API error:', error);
    return NextResponse.json({ error: 'Failed to analyze meal' }, { status: 500 });
  }
}