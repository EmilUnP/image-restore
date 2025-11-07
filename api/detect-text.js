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
    const { image, model: requestedModel } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Save uploaded image for analysis (this is part of translation workflow)
    try {
      await saveUploadedImage(image, 'translation', {
        model: requestedModel || 'default',
        type: 'translation',
        stage: 'text-detection',
        endpoint: '/api/detect-text'
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

    // Model selection
    const availableModels = [
      'gemini-2.0-flash-exp',
      'gemini-2.5-flash-image-preview',
    ];
    
    const modelName = requestedModel && availableModels.includes(requestedModel) 
      ? requestedModel 
      : 'gemini-2.0-flash-exp';

    const prompt = `You are an expert OCR (Optical Character Recognition) specialist. Analyze this image and detect ALL text content with maximum accuracy.

CRITICAL REQUIREMENTS:
1. Detect EVERY piece of text in the image
2. For each text block, provide:
   - The EXACT text content as it appears
   - A confidence score (0.0 to 1.0)
   - Bounding box coordinates if possible (x, y, width, height in pixels)

3. Return the results as a JSON array with this exact format:
[
  {
    "id": "text_1",
    "text": "exact text content here",
    "confidence": 0.95,
    "boundingBox": {
      "x": 100,
      "y": 50,
      "width": 200,
      "height": 30
    }
  }
]

IMPORTANT: Return ONLY valid JSON array, no other text or explanation.`;

    // Initialize Google Generative AI
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    let model;
    let result;

    try {
      model = genAI.getGenerativeModel({ model: modelName });
      result = await model.generateContent([prompt, { inlineData: { data: image.split(',')[1] || image, mimeType: 'image/jpeg' } }]);
    } catch (modelError) {
      // Fallback to flash if the requested model fails
      if (modelName !== 'gemini-1.5-flash' && modelError.status === 404) {
        console.warn(`Model ${modelName} not found, falling back to gemini-1.5-flash`);
        model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        result = await model.generateContent([prompt, { inlineData: { data: image.split(',')[1] || image, mimeType: 'image/jpeg' } }]);
      } else {
        throw modelError;
      }
    }

    const response = await result.response;
    const text = response.text();

    // Parse JSON from response
    let detectedTexts = [];
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        detectedTexts = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: create a simple text entry
        detectedTexts = [{
          id: 'text_1',
          text: text.trim(),
          confidence: 0.8,
          boundingBox: undefined
        }];
      }
    } catch (parseError) {
      console.error('Error parsing detected text:', parseError);
      console.error('Raw response:', text);
      // Fallback: create a simple text entry
      detectedTexts = [{
        id: 'text_1',
        text: text.trim(),
        confidence: 0.8,
        boundingBox: undefined
      }];
    }

    return res.status(200).json({
      detectedTexts,
      message: `Detected ${detectedTexts.length} text block(s)`,
      model: modelName
    });

  } catch (error) {
    console.error('Text detection error:', error);
    return res.status(500).json({ 
      error: 'Failed to detect text in image', 
      details: error.message || 'Unknown error'
    });
  }
}

