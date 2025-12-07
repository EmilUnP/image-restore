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
    const { aspectRatio = '1:1', style = 'modern', description, placedImages = [], placedTexts = [], canvasWidth, canvasHeight } = req.body;
    
    if (placedImages.length === 0 && placedTexts.length === 0) {
      return res.status(400).json({ error: 'At least one image or text element is required' });
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

    // Build comprehensive prompt based on layout plan
    let superPostPrompt = `Generate a high-quality social media post for ${dimensions.width}x${dimensions.height} pixels. ${styleConfig.prompt}\n\n`;
    
    // Add user description if provided
    if (description && description.trim()) {
      superPostPrompt += `USER'S VISION:\n`;
      superPostPrompt += `${description.trim()}\n\n`;
    }
    
    superPostPrompt += `LAYOUT PLAN:\n`;
    superPostPrompt += `The user has created a visual layout plan with the following elements:\n\n`;
    
    // Describe placed images
    if (placedImages.length > 0) {
      superPostPrompt += `IMAGES TO INCLUDE (with relative positions):\n`;
      placedImages.forEach((img, index) => {
        superPostPrompt += `${index + 1}. An image positioned at approximately ${img.x.toFixed(1)}% from left and ${img.y.toFixed(1)}% from top, taking up about ${img.width.toFixed(1)}% width and ${img.height.toFixed(1)}% height of the canvas.\n`;
      });
      superPostPrompt += `\n`;
    }
    
    // Describe placed texts
    if (placedTexts.length > 0) {
      superPostPrompt += `TEXT ELEMENTS TO INCLUDE (with relative positions):\n`;
      placedTexts.forEach((txt, index) => {
        superPostPrompt += `${index + 1}. Text "${txt.text}" positioned at approximately ${txt.x.toFixed(1)}% from left and ${txt.y.toFixed(1)}% from top, with font size ${txt.fontSize}px and color ${txt.color}.\n`;
      });
      superPostPrompt += `\n`;
    }
    
    superPostPrompt += `INSTRUCTIONS:\n`;
    superPostPrompt += `- Create a professional social media post that incorporates all the images and text elements according to their relative positions in the layout plan.\n`;
    superPostPrompt += `- The images should be placed at their specified relative positions (as percentages of canvas width/height).\n`;
    superPostPrompt += `- The text elements should be placed at their specified relative positions with the specified styling.\n`;
    superPostPrompt += `- Maintain the overall composition and balance while following the layout plan.\n`;
    superPostPrompt += `- Ensure all elements are clearly visible and well-integrated into the design.\n`;
    superPostPrompt += `- The final post should be visually appealing, professional, and ready to use on social media.\n\n`;
    
    superPostPrompt += `TECHNICAL SPECIFICATIONS:\n`;
    superPostPrompt += `- Size: ${dimensions.width}x${dimensions.height} pixels\n`;
    superPostPrompt += `- Aspect Ratio: ${aspectRatio}\n`;
    superPostPrompt += `- Style: ${validStyle}\n`;
    superPostPrompt += `- Format: High-quality social media post\n`;
    superPostPrompt += `- Quality: Professional, ready for social media use\n`;

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3-pro-image-preview" });

    try {
      // Prepare content array with all reference images
      const contentParts = [];
      
      // Add all placed images as references
      for (const img of placedImages) {
        const base64Data = img.image.includes(',') 
          ? img.image.split(',')[1] 
          : img.image;
        
        let mimeType = 'image/png';
        if (img.image.includes('data:image/')) {
          const mimeMatch = img.image.match(/data:image\/([^;]+)/);
          if (mimeMatch) {
            mimeType = `image/${mimeMatch[1]}`;
          }
        }
        
        contentParts.push({
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        });
      }
      
      // Add text prompt
      contentParts.push(superPostPrompt);

      const result = await model.generateContent(contentParts);
      const response = await result.response;
      
      // Try to get image from response
      let generatedImageBase64 = null;
      let mimeType = "image/png";
      
      if (response.candidates && response.candidates[0]) {
        const candidate = response.candidates[0];
        
        if (candidate.content && candidate.content.parts) {
          for (const part of candidate.content.parts) {
            if (part.inlineData) {
              generatedImageBase64 = part.inlineData.data;
              mimeType = part.inlineData.mimeType || "image/png";
              break;
            }
          }
        }
      }
      
      if (generatedImageBase64) {
        // Convert to data URL
        const dataUrl = `data:${mimeType};base64,${generatedImageBase64}`;
        
        // Generate context and hashtags
        let generatedContext = '';
        let generatedHashtags = [];
        
        try {
          const userDescription = description && description.trim() ? description : 'social media post';
          const contextPrompt = `Based on this social media post description: "${userDescription}", generate:
1. A compelling social media caption (2-3 sentences) that would accompany this post
2. A list of 5-10 relevant hashtags (without # symbol, just the words)

Format your response as JSON:
{
  "caption": "the caption text here",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"]
}`;

          const contextModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
          const contextResult = await contextModel.generateContent(contextPrompt);
          const contextResponse = await contextResult.response;
          const contextText = contextResponse.text();
          
          // Try to parse JSON from response
          try {
            let jsonText = contextText;
            const jsonMatch = contextText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
            if (jsonMatch) {
              jsonText = jsonMatch[1];
            }
            
            const parsed = JSON.parse(jsonText);
            generatedContext = parsed.caption || '';
            generatedHashtags = Array.isArray(parsed.hashtags) ? parsed.hashtags : [];
          } catch (parseError) {
            const lines = contextText.split('\n').filter(l => l.trim());
            generatedContext = lines.filter(l => !l.includes('#') && !l.toLowerCase().includes('hashtag')).join(' ').substring(0, 200);
            const hashtagMatches = contextText.match(/#(\w+)/g);
            if (hashtagMatches) {
              generatedHashtags = hashtagMatches.map(h => h.replace('#', ''));
            }
          }
        } catch (contextError) {
          console.warn('[Vercel Function] Context generation failed:', contextError);
        }
        
        console.log('[Vercel Function] Super social post generated successfully');
        return res.json({
          generatedPost: dataUrl,
          message: `Super post generated successfully using ${validStyle} style.`,
          actualPrompt: superPostPrompt,
          context: generatedContext,
          hashtags: generatedHashtags
        });
      } else {
        console.warn('[Vercel Function] No image in response, returning text description');
        return res.json({
          message: `Super post generation attempted. Note: Gemini may provide text descriptions. Please refine your layout plan.`,
          actualPrompt: superPostPrompt
        });
      }
    } catch (geminiError) {
      console.error('[Vercel Function] Gemini API error:', geminiError);
      return res.status(500).json({
        error: 'Failed to generate super post',
        details: geminiError instanceof Error ? geminiError.message : 'Unknown error',
        actualPrompt: superPostPrompt
      });
    }
  } catch (error) {
    console.error('[Vercel Function] Super post generation error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate super post'
    });
  }
}

