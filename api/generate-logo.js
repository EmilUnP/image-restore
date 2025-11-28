import { GoogleGenerativeAI } from '@google/generative-ai';
import { saveUploadedImage } from './lib/blob-storage.js';

// Logo generation style prompts
const logoStylePrompts = {
  modern: {
    prompt: 'Create a modern, professional logo with sleek design, contemporary aesthetics, and clean typography.',
    description: "Contemporary design with clean lines"
  },
  classic: {
    prompt: 'Create a classic, timeless logo with traditional design elements, elegant typography, and enduring appeal.',
    description: "Traditional design with timeless elegance"
  },
  minimalist: {
    prompt: 'Create a minimalist logo with simple shapes, minimal details, clean typography, and essential elements only.',
    description: "Simple, clean, and essential elements"
  },
  bold: {
    prompt: 'Create a bold, impactful logo with strong colors, thick strokes, powerful typography, and eye-catching design.',
    description: "Strong visual presence with vibrant colors"
  },
  elegant: {
    prompt: 'Create an elegant, sophisticated logo with refined design, graceful typography, and premium aesthetic.',
    description: "Sophisticated and refined design"
  },
  playful: {
    prompt: 'Create a playful, fun logo with whimsical elements, vibrant colors, and friendly typography.',
    description: "Fun and engaging design"
  },
  corporate: {
    prompt: 'Create a corporate, professional logo with business-oriented design, formal typography, and trustworthy appearance.',
    description: "Professional business design"
  },
  creative: {
    prompt: 'Create a creative, artistic logo with unique design elements, innovative typography, and expressive aesthetics.',
    description: "Innovative and artistic design"
  },
  vintage: {
    prompt: 'Create a vintage, retro logo with classic design elements, nostalgic typography, and old-school charm.',
    description: "Retro and nostalgic design"
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
    const { prompt, style = 'modern', size = '1024', companyName, tagline } = req.body;
    
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
    const validStyle = logoStylePrompts[style] ? style : 'modern';
    const styleConfig = logoStylePrompts[validStyle];

    // Build the logo generation prompt
    let logoPrompt = `Generate a high-quality professional logo for web and print use. ${styleConfig.prompt} The logo should represent: "${prompt}".`;
    
    if (companyName && companyName.trim()) {
      logoPrompt += ` Include the company name "${companyName}" as part of the logo design.`;
    }
    
    if (tagline && tagline.trim()) {
      logoPrompt += ` Include the tagline "${tagline}" below the company name or logo symbol.`;
    }
    
    logoPrompt += ` Make it suitable for use in modern branding, business cards, websites, and marketing materials. The logo should be professional, recognizable, scalable, and work well in both light and dark backgrounds. Size: ${size}x${size} pixels.`;

    // Initialize Google Generative AI
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3-pro-image-preview" });

    try {
      const result = await model.generateContent([logoPrompt]);
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
      
      // If logo is generated, return it
      if (generatedImageBase64) {
        console.log('[Vercel Function] Logo generated, returning with actualPrompt:', logoPrompt.substring(0, 100) + '...');
        const responseData = { 
          generatedLogo: `data:${mimeType};base64,${generatedImageBase64}`,
          message: `Logo generated successfully using ${validStyle} style.`,
          style: validStyle,
          actualPrompt: logoPrompt
        };
        console.log('[Vercel Function] Response data keys:', Object.keys(responseData));
        console.log('[Vercel Function] actualPrompt in response:', !!responseData.actualPrompt);
        return res.status(200).json(responseData);
      } else {
        // Return error if no image generated
        const text = response.text();
        return res.status(200).json({ 
          generatedLogo: null,
          analysis: text,
          message: `Logo generation attempted. Note: Gemini may provide text descriptions. Please refine your prompt.`,
          style: validStyle,
          actualPrompt: logoPrompt
        });
      }

    } catch (error) {
      console.error('Gemini API error:', error);
      
      if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('401')) {
        return res.status(401).json({ 
          error: 'Invalid API key. Please check your GEMINI_API_KEY.',
          actualPrompt: logoPrompt
        });
      }
      
      if (error.message?.includes('QUOTA_EXCEEDED') || error.message?.includes('429') || error.message?.includes('quota')) {
        return res.status(429).json({ 
          error: 'API quota exceeded. You have used up your free tier limit.',
          message: 'Please wait a few minutes and try again, or upgrade your API plan.',
          retryAfter: '42 seconds',
          actualPrompt: logoPrompt
        });
      }

      return res.status(500).json({ 
        error: 'Failed to generate logo', 
        details: error.message || 'Unknown error',
        actualPrompt: logoPrompt
      });
    }

  } catch (error) {
    console.error('Server error:', error);
    // Try to get the prompt if it was created before the error
    let promptToReturn = null;
    try {
      const { prompt, style = 'modern', size = '1024', companyName, tagline } = req.body;
      if (prompt) {
        const validStyle = logoStylePrompts[style] ? style : 'modern';
        const styleConfig = logoStylePrompts[validStyle];
        let logoPrompt = `Generate a high-quality professional logo for web and print use. ${styleConfig.prompt} The logo should represent: "${prompt}".`;
        if (companyName && companyName.trim()) {
          logoPrompt += ` Include the company name "${companyName}" as part of the logo design.`;
        }
        if (tagline && tagline.trim()) {
          logoPrompt += ` Include the tagline "${tagline}" below the company name or logo symbol.`;
        }
        logoPrompt += ` Make it suitable for use in modern branding, business cards, websites, and marketing materials. The logo should be professional, recognizable, scalable, and work well in both light and dark backgrounds. Size: ${size}x${size} pixels.`;
        promptToReturn = logoPrompt;
      }
    } catch (e) {
      // Ignore errors in prompt reconstruction
    }
    
    return res.status(500).json({ 
      error: 'An unexpected error occurred', 
      details: error.message || 'Unknown error',
      actualPrompt: promptToReturn
    });
  }
}

