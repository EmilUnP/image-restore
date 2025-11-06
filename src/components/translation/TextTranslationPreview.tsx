import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Edit2, Save, X, Languages, ArrowRight, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DetectedText } from "./TextDetectionPreview";

export interface TranslatedText extends DetectedText {
  translatedText: string;
}

interface TextTranslationPreviewProps {
  image: string;
  originalTexts: DetectedText[];
  targetLanguage: string;
  targetLanguageName: string;
  initialTranslatedTexts?: TranslatedText[];
  onTextsUpdate: (texts: TranslatedText[]) => void;
  onApply: (translatedTexts: TranslatedText[]) => void;
  onBack?: () => void;
  isTranslating?: boolean;
  isApplying?: boolean;
}

export const TextTranslationPreview = ({
  image,
  originalTexts,
  targetLanguage,
  targetLanguageName,
  initialTranslatedTexts,
  onTextsUpdate,
  onApply,
  onBack,
  isTranslating = false,
  isApplying = false,
}: TextTranslationPreviewProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [translatedTexts, setTranslatedTexts] = useState<TranslatedText[]>(initialTranslatedTexts || []);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  // Initialize translated texts when original texts change
  useEffect(() => {
    if (originalTexts.length > 0) {
      // If we have initial translations, use them
      if (initialTranslatedTexts && initialTranslatedTexts.length > 0) {
        setTranslatedTexts(initialTranslatedTexts);
        return;
      }
      
      // Check if we already have translations for these texts
      const hasTranslations = translatedTexts.length > 0 && 
        translatedTexts.every(t => originalTexts.some(ot => ot.id === t.id));
      
      if (!hasTranslations) {
        // Initialize with empty translations
        const initial: TranslatedText[] = originalTexts.map((text) => ({
          ...text,
          translatedText: "",
        }));
        setTranslatedTexts(initial);
        onTextsUpdate(initial);
      }
    }
  }, [originalTexts, initialTranslatedTexts]);

  const handleEdit = (id: string, currentText: string) => {
    setEditingId(id);
    setEditValues({ ...editValues, [id]: currentText });
  };

  const handleSave = (id: string) => {
    const updatedTexts = translatedTexts.map((text) =>
      text.id === id
        ? { ...text, translatedText: editValues[id] || text.translatedText }
        : text
    );
    setTranslatedTexts(updatedTexts);
    onTextsUpdate(updatedTexts);
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValues({});
  };

  const handleApply = () => {
    // Filter out empty translations
    const validTranslations = translatedTexts.filter(
      (text) => text.translatedText.trim().length > 0
    );
    if (validTranslations.length > 0) {
      onApply(validTranslations);
    }
  };

  const allTranslated = translatedTexts.every(
    (text) => text.translatedText.trim().length > 0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="w-5 h-5 text-primary" />
            Review Translations
          </CardTitle>
          <CardDescription>
            Review and edit the translated text before applying to the image. Target language: <span className="font-semibold">{targetLanguageName}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-foreground">{originalTexts.length}</div>
              <div className="text-sm text-muted-foreground">Text Blocks</div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-foreground">
                {translatedTexts.filter((t) => t.translatedText.trim().length > 0).length}
              </div>
              <div className="text-sm text-muted-foreground">Translated</div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-foreground">
                {translatedTexts.filter((t) => t.translatedText.trim().length === 0).length}
              </div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
          </div>

          {!allTranslated && !isTranslating && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Some text blocks are not yet translated. Please wait for translation to complete or edit them manually.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Image Preview */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="relative aspect-video bg-muted/50 rounded-lg overflow-hidden">
            <img
              src={image}
              alt="Preview"
              className="w-full h-full object-contain"
            />
          </div>
        </CardContent>
      </Card>

      {/* Translation Pairs */}
      <Card>
        <CardHeader>
          <CardTitle>Original → Translated Text</CardTitle>
          <CardDescription>
            Review and edit translations. Click on any translated text to edit it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isTranslating && translatedTexts.length === 0 ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
              <p className="text-muted-foreground">Translating text to {targetLanguageName}...</p>
            </div>
          ) : translatedTexts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No text to translate.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {translatedTexts.map((textPair, index) => (
                <Card
                  key={textPair.id}
                  className="border-2 transition-all hover:border-primary/50"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-sm text-primary">
                        {index + 1}
                      </div>
                      <div className="flex-1 space-y-3">
                        {/* Original Text */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">Original</Badge>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/50 border border-border">
                            <p className="text-sm font-medium">{textPair.text || "(Empty)"}</p>
                          </div>
                        </div>

                        {/* Arrow */}
                        <div className="flex items-center justify-center py-1">
                          <ArrowRight className="w-5 h-5 text-muted-foreground" />
                        </div>

                        {/* Translated Text */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="default" className="text-xs bg-primary">
                              {targetLanguageName}
                            </Badge>
                            {textPair.translatedText.trim().length === 0 && (
                              <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-600">
                                Pending
                              </Badge>
                            )}
                          </div>
                          {editingId === textPair.id ? (
                            <div className="space-y-2">
                              <Textarea
                                value={editValues[textPair.id] || textPair.translatedText}
                                onChange={(e) =>
                                  setEditValues({
                                    ...editValues,
                                    [textPair.id]: e.target.value,
                                  })
                                }
                                className="min-h-[80px]"
                                placeholder="Enter translation..."
                              />
                              <div className="flex items-center gap-2">
                                <Button
                                  onClick={() => handleSave(textPair.id)}
                                  size="sm"
                                  className="gap-2"
                                >
                                  <Save className="w-4 h-4" />
                                  Save
                                </Button>
                                <Button
                                  onClick={handleCancel}
                                  variant="outline"
                                  size="sm"
                                  className="gap-2"
                                >
                                  <X className="w-4 h-4" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                              {textPair.translatedText.trim().length > 0 ? (
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-sm font-medium flex-1">
                                    {textPair.translatedText}
                                  </p>
                                  <Button
                                    onClick={() => handleEdit(textPair.id, textPair.translatedText)}
                                    variant="ghost"
                                    size="sm"
                                    className="gap-2 flex-shrink-0"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                    Edit
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between">
                                  <p className="text-sm text-muted-foreground italic">
                                    Translation pending...
                                  </p>
                                  <Button
                                    onClick={() => handleEdit(textPair.id, "")}
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                    Add Translation
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4 flex-wrap">
        {onBack && (
          <Button
            onClick={onBack}
            variant="outline"
            size="lg"
            disabled={isApplying}
          >
            Back
          </Button>
        )}
        <Button
          onClick={handleApply}
          size="lg"
          className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 hover:shadow-lg transition-all duration-300"
          disabled={isApplying || !allTranslated || translatedTexts.length === 0}
        >
          {isApplying ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Applying Translation...
            </>
          ) : (
            <>
              <Languages className="w-5 h-5" />
              Apply Translation to Image
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

