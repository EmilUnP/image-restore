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
    // Get parameters from query string
    const { folderType, filename } = req.query;
    
    // Log for debugging
    console.log('Admin delete request:');
    console.log('  URL:', req.url);
    console.log('  Query:', req.query);
    console.log('  FolderType:', folderType);
    console.log('  Filename:', filename);
    
    if (!folderType || (folderType !== 'enhancement' && folderType !== 'translation')) {
      return res.status(400).json({ error: 'Invalid folder type. Must be "enhancement" or "translation"' });
    }
    
    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }
    
    // Security: prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    console.log(`Deleting image: ${folderType}/${filename}`);
    try {
      await deleteImage(folderType, filename);
      console.log(`✅ Successfully deleted: ${folderType}/${filename}`);
      return res.json({ success: true, message: 'Image deleted successfully' });
    } catch (blobError) {
      console.error('❌ Error deleting from Blob Storage:', blobError);
      console.error('   Error message:', blobError.message);
      return res.status(500).json({ 
        error: 'Failed to delete image from Blob Storage', 
        details: blobError.message 
      });
    }

  } catch (error) {
    console.error('❌ Error deleting image:', error);
    return res.status(500).json({ 
      error: 'Failed to delete image', 
      details: error.message 
    });
  }
}

