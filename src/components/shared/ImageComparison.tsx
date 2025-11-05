import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ImageComparisonProps {
  originalImage: string;
  enhancedImage: string | null;
  isProcessing: boolean;
  onDownload: () => void;
  originalLabel?: string;
  processedLabel?: string;
}

export const ImageComparison = ({
  originalImage,
  enhancedImage,
  isProcessing,
  onDownload,
  originalLabel = "Original",
  processedLabel = "Processed",
}: ImageComparisonProps) => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Original Image */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-4 text-center">{originalLabel}</h3>
          {originalImage ? (
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
              <img
                src={originalImage}
                alt="Original"
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">No image uploaded</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced/Translated Image */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-4 text-center">{processedLabel}</h3>
          {isProcessing ? (
            <div className="aspect-video bg-muted rounded-lg flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Processing...</p>
            </div>
          ) : enhancedImage ? (
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
              <img
                src={enhancedImage}
                alt="Processed"
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Processing result will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Download Button */}
      {enhancedImage && !isProcessing && (
        <div className="md:col-span-2 flex justify-center">
          <Button onClick={onDownload} size="lg" className="gap-2">
            <Download className="w-5 h-5" />
            Download {processedLabel} Image
          </Button>
        </div>
      )}
    </div>
  );
};

