import { NextResponse } from 'next/server';

// Try calling Gemini with a given model and API version
async function tryGemini(key: string, apiVersion: string, model: string) {
  const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: 'Say: hello' }] }] }),
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data, model, apiVersion };
}

export async function GET() {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!geminiKey) {
    return NextResponse.json({
      status: 'missing',
      message: 'GEMINI_API_KEY is NOT set in environment variables.',
      hint: 'Add it in Vercel -> Settings -> Environment Variables, then redeploy.',
    });
  }

  const maskedKey = geminiKey.slice(0, 8) + '...' + geminiKey.slice(-4);

  // Try multiple models + versions in order
  const attempts = [
    { apiVersion: 'v1', model: 'gemini-1.5-flash' },
    { apiVersion: 'v1', model: 'gemini-pro' },
    { apiVersion: 'v1beta', model: 'gemini-1.5-flash' },
    { apiVersion: 'v1beta', model: 'gemini-pro' },
  ];

  const results = [];

  for (const attempt of attempts) {
    try {
      const result = await tryGemini(geminiKey, attempt.apiVersion, attempt.model);
      results.push({
        model: attempt.model,
        apiVersion: attempt.apiVersion,
        httpStatus: result.status,
        ok: result.ok,
        error: result.ok ? null : result.data?.error?.message,
      });

      if (result.ok) {
        const reply = result.data?.candidates?.[0]?.content?.parts?.[0]?.text || '(no text)';
        return NextResponse.json({
          status: 'working',
          message: `Gemini is working! Best model: ${attempt.model} (${attempt.apiVersion})`,
          keyPreview: maskedKey,
          workingModel: attempt.model,
          workingApiVersion: attempt.apiVersion,
          geminiReply: reply,
          allAttempts: results,
        });
      }
    } catch (e) {
      results.push({ model: attempt.model, apiVersion: attempt.apiVersion, error: String(e) });
    }
  }

  // None worked
  return NextResponse.json({
    status: 'all_failed',
    message: 'Gemini key is set but no model worked. Check if Generative Language API is enabled.',
    keyPreview: maskedKey,
    allAttempts: results,
    hint: 'Go to console.cloud.google.com -> APIs -> Enable "Generative Language API"',
  });
}