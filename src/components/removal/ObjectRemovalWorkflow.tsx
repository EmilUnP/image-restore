import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { BackButton } from "@/components/shared/BackButton";
import { StepIndicator } from "@/components/shared/StepIndicator";
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
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
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

        const maxWidth = container.clientWidth;
        const maxHeight = window.innerHeight * 0.6;
        
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Initialize mask as transparent
        const mask = ctx.createImageData(width, height);
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
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';
    ctx.fillStyle = isEraser ? 'rgba(0,0,0,1)' : 'rgba(255,0,0,0.5)';
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();

    // Update mask data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
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
    if (!canvasRef.current || !imageRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
    
    const mask = ctx.createImageData(canvas.width, canvas.height);
    setMaskData(mask);
    toast.success("Mask cleared");
  };

  const handleRemove = async () => {
    if (!originalImage || !maskData) {
      toast.error("Please select areas to remove first");
      return;
    }

    setIsRemoving(true);
    try {
      // Convert mask to base64
      const canvas = canvasRef.current;
      if (!canvas) return;

      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = canvas.width;
      maskCanvas.height = canvas.height;
      const maskCtx = maskCanvas.getContext('2d');
      if (!maskCtx) return;

      // Create binary mask (white = remove, black = keep)
      const imageData = maskCtx.createImageData(canvas.width, canvas.height);
      const originalCtx = canvas.getContext('2d');
      if (!originalCtx) return;

      const originalData = originalCtx.getImageData(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < originalData.data.length; i += 4) {
        const r = originalData.data[i];
        const g = originalData.data[i + 1];
        const b = originalData.data[i + 2];
        const a = originalData.data[i + 3];
        
        // If pixel is marked (red overlay), mark as white in mask (to remove)
        // Otherwise mark as black (to keep)
        if (r > 200 && g < 50 && b < 50 && a > 100) {
          imageData.data[i] = 255;     // R
          imageData.data[i + 1] = 255;  // G
          imageData.data[i + 2] = 255;  // B
          imageData.data[i + 3] = 255;  // A
        } else {
          imageData.data[i] = 0;       // R
          imageData.data[i + 1] = 0;   // G
          imageData.data[i + 2] = 0;    // B
          imageData.data[i + 3] = 255;  // A
        }
      }

      maskCtx.putImageData(imageData, 0, 0);
      const maskBase64 = maskCanvas.toDataURL('image/png');

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
    { number: 2, label: "Select", status: (currentStep > 2 ? "completed" : currentStep === 2 ? "current" : "upcoming") as "current" | "completed" | "upcoming" },
    { number: 3, label: "Result", status: (currentStep >= 3 ? (cleanedImage ? "current" : "upcoming") : "upcoming") as "current" | "completed" | "upcoming" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <BackButton onClick={onBack} variant="floating" />
      
      {/* Header */}
      <div className="text-center space-y-3 mb-8">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 backdrop-blur-sm border border-red-500/30 shadow-lg shadow-red-500/10">
            <Eraser className="h-8 w-8 text-red-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-foreground via-red-400 to-orange-400 bg-clip-text text-transparent">
            Object Remover
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Select objects or areas on your image and remove them with AI-powered precision
        </p>
      </div>

      <StepIndicator steps={steps} />

      {!originalImage ? (
        <Card className="border-2 border-primary/20 bg-card/60 backdrop-blur-xl shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Upload Your Image</CardTitle>
            <CardDescription className="text-center">
              Upload an image to start removing unwanted objects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload
              onImageSelect={handleImageSelect}
              label="Upload Image"
              description="Select an image with objects you want to remove"
            />
          </CardContent>
        </Card>
      ) : !cleanedImage ? (
        <div className="space-y-6">
          {/* Tools Panel */}
          <Card className="border-2 border-primary/20 bg-card/60 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Paintbrush className="h-5 w-5 text-primary" />
                Selection Tools
              </CardTitle>
              <CardDescription>
                Draw on the image to mark areas you want to remove. Use the brush to mark, eraser to unmark.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                  Clear Selection
                </Button>
                <Button
                  variant="outline"
                  onClick={reset}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Reset Image
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Canvas */}
          <Card className="border-2 border-primary/20 bg-card/60 backdrop-blur-xl shadow-xl overflow-hidden">
            <CardContent className="p-6">
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
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  <span className="inline-block w-3 h-3 bg-red-500/50 rounded-full mr-2"></span>
                  Red overlay indicates areas to be removed
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Remove Button */}
          <Card className="border-2 border-primary/20 bg-card/60 backdrop-blur-xl shadow-xl">
            <CardContent className="p-6">
              <Button
                onClick={handleRemove}
                disabled={isRemoving || !maskData}
                size="lg"
                className="w-full bg-gradient-to-r from-red-500 via-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 font-bold text-lg py-6 shadow-2xl shadow-red-500/30 hover:shadow-red-500/50 transition-all duration-300"
              >
                {isRemoving ? (
                  <>
                    <Wand2 className="h-5 w-5 mr-2 animate-spin" />
                    Removing Object...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-5 w-5 mr-2" />
                    Remove Selected Areas
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Result */}
          <Card className="border-2 border-primary/20 bg-card/60 backdrop-blur-xl shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">Object Removed!</CardTitle>
              <CardDescription className="text-center">
                Your image has been cleaned. Download the result or try again.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                  className="flex-1 bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/90 hover:to-accent/90 font-bold shadow-xl shadow-primary/30"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download Result
                </Button>
                <Button
                  onClick={reset}
                  variant="outline"
                  size="lg"
                  className="flex-1"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Start Over
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

