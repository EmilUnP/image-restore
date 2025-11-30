import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { BackButton } from "@/components/shared/BackButton";
import { WorkflowHeader } from "@/components/shared/WorkflowHeader";
import { WorkflowCard } from "@/components/shared/WorkflowCard";
import { downloadImage } from "@/lib/utils";
import { toast } from "sonner";
import { Share2, Sparkles, X, Copy, Check, Image as ImageIcon, Download } from "lucide-react";
import { generateSocialPost } from "@/lib/api";
import { useImageUpload } from "@/hooks/useImageUpload";

interface SocialPostGenerationWorkflowProps {
  onBack: () => void;
}

type GenerationMode = 'from-scratch' | 'single-reference' | 'multi-reference';

export const SocialPostGenerationWorkflow = ({ onBack }: SocialPostGenerationWorkflowProps) => {
  const { fileToBase64 } = useImageUpload();
  const [mode, setMode] = useState<GenerationMode>('from-scratch');
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [style, setStyle] = useState('modern');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [generatedPost, setGeneratedPost] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [actualPrompt, setActualPrompt] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const handleModeChange = (newMode: string) => {
    setMode(newMode as GenerationMode);
    setReferenceImage(null);
    setReferenceImages([]);
    setGeneratedPost(null);
    setActualPrompt(null);
  };

  const handleReferenceImageSelect = async (file: File) => {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload a valid image file');
        return;
      }
      
      const base64Image = await fileToBase64(file);
      setReferenceImage(base64Image);
      setGeneratedPost(null);
      setActualPrompt(null);
    } catch (error) {
      console.error('Error converting file to base64:', error);
      toast.error('Failed to process image. Please try again.');
    }
  };

  const handleReferenceImageRemove = () => {
    setReferenceImage(null);
  };

  const handleMultiReferenceImageAdd = async (file: File) => {
    try {
      if (referenceImages.length >= 3) {
        toast.error('Maximum 3 reference images allowed');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload a valid image file');
        return;
      }
      
      const base64Image = await fileToBase64(file);
      if (!base64Image || typeof base64Image !== 'string') {
        toast.error('Failed to process image');
        return;
      }
      
      setReferenceImages([...referenceImages, base64Image]);
      setGeneratedPost(null);
      setActualPrompt(null);
    } catch (error) {
      console.error('Error converting file to base64:', error);
      toast.error('Failed to process image. Please try again.');
    }
  };

  const handleMultiReferenceImageRemove = (index: number) => {
    setReferenceImages(referenceImages.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a description for the social post');
      return;
    }

    if (mode === 'single-reference' && !referenceImage) {
      toast.error('Please upload a reference image');
      return;
    }

    if (mode === 'multi-reference' && referenceImages.length === 0) {
      toast.error('Please upload at least one reference image');
      return;
    }

    setIsGenerating(true);
    try {
      // Validate and filter reference images
      let validReferenceImages: string[] | undefined;
      if (mode === 'multi-reference' && referenceImages.length > 0) {
        validReferenceImages = referenceImages.filter((img): img is string => 
          typeof img === 'string' && img.length > 0
        );
        if (validReferenceImages.length === 0) {
          toast.error('Please upload valid reference images');
          return;
        }
      }

      const response = await generateSocialPost({
        prompt,
        aspectRatio,
        style,
        referenceImage: mode === 'single-reference' && referenceImage ? referenceImage : undefined,
        referenceImages: validReferenceImages,
      });

      if (response.error) {
        toast.error(response.error);
        return;
      }

      if (response.generatedPost) {
        setGeneratedPost(response.generatedPost);
        if (response.actualPrompt) {
          setActualPrompt(response.actualPrompt);
        }
        toast.success('Social post generated successfully!');
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate social post');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedPost) return;
    downloadImage(generatedPost, `social-post-${Date.now()}.png`);
    toast.success('Social post downloaded!');
  };

  const handleCopyPrompt = async (promptText: string) => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopiedPrompt(true);
      toast.success('Prompt copied to clipboard!');
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch (error) {
      toast.error('Failed to copy prompt');
    }
  };

  const handleReset = () => {
    setPrompt('');
    setReferenceImage(null);
    setReferenceImages([]);
    setGeneratedPost(null);
    setActualPrompt(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <WorkflowHeader
        icon={Share2}
        title="Social Post Generator"
        description="Create stunning social media posts. Generate from scratch, use reference images, or combine multiple inspirations."
        iconColor="text-pink-400"
        iconBgColor="bg-pink-500/20"
        backButton={<BackButton onClick={onBack} variant="floating" />}
      />

      {/* Enhanced Mode Selection */}
      <div className="mb-6">
        <Tabs value={mode} onValueChange={handleModeChange}>
          <TabsList className="grid w-full grid-cols-3 bg-card/60 backdrop-blur-xl border border-primary/30 p-1 rounded-xl h-12 shadow-lg shadow-primary/5">
            <TabsTrigger 
              value="from-scratch" 
              className="gap-2 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30 transition-all duration-300 rounded-lg"
            >
              <Sparkles className="w-4 h-4" />
              From Scratch
            </TabsTrigger>
            <TabsTrigger 
              value="single-reference" 
              className="gap-2 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30 transition-all duration-300 rounded-lg"
            >
              <ImageIcon className="w-4 h-4" />
              Single Ref
            </TabsTrigger>
            <TabsTrigger 
              value="multi-reference" 
              className="gap-2 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30 transition-all duration-300 rounded-lg"
            >
              <Share2 className="w-4 h-4" />
              Multi Ref
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {!generatedPost ? (
        <WorkflowCard
          title="Create Your Social Post"
          description="Describe your post and customize the style and aspect ratio"
        >
          <div className="space-y-5">
            {/* Reference Image Upload - Single */}
            {mode === 'single-reference' && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-primary" />
                  Reference Image
                </Label>
                {referenceImage ? (
                  <div className="relative group">
                    <div className="w-full max-h-56 rounded-xl border-2 border-primary/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-3 flex items-center justify-center overflow-hidden shadow-lg shadow-primary/10 transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/20">
                      {referenceImage && typeof referenceImage === 'string' ? (
                        <img
                          src={referenceImage}
                          alt="Reference"
                          className="w-full h-full object-contain max-h-52 rounded-lg transition-transform duration-300 group-hover:scale-[1.02]"
                          onError={(e) => {
                            console.error('Image load error:', e);
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="text-sm text-muted-foreground">Invalid image</div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-3 right-3 h-8 w-8 rounded-full bg-destructive/90 hover:bg-destructive text-destructive-foreground border-2 border-destructive-foreground/20 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
                      onClick={handleReferenceImageRemove}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="transition-all duration-300 hover:scale-[1.01]">
                    <ImageUpload
                      onImageSelect={handleReferenceImageSelect}
                      label="Upload Reference Image"
                      description="Drag and drop or click to select"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Reference Images Upload - Multiple */}
            {mode === 'multi-reference' && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-primary" />
                  Reference Images 
                  <span className="text-xs font-normal text-muted-foreground">({referenceImages.length}/3)</span>
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  {referenceImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <div className="w-full h-32 rounded-xl border-2 border-primary/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm overflow-hidden flex items-center justify-center shadow-md shadow-primary/5 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.02]">
                        {img && typeof img === 'string' ? (
                          <img
                            src={img}
                            alt={`Reference ${index + 1}`}
                            className="w-full h-full object-contain p-2"
                            onError={(e) => {
                              console.error('Image load error:', e);
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="text-xs text-muted-foreground">Invalid</div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7 rounded-full bg-destructive/90 hover:bg-destructive text-destructive-foreground border-2 border-destructive-foreground/20 shadow-md transition-all duration-300 hover:scale-110 hover:shadow-lg"
                        onClick={() => handleMultiReferenceImageRemove(index)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                  {referenceImages.length < 3 && (
                    <div className="h-32 transition-all duration-300 hover:scale-[1.02]">
                      <ImageUpload
                        onImageSelect={handleMultiReferenceImageAdd}
                        label="Add Image"
                        description=""
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Prompt Input */}
            <div className="space-y-2">
              <Label htmlFor="prompt" className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="prompt"
                placeholder="A vibrant social media post promoting a tech product launch with modern design, bold typography, and eye-catching visuals..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="resize-none bg-card/50 backdrop-blur-sm border-2 border-primary/30 text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/20 text-sm rounded-xl transition-all duration-300"
              />
            </div>

            {/* Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="aspect-ratio" className="text-sm font-semibold text-foreground">Aspect Ratio</Label>
                <Select value={aspectRatio} onValueChange={setAspectRatio}>
                  <SelectTrigger id="aspect-ratio" className="h-11 text-sm bg-card/50 backdrop-blur-sm border-2 border-primary/30 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 rounded-xl transition-all duration-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card/95 backdrop-blur-xl border-primary/30">
                    <SelectItem value="1:1">Square (1:1)</SelectItem>
                    <SelectItem value="16:9">Landscape (16:9)</SelectItem>
                    <SelectItem value="9:16">Portrait (9:16)</SelectItem>
                    <SelectItem value="4:5">Instagram (4:5)</SelectItem>
                    <SelectItem value="1.91:1">Facebook (1.91:1)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="style" className="text-sm font-semibold text-foreground">Style</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger id="style" className="h-11 text-sm bg-card/50 backdrop-blur-sm border-2 border-primary/30 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 rounded-xl transition-all duration-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card/95 backdrop-blur-xl border-primary/30">
                    <SelectItem value="modern">Modern</SelectItem>
                    <SelectItem value="minimalist">Minimalist</SelectItem>
                    <SelectItem value="bold">Bold</SelectItem>
                    <SelectItem value="elegant">Elegant</SelectItem>
                    <SelectItem value="playful">Playful</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="vintage">Vintage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full h-12 bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/90 hover:to-accent/90 text-base font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Generating Post...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Post
                </>
              )}
            </Button>
          </div>
        </WorkflowCard>
      ) : (
        <WorkflowCard
          title="Post Generated Successfully"
          description={`${style} style • ${aspectRatio} ratio`}
        >
          <div className="space-y-5">
            {/* Result Header */}
            <div className="flex items-center justify-between pb-3 border-b border-primary/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Generated Successfully</p>
                  <p className="text-xs text-muted-foreground capitalize">{style} style • {aspectRatio} ratio</p>
                </div>
              </div>
            </div>

            {/* Generated Image */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 rounded-xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
              <div className="relative w-full max-h-[500px] rounded-xl border-2 border-primary/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-6 flex items-center justify-center overflow-hidden shadow-2xl shadow-primary/20 transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-primary/30">
                <img
                  src={generatedPost}
                  alt="Generated social post"
                  className="w-full h-full object-contain max-h-[450px] rounded-lg transition-transform duration-300 group-hover:scale-[1.01]"
                />
              </div>
            </div>

            {/* AI Prompt Display */}
            {actualPrompt && (
              <div className="p-4 bg-gradient-to-br from-card/60 to-card/40 backdrop-blur-sm rounded-xl border-2 border-primary/20 shadow-md transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <p className="text-xs font-semibold text-foreground uppercase tracking-wide">AI Prompt</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-3 text-xs hover:bg-primary/10 transition-all duration-300"
                    onClick={() => handleCopyPrompt(actualPrompt)}
                  >
                    {copiedPrompt ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1.5 text-primary" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1.5" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-foreground/80 font-mono line-clamp-3 bg-background/30 p-2 rounded-lg border border-primary/10">{actualPrompt}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleDownload}
                className="flex-1 h-11 bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/90 hover:to-accent/90 text-sm font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 rounded-xl"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                className="h-11 px-6 text-sm font-medium border-2 border-primary/30 text-foreground hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 rounded-xl"
              >
                New Post
              </Button>
            </div>
          </div>
        </WorkflowCard>
      )}
    </div>
  );
};

