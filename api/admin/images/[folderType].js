import { listImages } from '../../lib/blob-storage.js';

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
    // Extract folderType from URL path or query
    // Vercel serverless functions: check query first, then URL path
    let folderType = req.query.folderType;
    
    // If not in query, extract from URL path
    // Handle both /api/admin/images/enhancement and /admin/images/enhancement
    if (!folderType && req.url) {
      let urlMatch = req.url.match(/\/api\/admin\/images\/([^/?]+)/);
      if (!urlMatch) {
        urlMatch = req.url.match(/\/admin\/images\/([^/?]+)/);
      }
      if (urlMatch) {
        folderType = urlMatch[1];
      }
    }
    
    // Log for debugging
    console.log('Admin images request:');
    console.log('  URL:', req.url);
    console.log('  Query:', req.query);
    console.log('  FolderType:', folderType);
    
    if (!folderType || (folderType !== 'enhancement' && folderType !== 'translation')) {
      console.error('Invalid folder type:', folderType);
      return res.status(400).json({ 
        error: 'Invalid folder type',
        received: folderType,
        url: req.url,
        query: req.query
      });
    }

    console.log(`Fetching images from Blob Storage for folder: ${folderType}`);
    try {
      const { images } = await listImages(folderType);
      console.log(`✅ Successfully retrieved ${images.length} images from ${folderType}`);
      return res.json({ images });
    } catch (blobError) {
      console.error('❌ Error fetching from Blob Storage:', blobError);
      console.error('   Error message:', blobError.message);
      console.error('   Error stack:', blobError.stack);
      return res.status(500).json({ 
        error: 'Failed to fetch images from Blob Storage', 
        details: blobError.message 
      });
    }

  } catch (error) {
    console.error('❌ Error listing images:', error);
    console.error('   Error message:', error.message);
    console.error('   Error stack:', error.stack);
    return res.status(500).json({ 
      error: 'Failed to list images', 
      details: error.message 
    });
  }
}

