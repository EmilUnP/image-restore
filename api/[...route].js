// Unified API Handler - Consolidates all API endpoints into a single serverless function
// This reduces the function count from 15+ to just 1, staying under Vercel's 12 function limit
// 
// IMPORTANT: After deploying this, you MUST delete the individual API files in /api directory
// (except this file and /api/lib) to prevent Vercel from creating separate functions for them.

import enhanceImageHandler from './enhance-image.js';
import translateImageHandler from './translate-image.js';
import detectTextHandler from './detect-text.js';
import translateTextHandler from './translate-text.js';
import generateIconHandler from './generate-icon.js';
import upgradeIconHandler from './upgrade-icon.js';
import generateLogoHandler from './generate-logo.js';
import upgradeLogoHandler from './upgrade-logo.js';
import generateSocialPostHandler from './generate-social-post.js';
import removeObjectHandler from './remove-object.js';
import enhancementModesHandler from './enhancement-modes.js';
import adminImagesIndexHandler from './admin/images/index.js';
import adminImagesDeleteHandler from './admin/images/delete.js';
import adminImagesFolderHandler from './admin/images/[folderType].js';
import adminImagesFilenameHandler from './admin/images/[folderType]/[filename].js';

// Import generate-super-social-post handler
import generateSuperSocialPostHandler from './generate-super-social-post.js';
// Import generate-infographic handler
import generateInfographicHandler from './generate-infographic.js';
// Import uniform-image-styling handler
import uniformImageStylingHandler from './uniform-image-styling.js';

export default async function handler(req, res) {
  // Extract route from query parameter (Vercel catch-all format)
  const route = req.query.route;
  let endpoint = '';
  
  if (Array.isArray(route)) {
    endpoint = route.join('/');
  } else if (route) {
    endpoint = route;
  } else {
    // Fallback: parse from URL
    const url = req.url || '';
    const match = url.match(/\/api\/(.+?)(?:\?|$)/);
    endpoint = match ? match[1] : '';
  }
  
  // Handle admin routes with dynamic segments
  if (endpoint.startsWith('admin/images/')) {
    const parts = endpoint.split('/');
    if (parts.length === 4) {
      // /api/admin/images/[folderType]/[filename]
      return adminImagesFilenameHandler(req, res);
    } else if (parts.length === 3 && parts[2] !== 'delete') {
      // /api/admin/images/[folderType]
      return adminImagesFolderHandler(req, res);
    } else if (parts[2] === 'delete') {
      // /api/admin/images/delete
      return adminImagesDeleteHandler(req, res);
    } else {
      // /api/admin/images (index)
      return adminImagesIndexHandler(req, res);
    }
  }
  
  // Route to appropriate handler based on endpoint
  switch (endpoint) {
    case 'enhance-image':
      return enhanceImageHandler(req, res);
    case 'translate-image':
      return translateImageHandler(req, res);
    case 'detect-text':
      return detectTextHandler(req, res);
    case 'translate-text':
      return translateTextHandler(req, res);
    case 'generate-icon':
      return generateIconHandler(req, res);
    case 'upgrade-icon':
      return upgradeIconHandler(req, res);
    case 'generate-logo':
      return generateLogoHandler(req, res);
    case 'upgrade-logo':
      return upgradeLogoHandler(req, res);
    case 'generate-social-post':
      return generateSocialPostHandler(req, res);
    case 'generate-super-social-post':
      return generateSuperSocialPostHandler(req, res);
    case 'generate-infographic':
      return generateInfographicHandler(req, res);
    case 'uniform-image-styling':
      return uniformImageStylingHandler(req, res);
    case 'remove-object':
      return removeObjectHandler(req, res);
    case 'enhancement-modes':
      return enhancementModesHandler(req, res);
    default:
      return res.status(404).json({ error: 'Endpoint not found', path: endpoint, url: req.url });
  }
}

