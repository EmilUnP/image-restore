import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import { LanguageSelector } from "./LanguageSelector";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { ImageComparison } from "@/components/shared/ImageComparison";
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

  const languageName = LANGUAGES.find(l => l.code === selectedLanguage)?.name || selectedLanguage;

  return (
    <>
      <BackButton onClick={onBack} variant="floating" />
      {!settingsConfigured ? (
        <>
          <div className="text-center mb-6 animate-fade-in">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div className="h-1 w-16 bg-muted rounded-full">
                <div className="h-full w-0 bg-primary rounded-full transition-all duration-300" />
              </div>
              <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold text-sm">
                2
              </div>
            </div>
            <h2 className="text-xl md:text-2xl font-semibold mb-2">Choose Target Language</h2>
            <p className="text-muted-foreground text-sm md:text-base">Select the language you want to translate the text to</p>
          </div>
          <LanguageSelector
            language={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
            disabled={isProcessing}
          />
          <div className="flex justify-center pt-6">
            <Button
              onClick={handleSettingsReady}
              size="lg"
              className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 hover:shadow-lg transition-all duration-300"
            >
              Continue to Upload
              <Languages className="w-5 h-5" />
            </Button>
          </div>
        </>
      ) : !originalImage ? (
        <>
          <div className="text-center mb-6 animate-fade-in">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                ✓
              </div>
              <div className="h-1 w-16 bg-primary rounded-full" />
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                2
              </div>
            </div>
            <h2 className="text-xl md:text-2xl font-semibold mb-2">Upload Your Image</h2>
            <p className="text-muted-foreground">
              Target language: <span className="font-semibold">{languageName}</span>
            </p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <Button onClick={() => setSettingsConfigured(false)} variant="ghost" size="sm">
                Change Language
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
            <div className="flex items-center gap-2">
              <Button onClick={() => setSettingsConfigured(false)} variant="ghost" size="sm">
                Change Language
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

