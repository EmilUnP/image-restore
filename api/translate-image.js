import { GoogleGenerativeAI } from '@google/generative-ai';
import { saveUploadedImage } from './lib/blob-storage.js';

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
    const { 
      image, 
      targetLanguage = 'en', 
      translatedTexts,
      correctedTexts,
      quality = 'premium',
      fontMatching = 'auto',
      textStyle = 'adaptive',
      preserveFormatting = true,
      enhanceReadability = true
    } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Save uploaded image for analysis (final translation stage)
    try {
      await saveUploadedImage(image, 'translation', {
        targetLanguage,
        quality,
        fontMatching,
        textStyle,
        preserveFormatting,
        enhanceReadability,
        translatedTextsCount: translatedTexts ? translatedTexts.length : 0,
        type: 'translation',
        stage: 'image-translation',
        endpoint: '/api/translate-image'
      });
    } catch (saveError) {
      console.error('Error saving uploaded image:', saveError);
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_api_key_here') {
      return res.status(500).json({ 
        error: 'AI service not configured. Please set GEMINI_API_KEY environment variable',
        instructions: 'Get your API key from https://aistudio.google.com/app/apikey and add it to Vercel environment variables'
      });
    }

    // Language name mapping
    const languageNames = {
      'en': 'English',
      'ru': 'Russian',
      'tr': 'Turkish',
      'uk': 'Ukrainian',
    };

    const targetLangName = languageNames[targetLanguage] || targetLanguage;

    // Build comprehensive prompt
    let prompt = `You are an expert image translation specialist. Replace ALL text in this image with the provided translations, maintaining professional quality.\n\n`;
    
    if (translatedTexts && Array.isArray(translatedTexts) && translatedTexts.length > 0) {
      prompt += `CRITICAL: Replace the following text pairs EXACTLY:\n\n`;
      translatedTexts.forEach((pair, i) => {
        if (pair.original && pair.translated) {
          prompt += `${i + 1}. Find: "${pair.original}" → Replace with: "${pair.translated}"\n`;
        }
      });
      prompt += `\nMaintain exact position, size, font, and style for each replacement.\n\n`;
    }

    prompt += `OUTPUT: Return ONLY the translated image with all text translated to ${targetLangName}.`;

    // Initialize Google Generative AI
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image-preview" });

    try {
      let mimeType = "image/jpeg";
      if (image.includes('data:image/')) {
        const mimeMatch = image.match(/data:image\/([^;]+)/);
        if (mimeMatch) {
          mimeType = `image/${mimeMatch[1]}`;
        }
      }
      
      const base64Data = image.split(',')[1] || image;
      const result = await model.generateContent([
        prompt,
        { inlineData: { data: base64Data, mimeType } }
      ]);

      const response = await result.response;
      
      // Try to get image from response
      let translatedImageBase64 = null;
      
      if (response.candidates && response.candidates[0]) {
        const parts = response.candidates[0].content?.parts || [];
        for (const part of parts) {
          if (part.inlineData?.data) {
            translatedImageBase64 = part.inlineData.data;
            break;
          }
        }
      }
      
      if (translatedImageBase64) {
        return res.json({ 
          translatedImage: `data:${mimeType};base64,${translatedImageBase64}`,
          message: `Image text translated successfully to ${targetLangName}.`,
          targetLanguage: targetLangName
        });
      } else {
        const text = response.text();
        return res.json({ 
          translatedImage: image,
          analysis: text,
          message: `Translation processed. Note: Gemini may provide analysis instead of translated images.`,
          targetLanguage: targetLangName
        });
      }

    } catch (error) {
      console.error('Gemini API error:', error);
      return res.status(500).json({ 
        error: 'Failed to translate image', 
        details: error.message || 'Unknown error'
      });
    }

  } catch (error) {
    console.error('Translation error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message || 'Unknown error'
    });
  }
}

