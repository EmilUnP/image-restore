import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { ImageComparison } from "@/components/shared/ImageComparison";
import { BackButton } from "@/components/shared/BackButton";
import { StepIndicator } from "@/components/shared/StepIndicator";
import { useIconGeneration } from "@/hooks/useIconGeneration";
import { downloadImage } from "@/lib/utils";
import { toast } from "sonner";
import { Zap, Sparkles, Plus, X, Download, Copy, Check } from "lucide-react";

interface IconGenerationWorkflowProps {
  onBack: () => void;
}

export const IconGenerationWorkflow = ({ onBack }: IconGenerationWorkflowProps) => {
  const [mode, setMode] = useState<'generate' | 'upgrade'>('generate');
  const [prompt, setPrompt] = useState('');
  const [useVariants, setUseVariants] = useState(false);
  const [variants, setVariants] = useState<string[]>(['']);
  const [style, setStyle] = useState('modern');
  const [size, setSize] = useState('512');
  const [upgradeLevel, setUpgradeLevel] = useState('medium');
  const [settingsConfigured, setSettingsConfigured] = useState(false);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  const {
    generatedIcon,
    generatedIcons,
    actualPrompt,
    originalIcon,
    isGenerating,
    setGenerationMode,
    generateIconFromText,
    generateMultipleIcons,
    upgradeExistingIcon,
    handleIconSelect,
    reset,
    setIsGenerating,
  } = useIconGeneration();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a description for the icon');
      return;
    }
    
    if (useVariants && variants.length > 0 && variants.some(v => v.trim())) {
      const validVariants = variants.filter(v => v.trim());
      await generateMultipleIcons(prompt, validVariants, style, size);
    } else {
      await generateIconFromText(prompt, style, size);
    }
  };

  const addVariant = () => {
    setVariants([...variants, '']);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, value: string) => {
    const newVariants = [...variants];
    newVariants[index] = value;
    setVariants(newVariants);
  };

  const handleDownloadAll = () => {
    generatedIcons.forEach((icon, index) => {
      setTimeout(() => {
        downloadImage(icon.image, icon.fileName);
      }, index * 200);
    });
    toast.success(`Downloading ${generatedIcons.length} icons...`);
  };

  const handleDownloadIcon = (icon: typeof generatedIcons[0]) => {
    downloadImage(icon.image, icon.fileName);
    toast.success(`${icon.prompt} downloaded!`);
  };

  const handleCopyPrompt = async (promptText: string, promptId: string) => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopiedPromptId(promptId);
      toast.success('Prompt copied to clipboard!');
      setTimeout(() => setCopiedPromptId(null), 2000);
    } catch (error) {
      toast.error('Failed to copy prompt');
    }
  };

  const handleUpgrade = async () => {
    if (!originalIcon) return;
    await upgradeExistingIcon(originalIcon, upgradeLevel, style);
  };

  const handleDownload = () => {
    if (!generatedIcon) return;
    downloadImage(generatedIcon, `icon-${Date.now()}.png`);
    toast.success("Icon downloaded!");
  };

  const handleModeChange = (newMode: 'generate' | 'upgrade') => {
    setMode(newMode);
    setGenerationMode(newMode);
    reset();
    setSettingsConfigured(false);
  };

  const handleSettingsReady = () => {
    if (mode === 'generate' && !prompt.trim()) {
      toast.error('Please enter a description for the icon');
      return;
    }
    if (mode === 'generate' && useVariants && variants.every(v => !v.trim())) {
      toast.error('Please add at least one variant description');
      return;
    }
    if (mode === 'upgrade' && !originalIcon) {
      toast.error('Please upload an icon first');
      return;
    }
    setSettingsConfigured(true);
  };

  // Determine current step for step indicator
  const getCurrentStep = () => {
    if (!settingsConfigured) return 1;
    if (mode === 'generate' && !prompt.trim()) return 2;
    if (mode === 'upgrade' && !originalIcon) return 2;
    return 3;
  };

  const currentStep = getCurrentStep();
  const hasResults = generatedIcon || generatedIcons.length > 0;
  const steps = [
    { number: 1, label: mode === 'generate' ? "Describe" : "Upload", status: currentStep > 1 ? "completed" : currentStep === 1 ? "current" : "upcoming" as const },
    { number: 2, label: mode === 'generate' ? "Generate" : "Upgrade", status: currentStep > 2 ? "completed" : currentStep === 2 ? "current" : "upcoming" as const },
    { number: 3, label: "Result", status: currentStep >= 3 ? (hasResults ? "current" : "upcoming") : "upcoming" as const },
  ];

  return (
    <>
      <BackButton onClick={onBack} variant="floating" />
      
      {/* Step Indicator */}
      <div className="mb-6">
        <StepIndicator steps={steps} />
      </div>

      {/* Mode Selection */}
      <div className="mb-6">
        <Tabs value={mode} onValueChange={(value) => handleModeChange(value as 'generate' | 'upgrade')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Generate New Icon
            </TabsTrigger>
            <TabsTrigger value="upgrade" className="gap-2">
              <Zap className="w-4 h-4" />
              Upgrade Existing Icon
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {mode === 'generate' ? (
        <>
          {!settingsConfigured ? (
            <Card className="space-y-6 p-6">
              <div className="text-center mb-4">
                <h2 className="text-xl font-semibold mb-2">Describe Your Icon</h2>
                <p className="text-sm text-muted-foreground">Tell us what kind of icon you want to generate</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prompt">Main Icon Description *</Label>
                  <Textarea
                    id="prompt"
                    placeholder="e.g., A modern phone icon, A minimalist home icon, A bold settings gear icon..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Be specific about style, colors, and purpose for best results
                  </p>
                </div>

                <div className="flex items-center space-x-2 p-4 border rounded-lg bg-muted/30">
                  <Checkbox
                    id="use-variants"
                    checked={useVariants}
                    onCheckedChange={(checked) => {
                      setUseVariants(checked as boolean);
                      if (!checked) {
                        setVariants(['']);
                      }
                    }}
                  />
                  <Label htmlFor="use-variants" className="cursor-pointer flex-1">
                    <span className="font-medium">Generate Multiple Variants</span>
                    <p className="text-xs text-muted-foreground font-normal">
                      Create related icons in the same style (e.g., phone, close, open, forward, back)
                    </p>
                  </Label>
                </div>

                {useVariants && (
                  <div className="space-y-3 p-4 border rounded-lg bg-muted/20">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Variant Descriptions</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addVariant}
                        className="gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Add Variant
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {variants.map((variant, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder={`Variant ${index + 1} (e.g., close, open, forward, back...)`}
                            value={variant}
                            onChange={(e) => updateVariant(index, e.target.value)}
                            className="flex-1"
                          />
                          {variants.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeVariant(index)}
                              className="text-destructive hover:text-destructive"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      All variants will be generated in the same style as the main icon
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="style">Style</Label>
                    <Select value={style} onValueChange={setStyle}>
                      <SelectTrigger id="style">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="minimalist">Minimalist</SelectItem>
                        <SelectItem value="bold">Bold</SelectItem>
                        <SelectItem value="outline">Outline</SelectItem>
                        <SelectItem value="filled">Filled</SelectItem>
                        <SelectItem value="gradient">Gradient</SelectItem>
                        <SelectItem value="3d">3D</SelectItem>
                        <SelectItem value="flat">Flat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="size">Size</Label>
                    <Select value={size} onValueChange={setSize}>
                      <SelectTrigger id="size">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="256">256x256</SelectItem>
                        <SelectItem value="512">512x512</SelectItem>
                        <SelectItem value="1024">1024x1024</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleSettingsReady}
                  className="w-full"
                  disabled={!prompt.trim() || isGenerating || (useVariants && variants.every(v => !v.trim()))}
                >
                  Continue to Generate
                </Button>
              </div>
            </Card>
          ) : generatedIcons.length > 0 || isGenerating ? (
            <>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-semibold">
                    {isGenerating ? 'Generating Icons...' : `Generated Icons (${generatedIcons.length})`}
                  </h2>
                  {!isGenerating && generatedIcons.length > 0 && (
                    <Button
                      onClick={handleDownloadAll}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download All
                    </Button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Style: <span className="font-medium capitalize">{style}</span> • 
                  Size: <span className="font-medium">{size}x{size}</span>
                  {isGenerating && (
                    <span className="ml-2">• Generating {generatedIcons.length + 1} of {1 + variants.filter(v => v.trim()).length}...</span>
                  )}
                </p>
                {generatedIcons[0]?.actualPrompt && (
                  <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-muted-foreground">Actual Prompt Sent to Gemini AI:</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => handleCopyPrompt(generatedIcons[0].actualPrompt || '', 'main-prompt')}
                      >
                        {copiedPromptId === 'main-prompt' ? (
                          <>
                            <Check className="w-3 h-3 mr-1" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-foreground font-mono break-words">{generatedIcons[0].actualPrompt}</p>
                  </div>
                )}
              </div>

              {generatedIcons.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                  {generatedIcons.map((icon) => (
                    <Card key={icon.id} className="overflow-hidden">
                      <div className="aspect-square p-4 bg-muted/30 flex items-center justify-center">
                        {icon.image ? (
                          <img
                            src={icon.image}
                            alt={icon.prompt}
                            className="max-w-full max-h-full object-contain rounded"
                          />
                        ) : (
                          <div className="text-center space-y-2">
                            <Sparkles className="w-8 h-8 mx-auto animate-spin text-primary" />
                            <p className="text-xs text-muted-foreground">Generating...</p>
                          </div>
                        )}
                      </div>
                    <CardContent className="p-4">
                      <p className="text-xs font-medium mb-2 truncate" title={icon.prompt}>
                        {icon.prompt}
                      </p>
                      {icon.actualPrompt && (
                        <div className="mb-2 p-2 bg-muted/30 rounded text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-[10px] font-medium text-muted-foreground">AI Prompt:</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 px-1.5 text-[10px]"
                              onClick={() => handleCopyPrompt(icon.actualPrompt || '', icon.id)}
                            >
                              {copiedPromptId === icon.id ? (
                                <Check className="w-2.5 h-2.5" />
                              ) : (
                                <Copy className="w-2.5 h-2.5" />
                              )}
                            </Button>
                          </div>
                          <p className="text-[10px] font-mono break-words line-clamp-2">{icon.actualPrompt}</p>
                        </div>
                      )}
                      {icon.image && (
                        <Button
                          onClick={() => handleDownloadIcon(icon)}
                          size="sm"
                          variant="outline"
                          className="w-full gap-2"
                        >
                          <Download className="w-3 h-3" />
                          Download
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {isGenerating && (
                  <Card className="overflow-hidden border-dashed">
                    <div className="aspect-square p-4 bg-muted/30 flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <Sparkles className="w-8 h-8 mx-auto animate-spin text-primary" />
                        <p className="text-xs text-muted-foreground">Generating...</p>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <p className="text-xs font-medium mb-2 text-muted-foreground">
                        Generating icon {generatedIcons.length + 1}...
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
              ) : isGenerating ? (
                <div className="text-center py-8">
                  <Sparkles className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Starting generation...</p>
                </div>
              ) : null}

              {generatedIcons.length > 0 && (
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={handleDownloadAll}
                    className="gap-2"
                    disabled={isGenerating || generatedIcons.filter(i => i.image).length === 0}
                  >
                    <Download className="w-4 h-4" />
                    Download All
                  </Button>
                  <Button
                    onClick={() => {
                      reset();
                      setSettingsConfigured(false);
                      setPrompt('');
                      setVariants(['']);
                      setUseVariants(false);
                    }}
                    variant="outline"
                  >
                    Generate Another Set
                  </Button>
                </div>
              )}
            </>
          ) : generatedIcon ? (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Generated Icon</h2>
                <p className="text-sm text-muted-foreground mb-3">
                  Style: <span className="font-medium capitalize">{style}</span> • 
                  Size: <span className="font-medium">{size}x{size}</span>
                </p>
                {actualPrompt && (
                  <div className="p-3 bg-muted/50 rounded-lg border border-border/50 mb-4">
                    <p className="text-xs font-medium mb-1 text-muted-foreground">Actual Prompt Sent to Gemini AI:</p>
                    <p className="text-xs text-foreground font-mono break-words">{actualPrompt}</p>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <img
                  src={generatedIcon}
                  alt="Generated icon"
                  className="max-w-full max-h-96 mx-auto rounded-lg border border-border shadow-lg"
                />
              </div>

              <div className="flex gap-3 justify-center">
                <Button
                  onClick={handleDownload}
                  className="gap-2"
                >
                  Download Icon
                </Button>
                <Button
                  onClick={() => {
                    reset();
                    setSettingsConfigured(false);
                    setPrompt('');
                    setVariants(['']);
                    setUseVariants(false);
                  }}
                  variant="outline"
                >
                  Generate Another
                </Button>
              </div>
            </>
          ) : null}
        </>
      ) : (
        <>
          {!settingsConfigured ? (
            <Card className="space-y-6 p-6">
              <div className="text-center mb-4">
                <h2 className="text-xl font-semibold mb-2">Upload Icon to Upgrade</h2>
                <p className="text-sm text-muted-foreground">Select an existing icon to enhance with AI</p>
              </div>

              {!originalIcon ? (
                <ImageUpload
                  onImageSelect={(file) => handleIconSelect(file, upgradeLevel, style)}
                  disabled={isGenerating}
                  label="Upload Icon"
                  description="Drag and drop or click to select an icon to upgrade"
                />
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium mb-2">Uploaded Icon:</p>
                    <img
                      src={originalIcon}
                      alt="Original icon"
                      className="max-w-32 max-h-32 mx-auto rounded"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="upgrade-level">Upgrade Level</Label>
                      <Select value={upgradeLevel} onValueChange={setUpgradeLevel}>
                        <SelectTrigger id="upgrade-level">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low (Subtle)</SelectItem>
                          <SelectItem value="medium">Medium (Balanced)</SelectItem>
                          <SelectItem value="high">High (Maximum)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="upgrade-style">Style</Label>
                      <Select value={style} onValueChange={setStyle}>
                        <SelectTrigger id="upgrade-style">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="modern">Modern</SelectItem>
                          <SelectItem value="minimalist">Minimalist</SelectItem>
                          <SelectItem value="bold">Bold</SelectItem>
                          <SelectItem value="outline">Outline</SelectItem>
                          <SelectItem value="filled">Filled</SelectItem>
                          <SelectItem value="gradient">Gradient</SelectItem>
                          <SelectItem value="3d">3D</SelectItem>
                          <SelectItem value="flat">Flat</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        reset();
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Change Icon
                    </Button>
                    <Button
                      onClick={handleSettingsReady}
                      className="flex-1"
                    >
                      Continue to Upgrade
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ) : !generatedIcon ? (
            <Card className="space-y-6 p-6">
              <div className="text-center mb-4">
                <h2 className="text-xl font-semibold mb-2">Ready to Upgrade</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Level: <span className="font-medium capitalize">{upgradeLevel}</span> • 
                  Style: <span className="font-medium capitalize">{style}</span>
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Button onClick={() => setSettingsConfigured(false)} variant="ghost" size="sm">
                    Change Settings
                  </Button>
                </div>
              </div>

              {originalIcon && (
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium mb-2">Original Icon:</p>
                    <img
                      src={originalIcon}
                      alt="Original icon"
                      className="max-w-32 max-h-32 mx-auto rounded"
                    />
                  </div>

                  <Button
                    onClick={handleUpgrade}
                    className="w-full"
                    disabled={isGenerating}
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Zap className="w-4 h-4 mr-2 animate-spin" />
                        Upgrading Icon...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Upgrade Icon
                      </>
                    )}
                  </Button>
                </div>
              )}
            </Card>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Upgraded Icon</h2>
                <p className="text-sm text-muted-foreground mb-3">
                  Level: <span className="font-medium capitalize">{upgradeLevel}</span> • 
                  Style: <span className="font-medium capitalize">{style}</span>
                </p>
                {actualPrompt && (
                  <div className="p-3 bg-muted/50 rounded-lg border border-border/50 mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-muted-foreground">Actual Prompt Sent to Gemini AI:</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => handleCopyPrompt(actualPrompt, 'upgrade-prompt')}
                      >
                        {copiedPromptId === 'upgrade-prompt' ? (
                          <>
                            <Check className="w-3 h-3 mr-1" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-foreground font-mono break-words">{actualPrompt}</p>
                  </div>
                )}
              </div>

              <ImageComparison
                originalImage={originalIcon || ''}
                enhancedImage={generatedIcon}
                isProcessing={isGenerating}
                onDownload={handleDownload}
                originalLabel="Original"
                processedLabel="Upgraded"
              />

              <div className="flex gap-3 justify-center pt-4">
                <Button
                  onClick={() => {
                    reset();
                    setSettingsConfigured(false);
                    reset();
                    setSettingsConfigured(false);
                  }}
                  variant="outline"
                >
                  Upgrade Another
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
};

