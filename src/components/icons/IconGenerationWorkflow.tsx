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
import { WorkflowHeader } from "@/components/shared/WorkflowHeader";
import { WorkflowCard } from "@/components/shared/WorkflowCard";
import { useIconGeneration } from "@/hooks/useIconGeneration";
import { downloadImage, downloadImageInFormat } from "@/lib/utils";
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
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<'png' | 'svg'>('png');

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

  const handleDownloadAll = async () => {
    try {
      for (let index = 0; index < generatedIcons.length; index++) {
        const icon = generatedIcons[index];
        await new Promise(resolve => setTimeout(resolve, index * 200));
        await downloadImageInFormat(
          icon.image, 
          icon.fileName, 
          exportFormat,
          parseInt(size),
          parseInt(size)
        );
      }
      toast.success(`Downloading ${generatedIcons.length} icons as ${exportFormat.toUpperCase()}...`);
    } catch (error) {
      toast.error('Failed to download some icons');
      console.error('Download error:', error);
    }
  };

  const handleDownloadIcon = async (icon: typeof generatedIcons[0]) => {
    try {
      await downloadImageInFormat(
        icon.image, 
        icon.fileName, 
        exportFormat,
        parseInt(size),
        parseInt(size)
      );
      toast.success(`${icon.prompt} downloaded as ${exportFormat.toUpperCase()}!`);
    } catch (error) {
      toast.error('Failed to download icon');
      console.error('Download error:', error);
    }
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

  const handleDownload = async () => {
    if (!generatedIcon) return;
    try {
      await downloadImageInFormat(
        generatedIcon, 
        `icon-${Date.now()}.png`, 
        exportFormat,
        parseInt(size),
        parseInt(size)
      );
      toast.success(`Icon downloaded as ${exportFormat.toUpperCase()}!`);
    } catch (error) {
      toast.error('Failed to download icon');
      console.error('Download error:', error);
    }
  };

  const handleModeChange = (newMode: 'generate' | 'upgrade') => {
    setMode(newMode);
    setGenerationMode(newMode);
    reset();
  };

  // Removed handleSettingsReady - now we just call handleGenerate directly

  // Determine current step for step indicator
  const getCurrentStep = () => {
    if (mode === 'generate') {
      if (!prompt.trim() && !generatedIcon && !generatedIcons.length) return 1;
      if (isGenerating || generatedIcon || generatedIcons.length > 0) return 2;
      return 1;
    } else {
      if (!originalIcon) return 1;
      if (generatedIcon) return 2;
      return 1;
    }
  };

  const currentStep = getCurrentStep();
  const hasResults = generatedIcon || generatedIcons.length > 0;
  const steps: Array<{ number: number; label: string; status: "completed" | "current" | "upcoming" }> = [
    { number: 1, label: mode === 'generate' ? "Configure" : "Upload", status: (currentStep > 1 ? "completed" : currentStep === 1 ? "current" : "upcoming") as "completed" | "current" | "upcoming" },
    { number: 2, label: "Result", status: (currentStep >= 2 ? (hasResults ? "current" : "upcoming") : "upcoming") as "completed" | "current" | "upcoming" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <WorkflowHeader
        icon={Zap}
        title="Icon Generator"
        description="Generate custom icons for your projects. Create multiple variants in the same style instantly."
        iconColor="text-purple-400"
        iconBgColor="bg-purple-500/20"
        backButton={<BackButton onClick={onBack} variant="floating" />}
      />
      
      {/* Step Indicator */}
      <div className="mb-6">
        <StepIndicator steps={steps} />
      </div>

      {/* Mode Selection */}
      <div className="mb-6">
        <Tabs value={mode} onValueChange={(value) => handleModeChange(value as 'generate' | 'upgrade')}>
          <TabsList className="grid w-full grid-cols-2 bg-card/60 backdrop-blur-xl border border-primary/30 p-1 rounded-xl h-12 shadow-lg shadow-primary/5">
            <TabsTrigger 
              value="generate" 
              className="gap-2 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30 transition-all duration-300 rounded-lg"
            >
              <Sparkles className="w-4 h-4" />
              Generate
            </TabsTrigger>
            <TabsTrigger 
              value="upgrade" 
              className="gap-2 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30 transition-all duration-300 rounded-lg"
            >
              <Zap className="w-4 h-4" />
              Upgrade
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {mode === 'generate' ? (
        <>
          {!generatedIcon && !generatedIcons.length && !isGenerating ? (
            <WorkflowCard
              title="Create Your Icon"
              description="Describe what you want and customize the settings, then click Generate"
            >
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="prompt" className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Description <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="prompt"
                    placeholder="A modern phone icon, minimalist home icon..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={3}
                    className="resize-none bg-card/50 backdrop-blur-sm border-2 border-primary/30 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 text-sm rounded-xl transition-all duration-300"
                  />
                </div>

                <div className="flex items-center space-x-2 p-2 border border-primary/20 rounded bg-background/20">
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
                  <Label htmlFor="use-variants" className="cursor-pointer text-xs text-foreground/90">
                    Generate Multiple Variants
                  </Label>
                </div>

                {useVariants && (
                  <div className="space-y-2 p-3 border border-primary/20 rounded bg-background/20">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-foreground/70">Variants</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addVariant}
                        className="h-6 px-2 text-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="space-y-1.5">
                      {variants.map((variant, index) => (
                        <div key={index} className="flex gap-1.5">
                          <Input
                            placeholder={`Variant ${index + 1}`}
                            value={variant}
                            onChange={(e) => updateVariant(index, e.target.value)}
                            className="flex-1 h-8 text-sm bg-background/30 border-primary/20"
                          />
                          {variants.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeVariant(index)}
                              className="h-8 w-8 p-0 text-foreground/70 hover:text-red-400"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="style" className="text-sm font-semibold text-foreground">Style</Label>
                    <Select value={style} onValueChange={setStyle}>
                      <SelectTrigger id="style" className="h-11 text-sm bg-card/50 backdrop-blur-sm border-2 border-primary/30 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 rounded-xl transition-all duration-300">
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
                    <Label htmlFor="size" className="text-sm font-semibold text-foreground">Size</Label>
                    <Select value={size} onValueChange={setSize}>
                      <SelectTrigger id="size" className="h-11 text-sm bg-card/50 backdrop-blur-sm border-2 border-primary/30 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 rounded-xl transition-all duration-300">
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
                  onClick={handleGenerate}
                  className="w-full h-12 bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/90 hover:to-accent/90 text-base font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!prompt.trim() || isGenerating || (useVariants && variants.every(v => !v.trim()))}
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Icon
                    </>
                  )}
                </Button>
              </div>
            </WorkflowCard>
          ) : generatedIcons.length > 0 || isGenerating ? (
            <WorkflowCard
              title={isGenerating ? "Generating Icons..." : `${generatedIcons.length} Icons Generated`}
              description={`${style} style • ${size}x${size} pixels`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-foreground/70">
                    {isGenerating ? 'Generating...' : `${generatedIcons.length} icons`} • <span className="capitalize">{style}</span> • {size}x{size}
                  </div>
                  {!isGenerating && generatedIcons.length > 0 && (
                    <Button
                      onClick={handleDownloadAll}
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1.5"
                    >
                      <Download className="w-3 h-3" />
                      All
                    </Button>
                  )}
                </div>
                {generatedIcons.length > 0 ? (
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                      {generatedIcons.map((icon) => (
                        <div key={icon.id} className="group relative">
                          <div className="aspect-square p-2 bg-background/30 rounded border border-primary/20 flex items-center justify-center hover:border-primary/50 transition-colors">
                            {icon.image ? (
                              <img
                                src={icon.image}
                                alt={icon.prompt}
                                className="w-full h-full object-contain rounded"
                              />
                            ) : (
                              <Sparkles className="w-6 h-6 animate-spin text-primary" />
                            )}
                          </div>
                          {icon.image && (
                            <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center gap-1">
                              <Button
                                onClick={() => handleDownloadIcon(icon)}
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2 text-xs"
                              >
                                <Download className="w-3 h-3" />
                              </Button>
                              {icon.actualPrompt && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-xs"
                                  onClick={() => handleCopyPrompt(icon.actualPrompt || '', icon.id)}
                                >
                                  {copiedPromptId === icon.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                      {isGenerating && (
                        <div className="aspect-square p-2 bg-background/30 rounded border border-dashed border-primary/20 flex items-center justify-center">
                          <Sparkles className="w-6 h-6 animate-spin text-primary" />
                        </div>
                      )}
                    </div>
                  ) : isGenerating ? (
                    <div className="text-center py-4">
                      <Sparkles className="w-8 h-8 mx-auto animate-spin text-primary" />
                    </div>
                  ) : null}

                  {generatedIcons.length > 0 && (
                    <div className="flex items-center justify-between pt-2 border-t border-primary/20">
                      <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as 'png' | 'svg')}>
                        <SelectTrigger className="h-7 w-20 text-xs bg-background/30 border-primary/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="png">PNG</SelectItem>
                          <SelectItem value="svg">SVG</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleDownloadAll}
                          className="h-7 px-3 text-xs gap-1.5"
                          disabled={isGenerating || generatedIcons.filter(i => i.image).length === 0}
                        >
                          <Download className="w-3 h-3" />
                          All
                        </Button>
                        <Button
                        onClick={() => {
                          reset();
                          setPrompt('');
                          setVariants(['']);
                          setUseVariants(false);
                        }}
                          variant="outline"
                          className="h-7 px-3 text-xs border-primary/20 text-foreground/90 hover:text-foreground"
                        >
                          New
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
            </WorkflowCard>
          ) : generatedIcon ? (
            <WorkflowCard
              title="Icon Generated"
              description={`${style} style • ${size}x${size} pixels`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-foreground/70">
                    <span className="capitalize">{style}</span> • {size}x{size}
                  </div>
                  <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as 'png' | 'svg')}>
                    <SelectTrigger className="h-7 w-20 text-xs bg-background/30 border-primary/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="png">PNG</SelectItem>
                      <SelectItem value="svg">SVG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="p-4 bg-background/20 rounded-lg border border-primary/20">
                  <img
                    src={generatedIcon}
                    alt="Generated icon"
                    className="w-full max-h-64 object-contain mx-auto"
                  />
                </div>

                {actualPrompt && (
                  <div className="p-2 bg-background/30 rounded border border-primary/20">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] text-foreground/70 uppercase">AI Prompt:</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 px-2 text-[10px]"
                        onClick={() => handleCopyPrompt(actualPrompt, 'single-prompt')}
                      >
                        {copiedPromptId === 'single-prompt' ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                      </Button>
                    </div>
                    <p className="text-[10px] text-foreground/90 font-mono line-clamp-2">{actualPrompt}</p>
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
                        onClick={() => {
                          reset();
                          setPrompt('');
                          setVariants(['']);
                          setUseVariants(false);
                        }}
                    variant="outline"
                    className="h-8 text-xs border-primary/20 text-foreground/90 hover:text-foreground"
                  >
                    New
                  </Button>
                </div>
              </div>
            </WorkflowCard>
          ) : null}
        </>
      ) : (
        <>
          {!originalIcon ? (
            <WorkflowCard
              title="Upload Icon to Upgrade"
              description="Upload an existing icon to enhance its quality and style"
            >
              <div className="space-y-3">

                {!originalIcon ? (
                  <ImageUpload
                    onImageSelect={(file) => handleIconSelect(file, upgradeLevel, style)}
                    disabled={isGenerating}
                    label="Upload Icon"
                    description="Drag and drop or click to select"
                  />
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 bg-background/30 rounded-lg border border-primary/20">
                      <img
                        src={originalIcon}
                        alt="Original icon"
                        className="w-24 h-24 mx-auto object-contain rounded"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="upgrade-level" className="text-xs text-foreground/70">Level</Label>
                        <Select value={upgradeLevel} onValueChange={setUpgradeLevel}>
                          <SelectTrigger id="upgrade-level" className="h-9 text-sm bg-background/30 border-primary/20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="upgrade-style" className="text-xs text-foreground/70">Style</Label>
                        <Select value={style} onValueChange={setStyle}>
                          <SelectTrigger id="upgrade-style" className="h-9 text-sm bg-background/30 border-primary/20">
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

                    <div className="flex gap-2">
                      <Button
                        onClick={() => reset()}
                        variant="outline"
                        className="flex-1 h-9 text-sm border-primary/20 text-foreground/90 hover:text-foreground"
                      >
                        Change
                      </Button>
                      <Button
                        onClick={handleUpgrade}
                        className="flex-1 h-9 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-sm font-semibold"
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <>
                            <Zap className="w-3 h-3 mr-1.5 animate-spin" />
                            Upgrading...
                          </>
                        ) : (
                          <>
                            <Zap className="w-3 h-3 mr-1.5" />
                            Upgrade
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </WorkflowCard>
          ) : !generatedIcon ? (
            <div className="grid lg:grid-cols-2 gap-6">
              <WorkflowCard title="Your Icon" description="Preview the icon you want to upgrade">
                <div className="space-y-4">
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden border-2 border-primary/20 bg-slate-900/50 flex items-center justify-center">
                    <img
                      src={originalIcon}
                      alt="Original icon"
                      className="w-full h-full object-contain p-4"
                    />
                  </div>
                </div>
              </WorkflowCard>

              <WorkflowCard 
                title="Upgrade Settings" 
                description="Adjust upgrade level and style, then click Upgrade"
              >
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="upgrade-level" className="text-sm font-semibold text-foreground">Level</Label>
                      <Select value={upgradeLevel} onValueChange={setUpgradeLevel}>
                        <SelectTrigger id="upgrade-level" className="h-11 text-sm bg-card/50 backdrop-blur-sm border-2 border-primary/30 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="upgrade-style" className="text-sm font-semibold text-foreground">Style</Label>
                      <Select value={style} onValueChange={setStyle}>
                        <SelectTrigger id="upgrade-style" className="h-11 text-sm bg-card/50 backdrop-blur-sm border-2 border-primary/30 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 rounded-xl">
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

                  <Button
                    onClick={handleUpgrade}
                    className="w-full h-12 bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/90 hover:to-accent/90 text-base font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 rounded-xl disabled:opacity-50"
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Zap className="w-4 h-4 mr-2 animate-spin" />
                        Upgrading...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Upgrade Icon
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => reset()}
                    variant="outline"
                    className="w-full border-primary/30 hover:bg-primary/10"
                  >
                    Upload Different Icon
                  </Button>
                </div>
              </WorkflowCard>
            </div>
          ) : (
            <>
              <WorkflowCard
                title="Icon Upgraded"
                description={`${upgradeLevel} level • ${style} style`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-foreground/70">
                      <span className="capitalize">{upgradeLevel}</span> • <span className="capitalize">{style}</span>
                    </div>
                    <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as 'png' | 'svg')}>
                      <SelectTrigger className="h-7 w-20 text-xs bg-background/30 border-primary/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="png">PNG</SelectItem>
                        <SelectItem value="svg">SVG</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <ImageComparison
                    originalImage={originalIcon || ''}
                    enhancedImage={generatedIcon}
                    isProcessing={isGenerating}
                    onDownload={handleDownload}
                    originalLabel="Original"
                    processedLabel="Upgraded"
                  />

                  {actualPrompt && (
                    <div className="p-2 bg-background/30 rounded border border-primary/20">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] text-foreground/70 uppercase">AI Prompt:</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 px-2 text-[10px]"
                          onClick={() => handleCopyPrompt(actualPrompt, 'upgrade-prompt')}
                        >
                          {copiedPromptId === 'upgrade-prompt' ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                        </Button>
                      </div>
                      <p className="text-[10px] text-foreground/90 font-mono line-clamp-2">{actualPrompt}</p>
                    </div>
                  )}

                  <Button
                    onClick={() => {
                      reset();
                    }}
                    variant="outline"
                    className="w-full h-8 text-xs border-primary/20 text-foreground/90 hover:text-foreground"
                  >
                    Upgrade Another
                  </Button>
                </div>
              </WorkflowCard>
            </>
          )}
        </>
      )}
    </div>
  );
};

