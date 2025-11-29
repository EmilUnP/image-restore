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
import { downloadImage } from "@/lib/utils";
import { toast } from "sonner";
import { Share2, Sparkles, X, Copy, Check, Image as ImageIcon } from "lucide-react";
import { generateSocialPost } from "@/lib/api";

interface SocialPostGenerationWorkflowProps {
  onBack: () => void;
}

type GenerationMode = 'from-scratch' | 'single-reference' | 'multi-reference';

export const SocialPostGenerationWorkflow = ({ onBack }: SocialPostGenerationWorkflowProps) => {
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

  const handleReferenceImageSelect = (image: string) => {
    setReferenceImage(image);
    setGeneratedPost(null);
    setActualPrompt(null);
  };

  const handleReferenceImageRemove = () => {
    setReferenceImage(null);
  };

  const handleMultiReferenceImageAdd = (image: string) => {
    if (referenceImages.length >= 3) {
      toast.error('Maximum 3 reference images allowed');
      return;
    }
    if (!image || typeof image !== 'string') {
      toast.error('Invalid image format');
      return;
    }
    setReferenceImages([...referenceImages, image]);
    setGeneratedPost(null);
    setActualPrompt(null);
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BackButton onBack={onBack} />
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Social Post Generator
            </h1>
            <p className="text-xs text-foreground/60 mt-0.5">Create stunning social media posts with AI</p>
          </div>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="mb-4">
        <Tabs value={mode} onValueChange={handleModeChange}>
          <TabsList className="grid w-full grid-cols-3 bg-background/40 backdrop-blur-sm border border-primary/20 p-0.5 rounded-lg h-9">
            <TabsTrigger value="from-scratch" className="gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              <Sparkles className="w-3 h-3" />
              From Scratch
            </TabsTrigger>
            <TabsTrigger value="single-reference" className="gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              <ImageIcon className="w-3 h-3" />
              Single Ref
            </TabsTrigger>
            <TabsTrigger value="multi-reference" className="gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              <Share2 className="w-3 h-3" />
              Multi Ref
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {!generatedPost ? (
        <Card className="p-4 bg-background/40 backdrop-blur-sm border-primary/20">
          <div className="space-y-3">
            {/* Reference Image Upload - Single */}
            {mode === 'single-reference' && (
              <div className="space-y-1.5">
                <Label className="text-xs text-foreground/70">Reference Image</Label>
                {referenceImage ? (
                  <div className="relative">
                    <div className="w-full max-h-48 rounded-lg border border-primary/20 bg-background/20 p-2 flex items-center justify-center overflow-hidden">
                      {referenceImage && typeof referenceImage === 'string' ? (
                        <img
                          src={referenceImage}
                          alt="Reference"
                          className="w-full h-full object-contain max-h-44"
                          onError={(e) => {
                            console.error('Image load error:', e);
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="text-xs text-foreground/40">Invalid image</div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 rounded-full bg-background/90 hover:bg-background border border-primary/20"
                      onClick={handleReferenceImageRemove}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <ImageUpload
                    onImageSelect={handleReferenceImageSelect}
                    maxSizeMB={10}
                    className="border-primary/20"
                  />
                )}
              </div>
            )}

            {/* Reference Images Upload - Multiple */}
            {mode === 'multi-reference' && (
              <div className="space-y-1.5">
                <Label className="text-xs text-foreground/70">
                  Reference Images ({referenceImages.length}/3)
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {referenceImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <div className="w-full h-24 rounded-lg border border-primary/20 overflow-hidden bg-background/20 flex items-center justify-center">
                        {img && typeof img === 'string' ? (
                          <img
                            src={img}
                            alt={`Reference ${index + 1}`}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              console.error('Image load error:', e);
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="text-xs text-foreground/40">Invalid</div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 rounded-full bg-background/90 hover:bg-background border border-primary/20"
                        onClick={() => handleMultiReferenceImageRemove(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {referenceImages.length < 3 && (
                    <div className="h-24">
                      <ImageUpload
                        onImageSelect={handleMultiReferenceImageAdd}
                        maxSizeMB={10}
                        className="border-primary/20 h-full"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Prompt Input */}
            <div className="space-y-1.5">
              <Label htmlFor="prompt" className="text-xs text-foreground/70">Description *</Label>
              <Textarea
                id="prompt"
                placeholder="A vibrant social media post promoting a tech product launch with modern design..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                className="resize-none bg-background/30 border-primary/20 text-foreground placeholder:text-muted-foreground focus:border-primary/50 text-sm"
              />
            </div>

            {/* Settings */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="aspect-ratio" className="text-xs text-foreground/70">Aspect Ratio</Label>
                <Select value={aspectRatio} onValueChange={setAspectRatio}>
                  <SelectTrigger id="aspect-ratio" className="h-9 text-sm bg-background/30 border-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1:1">Square (1:1)</SelectItem>
                    <SelectItem value="16:9">Landscape (16:9)</SelectItem>
                    <SelectItem value="9:16">Portrait (9:16)</SelectItem>
                    <SelectItem value="4:5">Instagram (4:5)</SelectItem>
                    <SelectItem value="1.91:1">Facebook (1.91:1)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="style" className="text-xs text-foreground/70">Style</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger id="style" className="h-9 text-sm bg-background/30 border-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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
              className="w-full h-9 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-sm font-semibold"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 mr-2" />
                  Generate Post
                </>
              )}
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-4 bg-background/40 backdrop-blur-sm border-primary/20">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs text-foreground/70">
                <span className="capitalize">{style}</span> • {aspectRatio}
              </div>
            </div>

            <div className="relative group">
              <img
                src={generatedPost}
                alt="Generated social post"
                className="w-full max-h-96 object-contain rounded-lg border border-primary/20 bg-background/20 p-4"
              />
            </div>

            {actualPrompt && (
              <div className="p-2 bg-background/30 rounded border border-primary/20">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] text-foreground/60 uppercase">AI Prompt:</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 px-2 text-[10px]"
                    onClick={() => handleCopyPrompt(actualPrompt)}
                  >
                    {copiedPrompt ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                  </Button>
                </div>
                <p className="text-[10px] text-foreground/80 font-mono line-clamp-2">{actualPrompt}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleDownload}
                className="flex-1 h-8 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-xs font-semibold"
              >
                Download
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                className="h-8 text-xs border-primary/20 text-foreground/70 hover:text-foreground hover:border-primary/40"
              >
                New
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

