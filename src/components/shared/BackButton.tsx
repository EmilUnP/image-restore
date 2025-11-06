import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  onClick: () => void;
  label?: string;
  variant?: "default" | "floating" | "inline";
  className?: string;
}

export const BackButton = ({
  onClick,
  label = "Back to Function Selection",
  variant = "default",
  className,
}: BackButtonProps) => {
  if (variant === "floating") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onClick}
            variant="outline"
            size="icon"
            className={cn(
              "fixed top-4 left-4 z-50 h-12 w-12 rounded-full shadow-lg backdrop-blur-sm bg-background/80 border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 hover:scale-110",
              className
            )}
            aria-label={label}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  if (variant === "inline") {
    return (
      <Button
        onClick={onClick}
        variant="outline"
        size="sm"
        className={cn(
          "gap-2 border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 group",
          className
        )}
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span className="hidden sm:inline">{label}</span>
        <span className="sm:hidden">Back</span>
      </Button>
    );
  }

  return (
    <Button
      onClick={onClick}
      variant="outline"
      size="lg"
      className={cn(
        "gap-2 border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 group shadow-sm hover:shadow-md",
        className
      )}
    >
      <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
      <Home className="w-4 h-4 opacity-70" />
      <span>{label}</span>
    </Button>
  );
};

