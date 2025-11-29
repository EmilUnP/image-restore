import { GoogleGenerativeAI } from '@google/generative-ai';

// Social post style prompts
const socialPostStylePrompts = {
  modern: {
    prompt: 'Create a modern, contemporary social media post with sleek design, vibrant colors, and clean typography.',
    description: "Contemporary design with clean lines"
  },
  minimalist: {
    prompt: 'Create a minimalist social media post with simple design, ample white space, and essential elements only.',
    description: "Simple, clean, and essential elements"
  },
  bold: {
    prompt: 'Create a bold, impactful social media post with strong colors, thick typography, and eye-catching design.',
    description: "Strong visual presence with vibrant colors"
  },
  elegant: {
    prompt: 'Create an elegant, sophisticated social media post with refined design, graceful typography, and premium aesthetic.',
    description: "Sophisticated and refined design"
  },
  playful: {
    prompt: 'Create a playful, fun social media post with whimsical elements, vibrant colors, and friendly typography.',
    description: "Fun and engaging design"
  },
  corporate: {
    prompt: 'Create a corporate, professional social media post with business-oriented design, formal typography, and trustworthy appearance.',
    description: "Professional business design"
  },
  creative: {
    prompt: 'Create a creative, artistic social media post with unique design elements, innovative typography, and expressive aesthetics.',
    description: "Innovative and artistic design"
  },
  vintage: {
    prompt: 'Create a vintage, retro social media post with classic design elements, nostalgic typography, and old-school charm.',
    description: "Retro and nostalgic design"
  }
};

// Aspect ratio dimensions
const aspectRatioDimensions = {
  '1:1': { width: 1080, height: 1080 },
  '16:9': { width: 1920, height: 1080 },
  '9:16': { width: 1080, height: 1920 },
  '4:5': { width: 1080, height: 1350 },
  '1.91:1': { width: 1200, height: 628 },
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
    const { prompt, style = 'modern', aspectRatio = '1:1', referenceImage, referenceImages } = req.body;
    
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
    const validStyle = socialPostStylePrompts[style] ? style : 'modern';
    const styleConfig = socialPostStylePrompts[validStyle];

    // Get dimensions for aspect ratio
    const dimensions = aspectRatioDimensions[aspectRatio] || aspectRatioDimensions['1:1'];

    // Build the social post generation prompt
    let socialPostPrompt = `Generate a high-quality social media post for ${dimensions.width}x${dimensions.height} pixels. ${styleConfig.prompt} The post should represent: "${prompt}".`;
    
    // Add reference image context if provided
    if (referenceImage) {
      socialPostPrompt += ` Use the provided reference image as inspiration and create a similar style social media post.`;
    }
    
    if (referenceImages && referenceImages.length > 0) {
      socialPostPrompt += ` Use the provided ${referenceImages.length} reference image(s) as inspiration. Combine elements, styles, and aesthetics from these references to create a unique social media post.`;
    }

    socialPostPrompt += ` 

TECHNICAL SPECIFICATIONS:
- Size: ${dimensions.width}x${dimensions.height} pixels
- Aspect Ratio: ${aspectRatio}
- Format: High-quality social media post
- Use: Instagram, Facebook, Twitter, LinkedIn, and other social platforms
- Quality: Professional, eye-catching, shareable, production-ready
- Design: Optimized for social media engagement with clear visual hierarchy

The social media post should be visually appealing, professional, and ready to use on any social media platform. Include engaging visuals, appropriate text placement, and modern design elements.`;

    // Initialize Google Generative AI
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3-pro-image-preview" });

    try {
      // Prepare content array with images if provided
      const contentParts = [];
      
      // Add reference images if provided
      if (referenceImage) {
        // Extract base64 from data URL
        const base64Data = referenceImage.includes(',') 
          ? referenceImage.split(',')[1] 
          : referenceImage;
        contentParts.push({
          inlineData: {
            data: base64Data,
            mimeType: 'image/png'
          }
        });
      }
      
      if (referenceImages && referenceImages.length > 0) {
        for (const refImg of referenceImages) {
          const base64Data = refImg.includes(',') 
            ? refImg.split(',')[1] 
            : refImg;
          contentParts.push({
            inlineData: {
              data: base64Data,
              mimeType: 'image/png'
            }
          });
        }
      }
      
      // Add text prompt
      contentParts.push(socialPostPrompt);

      const result = await model.generateContent(contentParts);
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
      
      // If post is generated, return it
      if (generatedImageBase64) {
        console.log('[Vercel Function] Social post generated successfully');
        const responseData = { 
          generatedPost: `data:${mimeType};base64,${generatedImageBase64}`,
          message: `Social post generated successfully using ${validStyle} style.`,
          style: validStyle,
          aspectRatio: aspectRatio,
          actualPrompt: socialPostPrompt
        };
        return res.status(200).json(responseData);
      } else {
        console.error('[Vercel Function] No image in response');
        return res.status(500).json({ 
          error: 'Failed to generate social post. No image was returned from the AI model.',
          actualPrompt: socialPostPrompt
        });
      }
    } catch (aiError) {
      console.error('[Vercel Function] AI generation error:', aiError);
      return res.status(500).json({ 
        error: `AI generation failed: ${aiError.message || 'Unknown error'}`,
        actualPrompt: socialPostPrompt
      });
    }
  } catch (error) {
    console.error('[Vercel Function] Handler error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error',
      details: error.stack
    });
  }
}

