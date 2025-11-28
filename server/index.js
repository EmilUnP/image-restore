#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { put, list, del } from '@vercel/blob';
import {
  createTextTranslationService,
  TranslationServiceError,
  classifyGeminiError,
} from './lib/text-translation.js';
import { applyTextOverlaysToImage } from './lib/local-image-translation.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Detect if running on Vercel
// Vercel sets VERCEL=1 and VERCEL_ENV (production, preview, development)
const IS_VERCEL = process.env.VERCEL === '1' || !!process.env.VERCEL_ENV || !!process.env.VERCEL_URL;

// Create upload directories - use /tmp on Vercel (temporary storage)
// Note: Files in /tmp are deleted after function execution on Vercel
// For persistent storage, consider using Vercel Blob Storage or another cloud storage service
const getUploadDirs = () => {
  if (IS_VERCEL) {
    // On Vercel, use /tmp directory (temporary, files are deleted after function execution)
    return {
      enhancement: path.join('/tmp', 'uploads', 'enhancement'),
      translation: path.join('/tmp', 'uploads', 'translation')
    };
  } else {
    // Local development - use project directory
    return {
      enhancement: path.join(__dirname, 'uploads', 'enhancement'),
      translation: path.join(__dirname, 'uploads', 'translation')
    };
  }
};

const UPLOAD_DIRS = getUploadDirs();

// Ensure upload directories exist
Object.entries(UPLOAD_DIRS).forEach(([type, dir]) => {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created upload directory: ${dir} (${type})`);
    } else {
      console.log(`📁 Upload directory exists: ${dir} (${type})`);
    }
    
    // Verify directory is writable
    try {
      const testFile = path.join(dir, '.test-write');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      console.log(`✅ Directory is writable: ${dir}`);
    } catch (error) {
      console.error(`❌ Directory is NOT writable: ${dir}`, error);
      if (IS_VERCEL) {
        console.warn('⚠️  On Vercel, files saved to /tmp are temporary and will be deleted after function execution.');
        console.warn('⚠️  For persistent storage, consider using Vercel Blob Storage or another cloud storage service.');
      }
    }
  } catch (error) {
    console.error(`❌ Error creating directory ${dir}:`, error);
    if (IS_VERCEL) {
      console.warn('⚠️  File saving is disabled on Vercel. Files will not be saved.');
    }
  }
});

// Log environment detection and Blob Storage status
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
console.log('🔍 Environment Detection:');
console.log(`   VERCEL env var: ${process.env.VERCEL}`);
console.log(`   VERCEL_ENV: ${process.env.VERCEL_ENV}`);
console.log(`   VERCEL_URL: ${process.env.VERCEL_URL}`);
console.log(`   IS_VERCEL: ${IS_VERCEL}`);
console.log(`   BLOB_READ_WRITE_TOKEN: ${BLOB_TOKEN ? '✅ Set' : '❌ Not set'}`);

if (IS_VERCEL) {
  if (BLOB_TOKEN) {
    console.log('✅ Running on Vercel with Blob Storage enabled');
    console.log('💾 Files will be saved to Vercel Blob Storage');
  } else {
    console.log('⚠️  Running on Vercel - BLOB_READ_WRITE_TOKEN not set');
    console.log('⚠️  Files will NOT be saved without Blob Storage token');
    console.log('💡 Add BLOB_READ_WRITE_TOKEN to Vercel environment variables');
  }
} else if (BLOB_TOKEN) {
  console.log('💡 BLOB_READ_WRITE_TOKEN detected - will use Blob Storage for file saving');
  console.log('   (Even in local development if token is set)');
}

// Helper function to save uploaded image
async function saveUploadedImage(base64Image, folderType, metadata = {}) {
  try {
    // Validate folderType
    if (!folderType || (folderType !== 'enhancement' && folderType !== 'translation')) {
      console.error(`Invalid folderType: ${folderType}`);
      return null;
    }
    
    // Extract image data and MIME type
    let mimeType = "image/jpeg";
    let base64Data = base64Image;
    
    if (!base64Image || typeof base64Image !== 'string') {
      console.error('Invalid base64Image: not a string or empty');
      return null;
    }
    
    if (base64Image.includes('data:image/')) {
      const mimeMatch = base64Image.match(/data:image\/([^;]+)/);
      if (mimeMatch) {
        mimeType = `image/${mimeMatch[1]}`;
      }
      base64Data = base64Image.split(',')[1] || base64Image;
    }
    
    // Validate base64 data
    if (!base64Data || base64Data.length === 0) {
      console.error('Invalid base64 data: empty after extraction');
      return null;
    }
    
    // Determine file extension
    const extMap = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/bmp': 'bmp'
    };
    const extension = extMap[mimeType] || 'jpg';
    
    // Generate filename with timestamp and metadata
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const mode = (metadata.mode || metadata.stage || 'unknown').replace(/[^a-zA-Z0-9]/g, '_');
    const language = (metadata.targetLanguage || metadata.language || 'unknown').replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${timestamp}_${mode}_${language}.${extension}`;
    const metadataFilename = `${timestamp}_${mode}_${language}.json`;
    
    // Convert base64 to buffer
    let buffer;
    try {
      buffer = Buffer.from(base64Data, 'base64');
      if (buffer.length === 0) {
        console.error('Failed to decode base64: buffer is empty');
        return null;
      }
    } catch (decodeError) {
      console.error('Error decoding base64:', decodeError);
      return null;
    }
    
    // Check if Blob Storage token is available (use it if available, regardless of environment)
    const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
    
    // Use Blob Storage if token is available (works on Vercel and can work locally too)
    if (BLOB_TOKEN) {
      try {
        console.log(`📤 Attempting to save to Vercel Blob Storage: ${folderType}/${filename}`);
        console.log(`   Buffer size: ${(buffer.length / 1024).toFixed(2)} KB`);
        console.log(`   MIME type: ${mimeType}`);
        console.log(`   IS_VERCEL detected: ${IS_VERCEL}`);
        
        // Upload image to Vercel Blob
        const imagePath = `${folderType}/${filename}`;
        const imageBlob = await put(imagePath, buffer, {
          access: 'public',
          contentType: mimeType,
          addRandomSuffix: false,
          token: BLOB_TOKEN,
        });
        
        console.log(`✅ Successfully saved to Vercel Blob: ${imageBlob.url}`);
        console.log(`   Path: ${imageBlob.pathname}`);
        console.log(`   Size: ${(buffer.length / 1024).toFixed(2)} KB`);
        
        // Save metadata as JSON to Blob
        const metadataContent = {
          filename,
          url: imageBlob.url,
          timestamp: new Date().toISOString(),
          mimeType,
          size: buffer.length,
          ...metadata
        };
        
        const metadataPath = `${folderType}/${metadataFilename}`;
        const metadataBlob = await put(
          metadataPath,
          Buffer.from(JSON.stringify(metadataContent, null, 2)),
          {
            access: 'public',
            contentType: 'application/json',
            addRandomSuffix: false,
            token: BLOB_TOKEN,
          }
        );
        
        console.log(`✅ Successfully saved metadata to Vercel Blob: ${metadataBlob.url}`);
        
        return {
          filename,
          url: imageBlob.url,
          metadataUrl: metadataBlob.url,
          path: imageBlob.pathname,
          size: buffer.length,
          mimeType
        };
      } catch (blobError) {
        console.error('❌ Error saving to Vercel Blob:', blobError);
        console.error('   Error message:', blobError.message);
        console.error('   Error stack:', blobError.stack);
        
        // If we're on Vercel, don't fall back to filesystem
        if (IS_VERCEL) {
          console.error('   On Vercel - cannot fall back to filesystem');
          return null;
        }
        
        // On local, fall through to filesystem save
        console.warn('   Falling back to local filesystem save');
      }
    } else if (IS_VERCEL) {
      // On Vercel without token, can't save
      console.warn('⚠️  Running on Vercel but BLOB_READ_WRITE_TOKEN not set - cannot save files');
      return null;
    }
    
    // Local development - save to filesystem
    const targetDir = UPLOAD_DIRS[folderType];
    if (!fs.existsSync(targetDir)) {
      try {
        fs.mkdirSync(targetDir, { recursive: true });
        console.log(`📁 Created upload directory: ${targetDir}`);
      } catch (error) {
        console.error(`❌ Failed to create directory ${targetDir}:`, error);
        return null;
      }
    }
    
    // Save file to local filesystem (buffer already created above)
    const filePath = path.join(targetDir, filename);
    fs.writeFileSync(filePath, buffer);
    console.log(`💾 Saved uploaded image: ${filename} (${(buffer.length / 1024).toFixed(2)} KB) in ${folderType} folder`);
    console.log(`   Full path: ${filePath}`);
    
    // Save metadata as JSON file
    const metadataPath = path.join(targetDir, metadataFilename);
    const metadataContent = {
      filename,
      timestamp: new Date().toISOString(),
      mimeType,
      size: buffer.length,
      ...metadata
    };
    fs.writeFileSync(metadataPath, JSON.stringify(metadataContent, null, 2));
    console.log(`💾 Saved metadata: ${metadataFilename}`);
    
    return { filename, filePath, metadataPath };
  } catch (error) {
    console.error('Error saving uploaded image:', error);
    console.error('Error stack:', error.stack);
    if (IS_VERCEL) {
      console.warn('⚠️  This error occurred on Vercel. File saving requires Vercel Blob Storage or another cloud storage solution.');
      console.warn('💡 See VERCEL_STORAGE_SETUP.md for setup instructions.');
    }
    return null;
  }
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

// Debug endpoint for Blob Storage testing
app.get('/api/debug/blob-storage', async (req, res) => {
  try {
    const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
    const envInfo = {
      IS_VERCEL,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_URL: process.env.VERCEL_URL,
      BLOB_TOKEN_SET: !!BLOB_TOKEN,
      BLOB_TOKEN_LENGTH: BLOB_TOKEN ? BLOB_TOKEN.length : 0,
    };
    
    if (!BLOB_TOKEN) {
      return res.json({
        status: 'error',
        message: 'BLOB_READ_WRITE_TOKEN not set',
        env: envInfo
      });
    }
    
    // Try to list blobs to verify connection
    try {
      const { blobs } = await list({
        limit: 10,
        token: BLOB_TOKEN,
      });
      
      return res.json({
        status: 'success',
        message: 'Blob Storage connection successful',
        blobCount: blobs.length,
        blobs: blobs.map(b => ({
          pathname: b.pathname,
          url: b.url,
          size: b.size,
          uploadedAt: b.uploadedAt,
        })),
        env: envInfo
      });
    } catch (blobError) {
      return res.json({
        status: 'error',
        message: 'Failed to connect to Blob Storage',
        error: blobError.message,
        errorStack: blobError.stack,
        env: envInfo
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message,
      errorStack: error.stack
    });
  }
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

// Admin API endpoints for viewing uploaded images
app.get('/api/admin/images/:folderType', async (req, res) => {
  try {
    const { folderType } = req.params;
    
    if (folderType !== 'enhancement' && folderType !== 'translation') {
      return res.status(400).json({ error: 'Invalid folder type' });
    }
    
    // On Vercel, fetch from Blob Storage
    if (IS_VERCEL) {
      try {
        const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
        
        if (!BLOB_TOKEN) {
          return res.json({ 
            images: [],
            message: 'BLOB_READ_WRITE_TOKEN not set. Files cannot be retrieved.',
            vercel: true
          });
        }
        
        // List all blobs in the folder
        const { blobs } = await list({
          prefix: `${folderType}/`,
          limit: 1000,
          token: BLOB_TOKEN,
        });
        
        // Filter for image files and metadata files
        const imageFiles = blobs.filter(blob => {
          const ext = path.extname(blob.pathname).toLowerCase();
          return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].includes(ext);
        });
        
        // Build images array with metadata
        const images = await Promise.all(
          imageFiles.map(async (blob) => {
            // Try to find corresponding metadata file
            const metadataFilename = blob.pathname.replace(/\.[^/.]+$/, '') + '.json';
            const metadataBlob = blobs.find(b => b.pathname === metadataFilename);
            
            let metadata = {};
            if (metadataBlob) {
              try {
                const metadataResponse = await fetch(metadataBlob.url);
                metadata = await metadataResponse.json();
              } catch (e) {
                console.error('Error reading metadata from blob:', e);
              }
            }
            
            return {
              filename: path.basename(blob.pathname),
              url: blob.url,
              size: blob.size,
              created: new Date(blob.uploadedAt),
              modified: new Date(blob.uploadedAt),
              ...metadata
            };
          })
        );
        
        // Sort by created date (newest first)
        images.sort((a, b) => new Date(b.created) - new Date(a.created));
        
        console.log(`✅ Retrieved ${images.length} images from Blob Storage`);
        return res.json({ images });
      } catch (blobError) {
        console.error('❌ Error fetching from Vercel Blob:', blobError);
        console.error('   Error message:', blobError.message);
        
        // If on Vercel, return error. Otherwise fall back to filesystem
        if (IS_VERCEL) {
          return res.status(500).json({ 
            error: 'Failed to fetch images from Blob Storage', 
            details: blobError.message 
          });
        }
        console.warn('   Falling back to filesystem...');
      }
    } else if (IS_VERCEL) {
      // On Vercel without token, return empty
      return res.json({ 
        images: [],
        message: 'BLOB_READ_WRITE_TOKEN not set. Files cannot be retrieved.',
        vercel: true
      });
    }
    
    // Local development - read from filesystem (or fallback)
    const folderPath = UPLOAD_DIRS[folderType];
    
    if (!fs.existsSync(folderPath)) {
      return res.json({ images: [] });
    }
    
    const files = fs.readdirSync(folderPath);
    const images = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].includes(ext);
      })
      .map(file => {
        const filePath = path.join(folderPath, file);
        const stats = fs.statSync(filePath);
        const metadataFile = file.replace(/\.[^/.]+$/, '') + '.json';
        const metadataPath = path.join(folderPath, metadataFile);
        
        let metadata = {};
        if (fs.existsSync(metadataPath)) {
          try {
            metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
          } catch (e) {
            console.error('Error reading metadata:', e);
          }
        }
        
        return {
          filename: file,
          url: `/uploads/${folderType}/${file}`,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          ...metadata
        };
      })
      .sort((a, b) => new Date(b.created) - new Date(a.created)); // Newest first
    
    res.json({ images });
  } catch (error) {
    console.error('Error listing images:', error);
    res.status(500).json({ error: 'Failed to list images', details: error.message });
  }
});

// Delete image endpoint
app.delete('/api/admin/images/:folderType/:filename', async (req, res) => {
  try {
    const { folderType, filename } = req.params;
    
    if (folderType !== 'enhancement' && folderType !== 'translation') {
      return res.status(400).json({ error: 'Invalid folder type' });
    }
    
    // Security: prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }
    
    // Try to delete from Blob Storage if token is available
    const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
    
    if (BLOB_TOKEN) {
      try {
        console.log(`🗑️ Attempting to delete from Blob Storage: ${folderType}/${filename}`);
        
        // Delete the image file
        const imagePath = `${folderType}/${filename}`;
        await del(imagePath, { token: BLOB_TOKEN });
        
        // Try to delete associated metadata file
        const metadataFile = filename.replace(/\.[^/.]+$/, '') + '.json';
        const metadataPath = `${folderType}/${metadataFile}`;
        try {
          await del(metadataPath, { token: BLOB_TOKEN });
        } catch (e) {
          // Metadata file might not exist, that's okay
          console.log('Metadata file not found or already deleted:', metadataPath);
        }
        
        console.log(`✅ Successfully deleted from Vercel Blob: ${imagePath}`);
        return res.json({ success: true, message: 'Image deleted successfully' });
      } catch (blobError) {
        console.error('❌ Error deleting from Vercel Blob:', blobError);
        console.error('   Error message:', blobError.message);
        
        // If on Vercel, return error. Otherwise fall back to filesystem
        if (IS_VERCEL) {
          return res.status(500).json({ 
            error: 'Failed to delete image from Blob Storage', 
            details: blobError.message 
          });
        }
        console.warn('   Falling back to filesystem delete...');
      }
    } else if (IS_VERCEL) {
      // On Vercel without token, can't delete
      return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN not set' });
    }
    
    // Local development - delete from filesystem (or fallback)
    const folderPath = UPLOAD_DIRS[folderType];
    const filePath = path.join(folderPath, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Delete the image file
    fs.unlinkSync(filePath);
    
    // Try to delete associated metadata file
    const metadataFile = filename.replace(/\.[^/.]+$/, '') + '.json';
    const metadataPath = path.join(folderPath, metadataFile);
    if (fs.existsSync(metadataPath)) {
      fs.unlinkSync(metadataPath);
    }
    
    console.log(`🗑️ Deleted image: ${filename} from ${folderType} folder`);
    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Failed to delete image', details: error.message });
  }
});

// Image enhancement endpoint
app.post('/api/enhance-image', async (req, res) => {
  try {
    const { image, mode = 'photo', intensity = 'medium' } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Save uploaded image for analysis
    await saveUploadedImage(image, 'enhancement', {
      mode,
      intensity,
      type: 'enhancement',
      endpoint: '/api/enhance-image'
    });

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
    const model = genAI.getGenerativeModel({ model: "gemini-3-pro-image-preview" });

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

// Icon upgrade level prompts
const iconUpgradeLevelPrompts = {
  low: {
    prompt: 'Apply subtle improvements: slightly enhance sharpness, improve contrast, and refine edges.',
    description: "Minimal changes while preserving original design"
  },
  medium: {
    prompt: 'Apply balanced improvements: enhance clarity, improve colors, refine details, and optimize for web use.',
    description: "Moderate enhancements for better quality"
  },
  high: {
    prompt: 'Apply maximum improvements: significantly enhance quality, optimize colors, perfect edges, add polish, and create professional-grade icon.',
    description: "Comprehensive upgrade for maximum quality"
  }
};

// Generate icon endpoint
app.post('/api/generate-icon', async (req, res) => {
  try {
    const { prompt, style = 'modern', size = '512' } = req.body;
    
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'No prompt provided' });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_api_key_here') {
      return res.status(500).json({ 
        error: 'AI service not configured. Please set GEMINI_API_KEY in server/.env file',
        instructions: 'Get your API key from https://aistudio.google.com/app/apikey and add it to server/.env'
      });
    }

    // Validate style
    const validStyle = iconStylePrompts[style] ? style : 'modern';
    const styleConfig = iconStylePrompts[validStyle];

    // Build the icon generation prompt
    const iconPrompt = `Generate a high-quality icon for web use. ${styleConfig.prompt} The icon should represent: "${prompt}". Make it suitable for use in modern web applications, with clear visual communication, scalable design, and appropriate size of ${size}x${size} pixels. The icon should be professional, recognizable, and suitable for both light and dark backgrounds.`;

    // Initialize Google Generative AI
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3-pro-image-preview" });

    try {
      const result = await model.generateContent([iconPrompt]);
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
        return res.json({ 
          generatedIcon: `data:${mimeType};base64,${generatedImageBase64}`,
          message: `Icon generated successfully using ${validStyle} style.`,
          style: validStyle,
          actualPrompt: iconPrompt
        });
      } else {
        // Return error if no image generated
        const text = response.text();
        return res.json({ 
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
    return res.status(500).json({ 
      error: 'An unexpected error occurred', 
      details: error.message || 'Unknown error'
    });
  }
});

// Upgrade icon endpoint
app.post('/api/upgrade-icon', async (req, res) => {
  try {
    const { image, upgradeLevel = 'medium', style = 'modern' } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Save uploaded image for analysis
    await saveUploadedImage(image, 'enhancement', {
      upgradeLevel,
      style,
      type: 'icon-upgrade',
      endpoint: '/api/upgrade-icon'
    });

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_api_key_here') {
      return res.status(500).json({ 
        error: 'AI service not configured. Please set GEMINI_API_KEY in server/.env file',
        instructions: 'Get your API key from https://aistudio.google.com/app/apikey and add it to server/.env'
      });
    }

    // Validate upgrade level and style
    const validUpgradeLevel = iconUpgradeLevelPrompts[upgradeLevel] ? upgradeLevel : 'medium';
    const validStyle = iconStylePrompts[style] ? style : 'modern';
    const upgradeConfig = iconUpgradeLevelPrompts[validUpgradeLevel];
    const styleConfig = iconStylePrompts[validStyle];

    // Build the upgrade prompt
    const upgradePrompt = `Upgrade and enhance this icon for professional web use. ${upgradeConfig.prompt} ${styleConfig.prompt} Maintain the core design and meaning while improving quality, clarity, and visual appeal. Make it suitable for modern web applications with scalable design.`;

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
      
      // If upgraded icon is returned, use it
      if (upgradedImageBase64) {
        return res.json({ 
          upgradedIcon: `data:${mimeType};base64,${upgradedImageBase64}`,
          message: `Icon upgraded successfully using ${validUpgradeLevel} level and ${validStyle} style.`,
          upgradeLevel: validUpgradeLevel,
          style: validStyle,
          actualPrompt: upgradePrompt
        });
      } else {
        // Return original image with analysis
        const text = response.text();
        return res.json({ 
          upgradedIcon: image,
          analysis: text,
          message: `Icon processing attempted. Note: Gemini provides analysis. Original icon returned.`,
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
        error: 'Failed to upgrade icon', 
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

// Logo upgrade level prompts
const logoUpgradeLevelPrompts = {
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

// Generate logo endpoint
app.post('/api/generate-logo', async (req, res) => {
  try {
    const { prompt, style = 'modern', size = '1024', companyName, tagline } = req.body;
    
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'No prompt provided' });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_api_key_here') {
      return res.status(500).json({ 
        error: 'AI service not configured. Please set GEMINI_API_KEY in server/.env file',
        instructions: 'Get your API key from https://aistudio.google.com/app/apikey and add it to server/.env'
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
        return res.json({ 
          generatedLogo: `data:${mimeType};base64,${generatedImageBase64}`,
          message: `Logo generated successfully using ${validStyle} style.`,
          style: validStyle,
          actualPrompt: logoPrompt
        });
      } else {
        // Return error if no image generated
        const text = response.text();
        return res.json({ 
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
});

// Upgrade logo endpoint
app.post('/api/upgrade-logo', async (req, res) => {
  try {
    const { image, upgradeLevel = 'medium', style = 'modern' } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Save uploaded image for analysis
    await saveUploadedImage(image, 'enhancement', {
      upgradeLevel,
      style,
      type: 'logo-upgrade',
      endpoint: '/api/upgrade-logo'
    });

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_api_key_here') {
      return res.status(500).json({ 
        error: 'AI service not configured. Please set GEMINI_API_KEY in server/.env file',
        instructions: 'Get your API key from https://aistudio.google.com/app/apikey and add it to server/.env'
      });
    }

    // Validate upgrade level and style
    const validUpgradeLevel = logoUpgradeLevelPrompts[upgradeLevel] ? upgradeLevel : 'medium';
    const validStyle = logoStylePrompts[style] ? style : 'modern';
    const upgradeConfig = logoUpgradeLevelPrompts[validUpgradeLevel];
    const styleConfig = logoStylePrompts[validStyle];

    // Build the upgrade prompt
    const upgradePrompt = `Upgrade and enhance this logo for professional branding use. ${upgradeConfig.prompt} ${styleConfig.prompt} Maintain the core design, brand identity, and meaning while improving quality, clarity, typography, and visual appeal. Make it suitable for modern branding, business cards, websites, and marketing materials with scalable design.`;

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
        return res.json({ 
          upgradedLogo: `data:${mimeType};base64,${upgradedImageBase64}`,
          message: `Logo upgraded successfully using ${validUpgradeLevel} level and ${validStyle} style.`,
          upgradeLevel: validUpgradeLevel,
          style: validStyle,
          actualPrompt: upgradePrompt
        });
      } else {
        // Return original image with analysis
        const text = response.text();
        return res.json({ 
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

    // Save uploaded image for analysis (this is part of translation workflow)
    await saveUploadedImage(image, 'translation', {
      model: requestedModel || 'default',
      type: 'translation',
      stage: 'text-detection',
      endpoint: '/api/detect-text'
    });

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
      'gemini-3-pro-image-preview', // Current default
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
        instructions: 'Get your API key from https://aistudio.google.com/app/apikey and add it to server/.env',
      });
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const translator = createTextTranslationService(genAI);

    try {
      const { translations, sanitizedCount, targetLanguageName } = await translator.translateTexts({
        texts,
        targetLanguage,
      });

      if (sanitizedCount === 0) {
        return res.json({
          translations,
          message: 'No valid text content received for translation',
        });
      }

      return res.json({
        translations,
        message: `Translated ${sanitizedCount} text(s) to ${targetLanguageName}`,
      });
    } catch (error) {
      const handledError = error instanceof TranslationServiceError ? error : classifyGeminiError(error);
      console.error('Gemini API error:', error);
      return res.status(handledError.statusCode).json({
        error: handledError.message,
        details: handledError.details || error.message || 'Unknown error',
      });
    }
  } catch (error) {
    console.error('Text translation error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message || 'Unknown error',
    });
  }
});

// Image text translation endpoint
app.post('/api/translate-image', async (req, res) => {
  try {
    const {
      image,
      targetLanguage = 'en',
      translatedTexts: translatedTextPairs,
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

    // Save uploaded image for analysis (final translation stage)
    await saveUploadedImage(image, 'translation', {
      targetLanguage,
      quality,
      fontMatching,
      textStyle,
      preserveFormatting,
      enhanceReadability,
      translatedTextsCount: translatedTextPairs ? translatedTextPairs.length : 0,
      type: 'translation',
      stage: 'image-translation',
      endpoint: '/api/translate-image'
    });

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
    console.log('- Translated texts pairs:', translatedTextPairs ? translatedTextPairs.length : 0);
    console.log('- Corrected texts:', correctedTexts ? correctedTexts.length : 0);
    if (translatedTextPairs && translatedTextPairs.length > 0) {
      console.log('- Text pairs:', translatedTextPairs.map(p => `${p.original} → ${p.translated}`));
    }
    
    // Build comprehensive prompt based on settings
    let prompt = `You are an expert image translation specialist. Replace ALL text in this image with the provided translations, maintaining professional quality and attention to detail.\n\n`;
    
    // Add translated text pairs if provided (preferred method)
    if (translatedTextPairs && Array.isArray(translatedTextPairs) && translatedTextPairs.length > 0) {
      prompt += `CRITICAL INSTRUCTIONS - READ CAREFULLY:\n\n`;
      prompt += `You MUST find and replace the following text in the image EXACTLY as specified:\n\n`;
      translatedTextPairs.forEach((pair, i) => {
        if (pair.original && pair.translated) {
          prompt += `${i + 1}. Find the text: "${pair.original}"\n`;
          prompt += `   Replace it with: "${pair.translated}"\n`;
          prompt += `   Keep the same position, size, font, and style\n\n`;
          if (pair.boundingBox) {
            const { x, y, width, height } = pair.boundingBox;
            prompt += `   Bounding box (approx): x=${Math.round(x)}, y=${Math.round(y)}, width=${Math.round(width)}, height=${Math.round(height)}\n\n`;
          }
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
    if (translatedTextPairs && translatedTextPairs.length > 0) {
      prompt += `1. TEXT REPLACEMENT (MANDATORY):\n`;
      prompt += `   - You have been given ${translatedTextPairs.length} specific text replacement pairs\n`;
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
    const model = genAI.getGenerativeModel({ model: "gemini-3-pro-image-preview" });

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
      if (!translatedImageBase64 && translatedTextPairs && translatedTextPairs.length > 0) {
        console.warn('Gemini did not return an inline image. Falling back to local renderer.');
        try {
          const overlayImage = await applyTextOverlaysToImage(image, translatedTextPairs);
          if (overlayImage) {
            return res.json({
              translatedImage: overlayImage,
              message: `Applied ${translatedTextPairs.length} translations using fallback renderer.`,
              targetLanguage: targetLangName,
            });
          }
        } catch (fallbackError) {
          console.error('Fallback translation renderer failed:', fallbackError);
        }
      }

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
  console.log('📁 Upload directories (for analysis):');
  console.log(`   - Enhancement: ${UPLOAD_DIRS.enhancement}`);
  console.log(`   - Translation: ${UPLOAD_DIRS.translation}`);
  console.log('');
  console.log('🔐 Admin endpoints available:');
  console.log(`   - GET /api/admin/images/:folderType`);
  console.log(`   - DELETE /api/admin/images/:folderType/:filename`);
  console.log(`   - Admin page: http://localhost:5173/admin`);
  console.log('');
  console.log('✅ Backend is ready! You can now start the frontend with: npm run dev');
});
