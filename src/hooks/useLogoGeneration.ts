import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { generateLogo, GenerateLogoRequest, upgradeLogo, UpgradeLogoRequest } from '@/lib/api';
import { useImageUpload } from './useImageUpload';

export interface GeneratedLogo {
  id: string;
  image: string;
  prompt?: string;
  fileName: string;
  timestamp: number;
}

export const useLogoGeneration = () => {
  const [generatedLogo, setGeneratedLogo] = useState<string | null>(null);
  const [actualPrompt, setActualPrompt] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationMode, setGenerationMode] = useState<'generate' | 'upgrade'>('generate');
  const [originalLogo, setOriginalLogo] = useState<string | null>(null);
  const { fileToBase64 } = useImageUpload();

  const generateLogoFromText = useCallback(async (
    prompt: string,
    style: string = 'modern',
    size: string = '1024',
    companyName?: string,
    tagline?: string
  ) => {
    setIsGenerating(true);
    try {
      const request: GenerateLogoRequest = {
        prompt,
        style,
        size,
        companyName,
        tagline,
      };

      const data = await generateLogo(request);

      // Debug logging
      console.log('[Logo Generation] Full API response:', data);
      console.log('[Logo Generation] actualPrompt in response:', data?.actualPrompt);
      console.log('[Logo Generation] Has generatedLogo:', !!data?.generatedLogo);

      // Always set the actual prompt if available, even if logo generation failed
      if (data?.actualPrompt) {
        console.log('[Logo Generation] Setting actualPrompt:', data.actualPrompt.substring(0, 100) + '...');
        setActualPrompt(data.actualPrompt);
      } else {
        console.warn('[Logo Generation] No actualPrompt in response!');
        setActualPrompt(null);
      }

      if (data?.generatedLogo) {
        setGeneratedLogo(data.generatedLogo);
        if (data.error) {
          toast.warning(data.error);
        } else {
          toast.success('Logo generated successfully!');
        }
        return data.generatedLogo;
      } else {
        const errorMsg = data?.error || "No logo generated";
        toast.error(errorMsg);
        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred. Make sure the backend server is running.";
      toast.error(errorMessage);
      setActualPrompt(null);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const upgradeExistingLogo = useCallback(async (
    base64Image: string,
    upgradeLevel: string = 'medium',
    style: string = 'modern'
  ) => {
    setIsGenerating(true);
    try {
      const request: UpgradeLogoRequest = {
        image: base64Image,
        upgradeLevel,
        style,
      };

      const data = await upgradeLogo(request);

      if (data?.upgradedLogo) {
        setGeneratedLogo(data.upgradedLogo);
        setActualPrompt(data.actualPrompt || null);
        toast.success('Logo upgraded successfully!');
        return data.upgradedLogo;
      } else {
        toast.error("Logo upgrade failed");
        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
      toast.error(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const handleLogoSelect = useCallback(async (
    file: File
  ) => {
    const base64Image = await fileToBase64(file);
    setOriginalLogo(base64Image);
    setGeneratedLogo(null);
    // Don't automatically start upgrade - let user review and configure first
  }, [fileToBase64]);

  const reset = useCallback(() => {
    setGeneratedLogo(null);
    setActualPrompt(null);
    setOriginalLogo(null);
    setIsGenerating(false);
  }, []);

  return {
    generatedLogo,
    actualPrompt,
    originalLogo,
    isGenerating,
    generationMode,
    setGenerationMode,
    generateLogoFromText,
    upgradeExistingLogo,
    handleLogoSelect,
    reset,
    setIsGenerating,
  };
};

