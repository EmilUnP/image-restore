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
  const [settingsConfigured, setSettingsConfigured] = useState(false);
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
    setSettingsConfigured(false);
  };

  const handleSettingsReady = async () => {
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
    
    // Trigger generation for generate mode
    if (mode === 'generate') {
      await handleGenerate();
    }
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
  const steps: Array<{ number: number; label: string; status: "completed" | "current" | "upcoming" }> = [
    { number: 1, label: mode === 'generate' ? "Describe" : "Upload", status: (currentStep > 1 ? "completed" : currentStep === 1 ? "current" : "upcoming") as "completed" | "current" | "upcoming" },
    { number: 2, label: mode === 'generate' ? "Generate" : "Upgrade", status: (currentStep > 2 ? "completed" : currentStep === 2 ? "current" : "upcoming") as "completed" | "current" | "upcoming" },
    { number: 3, label: "Result", status: (currentStep >= 3 ? (hasResults ? "current" : "upcoming") : "upcoming") as "completed" | "current" | "upcoming" },
  ];

  return (
    <>
      <BackButton onClick={onBack} variant="floating" />
      
      {/* Step Indicator */}
      <div className="mb-4">
        <StepIndicator steps={steps} />
      </div>

      {/* Mode Selection */}
      <div className="mb-4">
        <Tabs value={mode} onValueChange={(value) => handleModeChange(value as 'generate' | 'upgrade')}>
          <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 border border-slate-700/70 p-0.5 rounded-lg h-9">
            <TabsTrigger value="generate" className="gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              <Sparkles className="w-3 h-3" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="upgrade" className="gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              <Zap className="w-3 h-3" />
              Upgrade
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {mode === 'generate' ? (
        <>
          {!settingsConfigured ? (
            <Card className="p-4 bg-slate-800/50 backdrop-blur-sm border-slate-700/70">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="prompt" className="text-xs text-slate-400">Description *</Label>
                  <Textarea
                    id="prompt"
                    placeholder="A modern phone icon, minimalist home icon..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={3}
                    className="resize-none bg-slate-900/50 border-slate-700/70 text-slate-100 placeholder:text-slate-500 focus:border-primary/50 text-sm"
                  />
                </div>

                <div className="flex items-center space-x-2 p-2 border border-slate-700/70 rounded bg-slate-900/30">
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
                  <Label htmlFor="use-variants" className="cursor-pointer text-xs text-slate-300">
                    Generate Multiple Variants
                  </Label>
                </div>

                {useVariants && (
                  <div className="space-y-2 p-3 border border-slate-700/70 rounded bg-slate-900/20">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-slate-400">Variants</Label>
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
                            className="flex-1 h-8 text-sm bg-slate-900/50 border-slate-700/70"
                          />
                          {variants.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeVariant(index)}
                              className="h-8 w-8 p-0 text-slate-400 hover:text-red-400"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="style" className="text-xs text-slate-400">Style</Label>
                    <Select value={style} onValueChange={setStyle}>
                      <SelectTrigger id="style" className="h-9 text-sm bg-slate-900/50 border-slate-700/70">
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

                  <div className="space-y-1.5">
                    <Label htmlFor="size" className="text-xs text-slate-400">Size</Label>
                    <Select value={size} onValueChange={setSize}>
                      <SelectTrigger id="size" className="h-9 text-sm bg-slate-900/50 border-slate-700/70">
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
                  className="w-full h-9 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-sm font-semibold"
                  disabled={!prompt.trim() || isGenerating || (useVariants && variants.every(v => !v.trim()))}
                >
                  Generate
                </Button>
              </div>
            </Card>
          ) : generatedIcons.length > 0 || isGenerating ? (
            <Card className="p-4 bg-slate-800/50 backdrop-blur-sm border-slate-700/70">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-400">
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
                          <div className="aspect-square p-2 bg-slate-900/50 rounded border border-slate-700/70 flex items-center justify-center hover:border-primary/50 transition-colors">
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
                            <div className="absolute inset-0 bg-slate-900/90 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center gap-1">
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
                        <div className="aspect-square p-2 bg-slate-900/50 rounded border border-dashed border-slate-700/70 flex items-center justify-center">
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
                    <div className="flex items-center justify-between pt-2 border-t border-slate-700/70">
                      <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as 'png' | 'svg')}>
                        <SelectTrigger className="h-7 w-20 text-xs bg-slate-900/50 border-slate-700/70">
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
                            setSettingsConfigured(false);
                            setPrompt('');
                            setVariants(['']);
                            setUseVariants(false);
                          }}
                          variant="outline"
                          className="h-7 px-3 text-xs border-slate-700/70 text-slate-300 hover:text-slate-100"
                        >
                          New
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
          ) : generatedIcon ? (
            <Card className="p-4 bg-slate-800/50 backdrop-blur-sm border-slate-700/70">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    <span className="capitalize">{style}</span> • {size}x{size}
                  </div>
                  <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as 'png' | 'svg')}>
                    <SelectTrigger className="h-7 w-20 text-xs bg-slate-900/50 border-slate-700/70">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="png">PNG</SelectItem>
                      <SelectItem value="svg">SVG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="p-4 bg-slate-900/30 rounded-lg border border-slate-700/70">
                  <img
                    src={generatedIcon}
                    alt="Generated icon"
                    className="w-full max-h-64 object-contain mx-auto"
                  />
                </div>

                {actualPrompt && (
                  <div className="p-2 bg-slate-900/50 rounded border border-slate-700/70">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] text-slate-400 uppercase">AI Prompt:</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 px-2 text-[10px]"
                        onClick={() => handleCopyPrompt(actualPrompt, 'single-prompt')}
                      >
                        {copiedPromptId === 'single-prompt' ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                      </Button>
                    </div>
                    <p className="text-[10px] text-slate-300 font-mono line-clamp-2">{actualPrompt}</p>
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
                      setSettingsConfigured(false);
                      setPrompt('');
                      setVariants(['']);
                      setUseVariants(false);
                    }}
                    variant="outline"
                    className="h-8 text-xs border-slate-700/70 text-slate-300 hover:text-slate-100"
                  >
                    New
                  </Button>
                </div>
              </div>
            </Card>
          ) : null}
        </>
      ) : (
        <>
          {!settingsConfigured ? (
            <Card className="p-4 bg-slate-800/50 backdrop-blur-sm border-slate-700/70">
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
                    <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/70">
                      <img
                        src={originalIcon}
                        alt="Original icon"
                        className="w-24 h-24 mx-auto object-contain rounded"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="upgrade-level" className="text-xs text-slate-400">Level</Label>
                        <Select value={upgradeLevel} onValueChange={setUpgradeLevel}>
                          <SelectTrigger id="upgrade-level" className="h-9 text-sm bg-slate-900/50 border-slate-700/70">
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
                        <Label htmlFor="upgrade-style" className="text-xs text-slate-400">Style</Label>
                        <Select value={style} onValueChange={setStyle}>
                          <SelectTrigger id="upgrade-style" className="h-9 text-sm bg-slate-900/50 border-slate-700/70">
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
                        className="flex-1 h-9 text-sm border-slate-700/70 text-slate-300 hover:text-slate-100"
                      >
                        Change
                      </Button>
                      <Button
                        onClick={handleSettingsReady}
                        className="flex-1 h-9 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-sm font-semibold"
                      >
                        Upgrade
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ) : !generatedIcon ? (
            <Card className="p-4 bg-slate-800/50 backdrop-blur-sm border-slate-700/70">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    <span className="capitalize">{upgradeLevel}</span> • <span className="capitalize">{style}</span>
                  </div>
                  <Button onClick={() => setSettingsConfigured(false)} variant="ghost" size="sm" className="h-7 text-xs text-slate-400 hover:text-slate-200">
                    Edit
                  </Button>
                </div>
                {originalIcon && (
                  <>
                    <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/70">
                      <img
                        src={originalIcon}
                        alt="Original icon"
                        className="w-24 h-24 mx-auto object-contain rounded"
                      />
                    </div>
                    <Button
                      onClick={handleUpgrade}
                      className="w-full h-9 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-sm font-semibold"
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
                  </>
                )}
              </div>
            </Card>
          ) : (
            <>
              <Card className="p-4 bg-slate-800/50 backdrop-blur-sm border-slate-700/70">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-400">
                      <span className="capitalize">{upgradeLevel}</span> • <span className="capitalize">{style}</span>
                    </div>
                    <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as 'png' | 'svg')}>
                      <SelectTrigger className="h-7 w-20 text-xs bg-slate-900/50 border-slate-700/70">
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
                    <div className="p-2 bg-slate-900/50 rounded border border-slate-700/70">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] text-slate-400 uppercase">AI Prompt:</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 px-2 text-[10px]"
                          onClick={() => handleCopyPrompt(actualPrompt, 'upgrade-prompt')}
                        >
                          {copiedPromptId === 'upgrade-prompt' ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                        </Button>
                      </div>
                      <p className="text-[10px] text-slate-300 font-mono line-clamp-2">{actualPrompt}</p>
                    </div>
                  )}

                  <Button
                    onClick={() => {
                      reset();
                      setSettingsConfigured(false);
                    }}
                    variant="outline"
                    className="w-full h-8 text-xs border-slate-700/70 text-slate-300 hover:text-slate-100"
                  >
                    Upgrade Another
                  </Button>
                </div>
              </Card>
            </>
          )}
        </>
      )}
    </>
  );
};

