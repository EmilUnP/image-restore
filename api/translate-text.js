import { GoogleGenerativeAI } from '@google/generative-ai';

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
        instructions: 'Get your API key from https://aistudio.google.com/app/apikey and add it to Vercel environment variables'
      });
    }

    // Language name mapping
    const languageNames = {
      'en': 'English',
      'ru': 'Russian',
      'tr': 'Turkish',
      'uk': 'Ukrainian',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'zh': 'Chinese',
      'ja': 'Japanese',
      'ko': 'Korean',
      'ar': 'Arabic',
      'hi': 'Hindi',
    };

    const targetLangName = languageNames[targetLanguage] || targetLanguage;

    // Build translation prompt
    const prompt = `Translate the following texts to ${targetLangName}. 
    
Return ONLY a valid JSON array of translations in the same order as the input texts.
Format: ["translation1", "translation2", ...]

Texts to translate:
${texts.map((text, i) => `${i + 1}. "${text}"`).join('\n')}

Important: Return ONLY the JSON array, no other text or explanation.`;

    // Initialize Google Generative AI
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.3, // Lower temperature for more consistent translations
      }
    });

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON from response
      let translations = [];
      try {
        // Try to extract JSON array from response
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          translations = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback: try parsing entire response
          translations = JSON.parse(text.trim());
        }
      } catch (parseError) {
        console.error('Error parsing translations:', parseError);
        console.error('Raw response:', text);
        
        // Fallback: split by lines and extract translations
        const lines = text.split('\n').filter(line => line.trim().length > 0);
        translations = lines.slice(0, texts.length).map(line => {
          // Remove numbering and quotes
          return line.replace(/^\d+\.\s*["']?|["']?$/g, '').trim();
        });
      }

      // Ensure we have the same number of translations as input texts
      if (translations.length !== texts.length) {
        console.warn(`Translation count mismatch: expected ${texts.length}, got ${translations.length}`);
        // Pad with empty strings if needed
        while (translations.length < texts.length) {
          translations.push('');
        }
        // Trim if too many
        translations = translations.slice(0, texts.length);
      }

      return res.status(200).json({
        translations,
        message: `Translated ${translations.length} text(s) to ${targetLangName}`
      });

    } catch (error) {
      console.error('Gemini API error:', error);
      return res.status(500).json({ 
        error: 'Failed to translate texts', 
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

