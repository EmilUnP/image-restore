import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { translateImage, TranslateImageRequest, detectText, DetectTextRequest } from '@/lib/api';
import { useImageUpload } from './useImageUpload';
import { DetectedText } from '@/components/translation/TextDetectionPreview';

export const useImageTranslation = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [translatedImage, setTranslatedImage] = useState<string | null>(null);
  const [detectedTexts, setDetectedTexts] = useState<DetectedText[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const { fileToBase64 } = useImageUpload();

  const detectTextInImage = useCallback(async (
    base64Image: string
  ): Promise<DetectedText[]> => {
    setIsDetecting(true);
    try {
      const request: DetectTextRequest = {
        image: base64Image,
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

  const processTranslation = useCallback(async (
    base64Image: string,
    targetLanguage: string,
    correctedTexts?: DetectedText[]
  ) => {
    setIsProcessing(true);
    try {
      const request: TranslateImageRequest = {
        image: base64Image,
        targetLanguage,
        correctedTexts: correctedTexts?.map(t => t.text),
      };

      const data = await translateImage(request);

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
    processTranslation,
    setDetectedTexts,
    reset,
  };
};

