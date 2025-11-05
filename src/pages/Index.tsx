import { useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { BatchImageUpload } from "@/components/BatchImageUpload";
import { ImageComparison } from "@/components/ImageComparison";
import { BatchResults } from "@/components/BatchResults";
import { EnhancementModeSelector } from "@/components/EnhancementModeSelector";
import { toast } from "sonner";
import { FileText, Sparkles, Image as ImageIcon, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProcessedImage {
  id: string;
  original: string;
  enhanced: string | null;
  fileName: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}

const Index = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [enhancementMode, setEnhancementMode] = useState<string>("photo");
  const [enhancementIntensity, setEnhancementIntensity] = useState<string>("medium");
  const [settingsConfigured, setSettingsConfigured] = useState<boolean>(false);
  const [processingMode, setProcessingMode] = useState<'single' | 'batch'>('single');
  const [batchImages, setBatchImages] = useState<ProcessedImage[]>([]);

  const handleImageSelect = async (file: File) => {
    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result as string;
      setOriginalImage(base64Image);
      setEnhancedImage(null);

      // Start enhancement
      setIsProcessing(true);
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${API_URL}/api/enhance-image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            image: base64Image,
            mode: enhancementMode,
            intensity: enhancementIntensity
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          const errorMsg = errorData.error || `Failed to process image. Error: ${response.status}`;
          toast.error(errorMsg);
          
          if (errorData.message) {
            console.log("Additional info:", errorData.message);
          }
          if (errorData.retryAfter) {
            console.log("Retry after:", errorData.retryAfter);
          }
          return;
        }

        const data = await response.json();
        
        if (data?.enhancedImage) {
          setEnhancedImage(data.enhancedImage);
          const modeName = data.mode ? data.mode.charAt(0).toUpperCase() + data.mode.slice(1) : '';
          toast.success(`Image enhanced successfully using ${modeName} mode!`);
        } else {
          toast.error("No processed image received");
        }
      } catch (err) {
        toast.error("An unexpected error occurred. Make sure the backend server is running.");
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = () => {
    if (!enhancedImage) return;

    const link = document.createElement("a");
    link.href = enhancedImage;
    link.download = "enhanced-document.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Image downloaded!");
  };

  const handleReset = () => {
    setOriginalImage(null);
    setEnhancedImage(null);
    setIsProcessing(false);
    setSettingsConfigured(false);
    setBatchImages([]);
  };

  const handleSettingsReady = () => {
    setSettingsConfigured(true);
  };

  const handleBatchImagesSelect = async (files: File[]) => {
    if (files.length === 0) {
      setBatchImages([]);
      return;
    }

    // Convert files to base64 and create initial state
    const newImages: ProcessedImage[] = [];
    
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
    
    // Start processing all images sequentially
    setIsProcessing(true);
    processBatchImages(newImages);
  };

  const processBatchImages = async (images: ProcessedImage[]) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      
      // Update status to processing
      setBatchImages(prev => 
        prev.map(img => 
          img.id === image.id 
            ? { ...img, status: 'processing' }
            : img
        )
      );

      try {
        const response = await fetch(`${API_URL}/api/enhance-image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            image: image.original,
            mode: enhancementMode,
            intensity: enhancementIntensity
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          setBatchImages(prev => 
            prev.map(img => 
              img.id === image.id 
                ? { 
                    ...img, 
                    status: 'error',
                    error: errorData.error || 'Processing failed'
                  }
                : img
            )
          );
          continue;
        }

        const data = await response.json();
        
        if (data?.enhancedImage) {
          setBatchImages(prev => 
            prev.map(img => 
              img.id === image.id 
                ? { 
                    ...img, 
                    enhanced: data.enhancedImage,
                    status: 'completed'
                  }
                : img
            )
          );
          toast.success(`${image.fileName} enhanced successfully!`);
        } else {
          setBatchImages(prev => 
            prev.map(img => 
              img.id === image.id 
                ? { 
                    ...img, 
                    status: 'error',
                    error: 'No enhanced image received'
                  }
                : img
            )
          );
        }
      } catch (err) {
        setBatchImages(prev => 
          prev.map(img => 
            img.id === image.id 
              ? { 
                  ...img, 
                  status: 'error',
                  error: 'Network error occurred'
                }
              : img
          )
        );
      }
    }

    setIsProcessing(false);
    toast.success(`Batch processing complete! ${images.length} images processed.`);
  };

  const handleBatchDownload = (image: ProcessedImage) => {
    if (!image.enhanced) return;

    const link = document.createElement("a");
    link.href = image.enhanced;
    link.download = `enhanced-${image.fileName}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${image.fileName} downloaded!`);
  };

  const handleBatchDownloadAll = () => {
    const completedImages = batchImages.filter(img => img.status === 'completed' && img.enhanced);
    
    completedImages.forEach((image, index) => {
      setTimeout(() => {
        const link = document.createElement("a");
        link.href = image.enhanced!;
        link.download = `enhanced-${image.fileName}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * 200); // Stagger downloads
    });
    
    toast.success(`Downloading ${completedImages.length} images...`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <header className="text-center mb-12 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent">
              <ImageIcon className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI Image Optimizer
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Enhance any image with AI-powered quality improvements. Perfect for photos, documents, portraits, landscapes, and more.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-accent" />
            <span>Powered by Gemini AI</span>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto">
          <div className="bg-card rounded-2xl shadow-strong p-8 border border-border space-y-6">
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
                    <Button
                      onClick={() => setSettingsConfigured(false)}
                      variant="ghost"
                      size="sm"
                    >
                      Change Settings
                    </Button>
                    <Button
                      onClick={() => {
                        setProcessingMode('batch');
                        setOriginalImage(null);
                        setEnhancedImage(null);
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
                <ImageUpload onImageSelect={handleImageSelect} disabled={isProcessing} />
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
                    <Button
                      onClick={() => setSettingsConfigured(false)}
                      variant="ghost"
                      size="sm"
                    >
                      Change Settings
                    </Button>
                    <Button
                      onClick={() => {
                        setProcessingMode('single');
                        setBatchImages([]);
                        setIsProcessing(false);
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
                        setIsProcessing(false);
                      }}
                      variant="ghost"
                      size="sm"
                    >
                      Process More
                    </Button>
                    <Button
                      onClick={handleReset}
                      variant="outline"
                      size="sm"
                    >
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
                  <Button
                    onClick={() => setSettingsConfigured(false)}
                    variant="ghost"
                    size="sm"
                  >
                    Change Settings
                  </Button>
                </div>
                <ImageComparison
                  originalImage={originalImage}
                  enhancedImage={enhancedImage}
                  isProcessing={isProcessing}
                  onDownload={handleDownload}
                />
                {enhancedImage && !isProcessing && (
                  <div className="flex justify-center gap-4">
                    <Button
                      onClick={async () => {
                        // Re-enhance with current settings
                        setIsProcessing(true);
                        try {
                          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                          const response = await fetch(`${API_URL}/api/enhance-image`, {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ 
                              image: originalImage,
                              mode: enhancementMode,
                              intensity: enhancementIntensity
                            }),
                          });

                          if (!response.ok) {
                            const errorData = await response.json();
                            toast.error(errorData.error || `Failed to process image. Error: ${response.status}`);
                            return;
                          }

                          const data = await response.json();
                          if (data?.enhancedImage) {
                            setEnhancedImage(data.enhancedImage);
                            const modeName = data.mode ? data.mode.charAt(0).toUpperCase() + data.mode.slice(1) : '';
                            toast.success(`Image re-enhanced using ${modeName} mode!`);
                          }
                        } catch (err) {
                          toast.error("An unexpected error occurred.");
                        } finally {
                          setIsProcessing(false);
                        }
                      }}
                      variant="default"
                      size="lg"
                      disabled={isProcessing}
                    >
                      Re-enhance with Current Settings
                    </Button>
                    <Button
                      onClick={handleReset}
                      variant="outline"
                      size="lg"
                      disabled={isProcessing}
                    >
                      Start Over
                    </Button>
                  </div>
                )}
                {!enhancedImage && (
                  <div className="flex justify-center">
                    <Button
                      onClick={handleReset}
                      variant="outline"
                      size="lg"
                      disabled={isProcessing}
                    >
                      Cancel & Start Over
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>

        {/* Features */}
        <section className="mt-16 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            {
              title: "Multiple Enhancement Modes",
              description: "8 specialized modes for documents, photos, portraits, landscapes, and more",
              icon: ImageIcon,
            },
            {
              title: "Batch Processing",
              description: "Process up to 10 images at once with progress tracking and bulk download",
              icon: Layers,
            },
            {
              title: "AI-Powered Quality",
              description: "Powered by Gemini AI for professional-grade image enhancement",
              icon: Sparkles,
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-card rounded-xl p-6 border border-border shadow-soft hover:shadow-strong transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">{feature.title}</h3>
              </div>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default Index;
