import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import { LanguageSelector } from "./LanguageSelector";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { ImageComparison } from "@/components/shared/ImageComparison";
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
  
  const {
    originalImage,
    translatedImage,
    isProcessing,
    handleImageSelect,
    reset,
  } = useImageTranslation();

  const handleSettingsReady = () => {
    setSettingsConfigured(true);
  };

  const handleDownload = () => {
    if (!translatedImage) return;
    downloadImage(translatedImage, "translated-image.png");
    toast.success("Image downloaded!");
  };

  const handleReset = () => {
    reset();
    setSettingsConfigured(false);
  };

  const languageName = LANGUAGES.find(l => l.code === selectedLanguage)?.name || selectedLanguage;

  return (
    <>
      {!settingsConfigured ? (
        <>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold mb-2">Step 1: Choose Target Language</h2>
            <p className="text-muted-foreground">Select the language you want to translate the text to</p>
          </div>
          <LanguageSelector
            language={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
            disabled={isProcessing}
          />
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleSettingsReady}
              size="lg"
              className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
            >
              Continue to Upload
              <Languages className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex justify-center pt-2">
            <Button onClick={onBack} variant="ghost" size="sm">
              ← Back to Function Selection
            </Button>
          </div>
        </>
      ) : !originalImage ? (
        <>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold mb-2">Step 2: Upload Your Image</h2>
            <p className="text-muted-foreground">
              Target language: <span className="font-semibold">{languageName}</span>
            </p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <Button onClick={() => setSettingsConfigured(false)} variant="ghost" size="sm">
                Change Language
              </Button>
              <Button onClick={onBack} variant="ghost" size="sm">
                ← Back to Function Selection
              </Button>
            </div>
          </div>
          <ImageUpload
            onImageSelect={(file) => handleImageSelect(file, selectedLanguage)}
            disabled={isProcessing}
            label="Upload Image"
            description="Drag and drop or click to select an image with text to translate"
          />
        </>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-semibold mb-1">Translation Results</h2>
              <p className="text-muted-foreground text-sm">
                Target language: <span className="font-semibold">{languageName}</span>
              </p>
            </div>
            <Button onClick={() => setSettingsConfigured(false)} variant="ghost" size="sm">
              Change Language
            </Button>
          </div>
          <ImageComparison
            originalImage={originalImage || ''}
            enhancedImage={translatedImage}
            isProcessing={isProcessing}
            onDownload={handleDownload}
            originalLabel="Original"
            processedLabel="Translated"
          />
          {translatedImage && !isProcessing && (
            <div className="flex justify-center gap-4">
              <Button onClick={handleReset} variant="outline" size="lg" disabled={isProcessing}>
                Start Over
              </Button>
            </div>
          )}
          {!translatedImage && (
            <div className="flex justify-center">
              <Button onClick={handleReset} variant="outline" size="lg" disabled={isProcessing}>
                Cancel & Start Over
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
};

