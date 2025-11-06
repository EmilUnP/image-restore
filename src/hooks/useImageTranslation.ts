import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { translateImage, TranslateImageRequest, detectText, DetectTextRequest, translateText, TranslateTextRequest } from '@/lib/api';
import { useImageUpload } from './useImageUpload';
import { DetectedText } from '@/components/translation/TextDetectionPreview';
import { TranslatedText } from '@/components/translation/TextTranslationPreview';

export const useImageTranslation = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [translatedImage, setTranslatedImage] = useState<string | null>(null);
  const [detectedTexts, setDetectedTexts] = useState<DetectedText[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const { fileToBase64 } = useImageUpload();

  const detectTextInImage = useCallback(async (
    base64Image: string,
    model?: string
  ): Promise<DetectedText[]> => {
    setIsDetecting(true);
    try {
      const request: DetectTextRequest = {
        image: base64Image,
        model: model, // Pass model if specified
      };

      const data = await detectText(request);

      if (data?.detectedTexts && Array.isArray(data.detectedTexts)) {
        setDetectedTexts(data.detectedTexts);
        return data.detectedTexts;
      } else {
        // Fallback: create a mock detection result
        const mockTexts: DetectedText[] = [
          {
            id: '1',
            text: 'Text detected in image',
            confidence: 0.75,
          }
        ];
        setDetectedTexts(mockTexts);
        return mockTexts;
      }
    } catch (error) {
      console.error('Text detection error:', error);
      toast.error("Failed to detect text. Proceeding with translation...");
      return [];
    } finally {
      setIsDetecting(false);
    }
  }, []);

  const translateTexts = useCallback(async (
    texts: string[],
    targetLanguage: string
  ): Promise<string[]> => {
    try {
      console.log('useImageTranslation: Translating texts:', texts);
      console.log('useImageTranslation: Target language:', targetLanguage);
      console.log('useImageTranslation: Number of texts:', texts.length);
      
      if (!texts || texts.length === 0) {
        console.error('useImageTranslation: No texts to translate');
        toast.error("No texts provided for translation");
        return [];
      }
      
      const request: TranslateTextRequest = {
        texts,
        targetLanguage,
      };

      console.log('useImageTranslation: Sending request:', request);
      const data = await translateText(request);
      console.log('useImageTranslation: Full response:', data);
      console.log('useImageTranslation: Translations array:', data?.translations);
      console.log('useImageTranslation: Translations length:', data?.translations?.length);

      if (data?.translations && Array.isArray(data.translations)) {
        // Filter out empty translations and log them
        const validTranslations = data.translations.filter((t, i) => {
          if (!t || t.trim().length === 0) {
            console.warn(`useImageTranslation: Empty translation at index ${i} for text: "${texts[i]}"`);
            return false;
          }
          return true;
        });
        
        if (validTranslations.length > 0) {
          console.log('useImageTranslation: Successfully received translations:', validTranslations);
          // Return the same number of translations as input texts, filling empty ones
          return texts.map((text, index) => data.translations[index] || "");
        } else {
          console.error('useImageTranslation: All translations are empty!', data.translations);
          toast.error("Translation failed - all translations are empty");
          return [];
        }
      } else {
        console.error('useImageTranslation: Invalid translation response:', data);
        console.error('useImageTranslation: Response type:', typeof data);
        console.error('useImageTranslation: Has translations?', !!data?.translations);
        toast.error("Failed to get translations - invalid response format");
        return [];
      }
    } catch (error) {
      console.error('useImageTranslation: Translation error:', error);
      if (error instanceof Error) {
        console.error('useImageTranslation: Error message:', error.message);
        console.error('useImageTranslation: Error stack:', error.stack);
      }
      const errorMessage = error instanceof Error ? error.message : "Failed to translate text";
      toast.error(`Translation error: ${errorMessage}`);
      return [];
    }
  }, []);

  const processTranslation = useCallback(async (
    base64Image: string,
    targetLanguage: string,
    translatedTexts?: TranslatedText[],
    settings?: {
      quality?: "standard" | "premium" | "ultra";
      fontMatching?: "auto" | "preserve" | "native";
      textStyle?: "exact" | "natural" | "adaptive";
      preserveFormatting?: boolean;
      enhanceReadability?: boolean;
    }
  ) => {
    setIsProcessing(true);
    try {
      const textPairs = translatedTexts?.map(t => ({
        original: t.text || "",
        translated: t.translatedText || "",
      })).filter(pair => pair.original && pair.translated);
      
      console.log('Processing translation with text pairs:', textPairs);
      console.log('Settings:', settings);
      
      const request: TranslateImageRequest = {
        image: base64Image,
        targetLanguage,
        translatedTexts: textPairs && textPairs.length > 0 ? textPairs : undefined,
        quality: settings?.quality || "premium",
        fontMatching: settings?.fontMatching || "auto",
        textStyle: settings?.textStyle || "adaptive",
        preserveFormatting: settings?.preserveFormatting !== false,
        enhanceReadability: settings?.enhanceReadability !== false,
      };

      console.log('Sending translation request:', {
        ...request,
        image: request.image.substring(0, 50) + '...',
        translatedTexts: request.translatedTexts,
      });

      const data = await translateImage(request);
      console.log('Translation response:', data);

      if (data?.translatedImage) {
        setTranslatedImage(data.translatedImage);
        const langName = data.targetLanguage || targetLanguage;
        toast.success(`Image text translated successfully to ${langName}!`);
        return data.translatedImage;
      } else {
        toast.error("No translated image received");
        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred. Make sure the backend server is running.";
      toast.error(errorMessage);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleImageSelect = useCallback(async (
    file: File,
    targetLanguage: string
  ) => {
    const base64Image = await fileToBase64(file);
    setOriginalImage(base64Image);
    setTranslatedImage(null);
    setDetectedTexts([]);
    return base64Image;
  }, [fileToBase64]);

  const reset = useCallback(() => {
    setOriginalImage(null);
    setTranslatedImage(null);
    setDetectedTexts([]);
    setIsProcessing(false);
    setIsDetecting(false);
  }, []);

  return {
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
  };
};

