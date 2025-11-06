import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { translateImage, TranslateImageRequest } from '@/lib/api';
import { useImageUpload } from './useImageUpload';

export const useImageTranslation = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [translatedImage, setTranslatedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { fileToBase64 } = useImageUpload();

  const processTranslation = useCallback(async (
    base64Image: string,
    targetLanguage: string
  ) => {
    setIsProcessing(true);
    try {
      const request: TranslateImageRequest = {
        image: base64Image,
        targetLanguage,
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
    await processTranslation(base64Image, targetLanguage);
  }, [fileToBase64, processTranslation]);

  const reset = useCallback(() => {
    setOriginalImage(null);
    setTranslatedImage(null);
    setIsProcessing(false);
  }, []);

  return {
    originalImage,
    translatedImage,
    isProcessing,
    handleImageSelect,
    reset,
  };
};

