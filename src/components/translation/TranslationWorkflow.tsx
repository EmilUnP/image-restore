import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Languages, Loader2, X, RefreshCw, Plus } from "lucide-react";
import { LanguageSelector } from "./LanguageSelector";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { ImageComparison } from "@/components/shared/ImageComparison";
import { TextDetectionAndTranslation, DetectedText, TranslatedText } from "./TextDetectionAndTranslation";
import { TranslationSettingsComponent, TranslationSettings as TranslationSettingsType } from "./TranslationSettings";
import { BackButton } from "@/components/shared/BackButton";
import { StepIndicator } from "@/components/shared/StepIndicator";
import { WorkflowHeader } from "@/components/shared/WorkflowHeader";
import { WorkflowCard } from "@/components/shared/WorkflowCard";
import { useImageTranslation } from "@/hooks/useImageTranslation";
import { useImageUpload } from "@/hooks/useImageUpload";
import { downloadImage } from "@/lib/utils";
import { toast } from "sonner";
import { LANGUAGES } from "@/lib/constants";

interface TranslationWorkflowProps {
  onBack: () => void;
}

export const TranslationWorkflow = ({ onBack }: TranslationWorkflowProps) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDetectingText, setIsDetectingText] = useState<boolean>(false);
  const [isTranslatingText, setIsTranslatingText] = useState<boolean>(false);
  const [currentWorkflowStep, setCurrentWorkflowStep] = useState<'upload' | 'config' | 'detect-translate' | 'results'>('upload');
  const [translationSettings, setTranslationSettings] = useState<TranslationSettingsType>({
    quality: "premium",
    fontMatching: "auto",
    textStyle: "adaptive",
    preserveFormatting: true,
    enhanceReadability: true,
  });
  
  const {
    originalImage,
    translatedImage,
    detectedTexts,
    isProcessing,
    isDetecting,
    handleImageSelect,
    detectTextInImage,
    translateTexts,
    processTranslation,
    setDetectedTexts,
    reset,
  } = useImageTranslation();
  
  const { fileToBase64 } = useImageUpload();

  const handleImageUpload = async (file: File) => {
    // Just upload and store image, then auto-detect text
    const base64Image = await fileToBase64(file);
    setUploadedImage(base64Image);
    setIsDetectingText(true);
    
    // Always set image in hook so user can proceed even if no text detected
    await handleImageSelect(file, selectedLanguage);
    
    // Auto-detect text
    try {
      const texts = await detectTextInImage(base64Image);
      if (texts.length > 0) {
        toast.success(`Detected ${texts.length} text block${texts.length === 1 ? '' : 's'}`);
      } else {
        toast.warning("No text detected automatically. You can add text manually or retry detection.");
      }
      // Move to config step after upload
      setCurrentWorkflowStep('config');
    } catch (error) {
      console.error('Text detection error:', error);
      toast.warning("Text detection failed. You can add text manually or retry detection.");
      // Still move to config step so user can configure
      setCurrentWorkflowStep('config');
    } finally {
      setIsDetectingText(false);
    }
  };

  const handleRetryDetection = async () => {
    const imageToDetect = uploadedImage || originalImage;
    if (!imageToDetect) {
      toast.error("Please upload an image first");
      return;
    }

    setIsDetectingText(true);
    try {
      const texts = await detectTextInImage(imageToDetect);
      if (texts.length > 0) {
        toast.success(`Detected ${texts.length} text block${texts.length === 1 ? '' : 's'}`);
      } else {
        toast.warning("No text detected. Try a different image or add text manually.");
      }
    } catch (error) {
      console.error('Text detection error:', error);
      toast.error("Failed to detect text. Please try again or add text manually.");
    } finally {
      setIsDetectingText(false);
    }
  };


  const handleAddManualText = () => {
    const newText: DetectedText = {
      id: `manual-${Date.now()}`,
      text: '',
      confidence: 1.0,
    };
    const updatedTexts = [...detectedTexts, newText];
    setDetectedTexts(updatedTexts);
    // Scroll to the new text block after a brief delay
    setTimeout(() => {
      const element = document.getElementById(`text-block-${newText.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
    toast.success("Text block added. Click 'Edit' to add your text.");
  };

  const handleTranslateTexts = async (texts: DetectedText[]): Promise<TranslatedText[]> => {
    setIsTranslatingText(true);
    try {
      const textsToTranslate = texts.map(t => t.text);
      console.log('TranslationWorkflow: Translating texts:', textsToTranslate, 'to:', selectedLanguage);
      
      const translations = await translateTexts(textsToTranslate, selectedLanguage);
      console.log('TranslationWorkflow: Received translations:', translations);
      
      if (!translations || translations.length === 0) {
        console.error('TranslationWorkflow: No translations received');
        toast.error("Failed to translate text - no translations received");
        return [];
      }
      
      // Create translated text pairs
      const translatedPairs: TranslatedText[] = texts.map((text, index) => {
        const translation = translations[index];
        console.log(`TranslationWorkflow: Pair ${index}: "${text.text}" -> "${translation}"`);
        return {
          ...text,
          translatedText: translation || "",
        };
      });
      
      // Verify we have at least some translations
      const hasValidTranslations = translatedPairs.some(t => t.translatedText && t.translatedText.trim().length > 0);
      if (!hasValidTranslations) {
        console.error('TranslationWorkflow: All translations are empty');
        toast.error("Translation failed - all translations are empty");
        return [];
      }
      
      console.log('TranslationWorkflow: Returning translated pairs:', translatedPairs);
      return translatedPairs;
    } catch (error) {
      console.error('TranslationWorkflow: Translation error:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to translate text";
      toast.error(`Translation failed: ${errorMessage}`);
      return [];
    } finally {
      setIsTranslatingText(false);
    }
  };

  const handleTranslate = async (finalTranslatedTexts: TranslatedText[]) => {
    const imageToProcess = uploadedImage || originalImage;
    if (!imageToProcess) {
      toast.error("Please upload an image first");
      return;
    }
    
    // Move to results step
    setCurrentWorkflowStep('results');
    
    // Make sure image is set in hook
    if (!originalImage && uploadedImage) {
      // Image is already detected, just process
      await processTranslation(uploadedImage, selectedLanguage, finalTranslatedTexts, translationSettings);
    } else if (originalImage) {
      await processTranslation(originalImage, selectedLanguage, finalTranslatedTexts, translationSettings);
    }
  };

  const handleDownload = () => {
    if (!translatedImage) return;
    downloadImage(translatedImage, "translated-image.png");
    toast.success("Image downloaded!");
  };

  const languageName = LANGUAGES.find(l => l.code === selectedLanguage)?.name || selectedLanguage;

  // Determine current step for step indicator based on workflow step
  const getStepNumber = (step: typeof currentWorkflowStep) => {
    switch (step) {
      case 'upload': return 1;
      case 'config': return 2;
      case 'detect-translate': return 3;
      case 'results': return 4;
      default: return 1;
    }
  };

  const currentStepNumber = getStepNumber(currentWorkflowStep);
  const steps: Array<{ number: number; label: string; status: "completed" | "current" | "upcoming" }> = [
    { number: 1, label: "Upload", status: currentStepNumber > 1 ? "completed" : currentStepNumber === 1 ? "current" : "upcoming" },
    { number: 2, label: "Config", status: currentStepNumber > 2 ? "completed" : currentStepNumber === 2 ? "current" : "upcoming" },
    { number: 3, label: "Detect & Translate", status: currentStepNumber > 3 ? "completed" : currentStepNumber === 3 ? "current" : "upcoming" },
    { number: 4, label: "Results", status: currentStepNumber >= 4 ? "current" : "upcoming" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <WorkflowHeader
        icon={Languages}
        title="Text Translation"
        description="Translate text in images to any language while preserving the original design and formatting."
        iconColor="text-green-400"
        iconBgColor="bg-green-500/20"
        backButton={<BackButton onClick={onBack} variant="floating" />}
      />
      
      {/* Step Indicator */}
      <div className="mb-6">
        <StepIndicator steps={steps} />
      </div>

      {currentWorkflowStep === 'upload' ? (
        <WorkflowCard
          title="Upload Your Image"
          description="Start by uploading an image with text you want to translate"
        >
          <ImageUpload
            onImageSelect={handleImageUpload}
            disabled={isProcessing || isDetecting || isDetectingText}
            label="Upload Image"
            description="Drag and drop or click to select an image with text to translate"
          />
          {(isDetecting || isDetectingText) && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground mt-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Detecting text in image...</span>
            </div>
          )}
        </WorkflowCard>
      ) : currentWorkflowStep === 'config' ? (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Image Preview - Left Side */}
          <WorkflowCard title="Your Image" description="Preview your uploaded image">
            <div className="space-y-4">
              <div className="relative w-full aspect-square rounded-xl overflow-hidden border-2 border-primary/20 bg-slate-900/50 group">
                <img
                  src={uploadedImage || originalImage || ''}
                  alt="Original"
                  className="w-full h-full object-contain"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-3 h-9 w-9 rounded-full bg-destructive/90 hover:bg-destructive text-destructive-foreground border-2 border-destructive-foreground/20 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl opacity-0 group-hover:opacity-100"
                  onClick={() => {
                    reset();
                    setUploadedImage(null);
                    setCurrentWorkflowStep('upload');
                  }}
                  title="Remove image"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {detectedTexts.length > 0 && (
                <div className="text-sm text-muted-foreground text-center">
                  <p><span className="font-semibold text-foreground">{detectedTexts.length}</span> text element{detectedTexts.length === 1 ? '' : 's'} detected</p>
                </div>
              )}
            </div>
          </WorkflowCard>

          {/* Configuration - Right Side */}
          <WorkflowCard 
            title="Translation Configuration" 
            description="Select target language and configure translation settings"
          >
            <div className="space-y-6">
              <LanguageSelector
                language={selectedLanguage}
                onLanguageChange={setSelectedLanguage}
                disabled={isProcessing}
              />
              
              <TranslationSettingsComponent
                settings={translationSettings}
                onSettingsChange={setTranslationSettings}
                disabled={isProcessing}
              />

              <div className="pt-4 border-t border-primary/20">
                <Button
                  onClick={() => setCurrentWorkflowStep('detect-translate')}
                  className="w-full h-12 bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/90 hover:to-accent/90 font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300"
                >
                  <Languages className="w-5 h-5 mr-2" />
                  Continue to Detect & Translate
                </Button>
              </div>
            </div>
          </WorkflowCard>
        </div>
      ) : currentWorkflowStep === 'detect-translate' ? (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Image Preview - Left Side */}
          <WorkflowCard title="Your Image" description="Preview your uploaded image with detected text">
            <div className="space-y-4">
              <div className="relative w-full aspect-square rounded-xl overflow-hidden border-2 border-primary/20 bg-slate-900/50 group">
                <img
                  src={uploadedImage || originalImage || ''}
                  alt="Original"
                  className="w-full h-full object-contain"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-3 h-9 w-9 rounded-full bg-destructive/90 hover:bg-destructive text-destructive-foreground border-2 border-destructive-foreground/20 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl opacity-0 group-hover:opacity-100"
                  onClick={() => {
                    reset();
                    setUploadedImage(null);
                    setCurrentWorkflowStep('upload');
                  }}
                  title="Remove image"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {detectedTexts.length > 0 && (
                <div className="text-sm text-muted-foreground text-center">
                  <p><span className="font-semibold text-foreground">{detectedTexts.length}</span> text element{detectedTexts.length === 1 ? '' : 's'} detected</p>
                </div>
              )}
            </div>
          </WorkflowCard>

          {/* Detection & Translation - Right Side */}
          <WorkflowCard 
            title="Text Detection & Translation" 
            description="Review detected text blocks, edit if needed, then translate to your selected language"
          >
            <div className="space-y-6">
              {detectedTexts.length > 0 ? (
                <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-accent/5 border border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <Languages className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">Text Detected!</p>
                      <p className="text-xs text-muted-foreground">
                        {detectedTexts.length} text block{detectedTexts.length === 1 ? '' : 's'} found. Review and translate below.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 via-yellow-500/5 to-orange-500/5 border border-yellow-500/20">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-yellow-500/20">
                        <Languages className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground mb-1">No Text Detected</p>
                        <p className="text-xs text-muted-foreground mb-3">
                          No text was automatically detected. You can retry detection or add text manually.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleRetryDetection}
                        disabled={isDetectingText}
                        variant="outline"
                        size="sm"
                        className="flex-1 border-primary/30 hover:bg-primary/10"
                      >
                        {isDetectingText ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Detecting...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Retry Detection
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={handleAddManualText}
                        size="sm"
                        className="flex-1 bg-primary hover:bg-primary/90"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Text Manually
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <TextDetectionAndTranslation
                image={uploadedImage || originalImage || ''}
                detectedTexts={detectedTexts}
                targetLanguage={selectedLanguage}
                targetLanguageName={languageName}
                onTextsUpdate={setDetectedTexts}
                onTranslate={handleTranslateTexts}
                onApply={handleTranslate}
                isTranslating={isTranslatingText}
                isApplying={isProcessing}
                showTranslateButton={true}
              />
            </div>
          </WorkflowCard>
        </div>
      ) : currentWorkflowStep === 'results' ? (
        <>
          {isProcessing ? (
            <WorkflowCard
              title="Generating Translated Image"
              description="Applying translations to your image. This may take a moment..."
            >
              <div className="space-y-6">
                {/* Loading State */}
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="relative">
                    <Loader2 className="w-16 h-16 animate-spin text-primary" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-primary/20 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-lg font-semibold text-foreground">Processing Translation</p>
                    <p className="text-sm text-muted-foreground max-w-md">
                      AI is replacing text in your image with translations while preserving design and formatting...
                    </p>
                  </div>
                  <div className="w-full max-w-md space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <span>Status</span>
                      <span>Processing...</span>
                    </div>
                    <div className="h-2 bg-background/30 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary via-primary to-accent rounded-full animate-pulse" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                </div>

                {/* Show original image while processing */}
                <div className="border-2 border-primary/20 rounded-xl overflow-hidden bg-slate-900/50">
                  <div className="p-4 bg-background/20 border-b border-primary/20">
                    <p className="text-sm font-semibold text-foreground">Original Image</p>
                  </div>
                  <div className="p-4">
                    <img
                      src={originalImage || uploadedImage || ''}
                      alt="Original"
                      className="w-full max-h-96 object-contain mx-auto rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </WorkflowCard>
          ) : translatedImage ? (
            <WorkflowCard
              title="Translation Results"
              description={`Language: ${languageName} • Quality: ${translationSettings.quality} • Style: ${translationSettings.textStyle}`}
            >
              <div className="space-y-6">
                <ImageComparison
                  originalImage={originalImage || uploadedImage || ''}
                  enhancedImage={translatedImage}
                  isProcessing={isProcessing}
                  onDownload={handleDownload}
                  originalLabel="Original"
                  processedLabel="Translated"
                />
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      reset();
                      setUploadedImage(null);
                      setCurrentWorkflowStep('upload');
                    }}
                    variant="outline"
                    size="default"
                    className="flex-1 border-primary/30 hover:bg-primary/10"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove Image
                  </Button>
                </div>
              </div>
            </WorkflowCard>
          ) : (
            <WorkflowCard
              title="Translation Failed"
              description="Something went wrong during the translation process"
            >
              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="p-4 rounded-full bg-destructive/20 border-2 border-destructive/30">
                    <X className="w-12 h-12 text-destructive" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-lg font-semibold text-foreground">Translation Failed</p>
                    <p className="text-sm text-muted-foreground max-w-md">
                      The translation process encountered an error. Please try again or check your connection.
                    </p>
                  </div>
                </div>

                {/* Show original image */}
                <div className="border-2 border-primary/20 rounded-xl overflow-hidden bg-slate-900/50">
                  <div className="p-4 bg-background/20 border-b border-primary/20">
                    <p className="text-sm font-semibold text-foreground">Original Image</p>
                  </div>
                  <div className="p-4">
                    <img
                      src={originalImage || uploadedImage || ''}
                      alt="Original"
                      className="w-full max-h-96 object-contain mx-auto rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setCurrentWorkflowStep('detect-translate')}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                  <Button
                    onClick={() => {
                      reset();
                      setUploadedImage(null);
                      setCurrentWorkflowStep('upload');
                    }}
                    variant="outline"
                    className="flex-1 border-primary/30 hover:bg-primary/10"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Start Over
                  </Button>
                </div>
              </div>
            </WorkflowCard>
          )}
        </>
      ) : null}
    </div>
  );
};

