import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface QuickActionsProps {
  onDownload?: () => void;
  label?: string;
}

export const QuickActions = ({
  onDownload,
  label = "Processed",
}: QuickActionsProps) => {
  return (
    <div className="flex items-center justify-center">
      {onDownload && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onDownload}
              size="lg"
              className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 hover:shadow-lg transition-all duration-300"
            >
              <Download className="w-5 h-5" />
              Download {label} Image
            </Button>
          </TooltipTrigger>
          <TooltipContent>Download the processed image</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};

