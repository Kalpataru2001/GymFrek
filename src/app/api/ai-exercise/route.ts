import { NextRequest, NextResponse } from 'next/server';
import { findExerciseVideo, normalizeGymQuery } from '@/lib/workout-engine';

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json({ error: 'Please provide an exercise name' }, { status: 400 });
    }

    const raw = query.trim();
    const q = normalizeGymQuery(raw);

    // 1. Check local semantic database with normalized query
    const localMatch = findExerciseVideo(q, 0);

    // 2. Check if Gemini API key is available for dynamic AI generation
    const geminiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (geminiKey) {
      try {
        const prompt = `You are a certified master fitness coach and exercise physiologist.
Create a complete structured exercise guide for: "${raw}" (which corresponds to "${q}")

Return STRICT RAW JSON only (no markdown, no backticks) in this format:
{
  "name": "${raw}",
  "muscleGroup": "Primary muscle group (e.g. Chest, Back, Quads / Glutes, Shoulders, Biceps, Cardio & Conditioning, Mobility & Stretching)",
  "sets": 3,
  "reps": "8-12",
  "rest": "60s",
  "difficulty": "beginner" | "intermediate" | "advanced",
  "equipment": "e.g. Pair of Dumbbells / Barbell / Machine / Bodyweight",
  "instructions": "Clear 2-3 sentence execution instructions covering setup, movement path, and breathing.",
  "targetMuscles": ["Primary Muscle", "Secondary Muscle 1", "Secondary Muscle 2"],
  "tips": ["Pro form cue 1", "Pro form cue 2"],
  "commonMistakes": ["Common mistake 1", "Common mistake 2"]
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
                videoUrl: localMatch?.videoUrl || 'bEv6CCg2BC8',
                alternativeVideos: localMatch?.alternativeVideos || ['bEv6CCg2BC8', 'MeIiIdhvXT4', 'aclHkVaku9U'],
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
    const fallbackCategory = q.includes('squat') || q.includes('leg') || q.includes('quad') ? 'Quads / Glutes'
      : q.includes('cardio') || q.includes('treadmill') || q.includes('running') || q.includes('jump') ? 'Cardio & Conditioning'
      : q.includes('chest') ? 'Chest'
      : q.includes('back') || q.includes('row') || q.includes('lat') ? 'Back'
      : q.includes('shoulder') || q.includes('press') ? 'Shoulders'
      : q.includes('arm') || q.includes('bicep') || q.includes('curl') ? 'Biceps'
      : q.includes('tricep') || q.includes('pushdown') ? 'Triceps'
      : q.includes('stretch') || q.includes('mobility') ? 'Mobility & Stretching'
      : 'Full Body';

    return NextResponse.json({
      success: true,
      exercise: {
        name: raw,
        muscleGroup: localMatch?.muscleGroup || fallbackCategory,
        sets: localMatch?.sets || 3,
        reps: localMatch?.reps || '10-12',
        rest: localMatch?.rest || '60s',
        difficulty: localMatch?.difficulty || 'beginner',
        equipment: localMatch?.equipment || (q.includes('dumbbell') ? 'Pair of Dumbbells' : 'Gym Equipment'),
        instructions: localMatch?.instructions || `Perform ${raw} with strict form, keeping your core braced and moving through a full range of motion.`,
        targetMuscles: localMatch?.targetMuscles || [fallbackCategory],
        tips: localMatch?.tips || ['Control the eccentric lowering phase for 2 seconds.', 'Breathe out on exertion.'],
        commonMistakes: localMatch?.commonMistakes || ['Using momentum or rushing repetitions.'],
        videoUrl: localMatch?.videoUrl || (q.includes('squat') ? 'MeIiIdhvXT4' : 'bEv6CCg2BC8'),
        alternativeVideos: localMatch?.alternativeVideos || ['MeIiIdhvXT4', 'bEv6CCg2BC8', 'aclHkVaku9U'],
      },
      source: 'smart_local_nlp',
    });
  } catch (error) {
    console.error('AI Exercise API error:', error);
    return NextResponse.json({ error: 'Failed to search exercise' }, { status: 500 });
  }
}