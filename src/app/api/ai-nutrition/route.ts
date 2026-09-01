import { NextRequest, NextResponse } from 'next/server';
import { parseMealQueryLocally } from '@/lib/ai-nutrition-engine';

// Ordered by likelihood - Gemini 3.x first (as recommended by Google error messages)
const GEMINI_ATTEMPTS = [
  { apiVersion: 'v1beta', model: 'gemini-3.6-flash' },
  { apiVersion: 'v1beta', model: 'gemini-3.5-flash' },
  { apiVersion: 'v1beta', model: 'gemini-3.5-flash-lite' },
  { apiVersion: 'v1beta', model: 'gemini-3.0-flash' },
  { apiVersion: 'v1beta', model: 'gemini-2.5-flash' },
  { apiVersion: 'v1beta', model: 'gemini-2.5-flash-lite' },
  { apiVersion: 'v1beta', model: 'gemini-2.5-pro' },
  { apiVersion: 'v1beta', model: 'gemini-2.0-flash-001' },
  { apiVersion: 'v1alpha', model: 'gemini-3.6-flash' },
  { apiVersion: 'v1alpha', model: 'gemini-3.5-flash' },
];

async function callGeminiWithFallback(key: string, prompt: string): Promise<{ text: string; model: string } | null> {
  for (const { apiVersion, model } of GEMINI_ATTEMPTS) {
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
        if (text) return { text, model: `${model}/${apiVersion}` };
      }
    } catch {
      continue;
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
      const prompt = `You are an expert sports nutritionist specializing in Indian, South Asian, and global cuisine.
A user logged this meal: "${query}"

IMPORTANT - Handle phonetic/Hindi/Hinglish names:
- "Allu bhojia" / "alu bhujia" = Aloo Bhujia (fried potato sev snack, ~536 kcal/100g)
- "Daal" = Dal, "Chawal" = Rice, "Chapati" = Roti
- "Allu"/"alu" = Aloo (potato), "Panir" = Paneer
- "Chole"/"Chhole" = Chickpea curry

Return STRICT JSON only (no markdown):
{
  "summaryTitle": "Food name with portion",
  "totalCalories": number,
  "totalProtein": number,
  "totalCarbs": number,
  "totalFat": number,
  "totalFiber": number,
  "totalGrams": number,
  "ingredients": ["ingredient1", "ingredient2"],
  "items": [{
    "name": "Correct food name with portion",
    "quantity": number,
    "unit": "string",
    "calories": number,
    "protein": number,
    "carbs": number,
    "fat": number,
    "fiber": number
  }]
}`;

      const result = await callGeminiWithFallback(geminiKey, prompt);
      if (result) {
        try {
          const parsed = JSON.parse(result.text);
          return NextResponse.json({ success: true, ...parsed, source: 'ai_gemini', modelUsed: result.model });
        } catch {
          // JSON parse failed, fall through
        }
      }
    }

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