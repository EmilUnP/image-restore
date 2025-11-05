import { Download, Loader2 } from "lucide-react";
import { Button } from "./ui/button";

interface ImageComparisonProps {
  originalImage: string;
  enhancedImage: string | null;
  isProcessing: boolean;
  onDownload: () => void;
}

export const ImageComparison = ({
  originalImage,
  enhancedImage,
  isProcessing,
  onDownload,
}: ImageComparisonProps) => {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Original Image */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Original</h3>
          <div className="relative rounded-lg overflow-hidden border border-border shadow-soft bg-card">
            <img
              src={originalImage}
              alt="Original image"
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Enhanced Image */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Enhanced</h3>
          <div className="relative rounded-lg overflow-hidden border border-border shadow-soft bg-card">
            {isProcessing ? (
              <div className="flex items-center justify-center min-h-[400px] bg-muted/20">
                <div className="text-center space-y-4">
                  <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                  <p className="text-muted-foreground">Enhancing your image with AI...</p>
                </div>
              </div>
            ) : enhancedImage ? (
              <img
                src={enhancedImage}
                alt="Enhanced image"
                className="w-full h-auto"
              />
            ) : (
              <div className="flex items-center justify-center min-h-[400px] bg-muted/20">
                <p className="text-muted-foreground">
                  Enhanced version will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {enhancedImage && !isProcessing && (
        <div className="flex justify-center">
          <Button
            onClick={onDownload}
            size="lg"
            className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
          >
            <Download className="w-5 h-5" />
            Download Enhanced Image
          </Button>
        </div>
      )}
    </div>
  );
};
