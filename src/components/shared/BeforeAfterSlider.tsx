import { useState, useRef, useEffect, useCallback } from "react";
import { Move, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string | null;
  beforeLabel?: string;
  afterLabel?: string;
  isProcessing?: boolean;
}

export const BeforeAfterSlider = ({
  beforeImage,
  afterImage,
  beforeLabel = "Before",
  afterLabel = "After",
  isProcessing = false,
}: BeforeAfterSliderProps) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState({ before: false, after: false });
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);

  // Calculate position from event
  const calculatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return 50;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    return percentage;
  }, []);

  // Handle mouse move
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const percentage = calculatePosition(e.clientX);
    setSliderPosition(percentage);
  }, [isDragging, calculatePosition]);

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const touch = e.touches[0];
    const percentage = calculatePosition(touch.clientX);
    setSliderPosition(percentage);
  }, [isDragging, calculatePosition]);

  // Handle mouse/touch up
  const handleEnd = useCallback(() => {
    setIsDragging(false);
    // Set flag to prevent click event from firing immediately after drag
    justFinishedDragging.current = true;
    setTimeout(() => {
      justFinishedDragging.current = false;
    }, 100);
  }, []);

  // Track if we just finished dragging to prevent click from firing
  const justFinishedDragging = useRef(false);

  // Handle click to set position
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Don't set position if we just finished dragging
    if (justFinishedDragging.current) {
      justFinishedDragging.current = false;
      return;
    }
    // Don't set position if clicking on the handle
    if (handleRef.current && handleRef.current.contains(e.target as Node)) {
      return;
    }
    const percentage = calculatePosition(e.clientX);
    setSliderPosition(percentage);
  }, [calculatePosition]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setSliderPosition(prev => Math.max(0, prev - 1));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setSliderPosition(prev => Math.min(100, prev + 1));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setSliderPosition(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setSliderPosition(100);
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      setSliderPosition(50); // Reset to center
    }
  }, []);

  // Reset to center on double click
  const handleDoubleClick = useCallback(() => {
    setSliderPosition(50);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove, { passive: false });
      document.addEventListener("mouseup", handleEnd);
      document.addEventListener("touchmove", handleTouchMove, { passive: false });
      document.addEventListener("touchend", handleEnd);
      document.body.style.cursor = "ew-resize";
      document.body.style.userSelect = "none";
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleEnd);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleEnd);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDragging, handleMouseMove, handleTouchMove, handleEnd]);

  if (!afterImage || isProcessing) {
    return null;
  }

  const bothImagesLoaded = imagesLoaded.before && imagesLoaded.after;

  return (
    <Card className="overflow-hidden border-2 border-primary/20 shadow-xl">
      <CardContent className="p-0">
        <div 
          ref={containerRef}
          className="relative aspect-video bg-muted/50 rounded-lg overflow-hidden group"
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="slider"
          aria-label="Image comparison slider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={sliderPosition}
        >
          {/* Before Image (Background) */}
          <div className="absolute inset-0">
            {!imagesLoaded.before && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            )}
            <img
              src={beforeImage}
              alt={beforeLabel}
              className={`w-full h-full object-contain transition-opacity duration-300 ${
                imagesLoaded.before ? 'opacity-100' : 'opacity-0'
              }`}
              draggable={false}
              onLoad={() => setImagesLoaded(prev => ({ ...prev, before: true }))}
            />
          </div>

          {/* After Image (Clipped) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ 
              clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
              willChange: 'clip-path'
            }}
          >
            {!imagesLoaded.after && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            )}
            <img
              src={afterImage}
              alt={afterLabel}
              className={`w-full h-full object-contain transition-opacity duration-300 ${
                imagesLoaded.after ? 'opacity-100' : 'opacity-0'
              }`}
              draggable={false}
              onLoad={() => setImagesLoaded(prev => ({ ...prev, after: true }))}
            />
          </div>

          {/* Slider Line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white/90 shadow-2xl z-20 pointer-events-none transition-all duration-75"
            style={{ 
              left: `${sliderPosition}%`,
              boxShadow: '0 0 10px rgba(0,0,0,0.5), 0 0 20px rgba(255,255,255,0.3)'
            }}
          >
            {/* Slider Handle */}
            <div 
              ref={handleRef}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-2xl border-2 border-primary flex items-center justify-center cursor-ew-resize hover:scale-110 active:scale-95 transition-transform pointer-events-auto z-30"
              onMouseDown={(e) => {
                e.stopPropagation();
                setIsDragging(true);
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                setIsDragging(true);
              }}
            >
              <Move className="w-5 h-5 text-primary" />
            </div>
          </div>

          {/* Labels - positioned to show which image is actually visible on each side */}
          {/* Left side label: shows "after" image when slider is to the right, "before" when slider is all the way left */}
          <div 
            className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1.5 rounded-lg text-sm font-semibold backdrop-blur-md border border-white/10 shadow-lg z-10 transition-all duration-75"
          >
            {sliderPosition < 10 ? beforeLabel : afterLabel}
          </div>
          
          {/* Right side label: shows "before" image when slider is to the right, "after" when slider is all the way right */}
          <div
            className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-lg text-sm font-semibold backdrop-blur-md border border-white/10 shadow-lg z-10 transition-all duration-75"
          >
            {sliderPosition > 90 ? afterLabel : beforeLabel}
          </div>

          {/* Instructions */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg text-xs backdrop-blur-md border border-white/10 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
            <div className="flex items-center gap-4">
              <span>Drag to compare</span>
              <span>•</span>
              <span>Double-click to reset</span>
              <span>•</span>
              <span>Arrow keys to adjust</span>
            </div>
          </div>

          {/* Keyboard navigation hints */}
          {bothImagesLoaded && (
            <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
              <div className="bg-black/70 text-white px-2 py-1 rounded text-xs backdrop-blur-md border border-white/10">
                <ChevronLeft className="w-3 h-3 inline" /> / <ChevronRight className="w-3 h-3 inline" />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

