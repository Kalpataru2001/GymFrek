import { NextRequest, NextResponse } from 'next/server';
import { findExerciseVideo } from '@/lib/workout-engine';

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json({ error: 'Please provide an exercise name' }, { status: 400 });
    }

    const q = query.trim();

    // 1. Check local semantic database first
    const localMatch = findExerciseVideo(q);

    // 2. Check if Gemini API key is available for dynamic AI generation
    const geminiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (geminiKey) {
      try {
        const prompt = `You are a certified master fitness coach and exercise physiologist.
Create a complete structured exercise guide for: "${q}"

Return STRICT RAW JSON only (no markdown, no backticks) in this format:
{
  "name": "${q}",
  "muscleGroup": "Primary muscle group (e.g. Chest, Back, Quads, Shoulders, Biceps, Mobility)",
  "sets": 3,
  "reps": "8-12",
  "rest": "60s",
  "difficulty": "beginner" | "intermediate" | "advanced",
  "equipment": "e.g. Seated Chest Press Machine / Cable / Barbell",
  "instructions": "Clear 2-3 sentence execution instructions covering setup, movement path, and breathing.",
  "targetMuscles": ["Primary Muscle", "Secondary Muscle 1", "Secondary Muscle 2"],
  "tips": ["Pro form cue 1", "Pro form cue 2"],
  "commonMistakes": ["Common mistake 1", "Common mistake 2"],
  "videoSearchQuery": "${q} exercise form tutorial"
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
            return NextResponse.json({
              success: true,
              exercise: {
                ...parsed,
                videoUrl: localMatch?.videoUrl || parsed.videoUrl || 'rT7DgCr-3pg',
              },
              source: 'gemini_ai',
            });
          }
        }
      } catch (e) {
        console.warn('Gemini API call for exercise failed, using smart fallback:', e);
      }
    }

    // 3. Smart Fallback Generator
    const fallbackCategory = q.toLowerCase().includes('chest') ? 'Chest'
      : q.toLowerCase().includes('back') || q.toLowerCase().includes('row') || q.toLowerCase().includes('lat') ? 'Back'
      : q.toLowerCase().includes('leg') || q.toLowerCase().includes('squat') || q.toLowerCase().includes('quad') ? 'Quads / Legs'
      : q.toLowerCase().includes('shoulder') || q.toLowerCase().includes('press') ? 'Shoulders'
      : q.toLowerCase().includes('arm') || q.toLowerCase().includes('bicep') || q.toLowerCase().includes('curl') ? 'Biceps'
      : q.toLowerCase().includes('tricep') || q.toLowerCase().includes('pushdown') ? 'Triceps'
      : q.toLowerCase().includes('stretch') || q.toLowerCase().includes('mobility') ? 'Mobility & Stretching'
      : 'Full Body';

    return NextResponse.json({
      success: true,
      exercise: {
        name: q,
        muscleGroup: localMatch?.muscleGroup || fallbackCategory,
        sets: localMatch?.sets || 3,
        reps: localMatch?.reps || '10-12',
        rest: localMatch?.rest || '60s',
        difficulty: localMatch?.difficulty || 'beginner',
        equipment: localMatch?.equipment || 'Gym Machine / Free Weights',
        instructions: localMatch?.instructions || `Set up on the ${q} with proper seat alignment. Engage core, control the weight through a full range of motion, and breathe out during exertion.`,
        targetMuscles: localMatch?.targetMuscles || [fallbackCategory],
        tips: localMatch?.tips || ['Maintain steady tempo with a 2-second lowering phase.', 'Do not lock out joints aggressively at peak extension.'],
        commonMistakes: localMatch?.commonMistakes || ['Rushing through reps using momentum.'],
        videoUrl: localMatch?.videoUrl || (q.toLowerCase().includes('machine') ? 'rT7DgCr-3pg' : 'L_xrDAtyPqI'),
      },
      source: 'smart_local_nlp',
    });
  } catch (error) {
    console.error('AI Exercise API error:', error);
    return NextResponse.json({ error: 'Failed to search exercise' }, { status: 500 });
  }
}