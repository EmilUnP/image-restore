# AI Image Optimizer

Transform and enhance any image with AI-powered quality improvements. Perfect for photos, documents, portraits, landscapes, and more using Google Gemini AI technology.

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Google Gemini API key (get one from [Google AI Studio](https://aistudio.google.com/app/apikey))

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/EmilUnP/image-restore.git
   cd image-restore
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the `server` directory:
   ```env
   GEMINI_API_KEY=your_api_key_here
   PORT=3001
   ```

4. **Run the application**
   
   Start both the backend and frontend:
   ```bash
   npm run dev:all
   ```
   
   Or use the batch file:
   ```bash
   start.bat
   ```
   
   Or run them separately:
   - Backend: `npm run dev:backend` (runs on http://localhost:3001)
   - Frontend: `npm run dev` (runs on http://localhost:5173)

5. **Open your browser**
   
   Navigate to http://localhost:5173 to use the app.

## 🌐 Vercel Deployment

### Deploy to Vercel

1. **Push your code to GitHub**
   ```bash
   git push origin main
   ```

2. **Import project to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. **Set Environment Variables**
   - In Vercel project settings, go to "Environment Variables"
   - Add: `GEMINI_API_KEY` with your API key value
   - Make sure it's available for Production, Preview, and Development

4. **Deploy**
   - Vercel will automatically detect the build settings
   - The app will be deployed automatically

### Vercel Configuration

The project includes `vercel.json` with:
- Serverless functions in `/api` directory
- Static site build configuration
- Proper routing for SPA

## 📖 How to Use

1. **Select Enhancement Settings**
   - Choose from 8 enhancement modes (Document, Photo, Portrait, Landscape, Low Light, Art, Old Photo, Product)
   - Adjust intensity level (Low, Medium, High)

2. **Choose Processing Mode**
   - **Single Mode**: Upload and enhance one image at a time
   - **Batch Mode**: Upload up to 10 images and process them all

3. **Upload Images**
   - Drag and drop or click to select images
   - Processing starts automatically after upload

4. **View Results**
   - Compare original and enhanced images
   - Download individual or all enhanced images

## ✨ Features

- **8 Enhancement Modes**: Specialized modes for different image types
- **Batch Processing**: Process up to 10 images simultaneously
- **Adjustable Intensity**: Control enhancement strength
- **Real-time Progress**: Track processing status for batch operations
- **AI-Powered**: Powered by Google Gemini AI
- **Responsive Design**: Works on desktop and mobile

## 🛠️ Built With

- React + TypeScript
- Vite
- Tailwind CSS
- Shadcn UI Components
- Express.js (Local Development)
- Vercel Serverless Functions (Production)
- Google Gemini AI

## 📝 Important Notes

### Environment Variables

**For Local Development:**
- Create `server/.env` with `GEMINI_API_KEY`

**For Vercel:**
- Set `GEMINI_API_KEY` in Vercel project settings → Environment Variables

### API Endpoints

**Local Development:**
- Backend: `http://localhost:3001/api/*`
- Frontend automatically detects localhost

**Vercel Production:**
- API: `/api/*` (relative URLs)
- Frontend automatically uses relative URLs

## 🔧 Troubleshooting

### Error: "AI service not configured"

**Problem:** `GEMINI_API_KEY` is not set or invalid.

**Solution:**
1. Get your API key from https://aistudio.google.com/app/apikey
2. For local: Add it to `server/.env`
3. For Vercel: Add it in Vercel project settings → Environment Variables
4. Restart/redeploy

### Error: "Failed to process image"

**Local Development:**
- Check that backend server is running on port 3001
- Check browser console for CORS errors

**Vercel:**
- Check Vercel function logs
- Verify `GEMINI_API_KEY` is set in environment variables
- Check function timeout (set to 60s max)

### API quota exceeded

You've hit the free tier limits for Gemini API. Wait a few minutes or upgrade your API plan.

## 📄 License

MIT

## 🔗 Links

- Repository: https://github.com/EmilUnP/image-restore
- Google Gemini AI: https://aistudio.google.com/app/apikey
