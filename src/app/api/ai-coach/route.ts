import { NextRequest, NextResponse } from 'next/server';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CoachRequest {
  yesterdayLog: {
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    waterMl: number;
    attendance: string;
    foodCount: number;
  } | null;
  todayWorkout: {
    focus: string;
    isRest: boolean;
    exerciseCount: number;
  } | null;
  profile: {
    name: string;
    goal: string;
    weightKg: number;
    proteinTarget: number;
    calorieTarget: number;
  };
}

export interface CoachMessage {
  emoji: string;
  title: string;
  tips: string[];
  tone: 'celebrate' | 'motivate' | 'correct';
}

// ─── Gemini fallback helper ────────────────────────────────────────────────────

const GEMINI_MODELS = [
  { apiVersion: 'v1beta', model: 'gemini-3.6-flash' },
  { apiVersion: 'v1beta', model: 'gemini-3.5-flash' },
  { apiVersion: 'v1beta', model: 'gemini-3.5-flash-lite' },
  { apiVersion: 'v1beta', model: 'gemini-2.5-flash' },
  { apiVersion: 'v1beta', model: 'gemini-2.0-flash-001' },
];

async function callGemini(key: string, prompt: string): Promise<string | null> {
  for (const { apiVersion, model } of GEMINI_MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }
    } catch { continue; }
  }
  return null;
}

// ─── Local deterministic fallback ─────────────────────────────────────────────

function localCoachMessage(req: CoachRequest): CoachMessage {
  const { yesterdayLog, todayWorkout, profile } = req;
  const goal = profile.goal;

  // No data at all
  if (!yesterdayLog || yesterdayLog.foodCount === 0) {
    if (todayWorkout && !todayWorkout.isRest) {
      return {
        emoji: '🏋️',
        title: `${todayWorkout.focus} Day — Let\'s Go!`,
        tips: [
          `Start with a high-protein breakfast before your workout.`,
          `Target ${profile.proteinTarget}g protein and ${profile.calorieTarget} kcal today.`,
          `Log every meal on the Calendar to track your progress accurately.`,
        ],
        tone: 'motivate',
      };
    }
    return {
      emoji: '🌅',
      title: 'Start Your Day Strong!',
      tips: [
        `Log your meals today — consistency is the key to results.`,
        `Your daily protein target is ${profile.proteinTarget}g. Hit it every day.`,
        `Drink at least 2–3 litres of water throughout the day.`,
      ],
      tone: 'motivate',
    };
  }

  const proteinPct = profile.proteinTarget > 0
    ? (yesterdayLog.totalProtein / profile.proteinTarget) * 100
    : 100;
  const caloriePct = profile.calorieTarget > 0
    ? (yesterdayLog.totalCalories / profile.calorieTarget) * 100
    : 100;
  const calorieSurplus = yesterdayLog.totalCalories - profile.calorieTarget;
  const proteinGap = Math.round(profile.proteinTarget - yesterdayLog.totalProtein);

  // Perfect day
  if (proteinPct >= 90 && caloriePct >= 85 && caloriePct <= 115 && yesterdayLog.attendance === 'completed') {
    return {
      emoji: '🏆',
      title: 'Perfect Day Yesterday!',
      tips: [
        `You nailed protein (${Math.round(yesterdayLog.totalProtein)}g) and calories. Keep the streak!`,
        todayWorkout && !todayWorkout.isRest
          ? `Today is ${todayWorkout.focus} — maintain the momentum.`
          : `Today is rest day — focus on recovery and good sleep.`,
        `Hydration check: aim for 2.5–3L of water today.`,
      ],
      tone: 'celebrate',
    };
  }

  // Fat loss goal + surplus
  if ((goal === 'lose_weight') && calorieSurplus > 200) {
    return {
      emoji: '⚖️',
      title: 'Calorie Check',
      tips: [
        `You were ${Math.round(calorieSurplus)} kcal over target yesterday. Today is a fresh start.`,
        `Try a lighter breakfast — Greek yogurt, eggs, or a protein shake keeps you full and low-cal.`,
        proteinGap > 10
          ? `Also boost protein by ${proteinGap}g — it reduces cravings throughout the day.`
          : `Your protein was solid — keep that up today.`,
      ],
      tone: 'correct',
    };
  }

  // Low protein
  if (proteinPct < 70) {
    return {
      emoji: '🥩',
      title: 'Protein Needs Attention',
      tips: [
        `You hit only ${Math.round(proteinPct)}% of your protein target yesterday (${Math.round(yesterdayLog.totalProtein)}g / ${profile.proteinTarget}g).`,
        todayWorkout && !todayWorkout.isRest
          ? `Today is ${todayWorkout.focus} — you need protein to build and repair muscle. Add a scoop of whey or 200g paneer.`
          : `Even on rest days, protein prevents muscle breakdown. Aim for eggs, dal, or curd today.`,
        `Spread protein across 4 meals — your body absorbs it better in smaller doses.`,
      ],
      tone: 'correct',
    };
  }

  // Workout missed
  if (yesterdayLog.attendance === 'missed') {
    return {
      emoji: '💪',
      title: 'Bounce Back Today!',
      tips: [
        `Yesterday\'s workout was missed — that\'s okay. Champions get back up.`,
        todayWorkout && !todayWorkout.isRest
          ? `Today is ${todayWorkout.focus}. Show up and make it count.`
          : `Today is a rest day — use it well and come back strong tomorrow.`,
        `Fuel your comeback: hit your protein (${profile.proteinTarget}g) and stay hydrated.`,
      ],
      tone: 'motivate',
    };
  }

  // Good day — general motivation
  const isWorkoutDay = todayWorkout && !todayWorkout.isRest;
  return {
    emoji: isWorkoutDay ? '🔥' : '😌',
    title: isWorkoutDay ? `${todayWorkout!.focus} Day — Stay Focused!` : 'Recovery Day',
    tips: [
      `Great effort yesterday — ${Math.round(yesterdayLog.totalProtein)}g protein logged.`,
      isWorkoutDay
        ? `Pre-workout: eat 30–45 min before training. Post-workout: get 30–40g protein within 1 hour.`
        : `Rest days are when growth happens. Sleep 7–9h and stay hydrated.`,
      goal === 'lose_weight'
        ? `Stay at or below ${profile.calorieTarget} kcal today to keep your deficit on track.`
        : goal === 'gain_muscle'
        ? `Aim for a slight surplus today (~${profile.calorieTarget + 200} kcal) to fuel muscle growth.`
        : `Maintain your calorie balance at ${profile.calorieTarget} kcal today.`,
    ],
    tone: 'motivate',
  };
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as CoachRequest;
    const { yesterdayLog, todayWorkout, profile } = body;
    const geminiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (geminiKey) {
      const workoutStr = todayWorkout
        ? todayWorkout.isRest
          ? 'Rest Day (no workout scheduled)'
          : `${todayWorkout.focus} (${todayWorkout.exerciseCount} exercises)`
        : 'No workout plan loaded';

      const yesterdayStr = yesterdayLog && yesterdayLog.foodCount > 0
        ? `Calories: ${yesterdayLog.totalCalories} kcal (target: ${profile.calorieTarget}), Protein: ${yesterdayLog.totalProtein}g (target: ${profile.proteinTarget}g), Water: ${yesterdayLog.waterMl}ml, Workout: ${yesterdayLog.attendance}`
        : 'No food logged yesterday';

      const prompt = `You are a friendly, expert fitness and nutrition coach for an Indian fitness app called GymFrek.

User profile:
- Name: ${profile.name}
- Goal: ${profile.goal.replace(/_/g, ' ')}
- Weight: ${profile.weightKg}kg
- Protein target: ${profile.proteinTarget}g/day
- Calorie target: ${profile.calorieTarget} kcal/day

Yesterday's log:
${yesterdayStr}

Today's scheduled workout:
${workoutStr}

Write a personalized daily coaching message. Be warm, concise, and actionable. Use Indian context where relevant (mention dal, roti, paneer, etc. as protein examples if needed).

Return STRICT JSON only (no markdown):
{
  "emoji": "one relevant emoji",
  "title": "Short punchy title (max 8 words)",
  "tips": ["tip 1 (1-2 sentences)", "tip 2 (1-2 sentences)", "tip 3 (1-2 sentences)"],
  "tone": "celebrate OR motivate OR correct"
}

Rules:
- tone=celebrate if they had a near-perfect day yesterday
- tone=correct if they need to fix something specific (missed protein, over calories, missed workout)
- tone=motivate otherwise
- tips must be specific to THEIR numbers, not generic
- max 3 tips
- Keep each tip under 25 words`;

      const raw = await callGemini(geminiKey, prompt);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as CoachMessage;
          if (parsed.emoji && parsed.title && Array.isArray(parsed.tips)) {
            return NextResponse.json({ success: true, message: parsed });
          }
        } catch { /* fall through */ }
      }
    }

    // Local fallback
    const fallback = localCoachMessage(body);
    return NextResponse.json({ success: true, message: fallback, source: 'local' });
  } catch (err) {
    console.error('AI Coach error:', err);
    return NextResponse.json({ error: 'Failed to generate coaching message' }, { status: 500 });
  }
}
