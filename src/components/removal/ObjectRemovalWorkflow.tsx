import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { BackButton } from "@/components/shared/BackButton";
import { StepIndicator } from "@/components/shared/StepIndicator";
import { WorkflowHeader } from "@/components/shared/WorkflowHeader";
import { WorkflowCard } from "@/components/shared/WorkflowCard";
import { useImageUpload } from "@/hooks/useImageUpload";
import { removeObject } from "@/lib/api";
import { toast } from "sonner";
import { Download, Eraser, Paintbrush, RotateCcw, Wand2, X } from "lucide-react";

interface ObjectRemovalWorkflowProps {
  onBack: () => void;
}

type Tool = 'brush' | 'eraser';

export const ObjectRemovalWorkflow = ({ onBack }: ObjectRemovalWorkflowProps) => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [cleanedImage, setCleanedImage] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [brushSize, setBrushSize] = useState(30);
  const [tool, setTool] = useState<Tool>('brush');
  const [isDrawing, setIsDrawing] = useState(false);
  const [maskData, setMaskData] = useState<ImageData | null>(null);
  const [originalImageDimensions, setOriginalImageDimensions] = useState<{ width: number; height: number } | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const { fileToBase64 } = useImageUpload();

  // Initialize canvas
  useEffect(() => {
    if (originalImage && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        const container = containerRef.current;
        if (!container) return;

        // Store original dimensions
        setOriginalImageDimensions({ width: img.width, height: img.height });

        const maxWidth = container.clientWidth;
        const maxHeight = window.innerHeight * 0.6;
        
        let displayWidth = img.width;
        let displayHeight = img.height;
        
        if (displayWidth > maxWidth) {
          displayHeight = (displayHeight * maxWidth) / displayWidth;
          displayWidth = maxWidth;
        }
        if (displayHeight > maxHeight) {
          displayWidth = (displayWidth * maxHeight) / displayHeight;
          displayHeight = maxHeight;
        }

        canvas.width = displayWidth;
        canvas.height = displayHeight;
        
        ctx.drawImage(img, 0, 0, displayWidth, displayHeight);
        
        // Initialize mask canvas with display dimensions (for drawing)
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = displayWidth;
        maskCanvas.height = displayHeight;
        maskCanvasRef.current = maskCanvas;
        const maskCtx = maskCanvas.getContext('2d');
        if (maskCtx) {
          maskCtx.clearRect(0, 0, displayWidth, displayHeight);
        }
        
        // Initialize mask as transparent
        const mask = maskCtx?.createImageData(displayWidth, displayHeight) || null;
        setMaskData(mask);
      };
      img.src = originalImage;
    }
  }, [originalImage]);

  const handleImageSelect = async (file: File) => {
    try {
      const base64 = await fileToBase64(file);
      setOriginalImage(base64);
      setCleanedImage(null);
      setMaskData(null);
    } catch (error) {
      toast.error("Failed to load image");
      console.error(error);
    }
  };

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const drawOnCanvas = useCallback((x: number, y: number, isEraser: boolean) => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!canvas || !imageRef.current || !maskCanvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const maskCtx = maskCanvas.getContext('2d');
    if (!ctx || !maskCtx) return;

    // Draw on mask canvas with fully opaque red for better detection
    maskCtx.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';
    maskCtx.fillStyle = isEraser ? 'rgba(0,0,0,1)' : 'rgba(255,0,0,1)'; // Fully opaque red
    maskCtx.beginPath();
    maskCtx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    maskCtx.fill();

    // Redraw the main canvas: image + mask overlay (with transparency for visual)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 0.5; // Visual transparency
    ctx.drawImage(maskCanvas, 0, 0);
    ctx.globalAlpha = 1.0;

    // Update mask data
    const imageData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    setMaskData(imageData);
  }, [brushSize]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!originalImage) return;
    setIsDrawing(true);
    const coords = getCanvasCoordinates(e);
    if (coords) {
      drawOnCanvas(coords.x, coords.y, tool === 'eraser');
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !originalImage) return;
    const coords = getCanvasCoordinates(e);
    if (coords) {
      drawOnCanvas(coords.x, coords.y, tool === 'eraser');
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const clearMask = () => {
    if (!canvasRef.current || !imageRef.current || !maskCanvasRef.current) return;
    
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const maskCtx = maskCanvas.getContext('2d');
    if (!ctx || !maskCtx) return;

    // Clear mask canvas
    maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    
    // Redraw main canvas with just the image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
    
    const mask = maskCtx.createImageData(maskCanvas.width, maskCanvas.height);
    setMaskData(mask);
    toast.success("Mask cleared");
  };

  const handleRemove = async () => {
    if (!originalImage || !maskData || !maskCanvasRef.current) {
      toast.error("Please select areas to remove first");
      return;
    }

    setIsRemoving(true);
    try {
      // Convert mask to base64
      const maskCanvas = maskCanvasRef.current;
      const maskCtx = maskCanvas.getContext('2d');
      if (!maskCtx) return;

      // Get mask data from the mask canvas
      const maskImageData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
      
      // Create binary mask (white = remove, black = keep)
      const binaryMaskCanvas = document.createElement('canvas');
      binaryMaskCanvas.width = maskCanvas.width;
      binaryMaskCanvas.height = maskCanvas.height;
      const binaryMaskCtx = binaryMaskCanvas.getContext('2d');
      if (!binaryMaskCtx) return;

      const binaryImageData = binaryMaskCtx.createImageData(maskCanvas.width, maskCanvas.height);
      
      let markedPixels = 0;
      for (let i = 0; i < maskImageData.data.length; i += 4) {
        const r = maskImageData.data[i];
        const g = maskImageData.data[i + 1];
        const b = maskImageData.data[i + 2];
        const a = maskImageData.data[i + 3];
        
        // If pixel is marked (red overlay), mark as white in mask (to remove)
        // Check for red color - be more lenient with detection
        // Red pixels should have: high red, low green, low blue, and some alpha
        const isRed = r > 100 && g < r * 0.5 && b < r * 0.5 && a > 50;
        
        if (isRed) {
          markedPixels++;
          binaryImageData.data[i] = 255;     // R
          binaryImageData.data[i + 1] = 255;  // G
          binaryImageData.data[i + 2] = 255;  // B
          binaryImageData.data[i + 3] = 255;  // A
        } else {
          binaryImageData.data[i] = 0;       // R
          binaryImageData.data[i + 1] = 0;   // G
          binaryImageData.data[i + 2] = 0;    // B
          binaryImageData.data[i + 3] = 255;  // A
        }
      }
      
      console.log(`[Object Removal] Detected ${markedPixels} marked pixels in mask`);
      
      if (markedPixels === 0) {
        toast.error("No areas selected. Please draw on the image first.");
        setIsRemoving(false);
        return;
      }

      binaryMaskCtx.putImageData(binaryImageData, 0, 0);
      
      // Scale mask to original image dimensions if needed
      let finalMaskCanvas = binaryMaskCanvas;
      if (originalImageDimensions && 
          (binaryMaskCanvas.width !== originalImageDimensions.width || 
           binaryMaskCanvas.height !== originalImageDimensions.height)) {
        console.log(`[Object Removal] Scaling mask from ${binaryMaskCanvas.width}x${binaryMaskCanvas.height} to ${originalImageDimensions.width}x${originalImageDimensions.height}`);
        
        const scaledMaskCanvas = document.createElement('canvas');
        scaledMaskCanvas.width = originalImageDimensions.width;
        scaledMaskCanvas.height = originalImageDimensions.height;
        const scaledCtx = scaledMaskCanvas.getContext('2d');
        if (scaledCtx) {
          scaledCtx.drawImage(binaryMaskCanvas, 0, 0, scaledMaskCanvas.width, scaledMaskCanvas.height);
          finalMaskCanvas = scaledMaskCanvas;
        }
      }
      
      const maskBase64 = finalMaskCanvas.toDataURL('image/png');
      
      // Debug: Log mask info
      console.log(`[Object Removal] Original image size: ${originalImageDimensions?.width}x${originalImageDimensions?.height}`);
      console.log(`[Object Removal] Display mask size: ${maskCanvas.width}x${maskCanvas.height}`);
      console.log(`[Object Removal] Final mask size: ${finalMaskCanvas.width}x${finalMaskCanvas.height}`);
      console.log(`[Object Removal] Marked pixels: ${markedPixels}`);
      console.log(`[Object Removal] Mask base64 length: ${maskBase64.length}`);

      const result = await removeObject(originalImage, maskBase64);
      if (result?.cleanedImage) {
        setCleanedImage(result.cleanedImage);
        toast.success("Object removed successfully!");
      } else {
        throw new Error(result?.error || "Failed to remove object");
      }
    } catch (error: any) {
      console.error("Removal error:", error);
      toast.error(error?.message || "Failed to remove object. Please try again.");
    } finally {
      setIsRemoving(false);
    }
  };

  const handleDownload = () => {
    if (!cleanedImage) return;
    downloadImage(cleanedImage, "cleaned-image.png");
    toast.success("Image downloaded!");
  };

  const downloadImage = (base64: string, filename: string) => {
    const link = document.createElement('a');
    link.href = base64;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reset = () => {
    setOriginalImage(null);
    setCleanedImage(null);
    setMaskData(null);
    setIsDrawing(false);
  };

  const currentStep = !originalImage ? 1 : cleanedImage ? 3 : 2;
  const steps = [
    { number: 1, label: "Upload", status: (currentStep > 1 ? "completed" : currentStep === 1 ? "current" : "upcoming") as "current" | "completed" | "upcoming" },
    { number: 2, label: "Select & Remove", status: (currentStep > 2 ? "completed" : currentStep === 2 ? "current" : "upcoming") as "current" | "completed" | "upcoming" },
    { number: 3, label: "Result", status: (currentStep >= 3 ? (cleanedImage ? "current" : "upcoming") : "upcoming") as "current" | "completed" | "upcoming" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <WorkflowHeader
        icon={Eraser}
        title="Object Remover"
        description="Remove unwanted objects from images with AI-powered precision. Select areas to clean and get professional results."
        iconColor="text-red-400"
        iconBgColor="bg-red-500/20"
        backButton={<BackButton onClick={onBack} variant="floating" />}
      />

      <StepIndicator steps={steps} />

      {!originalImage ? (
        <WorkflowCard
          title="Upload Your Image"
          description="Start by uploading an image with objects you want to remove"
        >
          <ImageUpload
            onImageSelect={handleImageSelect}
            label="Upload Image"
            description="Select an image with objects you want to remove"
          />
        </WorkflowCard>
      ) : !cleanedImage ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Image Canvas - Left Side (2 columns) */}
          <div className="lg:col-span-2">
            <WorkflowCard
              title="Select Areas to Remove"
              description="Draw on the image to mark areas you want to remove"
            >
              <div className="p-6 space-y-4">
                <div 
                  ref={containerRef}
                  className="relative w-full flex justify-center items-center bg-slate-900/50 rounded-xl p-4 overflow-auto"
                  style={{ maxHeight: '70vh' }}
                >
                  <div className="relative inline-block">
                    <canvas
                      ref={canvasRef}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      className="cursor-crosshair max-w-full h-auto rounded-lg shadow-2xl"
                      style={{ imageRendering: 'auto' }}
                    />
                    {!maskData && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 rounded-lg">
                        <p className="text-muted-foreground">Loading image...</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    <span className="inline-block w-3 h-3 bg-red-500/50 rounded-full mr-2"></span>
                    Red overlay indicates areas to be removed
                  </p>
                </div>
              </div>
            </WorkflowCard>
          </div>

          {/* Tools Panel - Right Side (1 column) */}
          <WorkflowCard
            title="Tools & Settings"
            description="Select tool and adjust brush size"
          >
            <div className="space-y-6">
              {/* Tool Selection */}
              <div className="flex gap-4">
                <Button
                  variant={tool === 'brush' ? 'default' : 'outline'}
                  onClick={() => setTool('brush')}
                  className="flex-1"
                >
                  <Paintbrush className="h-4 w-4 mr-2" />
                  Brush
                </Button>
                <Button
                  variant={tool === 'eraser' ? 'default' : 'outline'}
                  onClick={() => setTool('eraser')}
                  className="flex-1"
                >
                  <Eraser className="h-4 w-4 mr-2" />
                  Eraser
                </Button>
              </div>

              {/* Brush Size */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Brush Size</label>
                  <span className="text-sm text-muted-foreground">{brushSize}px</span>
                </div>
                <Slider
                  value={[brushSize]}
                  onValueChange={(value) => setBrushSize(value[0])}
                  min={10}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-border/50">
                <Button
                  variant="outline"
                  onClick={clearMask}
                  className="flex-1"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear
                </Button>
                <Button
                  variant="outline"
                  onClick={reset}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>

              {/* Remove Button */}
              <Button
                onClick={handleRemove}
                disabled={isRemoving || !maskData}
                size="lg"
                className="w-full bg-gradient-to-r from-red-500 via-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 font-bold text-base py-6 shadow-2xl shadow-red-500/30 hover:shadow-red-500/50 transition-all duration-300 rounded-xl disabled:opacity-50"
              >
                {isRemoving ? (
                  <>
                    <Wand2 className="h-5 w-5 mr-2 animate-spin" />
                    Removing...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-5 w-5 mr-2" />
                    Remove Selected Areas
                  </>
                )}
              </Button>
            </div>
          </WorkflowCard>
        </div>
      ) : (
        <WorkflowCard
          title="Object Removed!"
          description="Your image has been cleaned. Download the result or try again."
        >
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground">Original</h3>
                <div className="relative rounded-xl overflow-hidden border-2 border-border/50 bg-slate-900/50">
                  <img
                    src={originalImage}
                    alt="Original"
                    className="w-full h-auto object-contain"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground">Cleaned</h3>
                <div className="relative rounded-xl overflow-hidden border-2 border-primary/50 bg-slate-900/50">
                  <img
                    src={cleanedImage}
                    alt="Cleaned"
                    className="w-full h-auto object-contain"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleDownload}
                size="lg"
                className="flex-1 bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/90 hover:to-accent/90 font-bold shadow-xl shadow-primary/30 rounded-xl"
              >
                <Download className="h-5 w-5 mr-2" />
                Download Result
              </Button>
              <Button
                onClick={reset}
                variant="outline"
                size="lg"
                className="flex-1 border-primary/30 hover:bg-primary/10 rounded-xl"
              >
                <X className="h-4 w-4 mr-2" />
                Remove Image
              </Button>
            </div>
          </div>
        </WorkflowCard>
      )}
    </div>
  );
};

