import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon, Layers, Sparkles } from "lucide-react";
import { EnhancementModeSelector } from "./EnhancementModeSelector";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { ImageComparison } from "@/components/shared/ImageComparison";
import { BatchImageUpload } from "./BatchImageUpload";
import { BatchResults } from "./BatchResults";
import { BackButton } from "@/components/shared/BackButton";
import { StepIndicator } from "@/components/shared/StepIndicator";
import { WorkflowHeader } from "@/components/shared/WorkflowHeader";
import { WorkflowCard } from "@/components/shared/WorkflowCard";
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
  const [enhancementQuality, setEnhancementQuality] = useState<string>("original");
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
    await processImage(originalImage, enhancementMode, enhancementIntensity, enhancementQuality);
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
        const result = await processImage(image.original, enhancementMode, enhancementIntensity, enhancementQuality);
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
  const steps: Array<{ number: number; label: string; status: "completed" | "current" | "upcoming" }> = [
    { number: 1, label: "Settings", status: currentStep > 1 ? "completed" : currentStep === 1 ? "current" : "upcoming" },
    { number: 2, label: "Upload", status: currentStep > 2 ? "completed" : currentStep === 2 ? "current" : "upcoming" },
    { number: 3, label: "Results", status: currentStep >= 3 ? (enhancedImage || batchImages.length > 0 ? "current" : "upcoming") : "upcoming" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <WorkflowHeader
        icon={Sparkles}
        title="Image Enhancement"
        description="Enhance image quality with AI. Improve sharpness, reduce noise, enhance colors, and restore old photos."
        iconColor="text-blue-400"
        iconBgColor="bg-blue-500/20"
        backButton={<BackButton onClick={onBack} variant="floating" />}
      />
      
      {/* Step Indicator */}
      <div className="mb-6">
        <StepIndicator steps={steps} />
      </div>

      {!settingsConfigured ? (
        <WorkflowCard
          title="Choose Enhancement Settings"
          description="Select your enhancement mode, intensity level, and quality settings"
        >
          <div className="space-y-6">
            <EnhancementModeSelector
              mode={enhancementMode}
              intensity={enhancementIntensity}
              quality={enhancementQuality}
              onModeChange={setEnhancementMode}
              onIntensityChange={setEnhancementIntensity}
              onQualityChange={setEnhancementQuality}
              disabled={isProcessing}
            />
            <Button
              onClick={handleSettingsReady}
              size="lg"
              className="w-full h-12 bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/90 hover:to-accent/90 font-bold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 rounded-xl"
            >
              Continue to Upload
              <ImageIcon className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </WorkflowCard>
      ) : processingMode === 'single' && !originalImage ? (
        <WorkflowCard
          title="Upload Your Image"
          description={`Mode: ${enhancementMode} • Intensity: ${enhancementIntensity}${enhancementQuality !== 'original' ? ` • Quality: ${enhancementQuality.toUpperCase()}` : ''}`}
        >
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-3">
              <Button onClick={() => setSettingsConfigured(false)} variant="outline" size="sm" className="border-primary/30 hover:bg-primary/10">
                Change Settings
              </Button>
              <Button
                onClick={() => {
                  setProcessingMode('batch');
                  reset();
                }}
                variant="outline"
                size="sm"
                className="gap-2 border-primary/30 hover:bg-primary/10"
              >
                <Layers className="w-4 h-4" />
                Batch Mode
              </Button>
            </div>
            <ImageUpload
              onImageSelect={(file) => handleImageSelect(file, enhancementMode, enhancementIntensity, enhancementQuality)}
              disabled={isProcessing}
              label="Upload Image"
              description="Drag and drop or click to select an image to enhance"
            />
          </div>
        </WorkflowCard>
      ) : processingMode === 'batch' && batchImages.length === 0 ? (
        <WorkflowCard
          title="Upload Multiple Images"
          description={`Mode: ${enhancementMode} • Intensity: ${enhancementIntensity}${enhancementQuality !== 'original' ? ` • Quality: ${enhancementQuality.toUpperCase()}` : ''}`}
        >
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-3">
              <Button onClick={() => setSettingsConfigured(false)} variant="outline" size="sm" className="border-primary/30 hover:bg-primary/10">
                Change Settings
              </Button>
              <Button
                onClick={() => {
                  setProcessingMode('single');
                  setBatchImages([]);
                }}
                variant="outline"
                size="sm"
                className="gap-2 border-primary/30 hover:bg-primary/10"
              >
                <ImageIcon className="w-4 h-4" />
                Single Mode
              </Button>
            </div>
            <BatchImageUpload
              onImagesSelect={handleBatchImagesSelect}
              disabled={isProcessing}
              maxImages={10}
            />
          </div>
        </WorkflowCard>
      ) : processingMode === 'batch' && batchImages.length > 0 ? (
        <WorkflowCard
          title="Batch Processing Results"
          description={`Mode: ${enhancementMode} • Intensity: ${enhancementIntensity}`}
        >
          <BatchResults
            images={batchImages}
            onDownload={handleBatchDownload}
            onDownloadAll={handleBatchDownloadAll}
            isProcessing={isProcessing}
          />
        </WorkflowCard>
      ) : (
        <WorkflowCard
          title="Processing Results"
          description={`Mode: ${enhancementMode} • Intensity: ${enhancementIntensity}`}
        >
          <div className="space-y-6">
            <ImageComparison
              originalImage={originalImage || ''}
              enhancedImage={enhancedImage}
              isProcessing={isProcessing}
              onDownload={handleDownload}
              originalLabel="Original"
              processedLabel="Enhanced"
            />
            {enhancedImage && !isProcessing && (
              <Button 
                onClick={handleReEnhance} 
                variant="outline" 
                size="default" 
                disabled={isProcessing}
                className="w-full border-primary/30 hover:bg-primary/10"
              >
                Re-enhance with Current Settings
              </Button>
            )}
          </div>
        </WorkflowCard>
      )}
    </div>
  );
};

