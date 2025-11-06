import { Download, Copy, Maximize2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

interface QuickActionsProps {
  image: string;
  fileName?: string;
  onDownload?: () => void;
  onReset?: () => void;
  onFullscreen?: () => void;
}

export const QuickActions = ({
  image,
  fileName = "image",
  onDownload,
  onReset,
  onFullscreen,
}: QuickActionsProps) => {
  const handleCopy = async () => {
    try {
      const response = await fetch(image);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      toast.success("Image copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy image");
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap justify-center">
      {onDownload && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onDownload}
              size="sm"
              className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
          </TooltipTrigger>
          <TooltipContent>Download the processed image</TooltipContent>
        </Tooltip>
      )}

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleCopy}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Copy className="w-4 h-4" />
            Copy
          </Button>
        </TooltipTrigger>
        <TooltipContent>Copy image to clipboard</TooltipContent>
      </Tooltip>

      {onFullscreen && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onFullscreen}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Maximize2 className="w-4 h-4" />
              Fullscreen
            </Button>
          </TooltipTrigger>
          <TooltipContent>View in fullscreen</TooltipContent>
        </Tooltip>
      )}

      {onReset && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onReset}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </TooltipTrigger>
          <TooltipContent>Start over with a new image</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};

