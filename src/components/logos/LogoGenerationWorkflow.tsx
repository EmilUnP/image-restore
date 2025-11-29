import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { ImageComparison } from "@/components/shared/ImageComparison";
import { BackButton } from "@/components/shared/BackButton";
import { StepIndicator } from "@/components/shared/StepIndicator";
import { useLogoGeneration } from "@/hooks/useLogoGeneration";
import { downloadImage, downloadImageInFormat } from "@/lib/utils";
import { toast } from "sonner";
import { Palette, Sparkles, Copy, Check } from "lucide-react";

interface LogoGenerationWorkflowProps {
  onBack: () => void;
}

export const LogoGenerationWorkflow = ({ onBack }: LogoGenerationWorkflowProps) => {
  const [mode, setMode] = useState<'generate' | 'upgrade'>('generate');
  const [prompt, setPrompt] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [tagline, setTagline] = useState('');
  const [style, setStyle] = useState('modern');
  const [size, setSize] = useState('1024');
  const [upgradeLevel, setUpgradeLevel] = useState('medium');
  const [settingsConfigured, setSettingsConfigured] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [exportFormat, setExportFormat] = useState<'png' | 'svg'>('png');

  const {
    generatedLogo,
    actualPrompt,
    originalLogo,
    isGenerating,
    setGenerationMode,
    generateLogoFromText,
    upgradeExistingLogo,
    handleLogoSelect,
    reset,
    setIsGenerating,
  } = useLogoGeneration();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a description for the logo');
      return;
    }
    await generateLogoFromText(prompt, style, size, companyName || undefined, tagline || undefined);
  };

  const handleUpgrade = async () => {
    if (!originalLogo) return;
    await upgradeExistingLogo(originalLogo, upgradeLevel, style);
  };

  const handleDownload = async () => {
    if (!generatedLogo) return;
    try {
      await downloadImageInFormat(
        generatedLogo, 
        `logo-${Date.now()}.png`, 
        exportFormat,
        parseInt(size),
        parseInt(size)
      );
      toast.success(`Logo downloaded as ${exportFormat.toUpperCase()}!`);
    } catch (error) {
      toast.error('Failed to download logo');
      console.error('Download error:', error);
    }
  };

  const handleCopyPrompt = async (promptText: string) => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopiedPrompt(true);
      toast.success('Prompt copied to clipboard! You can now reuse it with small changes.');
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch (error) {
      toast.error('Failed to copy prompt');
    }
  };

  const handleModeChange = (newMode: 'generate' | 'upgrade') => {
    setMode(newMode);
    setGenerationMode(newMode);
    reset();
    setSettingsConfigured(false);
  };

  const handleSettingsReady = () => {
    if (mode === 'generate' && !prompt.trim()) {
      toast.error('Please enter a description for the logo');
      return;
    }
    if (mode === 'upgrade' && !originalLogo) {
      toast.error('Please upload a logo first');
      return;
    }
    setSettingsConfigured(true);
  };

  // Determine current step for step indicator
  const getCurrentStep = () => {
    if (!settingsConfigured) return 1;
    if (mode === 'generate' && !prompt.trim()) return 2;
    if (mode === 'upgrade' && !originalLogo) return 2;
    return 3;
  };

  const currentStep = getCurrentStep();
  const steps = [
    { number: 1, label: mode === 'generate' ? "Describe" : "Upload", status: (currentStep > 1 ? "completed" : currentStep === 1 ? "current" : "upcoming") as "current" | "completed" | "upcoming" },
    { number: 2, label: mode === 'generate' ? "Generate" : "Upgrade", status: (currentStep > 2 ? "completed" : currentStep === 2 ? "current" : "upcoming") as "current" | "completed" | "upcoming" },
    { number: 3, label: "Result", status: (currentStep >= 3 ? (generatedLogo ? "current" : "upcoming") : "upcoming") as "current" | "completed" | "upcoming" },
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
              <Palette className="w-3 h-3" />
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
                  <Label htmlFor="company-name" className="text-xs text-slate-400">Company Name (Optional)</Label>
                  <Input
                    id="company-name"
                    placeholder="TechCorp, MyBrand"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="bg-slate-900/50 border-slate-700/70 text-slate-100 placeholder:text-slate-500 focus:border-primary/50 h-9 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="tagline" className="text-xs text-slate-400">Tagline (Optional)</Label>
                  <Input
                    id="tagline"
                    placeholder="Innovation First"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="bg-slate-900/50 border-slate-700/70 text-slate-100 placeholder:text-slate-500 focus:border-primary/50 h-9 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="prompt" className="text-xs text-slate-400">Description *</Label>
                  <Textarea
                    id="prompt"
                    placeholder="A modern tech logo with geometric shapes..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={3}
                    className="resize-none bg-slate-900/50 border-slate-700/70 text-slate-100 placeholder:text-slate-500 focus:border-primary/50 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="style" className="text-xs text-slate-400">Style</Label>
                    <Select value={style} onValueChange={setStyle}>
                      <SelectTrigger id="style" className="h-9 text-sm bg-slate-900/50 border-slate-700/70">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="classic">Classic</SelectItem>
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

                  <div className="space-y-1.5">
                    <Label htmlFor="size" className="text-xs text-slate-400">Size</Label>
                    <Select value={size} onValueChange={setSize}>
                      <SelectTrigger id="size" className="h-9 text-sm bg-slate-900/50 border-slate-700/70">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="512">512x512</SelectItem>
                        <SelectItem value="1024">1024x1024</SelectItem>
                        <SelectItem value="2048">2048x2048</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleSettingsReady}
                  className="w-full h-9 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-sm font-semibold"
                  disabled={!prompt.trim() || isGenerating}
                >
                  Generate
                </Button>
              </div>
            </Card>
          ) : !generatedLogo ? (
            <Card className="p-4 bg-slate-800/50 backdrop-blur-sm border-slate-700/70">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    <span className="capitalize">{style}</span> • {size}x{size}
                  </div>
                  <Button onClick={() => setSettingsConfigured(false)} variant="ghost" size="sm" className="h-7 text-xs text-slate-400 hover:text-slate-200">
                    Edit
                  </Button>
                </div>
                <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/70">
                  <p className="text-xs text-slate-300">{prompt}</p>
                  {companyName && <p className="text-xs text-slate-400 mt-1">Company: {companyName}</p>}
                  {tagline && <p className="text-xs text-slate-400 mt-0.5">Tagline: {tagline}</p>}
                </div>
                <Button
                  onClick={handleGenerate}
                  className="w-full h-9 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-sm font-semibold"
                  disabled={isGenerating || !prompt.trim()}
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="w-3 h-3 mr-1.5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 mr-1.5" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
            </Card>
          ) : (
            <>
              <Card className="p-4 bg-slate-800/50 backdrop-blur-sm border-slate-700/70">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-400">
                      <span className="capitalize">{style}</span> • {size}x{size}
                    </div>
                    <div className="flex items-center gap-2">
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
                  </div>
                  
                  <div className="relative group">
                    <img
                      src={generatedLogo}
                      alt="Generated logo"
                      className="w-full max-h-64 object-contain rounded-lg border border-slate-700/70 bg-slate-900/30 p-4"
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
                          onClick={() => handleCopyPrompt(actualPrompt)}
                        >
                          {copiedPrompt ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
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
                        setCompanyName('');
                        setTagline('');
                      }}
                      variant="outline"
                      className="h-8 text-xs border-slate-700/70 text-slate-300 hover:text-slate-100 hover:bg-slate-800/50"
                    >
                      New
                    </Button>
                  </div>
                </div>
              </Card>
            </>
          )}
        </>
      ) : (
        <>
          {!settingsConfigured ? (
            <Card className="p-4 bg-slate-800/50 backdrop-blur-sm border-slate-700/70">
              <div className="space-y-3">

                {!originalLogo ? (
                  <ImageUpload
                    onImageSelect={(file) => handleLogoSelect(file, upgradeLevel, style)}
                    disabled={isGenerating}
                    label="Upload Logo"
                    description="Drag and drop or click to select"
                  />
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/70">
                      <img
                        src={originalLogo}
                        alt="Original logo"
                        className="w-32 h-32 mx-auto object-contain rounded"
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
                            <SelectItem value="classic">Classic</SelectItem>
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
          ) : !generatedLogo ? (
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
                {originalLogo && (
                  <>
                    <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/70">
                      <img
                        src={originalLogo}
                        alt="Original logo"
                        className="w-32 h-32 mx-auto object-contain rounded"
                      />
                    </div>
                    <Button
                      onClick={handleUpgrade}
                      className="w-full h-9 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-sm font-semibold"
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <Palette className="w-3 h-3 mr-1.5 animate-spin" />
                          Upgrading...
                        </>
                      ) : (
                        <>
                          <Palette className="w-3 h-3 mr-1.5" />
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
                    originalImage={originalLogo || ''}
                    enhancedImage={generatedLogo}
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
                          onClick={() => handleCopyPrompt(actualPrompt)}
                        >
                          {copiedPrompt ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
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

