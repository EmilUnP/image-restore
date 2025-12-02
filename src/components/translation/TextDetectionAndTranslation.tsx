import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle2, Edit2, Save, X, Languages, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

export interface DetectedText {
  id: string;
  text: string;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface TranslatedText extends DetectedText {
  translatedText: string;
}

interface TextDetectionAndTranslationProps {
  image: string;
  detectedTexts: DetectedText[];
  targetLanguage: string;
  targetLanguageName: string;
  onTextsUpdate: (texts: DetectedText[]) => void;
  onTranslate: (texts: DetectedText[]) => Promise<TranslatedText[]>;
  onApply: (translatedTexts: TranslatedText[]) => void;
  isTranslating?: boolean;
  isApplying?: boolean;
  showTranslateButton?: boolean;
}

export const TextDetectionAndTranslation = ({
  image,
  detectedTexts,
  targetLanguage,
  targetLanguageName,
  onTextsUpdate,
  onTranslate,
  onApply,
  isTranslating = false,
  isApplying = false,
  showTranslateButton = true,
}: TextDetectionAndTranslationProps) => {
  const [editingOriginalId, setEditingOriginalId] = useState<string | null>(null);
  const [editingTranslatedId, setEditingTranslatedId] = useState<string | null>(null);
  const [originalTexts, setOriginalTexts] = useState<DetectedText[]>(detectedTexts);
  const [translatedTexts, setTranslatedTexts] = useState<TranslatedText[]>([]);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [hasTranslated, setHasTranslated] = useState<boolean>(false);

  // Update original texts when detectedTexts change
  useEffect(() => {
    if (detectedTexts.length > 0) {
      setOriginalTexts(detectedTexts);
      setTranslatedTexts([]);
      setHasTranslated(false);
    }
  }, [detectedTexts]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-500";
    if (confidence >= 0.6) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return "High";
    if (confidence >= 0.6) return "Medium";
    return "Low";
  };

  const handleEditOriginal = (id: string, currentText: string) => {
    setEditingOriginalId(id);
    setEditValues({ ...editValues, [id]: currentText });
  };

  const handleSaveOriginal = (id: string) => {
    const updatedTexts = originalTexts.map((text) =>
      text.id === id
        ? { ...text, text: editValues[id] || text.text, confidence: 1.0 }
        : text
    );
    setOriginalTexts(updatedTexts);
    onTextsUpdate(updatedTexts);
    setEditingOriginalId(null);
    // Reset translations if original text changed
    if (hasTranslated) {
      setTranslatedTexts([]);
      setHasTranslated(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingOriginalId(null);
    setEditingTranslatedId(null);
    setEditValues({});
  };

  const handleRemoveOriginal = (id: string) => {
    const updatedTexts = originalTexts.filter((text) => text.id !== id);
    setOriginalTexts(updatedTexts);
    onTextsUpdate(updatedTexts);
    // Remove corresponding translation if exists
    if (hasTranslated) {
      setTranslatedTexts(translatedTexts.filter(t => t.id !== id));
    }
  };

  const handleTranslate = async () => {
    if (originalTexts.length === 0) return;
    
    try {
      console.log('Starting translation for texts:', originalTexts.map(t => t.text));
      const translations = await onTranslate(originalTexts);
      console.log('Received translations from onTranslate:', translations);
      console.log('Translations type:', typeof translations, 'Is array:', Array.isArray(translations));
      console.log('Translations length:', translations?.length);
      
      if (translations && Array.isArray(translations) && translations.length > 0) {
        // Check if translations is already TranslatedText[] or string[]
        const isTranslatedTextArray = translations.length > 0 && typeof translations[0] === 'object' && 'translatedText' in translations[0];
        
        let validTranslations: TranslatedText[];
        if (isTranslatedTextArray) {
          // Already TranslatedText[]
          validTranslations = translations as TranslatedText[];
          console.log('Using TranslatedText[] format');
        } else {
          // It's string[], map to TranslatedText[]
          console.log('Mapping string[] to TranslatedText[]');
          const translationsArray = translations as unknown as string[];
          validTranslations = originalTexts.map((original, index) => {
            const translation = translationsArray[index];
            console.log(`Mapping ${index}: "${original.text}" -> "${translation}"`);
            return {
              ...original,
              translatedText: translation || "",
            };
          });
        }
        
        // Check if we have any actual translations (non-empty strings)
        const hasValidTranslations = validTranslations.some(t => t.translatedText && t.translatedText.trim().length > 0);
        
        if (hasValidTranslations) {
          console.log('Setting valid translations:', validTranslations);
          setTranslatedTexts(validTranslations);
          setHasTranslated(true);
        } else {
          console.error('All translations are empty!', validTranslations);
          toast.error("Translation failed - received empty translations. Please try again.");
        }
      } else {
        console.error('No translations received or empty array. Translations:', translations);
        toast.error("Translation failed - no translations received. Please check the console for details.");
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast.error(`Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleEditTranslated = (id: string, currentText: string) => {
    setEditingTranslatedId(id);
    setEditValues({ ...editValues, [`translated-${id}`]: currentText });
  };

  const handleSaveTranslated = (id: string) => {
    const updatedTexts = translatedTexts.map((text) =>
      text.id === id
        ? { ...text, translatedText: editValues[`translated-${id}`] || text.translatedText }
        : text
    );
    setTranslatedTexts(updatedTexts);
    setEditingTranslatedId(null);
  };

  const handleApply = () => {
    const validTranslations = translatedTexts.filter(
      (text) => text.translatedText && text.translatedText.trim().length > 0
    );
    
    console.log('Applying translations:', validTranslations);
    console.log('Original texts:', originalTexts);
    
    if (validTranslations.length > 0) {
      // Ensure we have both original and translated text for each
      const completeTranslations = validTranslations.map(t => ({
        ...t,
        text: t.text || originalTexts.find(ot => ot.id === t.id)?.text || "",
        translatedText: t.translatedText || "",
      }));
      
      console.log('Complete translations to apply:', completeTranslations);
      onApply(completeTranslations);
    } else {
      console.error('No valid translations to apply');
    }
  };

  const allTranslated = translatedTexts.length > 0 && translatedTexts.every(
    (text) => text.translatedText.trim().length > 0
  );

  const averageConfidence =
    originalTexts.length > 0
      ? originalTexts.reduce((sum, text) => sum + text.confidence, 0) / originalTexts.length
      : 0;

  return (
    <div className="space-y-4">
      {/* Compact Summary & Translate Button */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-accent/5 border border-primary/20">
        <div className="flex items-center gap-4 flex-1">
          <div className="p-2 rounded-lg bg-primary/20">
            <Languages className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground text-sm">
              {originalTexts.length} text block{originalTexts.length === 1 ? '' : 's'} detected
            </p>
            <p className="text-xs text-muted-foreground">
              {!hasTranslated 
                ? `Review and edit below, then translate to ${targetLanguageName}`
                : `${translatedTexts.filter((t) => t.translatedText.trim().length > 0).length} translated`}
            </p>
          </div>
        </div>
        {showTranslateButton && !hasTranslated && originalTexts.length > 0 && (
          <Button
            onClick={handleTranslate}
            size="sm"
            className="gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 h-10 px-6"
            disabled={isTranslating}
          >
            {isTranslating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Translating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Translate
              </>
            )}
          </Button>
        )}
        {hasTranslated && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs font-semibold">Done</span>
          </div>
        )}
      </div>

      {/* Text Blocks - Simplified */}
      <div className="space-y-3">
        {originalTexts.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No text blocks added yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
              {originalTexts.map((originalText, index) => {
                // Find translation by ID or by index if ID doesn't match
                let translatedText = translatedTexts.find(t => t.id === originalText.id);
                if (!translatedText && hasTranslated && translatedTexts[index]) {
                  translatedText = translatedTexts[index];
                }
                
                const isEditingOriginal = editingOriginalId === originalText.id;
                const isEditingTranslated = editingTranslatedId === originalText.id;

                return (
                  <div
                    id={`text-block-${originalText.id}`}
                    key={originalText.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      !originalText.text || originalText.text.trim().length === 0
                        ? "border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20"
                        : originalText.confidence < 0.6
                        ? "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20"
                        : originalText.confidence < 0.8
                        ? "border-yellow-200 bg-yellow-50/50 dark:border-yellow-900 dark:bg-yellow-950/20"
                        : "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs text-primary">
                        {index + 1}
                      </div>
                      <div className="flex-1 space-y-3">
                        {/* Original Text */}
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs font-medium text-muted-foreground">Original:</span>
                            {(!originalText.text || originalText.text.trim().length === 0) ? (
                              <Badge variant="outline" className="text-xs bg-blue-500 text-white border-0 h-5">
                                Manual
                              </Badge>
                            ) : originalText.confidence < 0.8 && (
                              <Badge
                                variant="outline"
                                className={`${getConfidenceColor(originalText.confidence)} text-white border-0 text-xs h-5`}
                              >
                                {(originalText.confidence * 100).toFixed(0)}%
                              </Badge>
                            )}
                          </div>
                          {isEditingOriginal ? (
                            <div className="space-y-2">
                              <Textarea
                                value={editValues[originalText.id] || originalText.text}
                                onChange={(e) =>
                                  setEditValues({
                                    ...editValues,
                                    [originalText.id]: e.target.value,
                                  })
                                }
                                className="min-h-[50px] text-sm"
                                placeholder="Enter or correct the text..."
                              />
                              <div className="flex items-center gap-2">
                                <Button
                                  onClick={() => handleSaveOriginal(originalText.id)}
                                  size="sm"
                                  className="gap-1.5 h-8 text-xs"
                                >
                                  <Save className="w-3.5 h-3.5" />
                                  Save
                                </Button>
                                <Button
                                  onClick={handleCancelEdit}
                                  variant="outline"
                                  size="sm"
                                  className="gap-1.5 h-8 text-xs"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="p-2.5 rounded-lg bg-muted/50 border border-border">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-medium flex-1">
                                  {originalText.text || <span className="text-muted-foreground italic text-xs">(Click Edit to add text)</span>}
                                </p>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <Button
                                    onClick={() => handleEditOriginal(originalText.id, originalText.text)}
                                    variant="ghost"
                                    size="sm"
                                    className="gap-1 h-7 w-7 p-0"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button
                                    onClick={() => handleRemoveOriginal(originalText.id)}
                                    variant="ghost"
                                    size="sm"
                                    className="gap-1 h-7 w-7 p-0 text-destructive hover:text-destructive"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Translated Text */}
                        {hasTranslated && (
                          <>
                            <div className="flex items-center justify-center py-0.5">
                              <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-xs font-medium text-muted-foreground">{targetLanguageName}:</span>
                                {translatedText && translatedText.translatedText.trim().length === 0 && (
                                  <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-600 h-5">
                                    Pending
                                  </Badge>
                                )}
                              </div>
                              {isEditingTranslated ? (
                                <div className="space-y-2">
                                  <Textarea
                                    value={editValues[`translated-${originalText.id}`] || (translatedText?.translatedText || "")}
                                    onChange={(e) =>
                                      setEditValues({
                                        ...editValues,
                                        [`translated-${originalText.id}`]: e.target.value,
                                      })
                                    }
                                    className="min-h-[50px] text-sm"
                                    placeholder="Enter translation..."
                                  />
                                  <div className="flex items-center gap-2">
                                    <Button
                                      onClick={() => handleSaveTranslated(originalText.id)}
                                      size="sm"
                                      className="gap-1.5 h-8 text-xs"
                                    >
                                      <Save className="w-3.5 h-3.5" />
                                      Save
                                    </Button>
                                    <Button
                                      onClick={handleCancelEdit}
                                      variant="outline"
                                      size="sm"
                                      className="gap-1.5 h-8 text-xs"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20">
                                  {translatedText && translatedText.translatedText.trim().length > 0 ? (
                                    <div className="flex items-start justify-between gap-2">
                                      <p className="text-sm font-medium flex-1">
                                        {translatedText.translatedText}
                                      </p>
                                      <Button
                                        onClick={() => handleEditTranslated(originalText.id, translatedText.translatedText)}
                                        variant="ghost"
                                        size="sm"
                                        className="gap-1 h-7 w-7 p-0 flex-shrink-0"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-between">
                                      <p className="text-sm text-muted-foreground italic">
                                        Translation pending...
                                      </p>
                                      <Button
                                        onClick={() => handleEditTranslated(originalText.id, "")}
                                        variant="outline"
                                        size="sm"
                                        className="gap-1.5 h-7 text-xs"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                        Add
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Apply Button - Simplified */}
      {hasTranslated && (
        <div className="pt-4 border-t border-primary/20">
          <Button
            onClick={handleApply}
            className="w-full h-11 bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300"
            disabled={isApplying || !allTranslated}
          >
            {isApplying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Applying to Image...
              </>
            ) : (
              <>
                <Languages className="w-4 h-4 mr-2" />
                Apply Translation to Image
              </>
            )}
          </Button>
          {!allTranslated && (
            <p className="text-xs text-yellow-600 dark:text-yellow-400 text-center mt-2">
              {translatedTexts.filter((t) => t.translatedText.trim().length === 0).length} text block(s) still need translation
            </p>
          )}
        </div>
      )}
    </div>
  );
};

