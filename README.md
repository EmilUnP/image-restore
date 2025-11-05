# Document Restorer AI

Transform low-quality scanned documents into crystal-clear, professional images using Google Gemini AI technology.

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Google Gemini API key (get one from [Google AI Studio](https://aistudio.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd antique-clarity-tool-main
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
   
   Or run them separately:
   - Backend: `npm run dev:backend` (runs on http://localhost:3001)
   - Frontend: `npm run dev` (runs on http://localhost:5173)

5. **Open your browser**
   
   Navigate to http://localhost:5173 to use the app.

## 📖 How to Use

1. Click the upload area or drag and drop your document image
2. Wait for the AI to analyze your image (this may take a few moments)
3. View the analysis results in the browser console
4. Download the processed image

## ✨ Features

- **AI Analysis**: Uses Google Gemini AI to analyze document images
- **Text Recognition**: Identifies text content and document structure
- **Quality Assessment**: Evaluates image quality and provides recommendations
- **Local Processing**: Runs completely on your local machine

## 🛠️ Built With

- React + TypeScript
- Vite
- Tailwind CSS
- Shadcn UI Components
- Express.js (Backend)
- Google Gemini AI

## 📝 Important Notes

### Current Implementation
This app currently provides **AI analysis** of document images rather than direct image enhancement. Google Gemini AI excels at:
- Analyzing image content
- Recognizing text
- Understanding document structure
- Providing quality assessments

### For True Image Enhancement
If you need actual image enhancement (not just analysis), consider:
- Using specialized image enhancement services (Replicate, Hugging Face)
- Implementing local image processing algorithms
- Using other AI services that provide image enhancement

## 🔧 Troubleshooting

### Error: "500 Internal Server Error"

**Problem:** Your `server/.env` file has `your_api_key_here` instead of a real API key.

**Solution:**
1. Get your API key from https://aistudio.google.com/app/apikey
2. Replace it in `server/.env`:
   ```
   GEMINI_API_KEY=AIzaSyC...your_actual_key_here
   ```
3. Restart the backend server

### Other Common Errors

- **"AI service not configured"**: Make sure you've created `server/.env` with your `GEMINI_API_KEY`
- **"Failed to process image"**: Check that the backend server is running on port 3001
- **CORS errors**: Ensure both frontend and backend are running
- **API quota exceeded**: You've hit the free tier limits for Gemini API

## 📄 License

MIT
