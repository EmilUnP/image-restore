import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { BackButton } from "@/components/shared/BackButton";
import { StepIndicator } from "@/components/shared/StepIndicator";
import { WorkflowHeader } from "@/components/shared/WorkflowHeader";
import { WorkflowCard } from "@/components/shared/WorkflowCard";
import { downloadImage } from "@/lib/utils";
import { toast } from "sonner";
import { Users, Sparkles, X, Download, Upload, Image as ImageIcon, Trash2, CheckCircle2, Loader2 } from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";
import { uniformImageStyling } from "@/lib/api";

interface UniformImageStylingWorkflowProps {
  onBack: () => void;
}

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  name: string;
}

interface ProcessedImage {
  id: string;
  originalId: string;
  originalName: string;
  processedImage: string;
}

export const UniformImageStylingWorkflow = ({ onBack }: UniformImageStylingWorkflowProps) => {
  const { fileToBase64 } = useImageUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [styleDescription, setStyleDescription] = useState('');
  const [stylePreset, setStylePreset] = useState('professional');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [backgroundStyle, setBackgroundStyle] = useState('solid');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [customPrompt, setCustomPrompt] = useState('');

  const stylePresets = {
    professional: {
      name: 'Professional Headshot',
      description: 'Corporate headshot style with neutral background, professional lighting, business attire',
      prompt: 'professional corporate headshot, neutral background, professional lighting, business attire, clean and polished look'
    },
    casual: {
      name: 'Casual Portrait',
      description: 'Relaxed, friendly portrait with natural lighting and casual background',
      prompt: 'casual portrait, natural lighting, friendly expression, relaxed pose, natural background'
    },
    studio: {
      name: 'Studio Portrait',
      description: 'High-end studio photography with controlled lighting and elegant background',
      prompt: 'studio portrait photography, professional lighting setup, elegant background, high quality, magazine style'
    },
    outdoor: {
      name: 'Outdoor Natural',
      description: 'Natural outdoor setting with natural lighting and scenic background',
      prompt: 'outdoor portrait, natural lighting, scenic background, vibrant colors, natural environment'
    },
    vintage: {
      name: 'Vintage Style',
      description: 'Retro vintage look with warm tones and classic styling',
      prompt: 'vintage portrait style, warm tones, classic styling, retro aesthetic, film photography look'
    },
    modern: {
      name: 'Modern Minimalist',
      description: 'Clean, minimalist style with simple background and contemporary look',
      prompt: 'modern minimalist portrait, clean background, contemporary style, simple and elegant'
    },
    custom: {
      name: 'Custom Style',
      description: 'Define your own style using custom prompt',
      prompt: ''
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages: UploadedImage[] = [];
    
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return;
      }

      const id = `img-${Date.now()}-${Math.random()}`;
      const preview = URL.createObjectURL(file);
      
      newImages.push({
        id,
        file,
        preview,
        name: file.name,
      });
    });

    setUploadedImages(prev => [...prev, ...newImages]);
    toast.success(`${newImages.length} image(s) added`);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (id: string) => {
    setUploadedImages(prev => {
      const image = prev.find(img => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  const handleClearAll = () => {
    uploadedImages.forEach(img => URL.revokeObjectURL(img.preview));
    setUploadedImages([]);
    setProcessedImages([]);
    setProcessingProgress(0);
  };

  const getStylePrompt = () => {
    if (stylePreset === 'custom' && customPrompt.trim()) {
      return customPrompt.trim();
    }
    return stylePresets[stylePreset as keyof typeof stylePresets].prompt;
  };

  const handleProcess = async () => {
    if (uploadedImages.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    const finalPrompt = styleDescription.trim() || getStylePrompt();
    if (!finalPrompt) {
      toast.error('Please provide a style description or select a preset');
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessedImages([]);

    try {
      const results: ProcessedImage[] = [];
      const total = uploadedImages.length;

      for (let i = 0; i < uploadedImages.length; i++) {
        const image = uploadedImages[i];
        setProcessingProgress(((i + 1) / total) * 100);

        try {
          // Convert file to base64
          const base64Image = await fileToBase64(image.file);

          // Build the full prompt
          let fullPrompt = finalPrompt;
          
          // Add background style
          if (backgroundStyle === 'solid') {
            fullPrompt += `, solid ${backgroundColor} background`;
          } else if (backgroundStyle === 'gradient') {
            fullPrompt += `, gradient background`;
          } else if (backgroundStyle === 'blur') {
            fullPrompt += `, blurred background`;
          } else if (backgroundStyle === 'transparent') {
            fullPrompt += `, transparent background`;
          }

          // Add aspect ratio info
          fullPrompt += `, ${aspectRatio} aspect ratio`;

          // Call API
          const response = await uniformImageStyling({
            image: base64Image,
            stylePrompt: fullPrompt,
            aspectRatio,
            backgroundStyle,
            backgroundColor: backgroundStyle === 'solid' ? backgroundColor : undefined,
          });

          if (response.error) {
            toast.error(`Failed to process ${image.name}: ${response.error}`);
            continue;
          }

          if (response.processedImage) {
            results.push({
              id: `processed-${image.id}`,
              originalId: image.id,
              originalName: image.name,
              processedImage: response.processedImage,
            });
          }
        } catch (error) {
          console.error(`Error processing ${image.name}:`, error);
          toast.error(`Failed to process ${image.name}`);
        }
      }

      setProcessedImages(results);
      
      if (results.length > 0) {
        toast.success(`Successfully processed ${results.length} of ${total} image(s)`);
      } else {
        toast.error('Failed to process any images');
      }
    } catch (error) {
      console.error('Processing error:', error);
      toast.error('An error occurred during processing');
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const handleDownloadAll = () => {
    processedImages.forEach((img, index) => {
      setTimeout(() => {
        downloadImage(img.processedImage, `uniform-styled-${img.originalName || `image-${index + 1}`}.png`);
      }, index * 100);
    });
    toast.success(`Downloading ${processedImages.length} image(s)...`);
  };

  const handleDownloadSingle = (image: ProcessedImage) => {
    downloadImage(image.processedImage, `uniform-styled-${image.originalName}.png`);
    toast.success('Image downloaded!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <WorkflowHeader
          icon={Users}
          title="Uniform Image Styling"
          description="Transform multiple images to match the same style, background, and design"
        />

        <StepIndicator 
          steps={[
            { number: 1, label: 'Upload', status: uploadedImages.length > 0 ? 'completed' : processedImages.length > 0 ? 'completed' : 'current' },
            { number: 2, label: 'Configure', status: uploadedImages.length > 0 && processedImages.length === 0 ? 'current' : processedImages.length > 0 ? 'completed' : 'upcoming' },
            { number: 3, label: 'Results', status: processedImages.length > 0 ? 'current' : 'upcoming' },
          ]} 
        />

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Upload & Settings */}
          <div className="lg:col-span-1 space-y-6">
            {/* Upload Section */}
            <WorkflowCard
              title="Upload Images"
              description="Upload multiple photos (employees, selfies, etc.)"
            >
              <div className="space-y-4">
                <div className="border-2 border-dashed border-primary/30 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center gap-3"
                  >
                    <div className="p-4 rounded-full bg-primary/10">
                      <Upload className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Click to upload images</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Supports multiple files (photos, selfies, portraits)
                      </p>
                    </div>
                  </label>
                </div>

                {uploadedImages.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">
                        {uploadedImages.length} image(s) uploaded
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearAll}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Clear All
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {uploadedImages.map((img) => (
                        <div key={img.id} className="relative group">
                          <img
                            src={img.preview}
                            alt={img.name}
                            className="w-full h-24 object-cover rounded-lg border-2 border-primary/20"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 rounded-full bg-destructive/90 hover:bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveImage(img.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          <p className="text-xs text-muted-foreground mt-1 truncate" title={img.name}>
                            {img.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </WorkflowCard>

            {/* Style Settings */}
            <WorkflowCard
              title="Style Settings"
              description="Choose how all images should look"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Style Preset</Label>
                  <Select value={stylePreset} onValueChange={setStylePreset}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(stylePresets).map(([key, preset]) => (
                        <SelectItem key={key} value={key}>
                          {preset.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {stylePreset !== 'custom' && (
                    <p className="text-xs text-muted-foreground">
                      {stylePresets[stylePreset as keyof typeof stylePresets].description}
                    </p>
                  )}
                </div>

                {stylePreset === 'custom' && (
                  <div className="space-y-2">
                    <Label>Custom Style Description</Label>
                    <Textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="e.g., professional headshot with blue background, corporate style, formal attire..."
                      rows={3}
                      className="bg-card/50 border-primary/30 resize-none"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Additional Style Description (Optional)</Label>
                  <Textarea
                    value={styleDescription}
                    onChange={(e) => setStyleDescription(e.target.value)}
                    placeholder="Add any specific requirements or modifications to the preset style..."
                    rows={2}
                    className="bg-card/50 border-primary/30 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Aspect Ratio</Label>
                  <Select value={aspectRatio} onValueChange={setAspectRatio}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1:1">Square (1:1)</SelectItem>
                      <SelectItem value="4:3">Standard (4:3)</SelectItem>
                      <SelectItem value="16:9">Widescreen (16:9)</SelectItem>
                      <SelectItem value="9:16">Portrait (9:16)</SelectItem>
                      <SelectItem value="3:4">Portrait (3:4)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Background Style</Label>
                  <Select value={backgroundStyle} onValueChange={setBackgroundStyle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solid">Solid Color</SelectItem>
                      <SelectItem value="gradient">Gradient</SelectItem>
                      <SelectItem value="blur">Blurred</SelectItem>
                      <SelectItem value="transparent">Transparent</SelectItem>
                      <SelectItem value="natural">Natural/Original</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {backgroundStyle === 'solid' && (
                  <div className="space-y-2">
                    <Label>Background Color</Label>
                    <Input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="h-12 bg-card/50 border-primary/30"
                    />
                  </div>
                )}

                <Button
                  onClick={handleProcess}
                  disabled={isProcessing || uploadedImages.length === 0}
                  className="w-full h-12 bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/90 hover:to-accent/90 font-semibold shadow-lg shadow-primary/30"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing... {Math.round(processingProgress)}%
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Process All Images
                    </>
                  )}
                </Button>
              </div>
            </WorkflowCard>
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2 space-y-6">
            {processedImages.length === 0 && !isProcessing && (
              <WorkflowCard
                title="Results"
                description="Processed images will appear here"
              >
                <div className="text-center py-12 text-muted-foreground">
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No processed images yet</p>
                  <p className="text-sm mt-2">Upload images and click "Process All Images" to get started</p>
                </div>
              </WorkflowCard>
            )}

            {isProcessing && (
              <WorkflowCard title="Processing...">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Processing images...</span>
                        <span>{Math.round(processingProgress)}%</span>
                      </div>
                      <div className="w-full bg-primary/10 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${processingProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This may take a few moments. Please wait...
                  </p>
                </div>
              </WorkflowCard>
            )}

            {processedImages.length > 0 && (
              <WorkflowCard
                title="Processed Images"
                description={`${processedImages.length} image(s) successfully processed`}
              >
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <Button
                      onClick={handleDownloadAll}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download All
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {processedImages.map((img) => (
                      <div key={img.id} className="relative group">
                        <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-primary/20 hover:border-primary/50 transition-colors">
                          <img
                            src={img.processedImage}
                            alt={img.originalName}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <Button
                              onClick={() => handleDownloadSingle(img)}
                              variant="secondary"
                              size="sm"
                              className="gap-2"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 truncate" title={img.originalName}>
                          {img.originalName}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Processed</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </WorkflowCard>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <BackButton onClick={onBack} />
        </div>
      </div>
    </div>
  );
};
