import { NextResponse } from 'next/server';

async function tryGemini(key: string, apiVersion: string, model: string) {
  const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${key}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: 'Say hello' }] }] }),
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, data, model, apiVersion };
  } catch (e) {
    return { ok: false, status: 0, data: { error: { message: String(e) } }, model, apiVersion };
  }
}

export async function GET() {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!geminiKey) {
    return NextResponse.json({
      status: 'missing',
      message: 'GEMINI_API_KEY is NOT set in environment variables.',
    });
  }

  const maskedKey = geminiKey.slice(0, 10) + '...' + geminiKey.slice(-4);

  // Try Gemini 3.x models first (as suggested by Google error messages), then fallbacks
  const attempts = [
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

  const results = [];

  for (const attempt of attempts) {
    const result = await tryGemini(geminiKey, attempt.apiVersion, attempt.model);
    const entry = {
      model: attempt.model,
      apiVersion: attempt.apiVersion,
      httpStatus: result.status,
      ok: result.ok,
      error: result.ok ? null : (result.data?.error?.message?.slice(0, 120) || 'unknown'),
    };
    results.push(entry);

    if (result.ok) {
      const reply = result.data?.candidates?.[0]?.content?.parts?.[0]?.text || '(no text)';
      return NextResponse.json({
        status: 'working',
        message: `SUCCESS! Working model: ${attempt.model} on ${attempt.apiVersion}`,
        keyPreview: maskedKey,
        workingModel: attempt.model,
        workingApiVersion: attempt.apiVersion,
        geminiReply: reply,
        allAttempts: results,
      });
    }
  }

  return NextResponse.json({
    status: 'all_failed',
    message: 'No Gemini model worked. See allAttempts for error details.',
    keyPreview: maskedKey,
    allAttempts: results,
  });
}