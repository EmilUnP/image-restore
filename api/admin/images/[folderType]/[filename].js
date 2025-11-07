import { deleteImage } from '../../lib/blob-storage.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { folderType, filename } = req.query;
    
    if (folderType !== 'enhancement' && folderType !== 'translation') {
      return res.status(400).json({ error: 'Invalid folder type' });
    }
    
    // Security: prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    try {
      await deleteImage(folderType, filename);
      return res.json({ success: true, message: 'Image deleted successfully' });
    } catch (blobError) {
      console.error('Error deleting from Blob Storage:', blobError);
      return res.status(500).json({ 
        error: 'Failed to delete image from Blob Storage', 
        details: blobError.message 
      });
    }

  } catch (error) {
    console.error('Error deleting image:', error);
    return res.status(500).json({ 
      error: 'Failed to delete image', 
      details: error.message 
    });
  }
}

