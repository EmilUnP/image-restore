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
    <div className="space-y-4">
      {/* View Mode Toggle */}
      {enhancedImage && !isProcessing && (
        <div className="flex items-center justify-center gap-2 mb-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                pressed={viewMode === "side-by-side"}
                onPressedChange={(pressed) => setViewMode(pressed ? "side-by-side" : "slider")}
                aria-label="Side by side view"
                className="gap-2"
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
                className="gap-2"
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
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          {/* Original Image */}
          <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-4 md:p-6">
              <h3 className="text-base md:text-lg font-semibold mb-4 text-center text-muted-foreground">
                {originalLabel}
              </h3>
              {originalImage ? (
                <div className="relative aspect-video bg-muted/50 rounded-lg overflow-hidden group">
                  <img
                    src={originalImage}
                    alt="Original"
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                    onLoad={() => setImageLoaded(true)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ) : (
                <div className="aspect-video bg-muted/50 rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                  <p className="text-muted-foreground text-sm">No image uploaded</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced/Translated Image */}
          <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-4 md:p-6">
              <h3 className="text-base md:text-lg font-semibold mb-4 text-center flex items-center justify-center gap-2">
                {processedLabel}
                {enhancedImage && !isProcessing && (
                  <Sparkles className="w-4 h-4 text-primary animate-pulse-slow" />
                )}
              </h3>
              {isProcessing ? (
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex flex-col items-center justify-center gap-4 border-2 border-dashed border-primary/30">
                  <div className="relative">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <div className="absolute inset-0 w-10 h-10 border-4 border-primary/20 rounded-full" />
                  </div>
                  <div className="text-center">
                    <p className="text-foreground font-medium">Processing...</p>
                    <p className="text-xs text-muted-foreground mt-1">This may take a few moments</p>
                  </div>
                </div>
              ) : enhancedImage ? (
                <div className="relative aspect-video bg-muted/50 rounded-lg overflow-hidden group animate-scale-in">
                  <img
                    src={enhancedImage}
                    alt="Processed"
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ) : (
                <div className="aspect-video bg-muted/50 rounded-lg flex items-center justify-center border-2 border-dashed border-border">
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
        <div className="flex justify-center animate-fade-in pt-4">
          <QuickActions
            onDownload={onDownload}
            label={processedLabel}
          />
        </div>
      )}
    </div>
  );
};

