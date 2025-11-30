import { GoogleGenerativeAI } from '@google/generative-ai';
import { saveUploadedImage } from './lib/blob-storage.js';

// Logo upgrade level prompts
const upgradeLevelPrompts = {
  low: {
    prompt: 'Apply subtle improvements: slightly enhance clarity, improve contrast, refine typography, and polish edges.',
    description: "Minimal changes while preserving original design"
  },
  medium: {
    prompt: 'Apply balanced improvements: enhance clarity and sharpness, improve colors and contrast, refine typography and details, optimize for professional use.',
    description: "Moderate enhancements for better quality"
  },
  high: {
    prompt: 'Apply maximum improvements: significantly enhance quality, optimize colors and contrast, perfect typography and edges, add professional polish, and create premium-grade logo.',
    description: "Comprehensive upgrade for maximum quality"
  }
};

// Logo style prompts
const logoStylePrompts = {
  modern: 'Update to modern style with contemporary aesthetics and clean design.',
  classic: 'Apply classic style with traditional elegance and timeless appeal.',
  minimalist: 'Simplify to minimalist style with essential elements only.',
  bold: 'Enhance to bold style with strong colors and impactful design.',
  elegant: 'Apply elegant style with sophisticated refinement.',
  playful: 'Transform to playful style with fun and engaging elements.',
  corporate: 'Enhance to corporate style with professional business aesthetics.',
  creative: 'Apply creative style with innovative artistic elements.',
  vintage: 'Transform to vintage style with retro nostalgic charm.'
};

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
    const { image, upgradeLevel = 'medium', style = 'modern' } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Save uploaded image for analysis
    try {
      await saveUploadedImage(image, 'enhancement', {
        upgradeLevel,
        style,
        type: 'logo-upgrade',
        endpoint: '/api/upgrade-logo'
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

    // Validate upgrade level and style
    const validUpgradeLevel = upgradeLevelPrompts[upgradeLevel] ? upgradeLevel : 'medium';
    const validStyle = logoStylePrompts[style] ? style : 'modern';
    const upgradeConfig = upgradeLevelPrompts[validUpgradeLevel];
    const stylePrompt = logoStylePrompts[validStyle];

    // Build the upgrade prompt
    const upgradePrompt = `Upgrade and enhance this logo for professional branding use. ${upgradeConfig.prompt} ${stylePrompt} Maintain the core design, brand identity, and meaning while improving quality, clarity, typography, and visual appeal. 

CRITICAL BACKGROUND REQUIREMENT:
- The upgraded logo MUST have a completely TRANSPARENT background (no solid color, no white, no background at all)
- Preserve or create a transparent background - remove any existing solid backgrounds
- NO solid backgrounds (no white, no gray, no colors)
- NO background shapes, patterns, or fills
- Only the logo itself should be visible - everything around it must be transparent
- The logo should be isolated on a transparent canvas

Make it suitable for modern branding, business cards, websites, and marketing materials with scalable design. The transparent background allows the logo to work on any colored background.`;

    // Initialize Google Generative AI
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3-pro-image-preview" });

    try {
      // Determine MIME type from base64 string
      let mimeType = "image/png";
      if (image.includes('data:image/')) {
        const mimeMatch = image.match(/data:image\/([^;]+)/);
        if (mimeMatch) {
          mimeType = `image/${mimeMatch[1]}`;
        }
      }
      
      const base64Data = image.split(',')[1] || image;
      const result = await model.generateContent([
        upgradePrompt,
        { inlineData: { data: base64Data, mimeType } }
      ]);

      const response = await result.response;
      
      // Try to get image from response
      let upgradedImageBase64 = null;
      
      if (response.candidates && response.candidates[0]) {
        const parts = response.candidates[0].content?.parts || [];
        for (const part of parts) {
          if (part.inlineData?.data) {
            upgradedImageBase64 = part.inlineData.data;
            if (part.inlineData.mimeType) {
              mimeType = part.inlineData.mimeType;
            }
            break;
          }
        }
      }
      
      // If upgraded logo is returned, use it
      if (upgradedImageBase64) {
        return res.status(200).json({ 
          upgradedLogo: `data:${mimeType};base64,${upgradedImageBase64}`,
          message: `Logo upgraded successfully using ${validUpgradeLevel} level and ${validStyle} style.`,
          upgradeLevel: validUpgradeLevel,
          style: validStyle,
          actualPrompt: upgradePrompt
        });
      } else {
        // Return original image with analysis
        const text = response.text();
        return res.status(200).json({ 
          upgradedLogo: image,
          analysis: text,
          message: `Logo processing attempted. Note: Gemini provides analysis. Original logo returned.`,
          upgradeLevel: validUpgradeLevel,
          style: validStyle,
          actualPrompt: upgradePrompt
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
        error: 'Failed to upgrade logo', 
        details: error.message || 'Unknown error'
      });
    }

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'An unexpected error occurred', 
      details: error.message || 'Unknown error'
    });
  }
}

