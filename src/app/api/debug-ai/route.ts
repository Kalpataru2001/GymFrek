import { NextResponse } from 'next/server';

export async function GET() {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!geminiKey) {
    return NextResponse.json({
      status: 'missing',
      message: 'GEMINI_API_KEY is NOT set in environment variables.',
      hint: 'Add it in Vercel -> Settings -> Environment Variables, then redeploy.',
    });
  }

  // Mask the key for safe display (show only first 8 chars)
  const maskedKey = geminiKey.slice(0, 8) + '...' + geminiKey.slice(-4);

  // Make a real test call to Gemini
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Say: hello' }] }],
        }),
      }
    );

    const data = await res.json();

    if (res.ok) {
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '(no text)';
      return NextResponse.json({
        status: 'working',
        message: 'Gemini API key is valid and working!',
        keyPreview: maskedKey,
        geminiReply: reply,
        httpStatus: res.status,
      });
    } else {
      return NextResponse.json({
        status: 'invalid_key',
        message: 'Gemini API key is set but rejected by Google.',
        keyPreview: maskedKey,
        httpStatus: res.status,
        geminiError: data?.error?.message || JSON.stringify(data),
        hint: 'Check: Is the key correct? Is Generative Language API enabled in your Google Cloud project?',
      });
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({
      status: 'network_error',
      message: 'Key is set but could not reach Gemini API.',
      keyPreview: maskedKey,
      error: msg,
    });
  }
}