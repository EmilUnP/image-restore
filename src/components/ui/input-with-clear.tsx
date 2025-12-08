import * as React from "react";
import { X } from "lucide-react";
import { Input, InputProps } from "./input";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export interface InputWithClearProps extends InputProps {
  showClearButton?: boolean;
  onClear?: () => void;
}

const InputWithClear = React.forwardRef<HTMLInputElement, InputWithClearProps>(
  ({ className, showClearButton = true, onClear, value, onChange, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const combinedRef = React.useCallback((node: HTMLInputElement) => {
      inputRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    }, [ref]);

    const hasValue = value !== undefined && value !== null && value !== '';

    const handleClear = () => {
      if (inputRef.current) {
        // Create a synthetic event
        const syntheticEvent = {
          target: { value: '' },
          currentTarget: { value: '' },
        } as React.ChangeEvent<HTMLInputElement>;
        
        onChange?.(syntheticEvent);
        inputRef.current.focus();
      }
      onClear?.();
    };

    return (
      <div className="relative w-full">
        <Input
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
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-md hover:bg-muted/50"
            onClick={handleClear}
            onMouseDown={(e) => {
              // Prevent input from losing focus
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
InputWithClear.displayName = "InputWithClear";

export { InputWithClear };
