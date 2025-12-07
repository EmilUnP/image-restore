# Vercel Deployment Fix - Reducing Serverless Functions

## Problem
You have 15+ API files in `/api`, but Vercel Hobby plan only allows 12 serverless functions.

## Solution
A unified API handler has been created at `api/[...route].js` that consolidates all endpoints into a single function.

## Action Required

**IMPORTANT**: You MUST delete the individual API files (except `api/[...route].js` and `api/lib/`) to prevent Vercel from creating separate functions for them.

### Files to DELETE:

1. `api/enhance-image.js`
2. `api/translate-image.js`
3. `api/detect-text.js`
4. `api/translate-text.js`
5. `api/generate-icon.js`
6. `api/upgrade-icon.js`
7. `api/generate-logo.js`
8. `api/upgrade-logo.js`
9. `api/generate-social-post.js`
10. `api/remove-object.js`
11. `api/enhancement-modes.js`
12. `api/admin/images/index.js`
13. `api/admin/images/delete.js`
14. `api/admin/images/[folderType].js`
15. `api/admin/images/[folderType]/[filename].js`

### Files to KEEP:
- `api/[...route].js` (unified handler)
- `api/lib/` (shared utilities)
- `api/generate-super-social-post.js` (will be created if missing)

## After Deletion

1. Test locally to ensure all endpoints work
2. Commit and push to trigger Vercel deployment
3. The deployment should now succeed with only 1 serverless function instead of 15+

## Note

The unified handler imports from the existing files, so make sure to delete them AFTER confirming the unified handler works, or move them to a backup location first.

