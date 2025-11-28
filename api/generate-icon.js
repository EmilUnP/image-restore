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
      iconPrompt = `You are an expert icon designer creating consistent icon sets. You will receive a reference icon image - analyze it FIRST before generating anything.

TASK: Create a new icon that represents "${prompt}" while maintaining PERFECT visual consistency with the reference icon image you see.

IMPORTANT: The reference icon image is shown to you. Study it carefully before proceeding.

STEP 1 - DEEP VISUAL ANALYSIS (REQUIRED - DO THIS FIRST):
Before generating anything, carefully examine the reference icon image and document these visual elements:

COLORS & PALETTE:
- Identify all primary colors used (RGB/hex values if possible)
- Note any gradients: direction, colors involved, gradient type (linear, radial, etc.)
- Document the exact color palette (e.g., "blue #0066FF, white #FFFFFF, shadow #000000 at 30% opacity")
- Note any color overlays, tints, or filters applied

STROKES & LINES:
- Measure/identify the exact stroke width/thickness in pixels or relative units
- Note stroke style: solid, dashed, dotted, or other patterns
- Document stroke color and opacity
- Note if strokes have rounded or square end caps

SHAPES & GEOMETRY:
- Measure corner radius: sharp (0px), slightly rounded, or heavily rounded
- Note edge treatment: beveled, embossed, flat, or 3D
- Identify shape complexity: simple geometric or detailed
- Document proportions: aspect ratio, width to height relationships

EFFECTS & LAYERING:
- Shadow: depth (distance), blur amount, direction (e.g., "bottom-right"), color, opacity
- Highlight: position (e.g., "top-left corner"), intensity, color, size
- Lighting: direction source, style (diffuse, specular, ambient), intensity
- Gloss/reflection: amount of gloss, reflection style
- Depth/3D: amount of dimensional effect, perspective type

FILL & TEXTURE:
- Fill type: solid color, gradient, pattern, or transparent
- Gradient specifics: if gradient, note exact colors and positions
- Texture: smooth, textured, or pattern overlay
- Transparency: areas of transparency or opacity variations

DESIGN LANGUAGE:
- Overall style: flat design, skeuomorphic, material design, neumorphic, etc.
- Visual weight: light/thin, medium, or heavy/bold
- Detail level: minimal, moderate, or highly detailed
- Complexity: simple (single shape) or complex (multiple elements)

STEP 2 - VISUAL REPLICATION (CRITICAL - COPY EXACTLY FROM REFERENCE):
Now create the new icon representing "${prompt}" by applying ALL the visual elements you analyzed from the reference:

🔴 MANDATORY EXACT SPECIFICATIONS (NO DEVIATIONS):

1. COLORS → Copy IDENTICAL color values, hex codes, RGB values from reference. Use EXACT same colors, gradients, gradient directions, color stops, and opacity levels.

2. STROKES → Replicate EXACT stroke width (measure precisely), stroke style (solid/dashed/dotted), stroke cap style (round/square/butt), stroke alignment, and stroke color/opacity.

3. CORNERS → Match EXACT corner radius value (in pixels or percentage). If reference has sharp corners (0px radius), use 0px. If rounded, measure and copy exact radius.

4. SHADOWS → Copy EXACT shadow offset (X and Y distance), blur radius, spread amount, shadow direction, shadow color (including opacity), and shadow type (drop shadow, inner shadow, etc.).

5. HIGHLIGHTS/GLOWS → Apply EXACT highlight position (top-left, bottom-right, etc.), highlight size, intensity, color, opacity, and glow effect if present.

6. LIGHTING → Match EXACT light source direction, lighting angle, shadow intensity, highlight intensity, and overall lighting style (diffuse/specular/ambient).

7. FILL → Use EXACT fill type (solid/gradient/pattern/none), gradient angles/positions if gradient, transparency values, and any fill overlays.

8. PROPORTIONS → Maintain EXACT visual weight (thickness), size ratios, spacing between elements, and overall dimensions relative to canvas.

9. DETAIL LEVEL → Keep EXACT same amount of detail - do NOT simplify or add complexity. Match the precise level of intricacy.

10. DESIGN SYSTEM → Preserve EXACT design language, aesthetic approach, visual style category, and overall "feel".

🚫 STRICT PROHIBITIONS:
   • DO NOT use different colors even if they seem similar
   • DO NOT change stroke thickness by even 1px
   • DO NOT modify corner radius values
   • DO NOT alter shadow properties in any way
   • DO NOT add visual effects not in reference
   • DO NOT change the visual weight or thickness
   • DO NOT simplify or complicate the design
   • DO NOT introduce new design elements or styles

✅ ONLY ALLOWED CHANGE:
   • The iconography/content (what the icon represents: "${prompt}")

CRITICAL RULE: Imagine the reference icon as a template. You are ONLY changing what it represents, NOT how it looks. Every visual property must be pixel-perfect identical.

STEP 3 - CONSISTENCY VERIFICATION (MANDATORY CHECK):
Before finalizing your generation, verify:
✓ Colors are EXACTLY the same (compare side-by-side)
✓ Stroke thickness matches EXACTLY
✓ Corner radius matches EXACTLY
✓ Shadows are EXACTLY the same (direction, blur, color, opacity)
✓ Visual weight matches EXACTLY
✓ Detail level matches EXACTLY
✓ Overall style matches EXACTLY
✓ If someone saw both icons, they'd say "same designer, same style"
✓ Only the iconography/content differs - everything else is identical

${styleConfig.prompt}

TECHNICAL SPECIFICATIONS:
- Size: ${size}x${size} pixels
- Format: High-quality, scalable vector-style icon
- Use: Modern web applications
- Background compatibility: Both light and dark backgrounds
- Quality: Professional, production-ready

OUTPUT: Generate ONLY the new icon matching the reference icon's visual style exactly while representing "${prompt}".`;
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
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3-pro-image-preview",
      generationConfig: isVariant && referenceImage ? {
        temperature: 0.3, // Lower temperature for more consistent/less random results
        topP: 0.95,
        topK: 40,
      } : undefined
    });

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
        
        // For variants: Put the reference image FIRST, then the prompt
        // This helps Gemini analyze the image before generating
        result = await model.generateContent([
          { inlineData: { data: base64Data, mimeType } },
          iconPrompt
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

