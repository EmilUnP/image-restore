import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon, Layers } from "lucide-react";
import { EnhancementModeSelector } from "./EnhancementModeSelector";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { ImageComparison } from "@/components/shared/ImageComparison";
import { BatchImageUpload } from "./BatchImageUpload";
import { BatchResults } from "./BatchResults";
import { useImageEnhancement } from "@/hooks/useImageEnhancement";
import { downloadImage } from "@/lib/utils";
import { toast } from "sonner";

interface EnhancementWorkflowProps {
  onBack: () => void;
}

export const EnhancementWorkflow = ({ onBack }: EnhancementWorkflowProps) => {
  const [enhancementMode, setEnhancementMode] = useState<string>("photo");
  const [enhancementIntensity, setEnhancementIntensity] = useState<string>("medium");
  const [settingsConfigured, setSettingsConfigured] = useState<boolean>(false);
  const [processingMode, setProcessingMode] = useState<'single' | 'batch'>('single');
  
  const {
    originalImage,
    enhancedImage,
    isProcessing,
    batchImages,
    setBatchImages,
    processImage,
    handleImageSelect,
    reset,
    setIsProcessing,
  } = useImageEnhancement();

  const handleSettingsReady = () => {
    setSettingsConfigured(true);
  };

  const handleDownload = () => {
    if (!enhancedImage) return;
    downloadImage(enhancedImage, "enhanced-image.png");
    toast.success("Image downloaded!");
  };

  const handleReset = () => {
    reset();
    setSettingsConfigured(false);
  };

  const handleReEnhance = async () => {
    if (!originalImage) return;
    setIsProcessing(true);
    await processImage(originalImage, enhancementMode, enhancementIntensity);
  };

  const handleBatchImagesSelect = async (files: File[]) => {
    if (files.length === 0) {
      setBatchImages([]);
      return;
    }

    const newImages: typeof batchImages = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      
      await new Promise<void>((resolve) => {
        reader.onloadend = () => {
          newImages.push({
            id: `img-${Date.now()}-${i}`,
            original: reader.result as string,
            enhanced: null,
            fileName: file.name,
            status: 'pending',
          });
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }

    setBatchImages(newImages);
    
    // Process batch images
    for (let i = 0; i < newImages.length; i++) {
      const image = newImages[i];
      setBatchImages(prev => 
        prev.map(img => 
          img.id === image.id 
            ? { ...img, status: 'processing' }
            : img
        )
      );

      try {
        const result = await processImage(image.original, enhancementMode, enhancementIntensity);
        if (result) {
          setBatchImages(prev => 
            prev.map(img => 
              img.id === image.id 
                ? { ...img, enhanced: result, status: 'completed' }
                : img
            )
          );
        }
      } catch (error) {
        setBatchImages(prev => 
          prev.map(img => 
            img.id === image.id 
              ? { ...img, status: 'error', error: 'Processing failed' }
              : img
          )
        );
      }
    }
  };

  const handleBatchDownload = (image: typeof batchImages[0]) => {
    if (!image.enhanced) return;
    downloadImage(image.enhanced, `enhanced-${image.fileName}`);
    toast.success(`${image.fileName} downloaded!`);
  };

  const handleBatchDownloadAll = () => {
    const completedImages = batchImages.filter(img => img.status === 'completed' && img.enhanced);
    completedImages.forEach((image, index) => {
      setTimeout(() => {
        downloadImage(image.enhanced!, `enhanced-${image.fileName}`);
      }, index * 200);
    });
    toast.success(`Downloading ${completedImages.length} images...`);
  };

  return (
    <>
      {!settingsConfigured ? (
        <>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold mb-2">Step 1: Choose Enhancement Settings</h2>
            <p className="text-muted-foreground">Select your enhancement mode and intensity level</p>
          </div>
          <EnhancementModeSelector
            mode={enhancementMode}
            intensity={enhancementIntensity}
            onModeChange={setEnhancementMode}
            onIntensityChange={setEnhancementIntensity}
            disabled={isProcessing}
          />
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleSettingsReady}
              size="lg"
              className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
            >
              Continue to Upload
              <ImageIcon className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex justify-center pt-2">
            <Button onClick={onBack} variant="ghost" size="sm">
              ← Back to Function Selection
            </Button>
          </div>
        </>
      ) : processingMode === 'single' && !originalImage ? (
        <>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold mb-2">Step 2: Upload Your Image</h2>
            <p className="text-muted-foreground">
              Selected mode: <span className="font-semibold capitalize">{enhancementMode}</span> • 
              Intensity: <span className="font-semibold capitalize">{enhancementIntensity}</span>
            </p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <Button onClick={() => setSettingsConfigured(false)} variant="ghost" size="sm">
                Change Settings
              </Button>
              <Button
                onClick={() => {
                  setProcessingMode('batch');
                  reset();
                }}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Layers className="w-4 h-4" />
                Switch to Batch Mode
              </Button>
            </div>
          </div>
          <ImageUpload
            onImageSelect={(file) => handleImageSelect(file, enhancementMode, enhancementIntensity)}
            disabled={isProcessing}
            label="Upload Image"
            description="Drag and drop or click to select an image to enhance"
          />
        </>
      ) : processingMode === 'batch' && batchImages.length === 0 ? (
        <>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold mb-2">Step 2: Upload Multiple Images</h2>
            <p className="text-muted-foreground">
              Selected mode: <span className="font-semibold capitalize">{enhancementMode}</span> • 
              Intensity: <span className="font-semibold capitalize">{enhancementIntensity}</span>
            </p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <Button onClick={() => setSettingsConfigured(false)} variant="ghost" size="sm">
                Change Settings
              </Button>
              <Button
                onClick={() => {
                  setProcessingMode('single');
                  setBatchImages([]);
                }}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <ImageIcon className="w-4 h-4" />
                Switch to Single Mode
              </Button>
            </div>
          </div>
          <BatchImageUpload
            onImagesSelect={handleBatchImagesSelect}
            disabled={isProcessing}
            maxImages={10}
          />
        </>
      ) : processingMode === 'batch' && batchImages.length > 0 ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-semibold mb-1">Batch Processing Results</h2>
              <p className="text-muted-foreground text-sm">
                Mode: <span className="font-semibold capitalize">{enhancementMode}</span> • 
                Intensity: <span className="font-semibold capitalize">{enhancementIntensity}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  setBatchImages([]);
                }}
                variant="ghost"
                size="sm"
              >
                Process More
              </Button>
              <Button onClick={handleReset} variant="outline" size="sm">
                Start Over
              </Button>
            </div>
          </div>
          <BatchResults
            images={batchImages}
            onDownload={handleBatchDownload}
            onDownloadAll={handleBatchDownloadAll}
            isProcessing={isProcessing}
          />
        </>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-semibold mb-1">Processing Results</h2>
              <p className="text-muted-foreground text-sm">
                Mode: <span className="font-semibold capitalize">{enhancementMode}</span> • 
                Intensity: <span className="font-semibold capitalize">{enhancementIntensity}</span>
              </p>
            </div>
            <Button onClick={() => setSettingsConfigured(false)} variant="ghost" size="sm">
              Change Settings
            </Button>
          </div>
          <ImageComparison
            originalImage={originalImage || ''}
            enhancedImage={enhancedImage}
            isProcessing={isProcessing}
            onDownload={handleDownload}
            originalLabel="Original"
            processedLabel="Enhanced"
          />
          {enhancedImage && !isProcessing && (
            <div className="flex justify-center gap-4">
              <Button onClick={handleReEnhance} variant="default" size="lg" disabled={isProcessing}>
                Re-enhance with Current Settings
              </Button>
              <Button onClick={handleReset} variant="outline" size="lg" disabled={isProcessing}>
                Start Over
              </Button>
            </div>
          )}
          {!enhancedImage && (
            <div className="flex justify-center">
              <Button onClick={handleReset} variant="outline" size="lg" disabled={isProcessing}>
                Cancel & Start Over
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
};

