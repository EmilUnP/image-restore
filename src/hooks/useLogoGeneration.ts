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

      // Always set the actual prompt if available, even if logo generation failed
      if (data?.actualPrompt) {
        setActualPrompt(data.actualPrompt);
      }

      if (data?.generatedLogo) {
        setGeneratedLogo(data.generatedLogo);
        toast.success('Logo generated successfully!');
        return data.generatedLogo;
      } else {
        toast.error("No logo generated");
        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred. Make sure the backend server is running.";
      toast.error(errorMessage);
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
    file: File,
    upgradeLevel: string = 'medium',
    style: string = 'modern'
  ) => {
    const base64Image = await fileToBase64(file);
    setOriginalLogo(base64Image);
    setGeneratedLogo(null);
    await upgradeExistingLogo(base64Image, upgradeLevel, style);
  }, [fileToBase64, upgradeExistingLogo]);

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

