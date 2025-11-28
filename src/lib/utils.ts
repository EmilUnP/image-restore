import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const downloadImage = (imageData: string, filename: string) => {
  const link = document.createElement("a");
  link.href = imageData;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Converts a raster image (PNG/JPEG) to SVG format by embedding it
 * This creates a wrapper SVG that contains the image, useful for web use
 */
export const convertImageToSVG = async (imageData: string, width?: number, height?: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const w = width || img.width || 512;
      const h = height || img.height || 512;
      
      // Create SVG with embedded image
      const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <image href="${imageData}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet"/>
</svg>`;
      
      // Convert to data URL
      const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      const reader = new FileReader();
      
      reader.onload = () => {
        resolve(reader.result as string);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to convert SVG to data URL'));
      };
      
      reader.readAsDataURL(svgBlob);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = imageData;
  });
};

/**
 * Downloads an image in the specified format (PNG or SVG)
 */
export const downloadImageInFormat = async (
  imageData: string, 
  filename: string, 
  format: 'png' | 'svg' = 'png',
  width?: number,
  height?: number
) => {
  try {
    if (format === 'svg') {
      // Convert to SVG and download
      const svgDataUrl = await convertImageToSVG(imageData, width, height);
      const svgFilename = filename.replace(/\.(png|jpg|jpeg)$/i, '.svg');
      downloadImage(svgDataUrl, svgFilename);
    } else {
      // Download as PNG (original behavior)
      const pngFilename = filename.endsWith('.png') ? filename : filename.replace(/\.[^/.]+$/, '.png');
      downloadImage(imageData, pngFilename);
    }
  } catch (error) {
    console.error('Error downloading image:', error);
    throw error;
  }
};
