import { NextRequest, NextResponse } from 'next/server';
import { analyzeFoodText } from '@/lib/ai-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, apiKey, model, geminiApiKey } = body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const result = await analyzeFoodText(prompt.trim(), { apiKey, model, geminiApiKey });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API /analyze-food error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to analyze food description' },
      { status: 500 }
    );
  }
}
