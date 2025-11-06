import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Languages, Loader2 } from "lucide-react";
import { LanguageSelector } from "./LanguageSelector";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { ImageComparison } from "@/components/shared/ImageComparison";
import { TextDetectionAndTranslation, DetectedText, TranslatedText } from "./TextDetectionAndTranslation";
import { TranslationSettingsComponent, TranslationSettings as TranslationSettingsType } from "./TranslationSettings";
import { BackButton } from "@/components/shared/BackButton";
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

  return (
    <>
      <BackButton onClick={onBack} variant="floating" />
      {!settingsConfigured ? (
        <>
          <div className="text-center mb-6 animate-fade-in">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-xs">
                1
              </div>
              <div className="h-0.5 w-16 bg-muted rounded-full">
                <div className="h-full w-0 bg-primary rounded-full transition-all duration-300" />
              </div>
              <div className="w-7 h-7 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-semibold text-xs">
                2
              </div>
            </div>
            <h2 className="text-xl md:text-2xl font-semibold mb-1.5 tracking-tight">Configure Translation Settings</h2>
            <p className="text-muted-foreground text-sm">Select language and adjust translation quality options</p>
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
              className="gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-medium shadow-md hover:shadow-glow-accent transition-all duration-300 h-11 text-base rounded-lg px-6"
            >
              Continue to Upload
              <Languages className="w-4 h-4" />
            </Button>
          </div>
        </>
      ) : !originalImage ? (
        <>
          <div className="text-center mb-8 animate-fade-in">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-base shadow-md">
                ✓
              </div>
              <div className="h-1 w-20 bg-primary rounded-full" />
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-base shadow-md">
                2
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">Upload Your Image</h2>
            <p className="text-muted-foreground text-base md:text-lg mb-4">
              Target language: <span className="font-semibold text-foreground">{languageName}</span>
            </p>
            <div className="flex items-center justify-center gap-4 mt-6">
              <Button onClick={() => setSettingsConfigured(false)} variant="ghost" size="sm" className="rounded-lg">
                Change Language
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
              <span>Detecting text in image...</span>
            </div>
          )}
        </>
      ) : showTextDetection && originalImage ? (
        <>
          <div className="text-center mb-8 animate-fade-in">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-base shadow-md">
                ✓
              </div>
              <div className="h-1 w-20 bg-primary rounded-full" />
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-base shadow-md">
                2
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">Detect & Translate Text</h2>
            <p className="text-muted-foreground text-base md:text-lg">
              Review detected text, edit if needed, then translate to <span className="font-semibold text-foreground">{languageName}</span>
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight">Translation Results</h2>
              <p className="text-muted-foreground text-sm md:text-base">
                Target language: <span className="font-semibold text-foreground">{languageName}</span> • 
                Quality: <span className="font-semibold text-foreground capitalize">{translationSettings.quality}</span> • 
                Style: <span className="font-semibold text-foreground capitalize">{translationSettings.textStyle}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setSettingsConfigured(false)} variant="ghost" size="sm" className="rounded-lg">
                Change Settings
            </Button>
            </div>
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

