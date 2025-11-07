# Blob Storage Troubleshooting Guide

## Issue: No blobs are being created in Vercel Blob Storage

If you're not seeing any files in your Vercel Blob Storage, follow these steps:

## Step 1: Verify Environment Variable

1. **Check Vercel Dashboard**
   - Go to your project → Settings → Environment Variables
   - Verify `BLOB_READ_WRITE_TOKEN` is set
   - Make sure it's enabled for **all environments** (Production, Preview, Development)
   - The value should be: `vercel_blob_rw_vJMBGVoXcxEs8rh8_228s3OatbRKdT0nVN5zqaqZ6ah0qFF`

2. **Redeploy After Adding Environment Variable**
   - After adding/changing environment variables, you **MUST redeploy**
   - Vercel doesn't automatically apply new env vars to running deployments
   - Go to Deployments → Click the three dots → Redeploy

## Step 2: Check Server Logs

After redeploying, check your Vercel function logs:

1. Go to Vercel Dashboard → Your Project → Logs
2. Look for these messages on server startup:
   ```
   🔍 Environment Detection:
      VERCEL env var: 1
      VERCEL_ENV: production
      IS_VERCEL: true
      BLOB_READ_WRITE_TOKEN: ✅ Set
   ✅ Running on Vercel with Blob Storage enabled
   💾 Files will be saved to Vercel Blob Storage
   ```

3. When you upload an image, look for:
   ```
   📤 Attempting to save to Vercel Blob Storage: enhancement/...
   ✅ Successfully saved to Vercel Blob: https://...
   ✅ Successfully saved metadata to Vercel Blob: https://...
   ```

## Step 3: Use Debug Endpoint

I've added a debug endpoint to test Blob Storage:

1. **Visit the debug endpoint**:
   ```
   https://your-app.vercel.app/api/debug/blob-storage
   ```

2. **What to check**:
   - `status: "success"` means Blob Storage is working
   - `status: "error"` means there's a problem (check the error message)
   - `BLOB_TOKEN_SET: true` confirms the token is loaded
   - `blobCount` shows how many files are in storage

## Step 4: Common Issues

### Issue: "BLOB_READ_WRITE_TOKEN not set"

**Solution**: 
- Make sure you added the environment variable in Vercel
- Make sure you redeployed after adding it
- Check that it's enabled for the correct environment (Production/Preview/Development)

### Issue: "Failed to connect to Blob Storage"

**Possible causes**:
1. **Invalid token**: The token might be incorrect or expired
   - Solution: Regenerate the token in Vercel Dashboard → Storage → Your Blob Store → Settings
   
2. **Wrong Blob Store**: The token might be for a different Blob Store
   - Solution: Make sure you're using the correct token for this project

3. **Network/permissions issue**: Rare, but possible
   - Solution: Check Vercel status page, or try regenerating the token

### Issue: Files are uploaded but not visible in Vercel Dashboard

**Possible causes**:
1. **Wrong Blob Store**: You might be looking at a different Blob Store
   - Solution: Check the Blob Store name in Vercel Dashboard

2. **Delay in UI**: Sometimes the Vercel Dashboard takes a moment to refresh
   - Solution: Refresh the page or wait a few seconds

## Step 5: Verify File Upload Flow

1. **Upload an image** through your app
2. **Check the logs** for these messages:
   ```
   📤 Attempting to save to Vercel Blob Storage: enhancement/2025-11-06T...
      Buffer size: 123.45 KB
      MIME type: image/jpeg
      IS_VERCEL detected: true
   ✅ Successfully saved to Vercel Blob: https://...
   ✅ Successfully saved metadata to Vercel Blob: https://...
   ```

3. **Check the Admin page**: Go to `/admin` and see if images appear

4. **Check Vercel Dashboard**: Go to Storage → Your Blob Store → Files

## Step 6: Manual Test

You can manually test Blob Storage by calling the debug endpoint:

```bash
# Replace with your Vercel URL
curl https://your-app.vercel.app/api/debug/blob-storage
```

Expected response if working:
```json
{
  "status": "success",
  "message": "Blob Storage connection successful",
  "blobCount": 0,
  "blobs": [],
  "env": {
    "IS_VERCEL": true,
    "BLOB_TOKEN_SET": true,
    ...
  }
}
```

## Important Notes

1. **No Manual Folder Creation Needed**: 
   - Vercel Blob Storage automatically creates "folders" when you upload files with paths like `folder/file.jpg`
   - You don't need to create folders manually

2. **Token Security**:
   - Never commit the token to Git
   - Always use environment variables
   - The token gives full read/write access to your Blob Store

3. **Environment Variables**:
   - Changes to environment variables require a redeploy
   - Make sure the variable is set for the correct environment (Production/Preview/Development)

## Still Having Issues?

1. Check Vercel function logs for error messages
2. Use the debug endpoint (`/api/debug/blob-storage`) to see what's happening
3. Verify the token is correct in Vercel Dashboard
4. Make sure you redeployed after adding the environment variable
5. Check that the Blob Store exists and is active in Vercel Dashboard

## Next Steps

After verifying everything works:
1. Upload a test image
2. Check `/admin` page to see if it appears
3. Check Vercel Dashboard → Storage → Your Blob Store to see the files
4. Try deleting an image from the Admin page to test deletion

