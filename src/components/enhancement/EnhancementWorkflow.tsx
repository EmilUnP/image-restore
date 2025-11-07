import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon, Layers } from "lucide-react";
import { EnhancementModeSelector } from "./EnhancementModeSelector";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { ImageComparison } from "@/components/shared/ImageComparison";
import { BatchImageUpload } from "./BatchImageUpload";
import { BatchResults } from "./BatchResults";
import { BackButton } from "@/components/shared/BackButton";
import { StepIndicator } from "@/components/shared/StepIndicator";
import { useImageEnhancement } from "@/hooks/useImageEnhancement";
import { downloadImage } from "@/lib/utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

  // Determine current step for step indicator
  const getCurrentStep = () => {
    if (!settingsConfigured) return 1;
    if (!originalImage && processingMode === 'single') return 2;
    if (batchImages.length === 0 && processingMode === 'batch') return 2;
    return 3;
  };

  const currentStep = getCurrentStep();
  const steps = [
    { number: 1, label: "Settings", status: currentStep > 1 ? "completed" : currentStep === 1 ? "current" : "upcoming" as const },
    { number: 2, label: "Upload", status: currentStep > 2 ? "completed" : currentStep === 2 ? "current" : "upcoming" as const },
    { number: 3, label: "Results", status: currentStep >= 3 ? (enhancedImage || batchImages.length > 0 ? "current" : "upcoming") : "upcoming" as const },
  ];

  return (
    <>
      <BackButton onClick={onBack} variant="floating" />
      
      {/* Step Indicator */}
      <div className="mb-6">
        <StepIndicator steps={steps} />
      </div>

      {!settingsConfigured ? (
        <>
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold mb-2">Choose Enhancement Settings</h2>
            <p className="text-sm text-muted-foreground">Select your enhancement mode and intensity level</p>
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
              size="default"
              className="gap-2"
            >
              Continue to Upload
              <ImageIcon className="w-4 h-4" />
            </Button>
          </div>
        </>
      ) : processingMode === 'single' && !originalImage ? (
        <>
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold mb-2">Upload Your Image</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Mode: <span className="font-medium capitalize">{enhancementMode}</span> • 
              Intensity: <span className="font-medium capitalize">{enhancementIntensity}</span>
            </p>
            <div className="flex items-center justify-center gap-3">
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
                Batch Mode
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
            <h2 className="text-xl font-semibold mb-2">Upload Multiple Images</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Mode: <span className="font-medium capitalize">{enhancementMode}</span> • 
              Intensity: <span className="font-medium capitalize">{enhancementIntensity}</span>
            </p>
            <div className="flex items-center justify-center gap-3">
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
                Single Mode
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
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Batch Processing Results</h2>
            <p className="text-sm text-muted-foreground">
              Mode: <span className="font-medium capitalize">{enhancementMode}</span> • 
              Intensity: <span className="font-medium capitalize">{enhancementIntensity}</span>
            </p>
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
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Processing Results</h2>
            <p className="text-sm text-muted-foreground">
              Mode: <span className="font-medium capitalize">{enhancementMode}</span> • 
              Intensity: <span className="font-medium capitalize">{enhancementIntensity}</span>
            </p>
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
            <div className="flex justify-center pt-4">
              <Button 
                onClick={handleReEnhance} 
                variant="outline" 
                size="default" 
                disabled={isProcessing}
                className="gap-2"
              >
                Re-enhance with Current Settings
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
};

