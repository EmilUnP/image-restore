# Vercel Storage Setup Guide

## Problem
Vercel serverless functions have a **read-only filesystem**. Files cannot be saved to the project directory. The `/tmp` directory is writable but files are **deleted after each function execution**, so they're not persistent.

## Solution Options

### Option 1: Vercel Blob Storage (Recommended)
Vercel Blob Storage provides persistent file storage for serverless functions.

#### Setup Steps:

1. **Install Vercel Blob SDK:**
   ```bash
   npm install @vercel/blob
   ```

2. **Get Blob Storage Token:**
   - Go to Vercel Dashboard → Your Project → Settings → Storage
   - Create a new Blob Store
   - Copy the `BLOB_READ_WRITE_TOKEN`

3. **Add Environment Variable:**
   - In Vercel Dashboard → Settings → Environment Variables
   - Add: `BLOB_READ_WRITE_TOKEN` with your token value

4. **Update Code:**
   - The code will need to be updated to use `@vercel/blob` instead of filesystem
   - See example implementation below

### Option 2: Cloud Storage Services
Use external cloud storage services:
- **AWS S3** (via `@aws-sdk/client-s3`)
- **Google Cloud Storage** (via `@google-cloud/storage`)
- **Cloudinary** (via `cloudinary`)
- **Supabase Storage** (via `@supabase/supabase-js`)

### Option 3: Database Storage
Store file metadata in a database and use external storage for actual files.

## Current Implementation

Currently, the code:
- ✅ Works perfectly on **local development** (saves to `server/uploads/`)
- ⚠️ On **Vercel**, files are NOT saved (function returns early)
- 💡 Files are logged but not persisted

## Recommended: Vercel Blob Storage Implementation

Here's how to implement Vercel Blob Storage:

```javascript
import { put } from '@vercel/blob';

async function saveUploadedImageToBlob(base64Image, folderType, metadata = {}) {
  try {
    const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
    
    if (!BLOB_TOKEN) {
      console.warn('BLOB_READ_WRITE_TOKEN not set - skipping file save');
      return null;
    }

    // Extract image data
    let mimeType = "image/jpeg";
    let base64Data = base64Image;
    
    if (base64Image.includes('data:image/')) {
      const mimeMatch = base64Image.match(/data:image\/([^;]+)/);
      if (mimeMatch) {
        mimeType = `image/${mimeMatch[1]}`;
      }
      base64Data = base64Image.split(',')[1] || base64Image;
    }

    const buffer = Buffer.from(base64Data, 'base64');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const mode = (metadata.mode || metadata.stage || 'unknown').replace(/[^a-zA-Z0-9]/g, '_');
    const language = (metadata.targetLanguage || metadata.language || 'unknown').replace(/[^a-zA-Z0-9]/g, '_');
    
    const extMap = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/bmp': 'bmp'
    };
    const extension = extMap[mimeType] || 'jpg';
    const filename = `${timestamp}_${mode}_${language}.${extension}`;
    const path = `${folderType}/${filename}`;

    // Upload to Vercel Blob
    const blob = await put(path, buffer, {
      access: 'public',
      contentType: mimeType,
      addRandomSuffix: false,
    });

    console.log(`💾 Saved to Vercel Blob: ${blob.url}`);
    
    // Save metadata separately (optional)
    const metadataBlob = await put(
      `${folderType}/${timestamp}_${mode}_${language}.json`,
      Buffer.from(JSON.stringify({
        filename,
        url: blob.url,
        timestamp: new Date().toISOString(),
        mimeType,
        size: buffer.length,
        ...metadata
      }, null, 2)),
      {
        access: 'public',
        contentType: 'application/json',
      }
    );

    return {
      filename,
      url: blob.url,
      metadataUrl: metadataBlob.url,
      path: blob.pathname
    };
  } catch (error) {
    console.error('Error saving to Vercel Blob:', error);
    return null;
  }
}
```

## Next Steps

1. **For now**: Files are logged but not saved on Vercel
2. **To enable persistent storage**: 
   - Install `@vercel/blob`
   - Set up Blob Storage in Vercel Dashboard
   - Update `saveUploadedImage` function to use Blob Storage
   - Update admin endpoints to read from Blob Storage

## Admin Page Access

The admin page (`/admin`) will work on local development but won't show files on Vercel until Blob Storage is implemented.

