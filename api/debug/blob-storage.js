import { list } from '@vercel/blob';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
    const envInfo = {
      IS_VERCEL: process.env.VERCEL === '1' || !!process.env.VERCEL_ENV,
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
}

