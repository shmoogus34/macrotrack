import { AIAnalysisResult } from './types';
import { validateAndCorrectMacros } from './nutrition-engine';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_MODELS = ['gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-flash-latest'];

const SYSTEM_NUTRITION_PROMPT = `
You are MacroTrack AI, an elite clinical dietitian, sports nutritionist, and computer vision specialist.
Your mission is to provide 100% mathematically and clinically accurate nutritional breakdowns based on standard USDA references.

CRITICAL INSTRUCTIONS:
1. For visual photos: You MUST provide "visualDescription" detailing exactly what food items, portion sizes, textures, and cooking methods are visible.
2. Calculate exact portion weights in grams for every recognized item.
3. Compute exact calories, protein, carbs, fat, and fiber based on Atwater factors (Protein=4 kcal/g, Carbs=4 kcal/g, Fat=9 kcal/g).
4. The sum of item calories MUST equal totalCalories.

Return strictly valid JSON conforming to this schema:
{
  "visualDescription": "Detailed sentence of exactly what you see in the photo",
  "mealName": "Concise name of the meal",
  "suggestedCategory": "breakfast" | "lunch" | "dinner" | "snack",
  "items": [
    {
      "name": "Component name",
      "portion": "e.g. 150g, 2 large, 1 cup",
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number,
      "fiber": number
    }
  ],
  "totalCalories": number,
  "totalProtein": number,
  "totalCarbs": number,
  "totalFat": number,
  "confidence": number,
  "healthTip": "Actionable health insight"
}
`.trim();

function getGeminiApiKey(customKey?: string): string {
  return (
    customKey ||
    process.env.GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    ''
  );
}

/**
 * Direct Gemini API call for Natural Language Food Analysis
 */
export async function directGeminiTextAnalysis(
  prompt: string,
  apiKeyOverride?: string
): Promise<AIAnalysisResult | null> {
  const apiKey = getGeminiApiKey(apiKeyOverride);
  if (!apiKey) return null;

  for (const model of GEMINI_MODELS) {
    try {
      const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${SYSTEM_NUTRITION_PROMPT}\n\nAnalyze this meal/food description and calculate exact USDA macros: "${prompt}"`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1400,
            responseMimeType: 'application/json',
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText);
          return validateAndCorrectMacros(parsed, prompt);
        }
      } else {
        console.warn(`Gemini model ${model} returned ${res.status}`);
      }
    } catch (err) {
      console.warn(`Gemini direct text call failed for ${model}:`, err);
    }
  }

  return null;
}

/**
 * Direct Gemini API call for Multimodal Image Vision Analysis
 */
export async function directGeminiImageAnalysis(
  imageBase64: string,
  apiKeyOverride?: string,
  userContext?: string
): Promise<AIAnalysisResult | null> {
  const apiKey = getGeminiApiKey(apiKeyOverride);
  if (!apiKey) return null;

  // Extract pure base64 data and mime type
  let mimeType = 'image/jpeg';
  let cleanData = imageBase64;

  const dataUriMatch = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
  if (dataUriMatch) {
    mimeType = dataUriMatch[1];
    cleanData = dataUriMatch[2];
  }

  for (const model of GEMINI_MODELS) {
    try {
      const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${SYSTEM_NUTRITION_PROMPT}\n\nLook at this food photo. Detail what you see in "visualDescription", estimate portions in grams, and calculate exact USDA macros. ${
                    userContext ? `User context: "${userContext}"` : ''
                  }`,
                },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: cleanData,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1600,
            responseMimeType: 'application/json',
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText);
          return validateAndCorrectMacros(parsed, 'Scanned Meal Plate');
        }
      } else {
        console.warn(`Gemini vision model ${model} returned ${res.status}`);
      }
    } catch (err) {
      console.warn(`Gemini direct vision call failed for ${model}:`, err);
    }
  }

  return null;
}
