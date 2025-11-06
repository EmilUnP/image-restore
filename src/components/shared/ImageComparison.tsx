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
        <div className="grid md:grid-cols-2 gap-8 md:gap-10">
          {/* Original Image */}
          <Card className="overflow-hidden transition-all duration-700 hover:shadow-2xl border-border/50 hover:border-border/70 rounded-2xl bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-sm">
            <CardContent className="p-6 md:p-8">
              <h3 className="text-xl md:text-2xl font-extrabold mb-6 text-center text-muted-foreground tracking-tight">
                {originalLabel}
              </h3>
              {originalImage ? (
                <div className="relative aspect-video bg-gradient-to-br from-muted/40 to-muted/20 rounded-2xl overflow-hidden group border-2 border-border/40 shadow-inner">
                  <img
                    src={originalImage}
                    alt="Original"
                    className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-[1.03]"
                    onLoad={() => setImageLoaded(true)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute inset-0 ring-2 ring-primary/0 group-hover:ring-primary/20 rounded-2xl transition-all duration-500" />
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-muted/40 to-muted/20 rounded-2xl flex items-center justify-center border-2 border-dashed border-border/50">
                  <p className="text-muted-foreground text-base md:text-lg font-medium">No image uploaded</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced/Translated Image */}
          <Card className="overflow-hidden transition-all duration-700 hover:shadow-2xl border-border/50 hover:border-primary/30 rounded-2xl bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-sm relative">
            {enhancedImage && !isProcessing && (
              <div className="absolute top-4 right-4 z-10">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg animate-pulse-slow" />
                  <Sparkles className="w-6 h-6 text-primary relative z-10 animate-pulse-slow" />
                </div>
              </div>
            )}
            <CardContent className="p-6 md:p-8">
              <h3 className="text-xl md:text-2xl font-extrabold mb-6 text-center flex items-center justify-center gap-3 tracking-tight">
                {processedLabel}
                {enhancedImage && !isProcessing && (
                  <span className="px-3 py-1 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 text-primary text-xs md:text-sm font-bold border border-primary/30">
                    Ready
                  </span>
                )}
              </h3>
              {isProcessing ? (
                <div className="aspect-video bg-gradient-to-br from-primary/15 via-primary/10 to-accent/15 rounded-2xl flex flex-col items-center justify-center gap-6 border-2 border-dashed border-primary/50 shadow-inner">
                  <div className="relative">
                    <Loader2 className="w-14 h-14 animate-spin text-primary" />
                    <div className="absolute inset-0 w-14 h-14 border-4 border-primary/20 rounded-full animate-pulse" />
                    <div className="absolute inset-0 w-14 h-14 border-t-4 border-primary rounded-full animate-spin" style={{ animationDuration: '1s' }} />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-foreground font-bold text-lg">Processing...</p>
                    <p className="text-sm md:text-base text-muted-foreground font-medium">This may take a few moments</p>
                  </div>
                </div>
              ) : enhancedImage ? (
                <div className="relative aspect-video bg-gradient-to-br from-muted/40 to-muted/20 rounded-2xl overflow-hidden group animate-scale-in border-2 border-primary/20 shadow-inner">
                  <img
                    src={enhancedImage}
                    alt="Processed"
                    className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute inset-0 ring-2 ring-primary/0 group-hover:ring-primary/30 rounded-2xl transition-all duration-500" />
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-muted/40 to-muted/20 rounded-2xl flex items-center justify-center border-2 border-dashed border-border/50">
                  <p className="text-muted-foreground text-base md:text-lg text-center px-4 font-medium">
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

