import { Download, Loader2, Sparkles, LayoutGrid, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { BeforeAfterSlider } from "./BeforeAfterSlider";
import { QuickActions } from "./QuickActions";
import { Toggle } from "@/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ImageComparisonProps {
  originalImage: string;
  enhancedImage: string | null;
  isProcessing: boolean;
  onDownload: () => void;
  originalLabel?: string;
  processedLabel?: string;
}

type ViewMode = "side-by-side" | "slider";

export const ImageComparison = ({
  originalImage,
  enhancedImage,
  isProcessing,
  onDownload,
  originalLabel = "Original",
  processedLabel = "Processed",
}: ImageComparisonProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>("side-by-side");
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="space-y-6">
      {/* View Mode Toggle */}
      {enhancedImage && !isProcessing && (
        <div className="flex items-center justify-center gap-3 mb-6">
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                pressed={viewMode === "side-by-side"}
                onPressedChange={(pressed) => setViewMode(pressed ? "side-by-side" : "slider")}
                aria-label="Side by side view"
                className="gap-2 rounded-lg h-10 px-4 transition-all duration-300"
              >
                <LayoutGrid className="w-4 h-4" />
                Side by Side
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Compare images side by side</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                pressed={viewMode === "slider"}
                onPressedChange={(pressed) => setViewMode(pressed ? "slider" : "side-by-side")}
                aria-label="Slider view"
                className="gap-2 rounded-lg h-10 px-4 transition-all duration-300"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Slider
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Drag to compare images</TooltipContent>
          </Tooltip>
        </div>
      )}

      {/* Slider View */}
      {viewMode === "slider" && enhancedImage && !isProcessing ? (
        <div className="animate-fade-in">
          <BeforeAfterSlider
            beforeImage={originalImage}
            afterImage={enhancedImage}
            beforeLabel={originalLabel}
            afterLabel={processedLabel}
          />
        </div>
      ) : (
        /* Side by Side View */
        <div className="grid md:grid-cols-2 gap-4">
          {/* Original Image */}
          <Card className="overflow-hidden transition-all duration-300 hover:shadow-md border">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4 text-center text-muted-foreground">
                {originalLabel}
              </h3>
              {originalImage ? (
                <div className="relative aspect-video bg-muted/20 rounded-lg overflow-hidden border">
                  <img
                    src={originalImage}
                    alt="Original"
                    className="w-full h-full object-contain"
                    onLoad={() => setImageLoaded(true)}
                  />
                </div>
              ) : (
                <div className="aspect-video bg-muted/20 rounded-lg flex items-center justify-center border border-dashed">
                  <p className="text-muted-foreground text-sm">No image uploaded</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced/Translated Image */}
          <Card className="overflow-hidden transition-all duration-300 hover:shadow-md border relative">
            {enhancedImage && !isProcessing && (
              <div className="absolute top-3 right-3 z-10">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
            )}
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4 text-center flex items-center justify-center gap-2">
                {processedLabel}
                {enhancedImage && !isProcessing && (
                  <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium">
                    Ready
                  </span>
                )}
              </h3>
              {isProcessing ? (
                <div className="aspect-video bg-primary/10 rounded-lg flex flex-col items-center justify-center gap-4 border border-dashed border-primary/50">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <div className="text-center space-y-1">
                    <p className="text-foreground font-medium text-sm">Processing...</p>
                    <p className="text-xs text-muted-foreground">This may take a few moments</p>
                  </div>
                </div>
              ) : enhancedImage ? (
                <div className="relative aspect-video bg-muted/20 rounded-lg overflow-hidden border border-primary/20">
                  <img
                    src={enhancedImage}
                    alt="Processed"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-muted/20 rounded-lg flex items-center justify-center border border-dashed">
                  <p className="text-muted-foreground text-sm text-center px-4">
                    Processing result will appear here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      {enhancedImage && !isProcessing && (
        <div className="flex justify-center animate-fade-in pt-6">
          <QuickActions
            onDownload={onDownload}
            label={processedLabel}
          />
        </div>
      )}
    </div>
  );
};

