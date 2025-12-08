import { GoogleGenerativeAI } from '@google/generative-ai';
import { saveUploadedImage } from './lib/imageStorage.js';

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
    const { image, stylePrompt, aspectRatio = '1:1', backgroundStyle = 'natural', backgroundColor } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    if (!stylePrompt || !stylePrompt.trim()) {
      return res.status(400).json({ error: 'No style prompt provided' });
    }

    // Save uploaded image for analysis
    try {
      await saveUploadedImage(image, 'uniform-styling', {
        stylePrompt,
        aspectRatio,
        backgroundStyle,
        type: 'uniform-styling',
        endpoint: '/api/uniform-image-styling'
      });
    } catch (saveError) {
      // Don't fail the request if saving fails, just log it
      console.error('Error saving uploaded image:', saveError);
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_api_key_here') {
      return res.status(500).json({ 
        error: 'AI service not configured. Please set GEMINI_API_KEY environment variable',
        instructions: 'Get your API key from https://aistudio.google.com/app/apikey and add it to Vercel environment variables'
      });
    }

    // Get dimensions for aspect ratio
    const aspectRatioDimensions = {
      '1:1': { width: 1024, height: 1024 },
      '4:3': { width: 1920, height: 1440 },
      '16:9': { width: 1920, height: 1080 },
      '9:16': { width: 1080, height: 1920 },
      '3:4': { width: 1440, height: 1920 },
    };

    const dimensions = aspectRatioDimensions[aspectRatio] || aspectRatioDimensions['1:1'];

    // Build the transformation prompt
    let transformationPrompt = `Transform this image to match the following style: "${stylePrompt}". `;
    
    transformationPrompt += `Maintain the person's face and identity, but apply the specified style consistently. `;
    transformationPrompt += `Ensure the background, lighting, colors, and overall aesthetic match the style description. `;
    
    if (backgroundStyle === 'solid' && backgroundColor) {
      transformationPrompt += `Use a solid ${backgroundColor} background. `;
    } else if (backgroundStyle === 'gradient') {
      transformationPrompt += `Use an elegant gradient background that complements the style. `;
    } else if (backgroundStyle === 'blur') {
      transformationPrompt += `Use a blurred, professional background. `;
    } else if (backgroundStyle === 'transparent') {
      transformationPrompt += `Use a transparent background. `;
    }

    transformationPrompt += `
    
TECHNICAL SPECIFICATIONS:
- Output size: ${dimensions.width}x${dimensions.height} pixels
- Maintain high quality and sharpness
- Preserve facial features and identity
- Apply consistent styling across all elements
- Ensure professional, polished appearance
- Match the style description exactly

IMPORTANT:
- Keep the person's face recognizable
- Apply the style uniformly
- Ensure consistent lighting and colors
- Match the background style specified
- Output a high-quality, professional result`;

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Prepare the image part
    const imagePart = {
      inlineData: {
        data: image.split(',')[1] || image, // Remove data:image/... prefix if present
        mimeType: 'image/png',
      },
    };

    const promptPart = {
      text: transformationPrompt,
    };

    console.log('[uniform-image-styling] Generating image with style:', stylePrompt);
    console.log('[uniform-image-styling] Dimensions:', dimensions);

    const result = await model.generateContent([promptPart, imagePart]);
    const response = await result.response;

    // Check if response contains image data
    let processedImage = null;

    // Try to extract image from response
    if (response.candidates && response.candidates[0]) {
      const candidate = response.candidates[0];
      
      // Check for inline data (base64 image)
      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData && part.inlineData.data) {
            processedImage = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
            break;
          }
        }
      }
    }

    if (!processedImage) {
      // If no image in response, try to get text response for debugging
      const textResponse = response.text();
      console.error('[uniform-image-styling] No image in response. Text response:', textResponse);
      return res.status(500).json({ 
        error: 'Failed to generate processed image',
        details: 'The AI model did not return an image. Please try again.',
        debug: textResponse.substring(0, 200)
      });
    }

    return res.status(200).json({
      processedImage,
      message: 'Image successfully processed with uniform styling',
    });

  } catch (error) {
    console.error('[uniform-image-styling] Error:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to process image',
      details: error.toString()
    });
  }
}
