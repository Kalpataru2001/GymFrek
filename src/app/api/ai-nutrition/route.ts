import { NextRequest, NextResponse } from 'next/server';
import { parseMealQueryLocally } from '@/lib/ai-nutrition-engine';

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json({ error: 'Please enter a meal description' }, { status: 400 });
    }

    const geminiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (geminiKey) {
      try {
        const prompt = `You are an expert sports nutritionist and food scientist specializing in Indian and global cuisine.
Analyze this meal logged by a user: "${query}"

Return a STRICT JSON object matching this structure (no markdown formatting, just raw JSON):
{
  "summaryTitle": "Brief clean title of the meal with portions (e.g. 2x Butter Roti + 1 Bowl Paneer Tikka)",
  "totalCalories": number,
  "totalProtein": number,
  "totalCarbs": number,
  "totalFat": number,
  "totalFiber": number,
  "totalGrams": number,
  "ingredients": ["ingredient1", "ingredient2", ...],
  "items": [
    {
      "name": "Food item name with portion",
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

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            return NextResponse.json({ success: true, ...parsed, source: 'ai_gemini' });
          }
        }
      } catch (e) {
        console.warn('Gemini API call failed, falling back to smart local NLP parser:', e);
      }
    }

    // Smart Local NLP Parser Fallback
    const localResult = parseMealQueryLocally(query);
    return NextResponse.json({ success: true, ...localResult, source: 'ai_local' });
  } catch (error) {
    console.error('AI Nutrition API error:', error);
    return NextResponse.json({ error: 'Failed to analyze meal' }, { status: 500 });
  }
}