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
import { useImageUpload } from "@/hooks/useImageUpload";
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
  const [processingMode, setProcessingMode] = useState<'single' | 'batch'>('single');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null); // Local state for uploaded image
  
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
  
  const { fileToBase64 } = useImageUpload();

  const handleImageUpload = async (file: File) => {
    // Just upload and store image locally, don't process yet
    const base64Image = await fileToBase64(file);
    setUploadedImage(base64Image);
    // Also set it in the hook for consistency, but don't process
    // We'll need to modify the hook or use a different approach
    // For now, let's use a workaround: set originalImage via the hook's reset and then manually set
    reset();
    // We'll store in local state and only set in hook when processing
  };

  const handleEnhance = async () => {
    const imageToProcess = uploadedImage || originalImage;
    if (!imageToProcess) {
      toast.error("Please upload an image first");
      return;
    }
    // Set the image in the hook and process
    setIsProcessing(true);
    // First set the original image in the hook
    const result = await processImage(imageToProcess, enhancementMode, enhancementIntensity, enhancementQuality);
    // Clear local uploaded image state since it's now in the hook
    if (uploadedImage) {
      setUploadedImage(null);
    }
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
    if ((!uploadedImage && !originalImage) && processingMode === 'single') return 1;
    if (batchImages.length === 0 && processingMode === 'batch') return 1;
    if ((uploadedImage || originalImage) && !enhancedImage && !isProcessing) return 2;
    if (enhancedImage || (batchImages.length > 0 && batchImages.some(img => img.enhanced))) return 3;
    return 2;
  };

  const currentStep = getCurrentStep();
  const steps: Array<{ number: number; label: string; status: "completed" | "current" | "upcoming" }> = [
    { number: 1, label: "Upload", status: currentStep > 1 ? "completed" : currentStep === 1 ? "current" : "upcoming" },
    { number: 2, label: "Configure", status: currentStep > 2 ? "completed" : currentStep === 2 ? "current" : "upcoming" },
    { number: 3, label: "Results", status: currentStep >= 3 ? "current" : "upcoming" },
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

      {processingMode === 'single' && !uploadedImage && !originalImage ? (
        <WorkflowCard
          title="Upload Your Image"
          description="Start by uploading an image you want to enhance"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-3">
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
              onImageSelect={handleImageUpload}
              disabled={isProcessing}
              label="Upload Image"
              description="Drag and drop or click to select an image to enhance"
            />
          </div>
        </WorkflowCard>
      ) : processingMode === 'batch' && batchImages.length === 0 ? (
        <WorkflowCard
          title="Upload Multiple Images"
          description="Upload multiple images to process in batch"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-3">
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
      ) : (uploadedImage || originalImage) && !enhancedImage ? (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Image Preview - Left Side */}
          <WorkflowCard title="Your Image" description="Preview your uploaded image">
            <div className="space-y-4">
              <div className="relative w-full aspect-square rounded-xl overflow-hidden border-2 border-primary/20 bg-slate-900/50">
                <img
                  src={uploadedImage || originalImage || ''}
                  alt="Original"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-sm text-muted-foreground text-center">
                <p>This is your original image. Adjust settings on the right, then click "Enhance" to process it.</p>
              </div>
            </div>
          </WorkflowCard>

          {/* Settings - Right Side */}
          <WorkflowCard 
            title="Enhancement Settings" 
            description="Adjust settings and click Enhance to process your image"
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
                onClick={handleEnhance}
                size="lg"
                disabled={isProcessing}
                className="w-full h-12 bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/90 hover:to-accent/90 font-bold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 rounded-xl disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Enhance Image
                  </>
                )}
              </Button>
              <Button
                onClick={() => {
                  reset();
                  setUploadedImage(null);
                  setProcessingMode('single');
                }}
                variant="outline"
                size="sm"
                className="w-full border-primary/30 hover:bg-primary/10"
              >
                Upload Different Image
              </Button>
            </div>
          </WorkflowCard>
        </div>
      ) : enhancedImage ? (
        <WorkflowCard
          title="Enhancement Results"
          description={`Mode: ${enhancementMode} • Intensity: ${enhancementIntensity}${enhancementQuality !== 'original' ? ` • Quality: ${enhancementQuality.toUpperCase()}` : ''}`}
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
            <div className="flex gap-3">
              <Button 
                onClick={handleReEnhance} 
                variant="outline" 
                size="default" 
                disabled={isProcessing}
                className="flex-1 border-primary/30 hover:bg-primary/10"
              >
                Try Again with Same Settings
              </Button>
              <Button
                onClick={() => {
                  reset();
                  setProcessingMode('single');
                }}
                variant="outline"
                size="default"
                className="flex-1 border-primary/30 hover:bg-primary/10"
              >
                Enhance Another Image
              </Button>
            </div>
          </div>
        </WorkflowCard>
      ) : null}
    </div>
  );
};

