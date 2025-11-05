# Vercel Deployment Guide

## Step-by-Step Deployment Instructions

### 1. Prepare Your Repository
- ✅ All code is committed and pushed to GitHub
- ✅ Repository: https://github.com/EmilUnP/image-restore

### 2. Deploy to Vercel

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com
   - Sign in with your GitHub account

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select your GitHub repository: `EmilUnP/image-restore`
   - Click "Import"

3. **Configure Project Settings**
   - **Framework Preset**: Vite (should auto-detect)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (should auto-detect)
   - **Output Directory**: `dist` (should auto-detect)
   - **Install Command**: `npm install` (should auto-detect)

4. **Set Environment Variables**
   - Click "Environment Variables" in project settings
   - Add the following:
     - **Name**: `GEMINI_API_KEY`
     - **Value**: Your Google Gemini API key (get from https://aistudio.google.com/app/apikey)
     - **Environment**: Select all (Production, Preview, Development)
   - Click "Save"

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete (usually 2-3 minutes)

### 3. Verify Deployment

1. **Check Function Logs**
   - Go to your Vercel project dashboard
   - Click "Functions" tab
   - You should see:
     - `/api/enhance-image`
     - `/api/enhancement-modes`

2. **Test the Application**
   - Visit your deployed URL (e.g., `https://image-restore.vercel.app`)
   - Try uploading an image
   - Check browser console for any errors

### 4. Troubleshooting

#### Issue: Functions not found
**Solution**: Make sure `api/` folder is in the root directory and files are named correctly:
- `api/enhance-image.js`
- `api/enhancement-modes.js`

#### Issue: Environment variable not working
**Solution**: 
- Double-check `GEMINI_API_KEY` is set in Vercel Environment Variables
- Make sure it's available for Production environment
- Redeploy after adding environment variables

#### Issue: CORS errors
**Solution**: The serverless functions already include CORS headers. If you still see errors:
- Check Vercel function logs
- Verify the function is being called correctly

#### Issue: Function timeout
**Solution**: 
- Functions are set to 60s max duration (in `vercel.json`)
- For very large images, consider reducing image size client-side

### 5. Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your Google Gemini API key | Yes |

### 6. Important Notes

- **Local Development**: Still uses Express server on port 3001
- **Vercel Production**: Uses serverless functions in `/api` directory
- **API URLs**: Automatically switch between localhost and relative URLs based on environment
- **Build**: Vercel automatically runs `npm run build` which creates the `dist` folder

### 7. After Deployment

Your app will be available at:
- Production: `https://your-project-name.vercel.app`
- Preview: `https://your-project-name-git-branch.vercel.app`

Every push to `main` branch automatically triggers a new deployment!

## Need Help?

- Check Vercel logs: Project Dashboard → Functions → View Logs
- Check browser console for frontend errors
- Verify API key is correct in Vercel Environment Variables

