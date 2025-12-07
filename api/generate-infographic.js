import { GoogleGenerativeAI } from '@google/generative-ai';

// Infographic style prompts
const infographicStylePrompts = {
  modern: {
    prompt: 'Create a modern, contemporary infographic with sleek design, vibrant colors, clean typography, and data visualization elements.',
    description: "Contemporary design with clean lines"
  },
  minimalist: {
    prompt: 'Create a minimalist infographic with simple design, ample white space, essential data points, and clear visual hierarchy.',
    description: "Simple, clean, and essential elements"
  },
  bold: {
    prompt: 'Create a bold, impactful infographic with strong colors, thick typography, eye-catching charts, and powerful visual elements.',
    description: "Strong visual presence with vibrant colors"
  },
  elegant: {
    prompt: 'Create an elegant, sophisticated infographic with refined design, graceful typography, premium aesthetic, and polished data visualization.',
    description: "Sophisticated and refined design"
  },
  playful: {
    prompt: 'Create a playful, fun infographic with whimsical elements, vibrant colors, friendly typography, and engaging visual storytelling.',
    description: "Fun and engaging design"
  },
  corporate: {
    prompt: 'Create a corporate, professional infographic with business-oriented design, formal typography, trustworthy appearance, and clear data presentation.',
    description: "Professional business design"
  },
  creative: {
    prompt: 'Create a creative, artistic infographic with unique design elements, innovative typography, expressive aesthetics, and creative data visualization.',
    description: "Innovative and artistic design"
  },
  data: {
    prompt: 'Create a data-driven infographic focused on clear statistics, charts, graphs, and visual data representation with professional design.',
    description: "Data-focused visualization"
  }
};

// Aspect ratio dimensions
const aspectRatioDimensions = {
  '1:1': { width: 1920, height: 1920 },
  '16:9': { width: 1920, height: 1080 },
  '9:16': { width: 1080, height: 1920 },
  '4:3': { width: 1920, height: 1440 },
  '3:4': { width: 1440, height: 1920 },
  'A4': { width: 2480, height: 3508 },
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
    const { 
      prompt, 
      style = 'modern', 
      aspectRatio = '16:9', 
      description,
      elements = [],
      canvasWidth,
      canvasHeight
    } = req.body;
    
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
    const validStyle = infographicStylePrompts[style] ? style : 'modern';
    const styleConfig = infographicStylePrompts[validStyle];

    // Get dimensions for aspect ratio
    const dimensions = aspectRatioDimensions[aspectRatio] || aspectRatioDimensions['16:9'];
    const finalWidth = canvasWidth || dimensions.width;
    const finalHeight = canvasHeight || dimensions.height;

    // Build comprehensive infographic generation prompt
    let infographicPrompt = `Generate a high-quality, professional infographic for ${finalWidth}x${finalHeight} pixels. ${styleConfig.prompt}\n\n`;
    
    infographicPrompt += `TOPIC/CONTENT:\n`;
    infographicPrompt += `${prompt}\n\n`;
    
    // Add user description if provided
    if (description && description.trim()) {
      infographicPrompt += `ADDITIONAL DETAILS:\n`;
      infographicPrompt += `${description.trim()}\n\n`;
    }
    
    // Describe elements if provided
    if (elements && Array.isArray(elements) && elements.length > 0) {
      infographicPrompt += `ELEMENTS TO INCLUDE:\n`;
      elements.forEach((element, index) => {
        if (element.type === 'text') {
          infographicPrompt += `${index + 1}. Text element: "${element.text}" at position ${element.x.toFixed(1)}%, ${element.y.toFixed(1)}% with font size ${element.fontSize}px and color ${element.color}.\n`;
        } else if (element.type === 'image') {
          infographicPrompt += `${index + 1}. Image element at position ${element.x.toFixed(1)}%, ${element.y.toFixed(1)}% with size ${element.width.toFixed(1)}% x ${element.height.toFixed(1)}%.\n`;
        } else if (element.type === 'shape') {
          infographicPrompt += `${index + 1}. ${element.shapeType || 'Shape'} element at position ${element.x.toFixed(1)}%, ${element.y.toFixed(1)}% with size ${element.width.toFixed(1)}% x ${element.height.toFixed(1)}% and color ${element.color || 'default'}.\n`;
        } else if (element.type === 'chart') {
          infographicPrompt += `${index + 1}. Chart element: ${element.chartType || 'bar chart'} at position ${element.x.toFixed(1)}%, ${element.y.toFixed(1)}% with data visualization.\n`;
        }
      });
      infographicPrompt += `\n`;
    }
    
    infographicPrompt += `INSTRUCTIONS:\n`;
    infographicPrompt += `- Create a professional, visually appealing infographic that effectively communicates the information.\n`;
    infographicPrompt += `- Include appropriate data visualization elements (charts, graphs, icons, illustrations).\n`;
    infographicPrompt += `- Use clear typography and visual hierarchy to guide the viewer's attention.\n`;
    infographicPrompt += `- Ensure all text is readable and all elements are well-integrated.\n`;
    infographicPrompt += `- If elements are specified, incorporate them at their relative positions.\n`;
    infographicPrompt += `- The infographic should be informative, engaging, and ready for professional use.\n`;
    infographicPrompt += `- Include visual elements like icons, illustrations, charts, and graphics that support the content.\n\n`;
    
    infographicPrompt += `TECHNICAL SPECIFICATIONS:\n`;
    infographicPrompt += `- Size: ${finalWidth}x${finalHeight} pixels\n`;
    infographicPrompt += `- Aspect Ratio: ${aspectRatio}\n`;
    infographicPrompt += `- Style: ${validStyle}\n`;
    infographicPrompt += `- Format: High-quality infographic\n`;
    infographicPrompt += `- Quality: Professional, publication-ready\n`;

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3-pro-image-preview" });

    try {
      // Prepare content array with element images if provided
      const contentParts = [];
      
      // Add images from elements if any
      if (elements && Array.isArray(elements)) {
        for (const element of elements) {
          if (element.type === 'image' && element.image) {
            const base64Data = element.image.includes(',') 
              ? element.image.split(',')[1] 
              : element.image;
            
            let mimeType = 'image/png';
            if (element.image.includes('data:image/')) {
              const mimeMatch = element.image.match(/data:image\/([^;]+)/);
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
        }
      }
      
      // Add text prompt
      contentParts.push(infographicPrompt);

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
        
        console.log('[Vercel Function] Infographic generated successfully');
        return res.json({
          generatedInfographic: dataUrl,
          message: `Infographic generated successfully using ${validStyle} style.`,
          actualPrompt: infographicPrompt
        });
      } else {
        console.warn('[Vercel Function] No image in response, returning text description');
        return res.json({
          message: `Infographic generation attempted. Note: Gemini may provide text descriptions. Please refine your prompt.`,
          actualPrompt: infographicPrompt
        });
      }
    } catch (geminiError) {
      console.error('[Vercel Function] Gemini API error:', geminiError);
      return res.status(500).json({
        error: 'Failed to generate infographic',
        details: geminiError instanceof Error ? geminiError.message : 'Unknown error',
        actualPrompt: infographicPrompt
      });
    }
  } catch (error) {
    console.error('[Vercel Function] Infographic generation error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate infographic'
    });
  }
}
