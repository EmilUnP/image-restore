import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { generateIcon, GenerateIconRequest, upgradeIcon, UpgradeIconRequest } from '@/lib/api';
import { useImageUpload } from './useImageUpload';

export interface GeneratedIcon {
  id: string;
  image: string;
  prompt?: string;
  fileName: string;
  timestamp: number;
}

export interface GeneratedIconVariant {
  id: string;
  image: string;
  prompt: string;
  actualPrompt?: string;
  fileName: string;
}

export const useIconGeneration = () => {
  const [generatedIcon, setGeneratedIcon] = useState<string | null>(null);
  const [generatedIcons, setGeneratedIcons] = useState<GeneratedIconVariant[]>([]);
  const [actualPrompt, setActualPrompt] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationMode, setGenerationMode] = useState<'generate' | 'upgrade'>('generate');
  const [originalIcon, setOriginalIcon] = useState<string | null>(null);
  const { fileToBase64 } = useImageUpload();

  const generateIconFromText = useCallback(async (
    prompt: string,
    style: string = 'modern',
    size: string = '512'
  ) => {
    setIsGenerating(true);
    try {
      const request: GenerateIconRequest = {
        prompt,
        style,
        size,
      };

      const data = await generateIcon(request);

      if (data?.generatedIcon) {
        setGeneratedIcon(data.generatedIcon);
        setActualPrompt(data.actualPrompt || null);
        toast.success('Icon generated successfully!');
        return data.generatedIcon;
      } else {
        toast.error("No icon generated");
        return null;
      }
    } catch (error) {
      let errorMessage = "An unexpected error occurred.";
      if (error instanceof Error) {
        errorMessage = error.message;
        // Check for common errors
        if (error.message.includes('404') || error.message.includes('Failed to fetch')) {
          errorMessage = "Backend server is not running. Please start the backend server on port 3001. Run: npm run dev:backend";
        } else if (error.message.includes('Network error')) {
          errorMessage = "Cannot connect to backend server. Make sure it's running on http://localhost:3001";
        }
      }
      toast.error(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const upgradeExistingIcon = useCallback(async (
    base64Image: string,
    upgradeLevel: string = 'medium',
    style: string = 'modern'
  ) => {
    setIsGenerating(true);
    try {
      const request: UpgradeIconRequest = {
        image: base64Image,
        upgradeLevel,
        style,
      };

      const data = await upgradeIcon(request);

      if (data?.upgradedIcon) {
        setGeneratedIcon(data.upgradedIcon);
        setActualPrompt(data.actualPrompt || null);
        toast.success('Icon upgraded successfully!');
        return data.upgradedIcon;
      } else {
        toast.error("Icon upgrade failed");
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

  const handleIconSelect = useCallback(async (
    file: File,
    upgradeLevel: string = 'medium',
    style: string = 'modern'
  ) => {
    const base64Image = await fileToBase64(file);
    setOriginalIcon(base64Image);
    setGeneratedIcon(null);
    await upgradeExistingIcon(base64Image, upgradeLevel, style);
  }, [fileToBase64, upgradeExistingIcon]);

  const generateMultipleIcons = useCallback(async (
    mainPrompt: string,
    variants: string[],
    style: string = 'modern',
    size: string = '512'
  ) => {
    setIsGenerating(true);
    setGeneratedIcons([]);
    setGeneratedIcon(null);
    setActualPrompt(null);
    
    try {
      const generated: GeneratedIconVariant[] = [];
      
      // First, generate the main icon
      try {
        const mainRequest: GenerateIconRequest = {
          prompt: mainPrompt,
          style,
          size,
          isVariant: false,
        };

        const mainData = await generateIcon(mainRequest);

        if (mainData?.generatedIcon) {
          const mainIcon: GeneratedIconVariant = {
            id: `icon-${Date.now()}-0`,
            image: mainData.generatedIcon,
            prompt: mainPrompt,
            actualPrompt: mainData.actualPrompt,
            fileName: `icon-${mainPrompt.replace(/\s+/g, '-').toLowerCase()}-main.png`,
          };
          
          generated.push(mainIcon);
          setGeneratedIcons([...generated]);
          toast.success(`Main icon generated!`, { duration: 2000 });
        } else {
          toast.error(`Failed to generate main icon: ${mainPrompt}`, { duration: 3000 });
        }
      } catch (mainError) {
        console.error(`Error generating main icon:`, mainError);
        toast.error(`Failed to generate main icon: ${mainPrompt}`, { duration: 3000 });
      }
      
      // Then generate variants with reference to the main prompt
      for (let i = 0; i < variants.length; i++) {
        const variantPrompt = variants[i];
        
        if (!variantPrompt.trim()) continue;
        
        try {
          const variantRequest: GenerateIconRequest = {
            prompt: variantPrompt,
            style,
            size,
            referencePrompt: mainPrompt, // Pass main prompt as reference
            isVariant: true, // Mark this as a variant
          };

          const variantData = await generateIcon(variantRequest);

          if (variantData?.generatedIcon) {
            const newIcon: GeneratedIconVariant = {
              id: `icon-${Date.now()}-${i + 1}`,
              image: variantData.generatedIcon,
              prompt: variantPrompt,
              actualPrompt: variantData.actualPrompt,
              fileName: `icon-${variantPrompt.replace(/\s+/g, '-').toLowerCase()}-${i + 1}.png`,
            };
            
            generated.push(newIcon);
            // Update state progressively so user sees icons appearing one by one
            setGeneratedIcons([...generated]);
            
            // Show progress toast
            toast.success(`Variant ${i + 1}/${variants.length} generated!`, { duration: 2000 });
          } else {
            toast.error(`Failed to generate variant: ${variantPrompt}`, { duration: 3000 });
          }
        } catch (variantError) {
          // Continue with next variant even if one fails
          console.error(`Error generating variant ${i + 1}:`, variantError);
          toast.error(`Failed to generate variant ${i + 1}: ${variantPrompt}`, { duration: 3000 });
        }
      }
      
      const totalExpected = 1 + variants.filter(v => v.trim()).length;

      if (generated.length > 0) {
        setGeneratedIcons(generated);
        toast.success(`Successfully generated ${generated.length} of ${totalExpected} icon${generated.length > 1 ? 's' : ''}!`);
        return generated;
      } else {
        toast.error("No icons were generated. Please check your connection and try again.");
        return [];
      }
    } catch (error) {
      let errorMessage = "An unexpected error occurred.";
      if (error instanceof Error) {
        errorMessage = error.message;
        // Check for common errors
        if (error.message.includes('404') || error.message.includes('Failed to fetch')) {
          errorMessage = "Backend server is not running. Please start the backend server on port 3001. Run: npm run dev:backend";
        } else if (error.message.includes('Network error')) {
          errorMessage = "Cannot connect to backend server. Make sure it's running on http://localhost:3001";
        }
      }
      toast.error(errorMessage);
      return [];
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const reset = useCallback(() => {
    setGeneratedIcon(null);
    setGeneratedIcons([]);
    setActualPrompt(null);
    setOriginalIcon(null);
    setIsGenerating(false);
  }, []);

  return {
    generatedIcon,
    generatedIcons,
    actualPrompt,
    originalIcon,
    isGenerating,
    generationMode,
    setGenerationMode,
    generateIconFromText,
    generateMultipleIcons,
    upgradeExistingIcon,
    handleIconSelect,
    reset,
    setIsGenerating,
  };
};

