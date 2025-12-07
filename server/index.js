#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { put, list, del } from '@vercel/blob';
import sharp from 'sharp';
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

// Icon processing logs storage (in-memory)
const iconProcessingLogs = [];
const MAX_LOGS = 1000; // Keep last 1000 logs

// Function to add icon processing log
function addIconProcessingLog(logEntry) {
  iconProcessingLogs.unshift(logEntry); // Add to beginning
  // Keep only last MAX_LOGS entries
  if (iconProcessingLogs.length > MAX_LOGS) {
    iconProcessingLogs.pop();
  }
}

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
// Support query parameter (primary method)
app.get('/api/admin/images', async (req, res) => {
  try {
    const folderType = req.query.folderType;
    
    if (!folderType) {
      return res.status(400).json({ error: 'folderType query parameter is required' });
    }
    
    if (folderType !== 'enhancement' && folderType !== 'translation') {
      return res.status(400).json({ error: 'Invalid folder type. Must be "enhancement" or "translation"' });
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

// Also support path parameter for backward compatibility
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

// Admin endpoint to get icon processing logs
app.get('/api/admin/icon-logs', async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const { limit = 100, status, mode } = req.query;
    
    let logs = [...iconProcessingLogs];
    
    // Filter by status if provided
    if (status) {
      logs = logs.filter(log => log.status === status);
    }
    
    // Filter by mode if provided
    if (mode) {
      logs = logs.filter(log => log.mode === mode);
    }
    
    // Limit results
    const limitNum = parseInt(limit, 10) || 100;
    logs = logs.slice(0, limitNum);
    
    return res.json({
      logs,
      total: iconProcessingLogs.length,
      filtered: logs.length
    });
  } catch (error) {
    console.error('Error fetching icon logs:', error);
    return res.status(500).json({
      error: 'Failed to fetch icon logs',
      details: error.message
    });
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

// Helper function to resize/upscale image based on quality setting
async function resizeImageByQuality(base64Image, quality, mimeType = 'image/jpeg') {
  try {
    // Extract base64 data
    const base64Data = base64Image.includes(',') 
      ? base64Image.split(',')[1] 
      : base64Image;
    
    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Get current image dimensions
    const metadata = await sharp(imageBuffer).metadata();
    const { width, height } = metadata;
    
    // Determine target max dimension based on quality
    let targetMaxDimension = null;
    if (quality === '2k') {
      targetMaxDimension = 2048;
    } else if (quality === '4k') {
      targetMaxDimension = 4096;
    }
    
    // If no quality setting, return original
    if (!targetMaxDimension) {
      return base64Image.includes('data:') ? base64Image : `data:${mimeType};base64,${base64Data}`;
    }
    
    // Calculate the maximum dimension of the current image
    const maxDimension = Math.max(width, height);
    
    // Only resize if the image is smaller than the target
    if (maxDimension < targetMaxDimension) {
      // Calculate scale factor to upscale to target
      const scaleFactor = targetMaxDimension / maxDimension;
      const newWidth = Math.round(width * scaleFactor);
      const newHeight = Math.round(height * scaleFactor);
      
      console.log(`Upscaling image from ${width}x${height} to ${newWidth}x${newHeight} (${quality})`);
      
      // Use high-quality upscaling with Lanczos3 kernel and sharpening
      let sharpInstance = sharp(imageBuffer)
        .resize(newWidth, newHeight, {
          kernel: sharp.kernel.lanczos3, // Best quality upscaling kernel
          fit: 'inside',
          withoutEnlargement: false
        })
        .sharpen({
          sigma: 1.5,
          flat: 1.0,
          jagged: 2.0
        }); // Enhanced sharpening for upscaled images
      
      // Preserve format and apply quality settings
      if (mimeType === 'image/png') {
        sharpInstance = sharpInstance.png({ compressionLevel: 9 });
      } else {
        sharpInstance = sharpInstance.jpeg({ quality: 95, mozjpeg: true });
      }
      
      const resizedBuffer = await sharpInstance.toBuffer();
      
      return `data:${mimeType};base64,${resizedBuffer.toString('base64')}`;
    } else if (maxDimension > targetMaxDimension) {
      // Downscale if image is larger than target
      const scaleFactor = targetMaxDimension / maxDimension;
      const newWidth = Math.round(width * scaleFactor);
      const newHeight = Math.round(height * scaleFactor);
      
      console.log(`Downscaling image from ${width}x${height} to ${newWidth}x${newHeight} (${quality})`);
      
      let sharpInstance = sharp(imageBuffer)
        .resize(newWidth, newHeight, {
          kernel: sharp.kernel.lanczos3,
          fit: 'inside',
          withoutEnlargement: false
        });
      
      // Preserve format and apply quality settings
      if (mimeType === 'image/png') {
        sharpInstance = sharpInstance.png({ compressionLevel: 9 });
      } else {
        sharpInstance = sharpInstance.jpeg({ quality: 95, mozjpeg: true });
      }
      
      const resizedBuffer = await sharpInstance.toBuffer();
      
      return `data:${mimeType};base64,${resizedBuffer.toString('base64')}`;
    }
    
    // Image is already at target size, return original
    return base64Image.includes('data:') ? base64Image : `data:${mimeType};base64,${base64Data}`;
  } catch (error) {
    console.error('Error resizing image:', error);
    // Return original image if resizing fails
    return base64Image.includes('data:') ? base64Image : `data:${mimeType};base64,${base64Image}`;
  }
}

// Image enhancement endpoint
app.post('/api/enhance-image', async (req, res) => {
  try {
    const { image, mode = 'photo', intensity = 'medium', quality = 'original' } = req.body;
    
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

    // Add quality/resolution requirements
    let qualityModifier = '';
    if (quality === '2k') {
      qualityModifier = ' Output the enhanced image at 2K resolution (2048 pixels maximum dimension). Upscale the image while maintaining quality and sharpness.';
    } else if (quality === '4k') {
      qualityModifier = ' Output the enhanced image at 4K resolution (4096 pixels maximum dimension). Upscale the image to ultra-high quality with maximum sharpness and detail preservation.';
    } else {
      qualityModifier = ' Maintain the original image resolution.';
    }

    const prompt = enhancementConfig.prompt + intensityModifier + qualityModifier;

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
      
      // If enhanced image is returned, process it
      if (enhancedImageBase64) {
        // Apply quality-based resizing if quality is set
        let finalImage = `data:${mimeType};base64,${enhancedImageBase64}`;
        
        if (quality === '2k' || quality === '4k') {
          try {
            finalImage = await resizeImageByQuality(enhancedImageBase64, quality, mimeType);
          } catch (resizeError) {
            console.error('Error resizing enhanced image:', resizeError);
            // Continue with original enhanced image if resizing fails
          }
        }
        
        return res.json({ 
          enhancedImage: finalImage,
          message: `Image enhanced successfully using ${validMode} mode${quality !== 'original' ? ` at ${quality.toUpperCase()} quality` : ''}.`,
          mode: validMode,
          quality: quality
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
  const startTime = Date.now();
  const requestId = `icon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    const { prompt, style = 'modern', size = '512', referencePrompt, referenceImage, isVariant = false } = req.body;
    
    // Log request
    const logEntry = {
      id: requestId,
      timestamp: new Date().toISOString(),
      type: 'generate-icon',
      mode: isVariant ? 'variant' : 'standard',
      request: {
        prompt: prompt?.substring(0, 100), // Truncate for storage
        style,
        size,
        isVariant,
        hasReferenceImage: !!referenceImage,
        referencePrompt: referencePrompt?.substring(0, 100)
      },
      status: 'processing',
      duration: null,
      response: null,
      error: null
    };
    addIconProcessingLog(logEntry);
    
    if (!prompt || !prompt.trim()) {
      logEntry.status = 'error';
      logEntry.error = 'No prompt provided';
      logEntry.duration = Date.now() - startTime;
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
- Background: MUST have 100% TRANSPARENT background (no solid color, no white, no colored background)
- Quality: Professional, production-ready

CRITICAL BACKGROUND REQUIREMENT:
- The background MUST be completely transparent/clear
- NO solid backgrounds (no white, no gray, no colors)
- NO background shapes, patterns, or fills
- Only the icon itself should be visible - everything around it must be transparent
- The icon should be isolated on a transparent canvas

OUTPUT: Generate ONLY the new icon matching the reference icon's visual style exactly while representing "${prompt}" with a completely transparent background.`;
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

CRITICAL: The icon MUST have a completely TRANSPARENT background (no solid color, no white, no background at all). 

TECHNICAL REQUIREMENTS:
- Size: ${size}x${size} pixels
- Background: 100% TRANSPARENT - no solid backgrounds, no white, no colored backgrounds
- Format: High-quality icon with clear visual communication
- Use: Modern web applications, scalable design
- Quality: Professional, production-ready

The icon should be professional, recognizable, and isolated on a transparent canvas. Only the icon elements should be visible - everything around the icon must be completely transparent.`;
    } else {
      // Standard generation without variant context
      iconPrompt = `Generate a high-quality icon for web use. ${styleConfig.prompt} The icon should represent: "${prompt}".

CRITICAL: The icon MUST have a completely TRANSPARENT background (no solid color, no white, no background at all).

TECHNICAL REQUIREMENTS:
- Size: ${size}x${size} pixels
- Background: 100% TRANSPARENT - no solid backgrounds, no white, no colored backgrounds, no background shapes or patterns
- Format: High-quality icon with clear visual communication
- Use: Modern web applications, scalable design
- Quality: Professional, production-ready

The icon should be professional, recognizable, and isolated on a transparent canvas. Only the icon elements should be visible - everything around the icon must be completely transparent. The transparent background allows the icon to work on any colored background.`;
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
      const duration = Date.now() - startTime;
      if (generatedImageBase64) {
        logEntry.status = 'success';
        logEntry.duration = duration;
        logEntry.response = {
          success: true,
          style: validStyle,
          imageSize: generatedImageBase64.length,
          message: `Icon generated successfully using ${validStyle} style.`
        };
        return res.json({ 
          generatedIcon: `data:${mimeType};base64,${generatedImageBase64}`,
          message: `Icon generated successfully using ${validStyle} style.`,
          style: validStyle,
          actualPrompt: iconPrompt
        });
      } else {
        // Return error if no image generated
        const text = response.text();
        logEntry.status = 'warning';
        logEntry.duration = duration;
        logEntry.response = {
          success: false,
          message: `Icon generation attempted. Note: Gemini may provide text descriptions.`,
          analysis: text?.substring(0, 200)
        };
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
      const duration = Date.now() - startTime;
      logEntry.status = 'error';
      logEntry.duration = duration;
      logEntry.error = error.message || 'Unknown error';
      
      if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('401')) {
        logEntry.error = 'Invalid API key';
        return res.status(401).json({ error: 'Invalid API key. Please check your GEMINI_API_KEY.' });
      }
      
      if (error.message?.includes('QUOTA_EXCEEDED') || error.message?.includes('429') || error.message?.includes('quota')) {
        logEntry.error = 'API quota exceeded';
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
    const duration = Date.now() - startTime;
    const logEntry = iconProcessingLogs.find(log => log.id === requestId);
    if (logEntry) {
      logEntry.status = 'error';
      logEntry.duration = duration;
      logEntry.error = error.message || 'Unknown error';
    }
    return res.status(500).json({ 
      error: 'An unexpected error occurred', 
      details: error.message || 'Unknown error'
    });
  }
});

// Upgrade icon endpoint
app.post('/api/upgrade-icon', async (req, res) => {
  const startTime = Date.now();
  const requestId = `upgrade-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    const { image, upgradeLevel = 'medium', style = 'modern' } = req.body;
    
    // Log request
    const logEntry = {
      id: requestId,
      timestamp: new Date().toISOString(),
      type: 'upgrade-icon',
      mode: 'upgrade',
      request: {
        prompt: 'Icon upgrade',
        style,
        upgradeLevel,
        hasImage: !!image
      },
      status: 'processing',
      duration: null,
      response: null,
      error: null
    };
    addIconProcessingLog(logEntry);
    
    if (!image) {
      logEntry.status = 'error';
      logEntry.error = 'No image provided';
      logEntry.duration = Date.now() - startTime;
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
    const upgradePrompt = `Upgrade and enhance this icon for professional web use. ${upgradeConfig.prompt} ${styleConfig.prompt} Maintain the core design and meaning while improving quality, clarity, and visual appeal. 

CRITICAL BACKGROUND REQUIREMENT:
- The upgraded icon MUST have a completely TRANSPARENT background (no solid color, no white, no background at all)
- Preserve or create a transparent background - remove any existing solid backgrounds
- NO solid backgrounds (no white, no gray, no colors)
- NO background shapes, patterns, or fills
- Only the icon itself should be visible - everything around it must be transparent
- The icon should be isolated on a transparent canvas

Make it suitable for modern web applications with scalable design. The transparent background allows the icon to work on any colored background.`;

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
      const duration = Date.now() - startTime;
      if (upgradedImageBase64) {
        logEntry.status = 'success';
        logEntry.duration = duration;
        logEntry.response = {
          success: true,
          upgradeLevel: validUpgradeLevel,
          style: validStyle,
          imageSize: upgradedImageBase64.length,
          message: `Icon upgraded successfully using ${validUpgradeLevel} level and ${validStyle} style.`
        };
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
        logEntry.status = 'warning';
        logEntry.duration = duration;
        logEntry.response = {
          success: false,
          message: `Icon processing attempted. Note: Gemini provides analysis.`,
          analysis: text?.substring(0, 200)
        };
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
      const duration = Date.now() - startTime;
      logEntry.status = 'error';
      logEntry.duration = duration;
      logEntry.error = error.message || 'Unknown error';
      
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
    
    logoPrompt += ` 

CRITICAL BACKGROUND REQUIREMENT:
- The logo MUST have a completely TRANSPARENT background (no solid color, no white, no background at all)
- NO solid backgrounds (no white, no gray, no colors)
- NO background shapes, patterns, or fills
- Only the logo itself should be visible - everything around it must be transparent
- The logo should be isolated on a transparent canvas

TECHNICAL SPECIFICATIONS:
- Size: ${size}x${size} pixels
- Background: 100% TRANSPARENT - no solid backgrounds, no white, no colored backgrounds
- Format: High-quality professional logo
- Use: Modern branding, business cards, websites, and marketing materials
- Quality: Professional, recognizable, scalable, production-ready

The transparent background allows the logo to work on any colored background. The logo should be professional and recognizable when placed on any background color.`;

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
        console.log('[Server] Returning logo with actualPrompt:', logoPrompt.substring(0, 100) + '...');
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
        logoPrompt += ` 

CRITICAL BACKGROUND REQUIREMENT:
- The logo MUST have a completely TRANSPARENT background (no solid color, no white, no background at all)
- NO solid backgrounds (no white, no gray, no colors)
- NO background shapes, patterns, or fills
- Only the logo itself should be visible - everything around it must be transparent
- The logo should be isolated on a transparent canvas

TECHNICAL SPECIFICATIONS:
- Size: ${size}x${size} pixels
- Background: 100% TRANSPARENT - no solid backgrounds, no white, no colored backgrounds
- Format: High-quality professional logo
- Use: Modern branding, business cards, websites, and marketing materials
- Quality: Professional, recognizable, scalable, production-ready

The transparent background allows the logo to work on any colored background. The logo should be professional and recognizable when placed on any background color.`;
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
    const upgradePrompt = `Upgrade and enhance this logo for professional branding use. ${upgradeConfig.prompt} ${styleConfig.prompt} Maintain the core design, brand identity, and meaning while improving quality, clarity, typography, and visual appeal. 

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

// Generate social post endpoint
app.post('/api/generate-social-post', async (req, res) => {
  try {
    const { prompt, style = 'modern', aspectRatio = '1:1', referenceImage, referenceImages } = req.body;
    
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
        // Determine MIME type
        let mimeType = 'image/png';
        if (referenceImage.includes('data:image/')) {
          const mimeMatch = referenceImage.match(/data:image\/([^;]+)/);
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
      
      if (referenceImages && Array.isArray(referenceImages) && referenceImages.length > 0) {
        for (const refImg of referenceImages) {
          // Validate that refImg is a string
          if (!refImg || typeof refImg !== 'string') {
            console.warn('[Server] Skipping invalid reference image:', typeof refImg);
            continue;
          }
          
          const base64Data = refImg.includes(',') 
            ? refImg.split(',')[1] 
            : refImg;
          
          // Determine MIME type
          let mimeType = 'image/png';
          if (refImg.includes('data:image/')) {
            const mimeMatch = refImg.match(/data:image\/([^;]+)/);
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
        console.log('[Server] Social post generated successfully');
        const responseData = { 
          generatedPost: `data:${mimeType};base64,${generatedImageBase64}`,
          message: `Social post generated successfully using ${validStyle} style.`,
          style: validStyle,
          aspectRatio: aspectRatio,
          actualPrompt: socialPostPrompt
        };
        return res.status(200).json(responseData);
      } else {
        console.error('[Server] No image in response');
        // Try to get text response
        const text = response.text();
        return res.status(200).json({ 
          generatedPost: null,
          analysis: text,
          message: `Social post generation attempted. Note: Gemini may provide text descriptions. Please refine your prompt.`,
          style: validStyle,
          aspectRatio: aspectRatio,
          actualPrompt: socialPostPrompt
        });
      }
    } catch (aiError) {
      console.error('[Server] AI generation error:', aiError);
      
      if (aiError.message?.includes('API_KEY_INVALID') || aiError.message?.includes('401')) {
        return res.status(401).json({ error: 'Invalid API key. Please check your GEMINI_API_KEY.' });
      }
      
      if (aiError.message?.includes('QUOTA_EXCEEDED') || aiError.message?.includes('429') || aiError.message?.includes('quota')) {
        return res.status(429).json({ 
          error: 'API quota exceeded. You have used up your free tier limit.',
          message: 'Please wait a few minutes and try again, or upgrade your API plan.',
          retryAfter: '42 seconds'
        });
      }

      return res.status(500).json({ 
        error: `AI generation failed: ${aiError.message || 'Unknown error'}`,
        actualPrompt: socialPostPrompt
      });
    }
  } catch (error) {
    console.error('[Server] Handler error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error',
      details: error.stack
    });
  }
});

// Super social post generation endpoint
app.post('/api/generate-super-social-post', async (req, res) => {
  try {
    const { aspectRatio = '1:1', style = 'modern', description, placedImages = [], placedTexts = [], canvasWidth, canvasHeight } = req.body;
    
    if (placedImages.length === 0 && placedTexts.length === 0) {
      return res.status(400).json({ error: 'At least one image or text element is required' });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_api_key_here') {
      return res.status(500).json({ 
        error: 'AI service not configured. Please set GEMINI_API_KEY in server/.env file',
        instructions: 'Get your API key from https://aistudio.google.com/app/apikey and add it to server/.env'
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
        
        console.log('[Server] Super social post generated successfully');
        return res.json({
          generatedPost: dataUrl,
          message: `Super post generated successfully using ${validStyle} style.`,
          actualPrompt: superPostPrompt
        });
      } else {
        console.warn('[Server] No image in response, returning text description');
        return res.json({
          message: `Super post generation attempted. Note: Gemini may provide text descriptions. Please refine your layout plan.`,
          actualPrompt: superPostPrompt
        });
      }
    } catch (geminiError) {
      console.error('[Server] Gemini API error:', geminiError);
      return res.status(500).json({
        error: 'Failed to generate super post',
        details: geminiError instanceof Error ? geminiError.message : 'Unknown error',
        actualPrompt: superPostPrompt
      });
    }
  } catch (error) {
    console.error('[Server] Super post generation error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate super post'
    });
  }
});

// Object removal endpoint
app.post('/api/remove-object', async (req, res) => {
  try {
    const { image, mask } = req.body;

    if (!image || !mask) {
      return res.status(400).json({ error: 'Image and mask are required' });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_api_key_here') {
      return res.status(500).json({ 
        error: 'AI service not configured. Please set GEMINI_API_KEY in server/.env file',
        instructions: 'Get your API key from https://aistudio.google.com/app/apikey and add it to server/.env'
      });
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

    // Extract base64 data from images
    const imageBase64 = image.includes('data:image') ? image.split(',')[1] : image;
    const maskBase64 = mask.includes('data:image') ? mask.split(',')[1] : mask;

    const imageParts = [
      {
        inlineData: {
          mimeType: 'image/png',
          data: imageBase64,
        },
      },
      {
        inlineData: {
          mimeType: 'image/png',
          data: maskBase64,
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
      az: 'Azerbaijani',
      en: 'English',
      ru: 'Russian',
      tr: 'Turkish',
      uk: 'Ukrainian',
      es: 'Spanish',
      fr: 'French',
      de: 'German',
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

// Infographic generation endpoint
app.post('/api/generate-infographic', async (req, res) => {
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
        error: 'AI service not configured. Please set GEMINI_API_KEY in server/.env file',
        instructions: 'Get your API key from https://aistudio.google.com/app/apikey and add it to server/.env'
      });
    }

    // Import infographic style prompts (same as in API file)
    const infographicStylePrompts = {
      modern: { prompt: 'Create a modern, contemporary infographic with sleek design, vibrant colors, clean typography, and data visualization elements.', description: "Contemporary design with clean lines" },
      minimalist: { prompt: 'Create a minimalist infographic with simple design, ample white space, essential data points, and clear visual hierarchy.', description: "Simple, clean, and essential elements" },
      bold: { prompt: 'Create a bold, impactful infographic with strong colors, thick typography, eye-catching charts, and powerful visual elements.', description: "Strong visual presence with vibrant colors" },
      elegant: { prompt: 'Create an elegant, sophisticated infographic with refined design, graceful typography, premium aesthetic, and polished data visualization.', description: "Sophisticated and refined design" },
      playful: { prompt: 'Create a playful, fun infographic with whimsical elements, vibrant colors, friendly typography, and engaging visual storytelling.', description: "Fun and engaging design" },
      corporate: { prompt: 'Create a corporate, professional infographic with business-oriented design, formal typography, trustworthy appearance, and clear data presentation.', description: "Professional business design" },
      creative: { prompt: 'Create a creative, artistic infographic with unique design elements, innovative typography, expressive aesthetics, and creative data visualization.', description: "Innovative and artistic design" },
      data: { prompt: 'Create a data-driven infographic focused on clear statistics, charts, graphs, and visual data representation with professional design.', description: "Data-focused visualization" }
    };

    const aspectRatioDimensions = {
      '1:1': { width: 1920, height: 1920 },
      '16:9': { width: 1920, height: 1080 },
      '9:16': { width: 1080, height: 1920 },
      '4:3': { width: 1920, height: 1440 },
      '3:4': { width: 1440, height: 1920 },
      'A4': { width: 2480, height: 3508 },
    };

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
        
        console.log('[Server] Infographic generated successfully');
        return res.json({
          generatedInfographic: dataUrl,
          message: `Infographic generated successfully using ${validStyle} style.`,
          actualPrompt: infographicPrompt
        });
      } else {
        console.warn('[Server] No image in response, returning text description');
        return res.json({
          message: `Infographic generation attempted. Note: Gemini may provide text descriptions. Please refine your prompt.`,
          actualPrompt: infographicPrompt
        });
      }
    } catch (geminiError) {
      console.error('[Server] Gemini API error:', geminiError);
      return res.status(500).json({
        error: 'Failed to generate infographic',
        details: geminiError instanceof Error ? geminiError.message : 'Unknown error',
        actualPrompt: infographicPrompt
      });
    }
  } catch (error) {
    console.error('[Server] Infographic generation error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate infographic'
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
