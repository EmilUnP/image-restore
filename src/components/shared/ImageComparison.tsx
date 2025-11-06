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
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* Original Image */}
          <Card className="overflow-hidden transition-all duration-500 hover:shadow-lg border-border/60">
            <CardContent className="p-5 md:p-7">
              <h3 className="text-lg md:text-xl font-bold mb-5 text-center text-muted-foreground tracking-tight">
                {originalLabel}
              </h3>
              {originalImage ? (
                <div className="relative aspect-video bg-muted/30 rounded-xl overflow-hidden group border border-border/50">
                  <img
                    src={originalImage}
                    alt="Original"
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                    onLoad={() => setImageLoaded(true)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ) : (
                <div className="aspect-video bg-muted/30 rounded-xl flex items-center justify-center border-2 border-dashed border-border/60">
                  <p className="text-muted-foreground text-sm md:text-base">No image uploaded</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced/Translated Image */}
          <Card className="overflow-hidden transition-all duration-500 hover:shadow-lg border-border/60">
            <CardContent className="p-5 md:p-7">
              <h3 className="text-lg md:text-xl font-bold mb-5 text-center flex items-center justify-center gap-2 tracking-tight">
                {processedLabel}
                {enhancedImage && !isProcessing && (
                  <Sparkles className="w-5 h-5 text-primary animate-pulse-slow" />
                )}
              </h3>
              {isProcessing ? (
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex flex-col items-center justify-center gap-5 border-2 border-dashed border-primary/40">
                  <div className="relative">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    <div className="absolute inset-0 w-12 h-12 border-4 border-primary/20 rounded-full" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-foreground font-semibold text-base">Processing...</p>
                    <p className="text-xs md:text-sm text-muted-foreground">This may take a few moments</p>
                  </div>
                </div>
              ) : enhancedImage ? (
                <div className="relative aspect-video bg-muted/30 rounded-xl overflow-hidden group animate-scale-in border border-border/50">
                  <img
                    src={enhancedImage}
                    alt="Processed"
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ) : (
                <div className="aspect-video bg-muted/30 rounded-xl flex items-center justify-center border-2 border-dashed border-border/60">
                  <p className="text-muted-foreground text-sm md:text-base text-center px-4">
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

