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
import { WorkflowHeader } from "@/components/shared/WorkflowHeader";
import { WorkflowCard } from "@/components/shared/WorkflowCard";
import { useLogoGeneration } from "@/hooks/useLogoGeneration";
import { downloadImage, downloadImageInFormat } from "@/lib/utils";
import { toast } from "sonner";
import { Palette, Sparkles, Copy, Check, Download } from "lucide-react";

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
    <div className="space-y-6 animate-fade-in">
      <WorkflowHeader
        icon={Palette}
        title="Logo Generator"
        description="Create professional logos for your brand. Generate unique designs with AI-powered creativity."
        iconColor="text-orange-400"
        iconBgColor="bg-orange-500/20"
        backButton={<BackButton onClick={onBack} variant="floating" />}
      />
      
      {/* Step Indicator */}
      <div className="mb-6">
        <StepIndicator steps={steps} />
      </div>

      {/* Enhanced Mode Selection */}
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
              <Palette className="w-4 h-4" />
              Upgrade
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {mode === 'generate' ? (
        <>
          {!settingsConfigured ? (
            <WorkflowCard
              title="Describe Your Logo"
              description="Enter company details and customize the style"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name" className="text-sm font-semibold text-foreground">Company Name <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                  <Input
                    id="company-name"
                    placeholder="TechCorp, MyBrand"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="bg-card/50 backdrop-blur-sm border-2 border-primary/30 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 h-11 text-sm rounded-xl transition-all duration-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tagline" className="text-sm font-semibold text-foreground">Tagline <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                  <Input
                    id="tagline"
                    placeholder="Innovation First"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="bg-card/50 backdrop-blur-sm border-2 border-primary/30 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 h-11 text-sm rounded-xl transition-all duration-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prompt" className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Description <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="prompt"
                    placeholder="A modern tech logo with geometric shapes, clean lines, and a professional color scheme..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    className="resize-none bg-card/50 backdrop-blur-sm border-2 border-primary/30 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 text-sm rounded-xl transition-all duration-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="style" className="text-sm font-semibold text-foreground">Style</Label>
                    <Select value={style} onValueChange={setStyle}>
                      <SelectTrigger id="style" className="h-11 text-sm bg-card/50 backdrop-blur-sm border-2 border-primary/30 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 rounded-xl transition-all duration-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card/95 backdrop-blur-xl border-primary/30">
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

                  <div className="space-y-2">
                    <Label htmlFor="size" className="text-sm font-semibold text-foreground">Size</Label>
                    <Select value={size} onValueChange={setSize}>
                      <SelectTrigger id="size" className="h-11 text-sm bg-card/50 backdrop-blur-sm border-2 border-primary/30 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 rounded-xl transition-all duration-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card/95 backdrop-blur-xl border-primary/30">
                        <SelectItem value="512">512x512</SelectItem>
                        <SelectItem value="1024">1024x1024</SelectItem>
                        <SelectItem value="2048">2048x2048</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleSettingsReady}
                  className="w-full h-12 bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/90 hover:to-accent/90 text-base font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!prompt.trim() || isGenerating}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Continue to Generate
                </Button>
              </div>
            </WorkflowCard>
          ) : !generatedLogo ? (
            <WorkflowCard
              title="Ready to Generate"
              description={`${style} style • ${size}x${size} pixels`}
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
                      <Palette className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground capitalize">{style} Style</p>
                      <p className="text-xs text-muted-foreground">{size}x{size} pixels</p>
                    </div>
                  </div>
                  <Button onClick={() => setSettingsConfigured(false)} variant="outline" size="sm" className="h-8 text-xs border-primary/30 hover:bg-primary/10 transition-all duration-300 rounded-lg">
                    Edit
                  </Button>
                </div>
                <div className="p-4 bg-gradient-to-br from-card/60 to-card/40 backdrop-blur-sm rounded-xl border-2 border-primary/20 shadow-md">
                  <p className="text-sm text-foreground/90 font-medium">{prompt}</p>
                  {companyName && <p className="text-xs text-muted-foreground mt-2">Company: <span className="font-semibold">{companyName}</span></p>}
                  {tagline && <p className="text-xs text-muted-foreground mt-1">Tagline: <span className="font-semibold">{tagline}</span></p>}
                </div>
                <Button
                  onClick={handleGenerate}
                  className="w-full h-12 bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/90 hover:to-accent/90 text-base font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isGenerating || !prompt.trim()}
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      Generating Logo...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Logo
                    </>
                  )}
                </Button>
              </div>
            </WorkflowCard>
          ) : (
            <>
              <WorkflowCard
                title="Logo Generated"
                description={`${style} style • ${size}x${size} pixels`}
              >
                <div className="space-y-5">
                  {/* Result Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-primary/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground capitalize">{style} Style</p>
                        <p className="text-xs text-muted-foreground">{size}x{size} pixels</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as 'png' | 'svg')}>
                        <SelectTrigger className="h-9 w-24 text-sm bg-card/50 backdrop-blur-sm border-2 border-primary/30 focus:border-primary/60 rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card/95 backdrop-blur-xl border-primary/30">
                          <SelectItem value="png">PNG</SelectItem>
                          <SelectItem value="svg">SVG</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Generated Logo */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 rounded-xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                    <div className="relative w-full max-h-80 rounded-xl border-2 border-primary/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-8 flex items-center justify-center overflow-hidden shadow-2xl shadow-primary/20 transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-primary/30">
                      <img
                        src={generatedLogo}
                        alt="Generated logo"
                        className="w-full h-full object-contain max-h-72 rounded-lg transition-transform duration-300 group-hover:scale-[1.02]"
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
                      Download {exportFormat.toUpperCase()}
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
                      className="h-11 px-6 text-sm font-medium border-2 border-primary/30 text-foreground hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 rounded-xl"
                    >
                      New Logo
                    </Button>
                  </div>
                </div>
              </WorkflowCard>
            </>
          )}
        </>
      ) : (
        <>
          {!settingsConfigured ? (
            <WorkflowCard
              title="Upload Logo to Upgrade"
              description="Upload an existing logo to enhance its quality and style"
            >
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
                    <div className="p-3 bg-background/30 rounded-lg border border-primary/20">
                      <img
                        src={originalLogo}
                        alt="Original logo"
                        className="w-32 h-32 mx-auto object-contain rounded"
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
                        className="flex-1 h-9 text-sm border-primary/20 text-foreground/70 hover:text-foreground hover:border-primary/40"
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
            </WorkflowCard>
          ) : !generatedLogo ? (
            <WorkflowCard
              title="Ready to Upgrade"
              description={`${upgradeLevel} level • ${style} style`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-foreground/70">
                    <span className="capitalize">{upgradeLevel}</span> • <span className="capitalize">{style}</span>
                  </div>
                  <Button onClick={() => setSettingsConfigured(false)} variant="ghost" size="sm" className="h-7 text-xs text-foreground/70 hover:text-foreground">
                    Edit
                  </Button>
                </div>
                {originalLogo && (
                  <>
                    <div className="p-3 bg-background/30 rounded-lg border border-primary/20">
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
            </WorkflowCard>
          ) : (
            <>
              <WorkflowCard
                title="Logo Upgraded"
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
                    originalImage={originalLogo || ''}
                    enhancedImage={generatedLogo}
                    isProcessing={isGenerating}
                    onDownload={handleDownload}
                    originalLabel="Original"
                    processedLabel="Upgraded"
                  />

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

                  <Button
                    onClick={() => {
                      reset();
                      setSettingsConfigured(false);
                    }}
                    variant="outline"
                    className="w-full h-8 text-xs border-primary/20 text-foreground/70 hover:text-foreground hover:border-primary/40"
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

