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
import { downloadImage } from "@/lib/utils";
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

  const handleDownload = () => {
    if (!generatedLogo) return;
    downloadImage(generatedLogo, `logo-${Date.now()}.png`);
    toast.success("Logo downloaded!");
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
      <div className="mb-6">
        <StepIndicator steps={steps} />
      </div>

      {/* Mode Selection */}
      <div className="mb-6">
        <Tabs value={mode} onValueChange={(value) => handleModeChange(value as 'generate' | 'upgrade')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Generate New Logo
            </TabsTrigger>
            <TabsTrigger value="upgrade" className="gap-2">
              <Palette className="w-4 h-4" />
              Upgrade Existing Logo
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {mode === 'generate' ? (
        <>
          {!settingsConfigured ? (
            <Card className="space-y-6 p-6">
              <div className="text-center mb-4">
                <h2 className="text-xl font-semibold mb-2">Describe Your Logo</h2>
                <p className="text-sm text-muted-foreground">Tell us about your brand and logo vision</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company/Brand Name (Optional)</Label>
                  <Input
                    id="company-name"
                    placeholder="e.g., TechCorp, MyBrand"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Your company or brand name to include in the logo
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline/Slogan (Optional)</Label>
                  <Input
                    id="tagline"
                    placeholder="e.g., Innovation First, Quality Matters"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    A short tagline or slogan to include below the logo
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prompt">Logo Description *</Label>
                  <Textarea
                    id="prompt"
                    placeholder="e.g., A modern tech company logo with geometric shapes, A classic coffee shop logo with warm colors, A minimalist fitness brand logo..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Be specific about style, colors, industry, and visual elements for best results
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="style">Style</Label>
                    <Select value={style} onValueChange={setStyle}>
                      <SelectTrigger id="style">
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

                  <div className="space-y-2">
                    <Label htmlFor="size">Size</Label>
                    <Select value={size} onValueChange={setSize}>
                      <SelectTrigger id="size">
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
                  className="w-full"
                  disabled={!prompt.trim() || isGenerating}
                >
                  Continue to Generate
                </Button>
              </div>
            </Card>
          ) : !generatedLogo ? (
            <Card className="space-y-6 p-6">
              <div className="text-center mb-4">
                <h2 className="text-xl font-semibold mb-2">Ready to Generate</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Style: <span className="font-medium capitalize">{style}</span> • 
                  Size: <span className="font-medium">{size}x{size}</span>
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Button onClick={() => setSettingsConfigured(false)} variant="ghost" size="sm">
                    Change Settings
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <p className="text-sm font-medium">Description:</p>
                  <p className="text-sm text-muted-foreground">{prompt}</p>
                  {companyName && (
                    <>
                      <p className="text-sm font-medium mt-2">Company Name:</p>
                      <p className="text-sm text-muted-foreground">{companyName}</p>
                    </>
                  )}
                  {tagline && (
                    <>
                      <p className="text-sm font-medium mt-2">Tagline:</p>
                      <p className="text-sm text-muted-foreground">{tagline}</p>
                    </>
                  )}
                </div>

                <Button
                  onClick={handleGenerate}
                  className="w-full"
                  disabled={isGenerating || !prompt.trim()}
                  size="lg"
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
            </Card>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Generated Logo</h2>
                <p className="text-sm text-muted-foreground mb-3">
                  Style: <span className="font-medium capitalize">{style}</span> • 
                  Size: <span className="font-medium">{size}x{size}</span>
                </p>
                <div className="p-3 bg-muted/50 rounded-lg border border-border/50 mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-muted-foreground">Actual Prompt Sent to Gemini AI:</p>
                    {actualPrompt && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => handleCopyPrompt(actualPrompt)}
                      >
                        {copiedPrompt ? (
                          <>
                            <Check className="w-3 h-3 mr-1" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 mr-1" />
                            Copy Prompt
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  {actualPrompt ? (
                    <>
                      <p className="text-xs text-foreground font-mono break-words whitespace-pre-wrap">{actualPrompt}</p>
                      <p className="text-[10px] text-muted-foreground mt-2 italic">
                        💡 Copy this prompt and reuse it with small changes for better results
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      Prompt information not available. Please regenerate the logo to see the prompt.
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <img
                  src={generatedLogo}
                  alt="Generated logo"
                  className="max-w-full max-h-96 mx-auto rounded-lg border border-border shadow-lg"
                />
              </div>

              <div className="flex gap-3 justify-center">
                <Button
                  onClick={handleDownload}
                  className="gap-2"
                >
                  Download Logo
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
                >
                  Generate Another
                </Button>
              </div>
            </>
          )}
        </>
      ) : (
        <>
          {!settingsConfigured ? (
            <Card className="space-y-6 p-6">
              <div className="text-center mb-4">
                <h2 className="text-xl font-semibold mb-2">Upload Logo to Upgrade</h2>
                <p className="text-sm text-muted-foreground">Select an existing logo to enhance with AI</p>
              </div>

              {!originalLogo ? (
                <ImageUpload
                  onImageSelect={async (file) => {
                    const base64 = await new Promise<string>((resolve) => {
                      const reader = new FileReader();
                      reader.onloadend = () => resolve(reader.result as string);
                      reader.readAsDataURL(file);
                    });
                    // Original logo is set by handleLogoSelect
                  }}
                  disabled={isGenerating}
                  label="Upload Logo"
                  description="Drag and drop or click to select a logo to upgrade"
                />
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium mb-2">Uploaded Logo:</p>
                    <img
                      src={originalLogo}
                      alt="Original logo"
                      className="max-w-64 max-h-64 mx-auto rounded"
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

                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        // Original logo is reset by reset() function
                        reset();
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Change Logo
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
          ) : !generatedLogo ? (
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

              {originalLogo && (
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium mb-2">Original Logo:</p>
                    <img
                      src={originalLogo}
                      alt="Original logo"
                      className="max-w-64 max-h-64 mx-auto rounded"
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
                        <Palette className="w-4 h-4 mr-2 animate-spin" />
                        Upgrading Logo...
                      </>
                    ) : (
                      <>
                        <Palette className="w-4 h-4 mr-2" />
                        Upgrade Logo
                      </>
                    )}
                  </Button>
                </div>
              )}
            </Card>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Upgraded Logo</h2>
                <p className="text-sm text-muted-foreground mb-3">
                  Level: <span className="font-medium capitalize">{upgradeLevel}</span> • 
                  Style: <span className="font-medium capitalize">{style}</span>
                </p>
                <div className="p-3 bg-muted/50 rounded-lg border border-border/50 mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-muted-foreground">Actual Prompt Sent to Gemini AI:</p>
                    {actualPrompt && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => handleCopyPrompt(actualPrompt)}
                      >
                        {copiedPrompt ? (
                          <>
                            <Check className="w-3 h-3 mr-1" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 mr-1" />
                            Copy Prompt
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  {actualPrompt ? (
                    <>
                      <p className="text-xs text-foreground font-mono break-words whitespace-pre-wrap">{actualPrompt}</p>
                      <p className="text-[10px] text-muted-foreground mt-2 italic">
                        💡 Copy this prompt and reuse it with small changes for better results
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      Prompt information not available. Please regenerate the logo to see the prompt.
                    </p>
                  )}
                </div>
              </div>

              <ImageComparison
                originalImage={originalLogo || ''}
                enhancedImage={generatedLogo}
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

