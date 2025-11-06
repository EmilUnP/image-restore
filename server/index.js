#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Enhancement mode prompts
const enhancementPrompts = {
  document: {
    prompt: `Enhance this document image to high quality. Remove noise, yellowing, and scanning artifacts. Sharpen text edges, improve contrast between text and background, correct perspective, and make it crystal clear while preserving all original content, layout, and formatting. Output a professional, clean document image.`,
    description: "Perfect for scanned documents, receipts, and text-based images"
  },
  photo: {
    prompt: `Enhance this photograph to high quality. Improve sharpness, reduce noise and grain, enhance colors and contrast naturally, correct exposure, and bring out fine details. Maintain natural skin tones and realistic colors. Output a professional, vibrant photo without over-processing.`,
    description: "Enhance general photographs with natural, professional results"
  },
  portrait: {
    prompt: `Enhance this portrait photo to high quality. Improve skin texture naturally, reduce noise, enhance eye clarity and detail, improve lighting balance, and bring out natural colors. Maintain realistic skin tones and avoid over-smoothing. Output a professional portrait with natural beauty.`,
    description: "Optimized for portraits and people photos"
  },
  lowlight: {
    prompt: `Enhance this low-light image to high quality. Brighten the image naturally, reduce noise and grain, improve visibility of dark areas, enhance details in shadows, and correct color balance. Maintain realistic lighting without creating artifacts. Output a clear, well-lit image.`,
    description: "Brighten and enhance dark or low-light images"
  },
  art: {
    prompt: `Enhance this artwork or illustration to high quality. Preserve artistic style and colors, reduce noise and compression artifacts, sharpen fine details, improve color vibrancy, and enhance overall clarity. Maintain the original artistic intent and aesthetic. Output a high-quality digital art piece.`,
    description: "Enhance artwork, illustrations, and digital art"
  },
  old: {
    prompt: `Restore and enhance this old or vintage image to high quality. Remove scratches, dust, and age-related damage. Reduce yellowing and fading, restore natural colors, improve contrast, and sharpen details. Preserve the vintage character while making it look professionally restored. Output a restored, high-quality image.`,
    description: "Restore old photos and vintage images"
  },
  landscape: {
    prompt: `Enhance this landscape image to high quality. Improve overall sharpness, enhance natural colors and saturation, improve sky and foreground contrast, reduce haze, and bring out fine details in both near and far objects. Maintain realistic natural beauty. Output a stunning, vibrant landscape photo.`,
    description: "Enhance landscape and nature photography"
  },
  product: {
    prompt: `Enhance this product image to high quality. Improve sharpness and clarity, enhance colors accurately, remove background noise, improve lighting balance, and make the product stand out professionally. Maintain accurate color representation for e-commerce. Output a professional product photo.`,
    description: "Perfect for product photography and e-commerce"
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Image Optimizer AI Backend is running!' });
});

// Get available enhancement modes
app.get('/api/enhancement-modes', (req, res) => {
  const modes = Object.keys(enhancementPrompts).map(key => ({
    id: key,
    name: key.charAt(0).toUpperCase() + key.slice(1),
    description: enhancementPrompts[key].description
  }));
  res.json({ modes });
});

// Image enhancement endpoint
app.post('/api/enhance-image', async (req, res) => {
  try {
    const { image, mode = 'photo', intensity = 'medium' } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_api_key_here') {
      return res.status(500).json({ 
        error: 'AI service not configured. Please set GEMINI_API_KEY in server/.env file',
        instructions: 'Get your API key from https://aistudio.google.com/app/apikey and add it to server/.env'
      });
    }

    // Validate mode
    const validMode = enhancementPrompts[mode] ? mode : 'photo';
    const enhancementConfig = enhancementPrompts[validMode];

    // Adjust prompt based on intensity
    let intensityModifier = '';
    if (intensity === 'low') {
      intensityModifier = ' Apply subtle enhancements only.';
    } else if (intensity === 'high') {
      intensityModifier = ' Apply aggressive enhancements for maximum quality improvement.';
    } else {
      intensityModifier = ' Apply balanced, moderate enhancements.';
    }

    const prompt = enhancementConfig.prompt + intensityModifier;

    // Initialize Google Generative AI
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image-preview" });

    try {
      // Determine MIME type from base64 string
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
      let enhancedImageBase64 = null;
      
      if (response.candidates && response.candidates[0]) {
        const parts = response.candidates[0].content?.parts || [];
        for (const part of parts) {
          if (part.inlineData?.data) {
            enhancedImageBase64 = part.inlineData.data;
            break;
          }
        }
      }
      
      // If enhanced image is returned, use it
      if (enhancedImageBase64) {
        return res.json({ 
          enhancedImage: `data:${mimeType};base64,${enhancedImageBase64}`,
          message: `Image enhanced successfully using ${validMode} mode.`,
          mode: validMode
        });
      } else {
        // Return original image with analysis
        const text = response.text();
        return res.json({ 
          enhancedImage: image,
          analysis: text,
          message: `Image processed using ${validMode} mode. Note: Gemini provides analysis, not enhanced images.`,
          mode: validMode
        });
      }

    } catch (error) {
      console.error('Gemini API error:', error);
      
      if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('401')) {
        return res.status(401).json({ error: 'Invalid API key. Please check your GEMINI_API_KEY.' });
      }
      
      if (error.message?.includes('QUOTA_EXCEEDED') || error.message?.includes('429') || error.message?.includes('quota')) {
        return res.status(429).json({ 
          error: 'API quota exceeded. You have used up your free tier limit.',
          message: 'Please wait a few minutes and try again, or upgrade your API plan.',
          retryAfter: '42 seconds'
        });
      }

      return res.status(500).json({ 
        error: 'Failed to process image', 
        details: error.message || 'Unknown error'
      });
    }

  } catch (error) {
    return res.status(500).json({ 
      error: 'An unexpected error occurred', 
      details: error.message || 'Unknown error'
    });
  }
});

// Text detection endpoint
app.post('/api/detect-text', async (req, res) => {
  try {
    const { image, model: requestedModel } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_api_key_here') {
      return res.status(500).json({ 
        error: 'AI service not configured. Please set GEMINI_API_KEY in server/.env file',
        instructions: 'Get your API key from https://aistudio.google.com/app/apikey and add it to server/.env'
      });
    }

    // Model selection: Use requested model or default to best text detection model
     const availableModels = [
      'gemini-2.0-flash-exp',      // Best for text detection (experimental)
      'gemini-2.5-flash-image-preview', // Current default
    ];
    
    // Default to flash which is more stable and available
    const modelName = requestedModel && availableModels.includes(requestedModel) 
      ? requestedModel 
      : 'gemini-2.0-flash-exp'; // Default to flash for better availability

    const prompt = `You are an expert OCR (Optical Character Recognition) specialist. Analyze this image and detect ALL text content with maximum accuracy.

CRITICAL REQUIREMENTS:
1. Detect EVERY piece of text in the image, including:
   - Headers, titles, subtitles
   - Body text, paragraphs, sentences
   - Labels, captions, annotations
   - Buttons, menu items, navigation text
   - Watermarks, copyright notices
   - Numbers, dates, prices, codes
   - Text in different languages
   - Text in various fonts, sizes, and styles
   - Text on different backgrounds (light, dark, colored)

2. For each text block, provide:
   - The EXACT text content as it appears (preserve capitalization, punctuation, spacing)
   - A confidence score (0.0 to 1.0) - be honest about uncertainty
   - Bounding box coordinates if possible (x, y, width, height in pixels)

3. Text detection guidelines:
   - Read text in reading order (top to bottom, left to right)
   - Group related text together (e.g., a sentence as one block)
   - Separate distinct text elements (e.g., title vs body text)
   - Preserve line breaks and formatting where important
   - Handle rotated or skewed text if present
   - Detect text in multiple languages if present

4. Confidence scoring:
   - 0.9-1.0: Very clear, high-quality text
   - 0.7-0.89: Clear text with minor uncertainty
   - 0.5-0.69: Text is readable but may have some errors
   - Below 0.5: Low confidence, text may be unclear or partially obscured

Return the results as a JSON array with this EXACT structure:
[
  {
    "text": "exact text content here",
    "confidence": 0.95,
    "boundingBox": {"x": 10, "y": 20, "width": 100, "height": 30}
  }
]

IMPORTANT: 
- Return ONLY valid JSON, no markdown, no explanations
- If bounding boxes cannot be determined, omit the "boundingBox" field
- Be thorough - detect ALL text, even small or partially visible text
- Maintain the exact text as it appears (don't correct spelling or grammar)
- Order text blocks in reading order when possible`;

    // Initialize Google Generative AI
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    // Note: getGenerativeModel doesn't validate the model until generateContent is called
    // So we'll handle model errors in the API call catch block
    const model = genAI.getGenerativeModel({ model: modelName });
    let actualModelName = modelName;
    console.log(`Attempting to use model: ${modelName} for text detection`);

    try {
      // Determine MIME type from base64 string
      let mimeType = "image/jpeg";
      if (image.includes('data:image/')) {
        const mimeMatch = image.match(/data:image\/([^;]+)/);
        if (mimeMatch) {
          mimeType = `image/${mimeMatch[1]}`;
        }
      }
      
      const base64Data = image.split(',')[1] || image;
      
      // Use generation config for better JSON output
      const generationConfig = {
        temperature: 0.1, // Low temperature for more deterministic, accurate text detection
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      };
      
      let result;
      let response;
      let text;
      
      try {
        result = await model.generateContent(
          [
            prompt,
            { inlineData: { data: base64Data, mimeType } }
          ],
          { generationConfig }
        );
        response = await result.response;
        text = response.text();
      } catch (apiError) {
        // If the model fails (404 or other API error), try fallback models
        if (apiError.status === 404 || apiError.message?.includes('not found') || apiError.message?.includes('not supported')) {
          console.warn(`Model ${actualModelName} failed with error:`, apiError.message);
          console.log('Attempting to use fallback model: gemini-2.0-flash');
          
          try {
            const fallbackModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
            result = await fallbackModel.generateContent(
              [
                prompt,
                { inlineData: { data: base64Data, mimeType } }
              ],
              { generationConfig }
            );
            response = await result.response;
            text = response.text();
            actualModelName = 'gemini-2.0-flash-exp';
            console.log('Successfully used fallback model');
          } catch (fallbackError) {
            console.error('Fallback model also failed:', fallbackError);
            throw apiError; // Throw original error
          }
        } else {
          throw apiError; // Re-throw if it's not a model availability error
        }
      }
      
      // Try to parse JSON from response with multiple strategies
      let detectedTexts = [];
      try {
        // Strategy 1: Extract JSON from markdown code blocks
        const jsonMatch = text.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
        if (jsonMatch) {
          detectedTexts = JSON.parse(jsonMatch[1]);
        } else {
          // Strategy 2: Find JSON array in the text
          const arrayMatch = text.match(/\[[\s\S]*\]/);
          if (arrayMatch) {
            detectedTexts = JSON.parse(arrayMatch[0]);
          } else {
            // Strategy 3: Try parsing the entire response as JSON
            detectedTexts = JSON.parse(text.trim());
          }
        }
      } catch (parseError) {
        console.warn('JSON parsing failed, attempting fallback extraction:', parseError.message);
        // Fallback: Try to extract structured data from text response
        // Look for patterns like: "text": "...", "confidence": ...
        try {
          const textMatches = Array.from(text.matchAll(/"text"\s*:\s*"([^"]+)"/g));
          const confidenceMatches = Array.from(text.matchAll(/"confidence"\s*:\s*([\d.]+)/g));
          
          const texts = textMatches.map(m => m[1]);
          const confidences = confidenceMatches.map(m => parseFloat(m[1]));
          
          if (texts.length > 0) {
            detectedTexts = texts.map((text, index) => ({
              text: text,
              confidence: confidences[index] || 0.7,
            }));
          } else {
            // Last resort: Split by lines and create basic text blocks
            const lines = text.split('\n')
              .filter(line => line.trim().length > 0)
              .filter(line => !line.match(/^[\[\]{}",\s]*$/)) // Filter out JSON structure lines
              .slice(0, 50); // Limit to 50 lines
            
            detectedTexts = lines.map((line, index) => ({
              id: `text-${index + 1}`,
              text: line.trim().replace(/^["']|["']$/g, ''), // Remove quotes
              confidence: 0.7,
            }));
          }
        } catch (fallbackError) {
          console.error('Fallback extraction also failed:', fallbackError);
          detectedTexts = [];
        }
      }

      // Ensure we have an array with proper structure
      if (!Array.isArray(detectedTexts)) {
        detectedTexts = [];
      }

      // Add IDs and ensure proper structure
      detectedTexts = detectedTexts.map((item, index) => ({
        id: item.id || `text-${index + 1}`,
        text: item.text || String(item),
        confidence: typeof item.confidence === 'number' ? item.confidence : 0.7,
        boundingBox: item.boundingBox || undefined,
      }));

            return res.json({ 
              detectedTexts,
              message: `Detected ${detectedTexts.length} text block(s) using ${actualModelName}`,
              model: actualModelName,
            });

    } catch (error) {
      console.error('Gemini API error:', error);
      return res.status(500).json({ 
        error: 'Failed to detect text in image',
        details: error.message || 'Unknown error'
      });
    }
  } catch (error) {
    console.error('Text detection error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message || 'Unknown error'
    });
  }
});

// Text translation endpoint (translates text only, not images)
app.post('/api/translate-text', async (req, res) => {
  try {
    const { texts, targetLanguage = 'en' } = req.body;
    
    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return res.status(400).json({ error: 'No texts provided' });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_api_key_here') {
      return res.status(500).json({ 
        error: 'AI service not configured. Please set GEMINI_API_KEY in server/.env file',
        instructions: 'Get your API key from https://aistudio.google.com/app/apikey and add it to server/.env'
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

    const prompt = `You are a professional translator. Translate the following texts to ${targetLangName}. 

CRITICAL REQUIREMENTS:
1. Return ONLY a valid JSON array
2. Maintain the exact same order as the input texts
3. Translate each text accurately and completely
4. Do not add explanations, comments, or markdown
5. Return the JSON array directly, no code blocks

Texts to translate:
${texts.map((text, i) => `${i + 1}. "${text}"`).join('\n')}

Return ONLY this format (JSON array):
["translation1", "translation2", "translation3"]`;

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image-preview" });

    try {
      const generationConfig = {
        temperature: 0.3, // Lower temperature for more consistent translations
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      };
      
      console.log('Sending translation request to Gemini API...');
      const result = await model.generateContent([prompt], { generationConfig });
      const response = await result.response;
      const text = response.text();
      console.log('Received response from Gemini API, length:', text.length);
      
      // Try to parse JSON from response
      let translations = [];
      console.log('Raw AI response:', text);
      
      try {
        // Strategy 1: Extract JSON from markdown code blocks
        const jsonMatch = text.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
        if (jsonMatch) {
          console.log('Found JSON in code block');
          translations = JSON.parse(jsonMatch[1]);
        } else {
          // Strategy 2: Try to find JSON array in the text
          const arrayMatch = text.match(/\[[\s\S]*\]/);
          if (arrayMatch) {
            console.log('Found JSON array in text');
            translations = JSON.parse(arrayMatch[0]);
          } else {
            // Strategy 3: Try parsing the entire response
            console.log('Trying to parse entire response as JSON');
            translations = JSON.parse(text.trim());
          }
        }
        console.log('Parsed translations:', translations);
      } catch (parseError) {
        console.error('JSON parsing failed:', parseError);
        console.log('Attempting fallback extraction...');
        
        // Fallback: Try to extract translations from numbered list or quoted strings
        try {
          // Try to find quoted strings
          const quotedMatches = text.matchAll(/"([^"]+)"/g);
          const quoted = Array.from(quotedMatches).map(m => m[1]);
          
          if (quoted.length >= texts.length) {
            console.log('Using quoted strings as translations');
            translations = quoted.slice(0, texts.length);
          } else {
            // Try numbered list format
            const lines = text.split('\n')
              .filter(line => line.trim().length > 0)
              .filter(line => /^\d+\./.test(line.trim()));
            
            if (lines.length >= texts.length) {
              console.log('Using numbered list as translations');
              translations = lines.slice(0, texts.length).map(line => 
                line.replace(/^\d+\.\s*["']?|["']?$/g, '').trim()
              );
            } else {
              // Last resort: split by lines and take first N
              const allLines = text.split('\n')
                .filter(line => line.trim().length > 0)
                .filter(line => !line.match(/^[\[\]{}",\s]*$/))
                .slice(0, texts.length);
              
              translations = allLines.map(line => line.trim().replace(/^["']|["']$/g, ''));
            }
          }
        } catch (fallbackError) {
          console.error('Fallback extraction also failed:', fallbackError);
          translations = [];
        }
      }

      // Validate translations
      if (!Array.isArray(translations)) {
        console.error('Translations is not an array:', translations);
        translations = [];
      }
      
      // Ensure we have the same number of translations as texts
      if (translations.length !== texts.length) {
        console.warn(`Translation count mismatch: expected ${texts.length}, got ${translations.length}`);
        // Pad with empty strings or truncate
        while (translations.length < texts.length) {
          translations.push("");
        }
        translations = translations.slice(0, texts.length);
      }
      
      // Log final translations
      console.log(`Final translations (${translations.length}):`, translations);
      texts.forEach((text, i) => {
        console.log(`  "${text}" -> "${translations[i]}"`);
      });

      return res.json({ 
        translations,
        message: `Translated ${translations.length} text(s) to ${targetLangName}`,
      });

    } catch (error) {
      console.error('Gemini API error:', error);
      return res.status(500).json({ 
        error: 'Failed to translate text',
        details: error.message || 'Unknown error'
      });
    }
  } catch (error) {
    console.error('Text translation error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message || 'Unknown error'
    });
  }
});

// Image text translation endpoint
app.post('/api/translate-image', async (req, res) => {
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

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_api_key_here') {
      return res.status(500).json({ 
        error: 'AI service not configured. Please set GEMINI_API_KEY in server/.env file',
        instructions: 'Get your API key from https://aistudio.google.com/app/apikey and add it to server/.env'
      });
    }

    // Language name mapping for better prompts
    const languageNames = {
      'en': 'English',
      'ru': 'Russian',
      'tr': 'Turkish',
      'uk': 'Ukrainian',
    };

    const targetLangName = languageNames[targetLanguage] || targetLanguage;

    // Log received data for debugging
    console.log('Translation request received:');
    console.log('- Target language:', targetLangName);
    console.log('- Translated texts pairs:', translatedTexts ? translatedTexts.length : 0);
    console.log('- Corrected texts:', correctedTexts ? correctedTexts.length : 0);
    if (translatedTexts && translatedTexts.length > 0) {
      console.log('- Text pairs:', translatedTexts.map(p => `${p.original} → ${p.translated}`));
    }
    
    // Build comprehensive prompt based on settings
    let prompt = `You are an expert image translation specialist. Replace ALL text in this image with the provided translations, maintaining professional quality and attention to detail.\n\n`;
    
    // Add translated text pairs if provided (preferred method)
    if (translatedTexts && Array.isArray(translatedTexts) && translatedTexts.length > 0) {
      prompt += `CRITICAL INSTRUCTIONS - READ CAREFULLY:\n\n`;
      prompt += `You MUST find and replace the following text in the image EXACTLY as specified:\n\n`;
      translatedTexts.forEach((pair, i) => {
        if (pair.original && pair.translated) {
          prompt += `${i + 1}. Find the text: "${pair.original}"\n`;
          prompt += `   Replace it with: "${pair.translated}"\n`;
          prompt += `   Keep the same position, size, font, and style\n\n`;
        }
      });
      prompt += `VERY IMPORTANT:\n`;
      prompt += `- Search for each original text EXACTLY as written above\n`;
      prompt += `- Replace it with the corresponding translation EXACTLY as provided\n`;
      prompt += `- Maintain the exact same visual appearance (font, size, color, position)\n`;
      prompt += `- Do NOT translate any other text that is not in the list above\n`;
      prompt += `- Do NOT modify the image in any other way\n\n`;
    } else if (correctedTexts && Array.isArray(correctedTexts) && correctedTexts.length > 0) {
      // Fallback to old method if translatedTexts not provided
      prompt += `IMPORTANT: The following text blocks have been verified and corrected by the user. Translate these texts to ${targetLangName}:\n${correctedTexts.map((text, i) => `${i + 1}. "${text}"`).join('\n')}\n\n`;
    } else {
      // If no specific texts provided, detect and translate all
      prompt += `Detect ALL text in the image and translate it to ${targetLangName}.\n\n`;
    }
    
    // Quality-specific instructions
    const qualityInstructions = {
      standard: "Provide accurate translation with good text rendering.",
      premium: "Provide highly accurate translation with excellent text rendering, precise font matching, and perfect positioning. Pay extra attention to details.",
      ultra: "Provide perfect translation with pixel-perfect text rendering, exact font matching, perfect positioning, and flawless visual integration. Maximum attention to every detail."
    };
    
    // Font matching instructions
    const fontInstructions = {
      auto: "Intelligently match fonts that are visually similar to the original, considering the target language's typography conventions.",
      preserve: "Preserve the exact original fonts as much as possible, adapting only the characters to the target language.",
      native: "Use fonts that are native and natural for the target language while maintaining visual harmony with the original design."
    };
    
    // Text style instructions
    const styleInstructions = {
      exact: "Preserve the exact original text style, formatting, and visual appearance.",
      natural: "Adapt the text style to be natural and readable in the target language while maintaining visual coherence.",
      adaptive: "Balance between preserving original style and adapting to target language conventions for optimal readability and visual appeal."
    };
    
    prompt += `TRANSLATION REQUIREMENTS:\n\n`;
    if (translatedTexts && translatedTexts.length > 0) {
      prompt += `1. TEXT REPLACEMENT (MANDATORY):\n`;
      prompt += `   - You have been given ${translatedTexts.length} specific text replacement pairs\n`;
      prompt += `   - For EACH pair, find the original text in the image and replace it with the translation\n`;
      prompt += `   - Use the EXACT translations provided - do NOT modify, improve, or change them\n`;
      prompt += `   - Match text positions, sizes, fonts, colors, and styles EXACTLY\n`;
      prompt += `   - If you cannot find a text, try variations (case-insensitive, with/without spaces)\n`;
      prompt += `   - DO NOT translate any text that is NOT in the provided list\n`;
    } else {
      prompt += `1. TEXT DETECTION & TRANSLATION:\n`;
      prompt += `   - Identify EVERY piece of text in the image (signs, labels, captions, subtitles, buttons, menus, headers, footers, watermarks, etc.)\n`;
      prompt += `   - Translate ALL text accurately to ${targetLangName}\n`;
      prompt += `   - Maintain proper grammar, context, and meaning\n`;
    }
    prompt += `   - Preserve numbers, dates, and special characters unless they need localization\n\n`;
    
    prompt += `2. VISUAL PRESERVATION:\n`;
    prompt += `   - Preserve 100% of the original image quality, resolution, and clarity\n`;
    prompt += `   - Keep ALL colors, gradients, shadows, and visual effects exactly as they are\n`;
    prompt += `   - Maintain the exact same background, images, graphics, and non-text elements\n`;
    prompt += `   - Do NOT alter, remove, or modify any visual elements except text\n\n`;
    
    prompt += `3. TEXT RENDERING (${quality.toUpperCase()} Quality):\n`;
    prompt += `   - ${qualityInstructions[quality]}\n`;
    prompt += `   - ${fontInstructions[fontMatching]}\n`;
    prompt += `   - ${styleInstructions[textStyle]}\n`;
    prompt += `   - Maintain exact text positioning, alignment, and spacing\n`;
    prompt += `   - Preserve text size relationships (headings vs body text)\n`;
    prompt += `   - Keep text colors, shadows, outlines, and effects identical\n`;
    if (preserveFormatting) {
      prompt += `   - Preserve ALL formatting: bold, italic, underline, strikethrough, colors, sizes\n`;
    }
    if (enhanceReadability) {
      prompt += `   - Optimize text for maximum readability in ${targetLangName}\n`;
      prompt += `   - Ensure proper spacing and line breaks for target language\n`;
    }
    prompt += `\n`;
    
    prompt += `4. TECHNICAL REQUIREMENTS:\n`;
    prompt += `   - Output a high-resolution image matching the original dimensions\n`;
    prompt += `   - Ensure text is crisp, clear, and properly rendered\n`;
    prompt += `   - Maintain aspect ratio and image proportions\n`;
    prompt += `   - Preserve image format and quality settings\n`;
    prompt += `   - Ensure translated text is perfectly integrated and looks natural\n\n`;
    
    prompt += `5. QUALITY STANDARDS:\n`;
    prompt += `   - The translated image should look like it was originally created in ${targetLangName}\n`;
    prompt += `   - Text should appear natural and professionally rendered\n`;
    prompt += `   - No artifacts, blur, or quality degradation\n`;
    prompt += `   - Perfect alignment and positioning of all text elements\n`;
    prompt += `   - Seamless visual integration of translated text\n\n`;
    
    prompt += `OUTPUT: Return ONLY the translated image with all text translated to ${targetLangName}. The image should be visually identical to the original except for the translated text.`;

    // Initialize Google Generative AI
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image-preview" });

    try {
      // Determine MIME type from base64 string
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
      
      // If translated image is returned, use it
      if (translatedImageBase64) {
        return res.json({ 
          translatedImage: `data:${mimeType};base64,${translatedImageBase64}`,
          message: `Image text translated successfully to ${targetLangName}.`,
          targetLanguage: targetLangName
        });
      } else {
        // Return original image with analysis
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
      
      if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('401')) {
        return res.status(401).json({ error: 'Invalid API key. Please check your GEMINI_API_KEY.' });
      }
      
      if (error.message?.includes('QUOTA_EXCEEDED') || error.message?.includes('429') || error.message?.includes('quota')) {
        return res.status(429).json({ 
          error: 'API quota exceeded. You have used up your free tier limit.',
          message: 'Please wait a few minutes and try again, or upgrade your API plan.',
          retryAfter: '42 seconds'
        });
      }

      return res.status(500).json({ 
        error: 'Failed to translate image', 
        details: error.message || 'Unknown error'
      });
    }

  } catch (error) {
    return res.status(500).json({ 
      error: 'An unexpected error occurred', 
      details: error.message || 'Unknown error'
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Image Optimizer AI Backend running on http://localhost:${PORT}`);
  console.log('📝 Make sure you have GEMINI_API_KEY set in server/.env file');
  console.log('🔗 Get your API key from: https://aistudio.google.com/app/apikey');
  console.log(`📸 Available enhancement modes: ${Object.keys(enhancementPrompts).join(', ')}`);
  console.log('🌍 Image translation feature enabled');
  console.log('');
  console.log('✅ Backend is ready! You can now start the frontend with: npm run dev');
});
