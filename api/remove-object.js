import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image, mask } = req.body;

    if (!image || !mask) {
      return res.status(400).json({ error: 'Image and mask are required' });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY is not set');
      return res.status(500).json({ error: 'AI service is not configured. Please set GEMINI_API_KEY.' });
    }

    console.log('🎨 Starting object removal process...');
    console.log(`   Image size: ${image.length} characters`);
    console.log(`   Mask size: ${mask.length} characters`);

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-3-pro-image-preview' });

    // Construct the prompt for inpainting/object removal
    const prompt = `You are a professional image inpainting specialist. Your task is to remove ONLY the areas marked in white in the mask image from the original image.

CRITICAL INSTRUCTIONS - FOLLOW EXACTLY:

1. MASK INTERPRETATION:
   - WHITE pixels in the mask = areas to REMOVE and fill with background
   - BLACK pixels in the mask = areas to KEEP EXACTLY AS THEY ARE
   - Do NOT modify anything outside the white mask areas

2. REMOVAL PROCESS:
   - Remove ONLY the objects/areas shown in white in the mask
   - Fill removed areas by extending and blending the surrounding background
   - Use context-aware inpainting that matches the immediate surrounding pixels
   - The filled area should look like the background naturally continues

3. STRICT PROHIBITIONS:
   - DO NOT add any new objects, elements, or details
   - DO NOT modify colors, lighting, or style outside the mask area
   - DO NOT change any part of the image that is NOT marked in white
   - DO NOT add text, shapes, or any visual elements
   - DO NOT enhance or improve anything - only remove what's marked

4. QUALITY REQUIREMENTS:
   - The result should look like the object was never there
   - Seamless blending with surrounding background
   - Maintain exact same resolution, colors, and quality
   - No visible artifacts, blur, or distortion
   - Natural continuation of background patterns/textures

5. OUTPUT:
   - Return ONLY the inpainted image
   - The image should be identical to the original EXCEPT for the removed white mask areas
   - All other areas must remain pixel-perfect unchanged

Remember: Your ONLY job is to remove what's marked in white and fill it with background. Do NOT add anything new. Do NOT modify anything else.`;

    const imageParts = [
      {
        inlineData: {
          mimeType: 'image/png',
          data: image.includes('data:image') ? image.split(',')[1] : image,
        },
      },
      {
        inlineData: {
          mimeType: 'image/png',
          data: mask.includes('data:image') ? mask.split(',')[1] : mask,
        },
      },
    ];

    console.log('🤖 Calling Gemini API for object removal...');
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    
    // Try to get image from response structure first
    let cleanedImageBase64 = null;
    let mimeType = "image/png";
    
    if (response.candidates && response.candidates[0]) {
      const parts = response.candidates[0].content?.parts || [];
      for (const part of parts) {
        if (part.inlineData?.data) {
          cleanedImageBase64 = part.inlineData.data;
          if (part.inlineData.mimeType) {
            mimeType = part.inlineData.mimeType;
          }
          break;
        }
      }
    }
    
    // If image found in response structure, return it
    if (cleanedImageBase64) {
      console.log('✅ Successfully extracted cleaned image from response structure');
      console.log(`   Cleaned image size: ${cleanedImageBase64.length} characters`);
      
      return res.status(200).json({
        cleanedImage: `data:${mimeType};base64,${cleanedImageBase64}`,
        message: 'Object removed successfully',
      });
    }
    
    // Fallback: Try to extract from text response
    console.log('⚠️ No image in response structure, trying text extraction...');
    const responseText = response.text();
    console.log(`   Response text length: ${responseText.length} characters`);
    
    let cleanedImage = responseText.trim();

    // Try to extract base64 from markdown code blocks or direct base64
    const base64Match = cleanedImage.match(/data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/);
    if (base64Match) {
      cleanedImage = base64Match[0];
      console.log('✅ Successfully extracted cleaned image from text response');
      return res.status(200).json({
        cleanedImage,
        message: 'Object removed successfully',
      });
    }
    
    // If no data URI, try to find plain base64
    const plainBase64Match = cleanedImage.match(/([A-Za-z0-9+/=]{100,})/);
    if (plainBase64Match) {
      cleanedImage = `data:image/png;base64,${plainBase64Match[1]}`;
      console.log('✅ Successfully extracted cleaned image from plain base64');
      return res.status(200).json({
        cleanedImage,
        message: 'Object removed successfully',
      });
    }
    
    // If all extraction methods fail
    console.error('❌ Could not extract image from AI response');
    console.error('   Response text preview:', responseText.substring(0, 500));
    throw new Error('Could not extract image from AI response. The model may have returned text instead of an image.');
  } catch (error) {
    console.error('❌ Error in remove-object:', error);
    
    // Handle quota or API key errors
    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('API key')) {
      return res.status(401).json({ error: 'Invalid API key. Please check your GEMINI_API_KEY.' });
    }
    
    if (error.message?.includes('quota') || error.message?.includes('QUOTA')) {
      return res.status(429).json({ error: 'API quota exceeded. Please try again later.' });
    }

    return res.status(500).json({
      error: error.message || 'AI generation failed. Please try again.',
    });
  }
}

