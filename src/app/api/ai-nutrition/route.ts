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
        const prompt = `You are an expert sports nutritionist and food scientist specializing in Indian, South Asian, and global cuisine.
A user has logged this meal: "${query}"

IMPORTANT: The user may use phonetic spellings, Hindi, or Hinglish names. For example:
- "Allu bhojia" or "alu bhujia" = Aloo Bhujia (fried potato sev snack, ~536 kcal/100g)
- "Daal" = Dal (lentil curry), "Chawal" = Rice, "Roti" / "Chapati" = Indian flatbread
- "Allu" / "alu" = Aloo (potato), "Panir" = Paneer, "Chole" / "Chhole" = Chickpea curry
Identify the CORRECT food item, not a random other food.

Return a STRICT JSON object (no markdown, just raw JSON):
{
  "summaryTitle": "Brief clean title with portions (e.g. 1x Aloo Bhujia 30g)",
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
        } else {
          const errData = await res.json().catch(() => ({}));
          console.error('Gemini API error:', res.status, errData);
          const localResult = parseMealQueryLocally(query);
          return NextResponse.json({
            success: true,
            ...localResult,
            source: 'ai_local',
            geminiStatus: `failed_${res.status}`,
            geminiError: (errData as { error?: { message?: string } })?.error?.message || `HTTP ${res.status}`,
          });
        }
      } catch (e) {
        console.warn('Gemini API call failed:', e);
      }
    }

    // Smart Local NLP Parser Fallback
    const localResult = parseMealQueryLocally(query);
    return NextResponse.json({
      success: true,
      ...localResult,
      source: 'ai_local',
      geminiStatus: geminiKey ? 'exception_thrown' : 'key_not_set_in_env',
    });
  } catch (error) {
    console.error('AI Nutrition API error:', error);
    return NextResponse.json({ error: 'Failed to analyze meal' }, { status: 500 });
  }
}