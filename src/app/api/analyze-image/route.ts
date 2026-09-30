import { NextRequest, NextResponse } from 'next/server';
import { analyzeFoodImage } from '@/lib/ai-service';

export const maxDuration = 30; // 30s timeout for image vision processing

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image, apiKey, model, userContext, geminiApiKey } = body;

    if (!image || typeof image !== 'string') {
      return NextResponse.json({ error: 'Image data is required' }, { status: 400 });
    }

    const result = await analyzeFoodImage(image, { apiKey, model, userContext, geminiApiKey });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API /analyze-image error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to analyze food image' },
      { status: 500 }
    );
  }
}
