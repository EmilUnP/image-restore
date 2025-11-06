import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle2, Edit2, Save, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

interface TextDetectionPreviewProps {
  image: string;
  detectedTexts: DetectedText[];
  onTextsUpdate: (texts: DetectedText[]) => void;
  onContinue: (correctedTexts: DetectedText[]) => void;
  onSkip?: () => void;
  isProcessing?: boolean;
}

export const TextDetectionPreview = ({
  image,
  detectedTexts,
  onTextsUpdate,
  onContinue,
  onSkip,
  isProcessing = false,
}: TextDetectionPreviewProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedTexts, setEditedTexts] = useState<DetectedText[]>(detectedTexts);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

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

  const handleEdit = (id: string, currentText: string) => {
    setEditingId(id);
    setEditValues({ ...editValues, [id]: currentText });
  };

  const handleSave = (id: string) => {
    const updatedTexts = editedTexts.map((text) =>
      text.id === id
        ? { ...text, text: editValues[id] || text.text, confidence: 1.0 }
        : text
    );
    setEditedTexts(updatedTexts);
    onTextsUpdate(updatedTexts);
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValues({});
  };

  const handleRemove = (id: string) => {
    const updatedTexts = editedTexts.filter((text) => text.id !== id);
    setEditedTexts(updatedTexts);
    onTextsUpdate(updatedTexts);
  };

  const handleAddNew = () => {
    const newText: DetectedText = {
      id: `new-${Date.now()}`,
      text: "",
      confidence: 1.0,
    };
    const updatedTexts = [...editedTexts, newText];
    setEditedTexts(updatedTexts);
    setEditingId(newText.id);
    setEditValues({ ...editValues, [newText.id]: "" });
  };

  const averageConfidence =
    editedTexts.length > 0
      ? editedTexts.reduce((sum, text) => sum + text.confidence, 0) / editedTexts.length
      : 0;

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-primary" />
            Text Detection Results
          </CardTitle>
          <CardDescription>
            Review and correct detected text before translation. Low confidence scores may need manual correction.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-foreground">{editedTexts.length}</div>
              <div className="text-sm text-muted-foreground">Text Blocks Detected</div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-foreground">
                {(averageConfidence * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Average Confidence</div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-foreground">
                {editedTexts.filter((t) => t.confidence < 0.6).length}
              </div>
              <div className="text-sm text-muted-foreground">Low Confidence</div>
            </div>
          </div>

          {averageConfidence < 0.7 && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Low average confidence detected. Please review and correct the text below for better translation results.
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

      {/* Detected Texts List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Detected Text Blocks</CardTitle>
            <Button
              onClick={handleAddNew}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Add Text
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {editedTexts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No text detected in the image.</p>
              <p className="text-sm mt-2">You can add text manually using the button above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {editedTexts.map((detectedText, index) => (
                <Card
                  key={detectedText.id}
                  className={`border-2 transition-all ${
                    detectedText.confidence < 0.6
                      ? "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20"
                      : detectedText.confidence < 0.8
                      ? "border-yellow-200 bg-yellow-50/50 dark:border-yellow-900 dark:bg-yellow-950/20"
                      : "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-sm text-primary">
                        {index + 1}
                      </div>
                      <div className="flex-1 space-y-2">
                        {editingId === detectedText.id ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editValues[detectedText.id] || detectedText.text}
                              onChange={(e) =>
                                setEditValues({
                                  ...editValues,
                                  [detectedText.id]: e.target.value,
                                })
                              }
                              className="min-h-[80px]"
                              placeholder="Enter or correct the text..."
                            />
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => handleSave(detectedText.id)}
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
                          <>
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-base font-medium flex-1">{detectedText.text || "(Empty)"}</p>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className={`${getConfidenceColor(detectedText.confidence)} text-white border-0`}
                                >
                                  {getConfidenceLabel(detectedText.confidence)} ({(detectedText.confidence * 100).toFixed(0)}%)
                                </Badge>
                                {detectedText.confidence >= 0.8 && (
                                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => handleEdit(detectedText.id, detectedText.text)}
                                variant="outline"
                                size="sm"
                                className="gap-2"
                              >
                                <Edit2 className="w-4 h-4" />
                                Edit
                              </Button>
                              <Button
                                onClick={() => handleRemove(detectedText.id)}
                                variant="outline"
                                size="sm"
                                className="gap-2 text-destructive hover:text-destructive"
                              >
                                <X className="w-4 h-4" />
                                Remove
                              </Button>
                            </div>
                          </>
                        )}
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
        {onSkip && (
          <Button
            onClick={onSkip}
            variant="outline"
            size="lg"
            disabled={isProcessing}
          >
            Skip Preview
          </Button>
        )}
        <Button
          onClick={() => onContinue(editedTexts)}
          size="lg"
          className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 hover:shadow-lg transition-all duration-300"
          disabled={isProcessing || editedTexts.length === 0}
        >
          Continue to Translation
        </Button>
      </div>
    </div>
  );
};

