import { GoogleGenerativeAI } from '@google/generative-ai';
import { saveUploadedImage } from './lib/blob-storage.js';

// Icon generation style prompts
const iconStylePrompts = {
  modern: {
    prompt: 'Create a modern, sleek icon with clean lines, contemporary design, and professional appearance.',
    description: "Contemporary design with smooth edges"
  },
  minimalist: {
    prompt: 'Create a minimalist icon with simple shapes, minimal details, and clean aesthetics.',
    description: "Simple, clean, and essential elements only"
  },
  bold: {
    prompt: 'Create a bold, eye-catching icon with strong colors, thick strokes, and impactful design.',
    description: "Strong visual presence with vibrant colors"
  },
  outline: {
    prompt: 'Create an outlined icon with stroke-based design, no fills, and clear boundaries.',
    description: "Line-based design without fills"
  },
  filled: {
    prompt: 'Create a filled icon with solid colors, complete shapes, and rich visual presence.',
    description: "Solid colors with complete shapes"
  },
  gradient: {
    prompt: 'Create a gradient icon with smooth color transitions, depth, and modern gradient effects.',
    description: "Smooth color transitions and depth"
  },
  '3d': {
    prompt: 'Create a 3D icon with depth, shadows, highlights, and dimensional appearance.',
    description: "Three-dimensional design with depth"
  },
  flat: {
    prompt: 'Create a flat icon with 2D design, simple colors, and no shadows or gradients.',
    description: "Simple 2D design without depth effects"
  }
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
    const { prompt, style = 'modern', size = '512', referencePrompt, referenceImage, isVariant = false } = req.body;
    
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'No prompt provided' });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_api_key_here') {
      return res.status(500).json({ 
        error: 'AI service not configured. Please set GEMINI_API_KEY environment variable',
        instructions: 'Get your API key from https://aistudio.google.com/app/apikey and add it to Vercel environment variables'
      });
    }

    // Validate style
    const validStyle = iconStylePrompts[style] ? style : 'modern';
    const styleConfig = iconStylePrompts[validStyle];

    // Build the icon generation prompt
    let iconPrompt;
    if (isVariant && referenceImage) {
      // For variants with image reference, instruct to match the visual style exactly
      iconPrompt = `Generate a high-quality icon variant for web use. ${styleConfig.prompt}

Look at the reference icon image provided. Create a new related icon that represents: "${prompt}".

CRITICAL VISUAL CONSISTENCY REQUIREMENTS (match the reference icon exactly):
- Use the EXACT SAME colors, gradients, and color palette from the reference icon
- Match the exact line weight, stroke width, and thickness
- Use identical corner radius, rounding, and edge treatment
- Replicate the same shadow, highlight, and lighting effects
- Maintain the same visual density and detail level
- Match the same overall proportions, scale, and visual weight
- Use the same design language, style, and aesthetic approach
- Ensure this variant looks like it was created by the same designer and belongs to the same icon set/family

The new icon should represent "${prompt}" but visually match the reference icon in every way possible. The icon should be suitable for use in modern web applications, with clear visual communication, scalable design, and appropriate size of ${size}x${size} pixels.`;
    } else if (isVariant && referencePrompt) {
      // Fallback: variant with only text reference
      iconPrompt = `Generate a high-quality icon variant for web use. ${styleConfig.prompt} 

This icon is part of a set. The main icon represents: "${referencePrompt}". 

Create a related icon that represents: "${prompt}". 

CRITICAL CONSISTENCY REQUIREMENTS:
- Use the EXACT SAME design style, color palette, and visual language as the main icon
- Maintain the same line weight, corner radius, and overall aesthetic
- Use identical or very similar colors, shadows, and effects
- Ensure this variant looks like it belongs to the same icon family/set
- Keep the same level of detail and complexity
- Match the overall proportions and visual weight

The icon should be suitable for use in modern web applications, with clear visual communication, scalable design, and appropriate size of ${size}x${size} pixels. The icon should be professional, recognizable, and suitable for both light and dark backgrounds.`;
    } else {
      // Standard generation without variant context
      iconPrompt = `Generate a high-quality icon for web use. ${styleConfig.prompt} The icon should represent: "${prompt}". Make it suitable for use in modern web applications, with clear visual communication, scalable design, and appropriate size of ${size}x${size} pixels. The icon should be professional, recognizable, and suitable for both light and dark backgrounds.`;
    }

    // Initialize Google Generative AI
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3-pro-image-preview" });

    try {
      // If we have a reference image, send both prompt and image
      let result;
      if (isVariant && referenceImage) {
        // Extract MIME type and base64 data from reference image
        let mimeType = "image/png";
        let base64Data = referenceImage;
        
        if (referenceImage.includes('data:image/')) {
          const mimeMatch = referenceImage.match(/data:image\/([^;]+)/);
          if (mimeMatch) {
            mimeType = `image/${mimeMatch[1]}`;
          }
          base64Data = referenceImage.split(',')[1] || referenceImage;
        }
        
        result = await model.generateContent([
          iconPrompt,
          { inlineData: { data: base64Data, mimeType } }
        ]);
      } else {
        // Standard generation without image reference
        result = await model.generateContent([iconPrompt]);
      }

      const response = await result.response;
      
      // Try to get image from response
      let generatedImageBase64 = null;
      let mimeType = "image/png";
      
      if (response.candidates && response.candidates[0]) {
        const parts = response.candidates[0].content?.parts || [];
        for (const part of parts) {
          if (part.inlineData?.data) {
            generatedImageBase64 = part.inlineData.data;
            if (part.inlineData.mimeType) {
              mimeType = part.inlineData.mimeType;
            }
            break;
          }
        }
      }
      
      // If icon is generated, return it
      if (generatedImageBase64) {
        return res.status(200).json({ 
          generatedIcon: `data:${mimeType};base64,${generatedImageBase64}`,
          message: `Icon generated successfully using ${validStyle} style.`,
          style: validStyle,
          actualPrompt: iconPrompt
        });
      } else {
        // Return error if no image generated
        const text = response.text();
        return res.status(200).json({ 
          generatedIcon: null,
          analysis: text,
          message: `Icon generation attempted. Note: Gemini may provide text descriptions. Please refine your prompt.`,
          style: validStyle,
          actualPrompt: iconPrompt
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
        error: 'Failed to generate icon', 
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

