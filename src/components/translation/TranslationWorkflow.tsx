import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Languages, Loader2 } from "lucide-react";
import { LanguageSelector } from "./LanguageSelector";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { ImageComparison } from "@/components/shared/ImageComparison";
import { TextDetectionAndTranslation, DetectedText, TranslatedText } from "./TextDetectionAndTranslation";
import { TranslationSettingsComponent, TranslationSettings as TranslationSettingsType } from "./TranslationSettings";
import { BackButton } from "@/components/shared/BackButton";
import { StepIndicator } from "@/components/shared/StepIndicator";
import { useImageTranslation } from "@/hooks/useImageTranslation";
import { downloadImage } from "@/lib/utils";
import { toast } from "sonner";
import { LANGUAGES } from "@/lib/constants";

interface TranslationWorkflowProps {
  onBack: () => void;
}

export const TranslationWorkflow = ({ onBack }: TranslationWorkflowProps) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");
  const [settingsConfigured, setSettingsConfigured] = useState<boolean>(false);
  const [showTextDetection, setShowTextDetection] = useState<boolean>(false);
  const [isTranslatingText, setIsTranslatingText] = useState<boolean>(false);
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

  const handleSettingsReady = () => {
    setSettingsConfigured(true);
  };

  const handleImageUpload = async (file: File) => {
    // Set image in hook and get base64
    const base64Image = await handleImageSelect(file, selectedLanguage);
    
    if (base64Image) {
      // Auto-detect text after image is set
      const texts = await detectTextInImage(base64Image);
      if (texts.length > 0) {
        setShowTextDetection(true);
      } else {
        toast.error("No text detected in the image");
      }
    }
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

  const handleApplyTranslation = async (finalTranslatedTexts: TranslatedText[]) => {
    setShowTextDetection(false);
    
    if (originalImage) {
      await processTranslation(originalImage, selectedLanguage, finalTranslatedTexts, translationSettings);
    }
  };

  const handleDownload = () => {
    if (!translatedImage) return;
    downloadImage(translatedImage, "translated-image.png");
    toast.success("Image downloaded!");
  };

  const languageName = LANGUAGES.find(l => l.code === selectedLanguage)?.name || selectedLanguage;

  // Determine current step for step indicator
  const getCurrentStep = () => {
    if (!settingsConfigured) return 1;
    if (!originalImage) return 2;
    if (showTextDetection && originalImage) return 3;
    return 4;
  };

  const currentStep = getCurrentStep();
  const steps: Array<{ number: number; label: string; status: "completed" | "current" | "upcoming" }> = [
    { number: 1, label: "Settings", status: currentStep > 1 ? "completed" : currentStep === 1 ? "current" : "upcoming" },
    { number: 2, label: "Upload", status: currentStep > 2 ? "completed" : currentStep === 2 ? "current" : "upcoming" },
    { number: 3, label: "Review", status: currentStep > 3 ? "completed" : currentStep === 3 ? "current" : "upcoming" },
    { number: 4, label: "Results", status: currentStep >= 4 ? (translatedImage ? "current" : "upcoming") : "upcoming" },
  ];

  return (
    <>
      <BackButton onClick={onBack} variant="floating" />
      
      {/* Step Indicator */}
      <div className="mb-6">
        <StepIndicator steps={steps} />
      </div>

      {!settingsConfigured ? (
        <>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold mb-3 bg-gradient-to-r from-slate-100 via-primary to-slate-100 bg-clip-text text-transparent">
              Configure Translation Settings
            </h2>
            <p className="text-sm text-slate-400">Select language and adjust translation quality options</p>
          </div>
          <LanguageSelector
            language={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
            disabled={isProcessing}
          />
          <div className="mt-4">
            <TranslationSettingsComponent
              settings={translationSettings}
              onSettingsChange={setTranslationSettings}
              disabled={isProcessing}
            />
          </div>
          <div className="flex justify-center pt-6">
            <Button
              onClick={handleSettingsReady}
              size="lg"
              className="gap-2 h-12 bg-gradient-to-r from-primary via-primary to-accent hover:opacity-90 font-bold shadow-lg shadow-primary/30 hover:shadow-primary/40 transition-all duration-300"
            >
              Continue to Upload
              <Languages className="w-4 h-4" />
            </Button>
          </div>
        </>
      ) : !originalImage ? (
        <>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold mb-3 bg-gradient-to-r from-slate-100 via-primary to-slate-100 bg-clip-text text-transparent">
              Upload Your Image
            </h2>
            <p className="text-sm text-slate-400 mb-4">
              Target language: <span className="font-medium text-slate-300">{languageName}</span>
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button onClick={() => setSettingsConfigured(false)} variant="ghost" size="sm" className="text-slate-300 hover:text-slate-100 hover:bg-slate-800/50">
                Change Settings
              </Button>
            </div>
          </div>
          <ImageUpload
            onImageSelect={handleImageUpload}
            disabled={isProcessing || isDetecting}
            label="Upload Image"
            description="Drag and drop or click to select an image with text to translate"
          />
          {isDetecting && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground mt-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Detecting text in image...</span>
            </div>
          )}
        </>
      ) : showTextDetection && originalImage ? (
        <>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold mb-3 bg-gradient-to-r from-slate-100 via-primary to-slate-100 bg-clip-text text-transparent">
              Review & Translate Text
            </h2>
            <p className="text-sm text-slate-400">
              Review detected text, edit if needed, then translate to <span className="font-medium text-slate-300">{languageName}</span>
            </p>
          </div>
          <TextDetectionAndTranslation
            image={originalImage}
            detectedTexts={detectedTexts}
            targetLanguage={selectedLanguage}
            targetLanguageName={languageName}
            onTextsUpdate={setDetectedTexts}
            onTranslate={handleTranslateTexts}
            onApply={handleApplyTranslation}
            isTranslating={isTranslatingText}
            isApplying={isProcessing}
          />
        </>
      ) : (
        <>
          <div className="mb-6">
            <h2 className="text-3xl font-extrabold mb-3 bg-gradient-to-r from-slate-100 via-primary to-slate-100 bg-clip-text text-transparent">
              Translation Results
            </h2>
            <p className="text-sm text-slate-400">
              Language: <span className="font-medium text-slate-300">{languageName}</span> • 
              Quality: <span className="font-medium capitalize text-slate-300">{translationSettings.quality}</span> • 
              Style: <span className="font-medium capitalize text-slate-300">{translationSettings.textStyle}</span>
            </p>
          </div>
          <ImageComparison
            originalImage={originalImage || ''}
            enhancedImage={translatedImage}
            isProcessing={isProcessing}
            onDownload={handleDownload}
            originalLabel="Original"
            processedLabel="Translated"
          />
        </>
      )}
    </>
  );
};

