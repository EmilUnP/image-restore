import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  createTextTranslationService,
  TranslationServiceError,
  classifyGeminiError,
} from '../server/lib/text-translation.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { texts, targetLanguage = 'en' } = req.body;

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return res.status(400).json({ error: 'No texts provided' });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_api_key_here') {
      return res.status(500).json({
        error: 'AI service not configured. Please set GEMINI_API_KEY environment variable',
        instructions: 'Get your API key from https://aistudio.google.com/app/apikey and add it to Vercel environment variables',
      });
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const translator = createTextTranslationService(genAI);
    const { translations, sanitizedCount, targetLanguageName } = await translator.translateTexts({
      texts,
      targetLanguage,
    });

    if (sanitizedCount === 0) {
      return res.status(200).json({
        translations,
        message: 'No valid text content received for translation',
      });
    }

    return res.status(200).json({
      translations,
      message: `Translated ${sanitizedCount} text(s) to ${targetLanguageName}`,
    });
  } catch (error) {
    const handledError = error instanceof TranslationServiceError ? error : classifyGeminiError(error);
    console.error('Translation error:', error);

    return res.status(handledError.statusCode).json({
      error: handledError.message,
      details: handledError.details || error.message || 'Unknown error',
    });
  }
}
