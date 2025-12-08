import * as React from "react";
import { X } from "lucide-react";
import { Textarea, TextareaProps } from "./textarea";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export interface TextareaWithClearProps extends TextareaProps {
  showClearButton?: boolean;
  onClear?: () => void;
}

const TextareaWithClear = React.forwardRef<HTMLTextAreaElement, TextareaWithClearProps>(
  ({ className, showClearButton = true, onClear, value, onChange, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const combinedRef = React.useCallback((node: HTMLTextAreaElement) => {
      textareaRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    }, [ref]);

    const hasValue = value !== undefined && value !== null && value !== '';

    const handleClear = () => {
      if (textareaRef.current) {
        // Create a synthetic event
        const syntheticEvent = {
          target: { value: '' },
          currentTarget: { value: '' },
        } as React.ChangeEvent<HTMLTextAreaElement>;
        
        onChange?.(syntheticEvent);
        textareaRef.current.focus();
      }
      onClear?.();
    };

    return (
      <div className="relative w-full">
        <Textarea
          ref={combinedRef}
          className={cn(showClearButton && hasValue && "pr-10", className)}
          value={value}
          onChange={onChange}
          {...props}
        />
        {showClearButton && hasValue && !props.disabled && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-7 w-7 rounded-md hover:bg-muted/50"
            onClick={handleClear}
            onMouseDown={(e) => {
              // Prevent textarea from losing focus
              e.preventDefault();
            }}
            title="Clear"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
          </Button>
        )}
      </div>
    );
  }
);
TextareaWithClear.displayName = "TextareaWithClear";

export { TextareaWithClear };
