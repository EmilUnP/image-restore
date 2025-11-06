import { useState, useEffect } from "react";
import { X, FileImage, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ImagePreviewProps {
  image: string | null;
  fileName?: string;
  fileSize?: number;
  onRemove?: () => void;
  onProcess?: () => void;
  isProcessing?: boolean;
  showActions?: boolean;
}

export const ImagePreview = ({
  image,
  fileName,
  fileSize,
  onRemove,
  onProcess,
  isProcessing = false,
  showActions = true,
}: ImagePreviewProps) => {
  const [imageInfo, setImageInfo] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    if (image) {
      const img = new Image();
      img.onload = () => {
        setImageInfo({ width: img.width, height: img.height });
      };
      img.src = image;
    }
  }, [image]);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!image) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <FileImage className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm">No image selected</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="relative group">
          {/* Image */}
          <div className="relative aspect-video bg-muted/50 overflow-hidden">
            <img
              src={image}
              alt="Preview"
              className="w-full h-full object-contain"
            />
            {isProcessing && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-2" />
                  <p className="text-white text-sm">Processing...</p>
                </div>
              </div>
            )}
          </div>

          {/* Overlay Info */}
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-4 text-white">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                {fileName && (
                  <p className="text-sm font-medium truncate mb-1">{fileName}</p>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  {imageInfo && (
                    <Badge variant="secondary" className="bg-white/20 text-white border-0">
                      {imageInfo.width} × {imageInfo.height}
                    </Badge>
                  )}
                  {fileSize && (
                    <Badge variant="secondary" className="bg-white/20 text-white border-0">
                      {formatFileSize(fileSize)}
                    </Badge>
                  )}
                </div>
              </div>
              {onRemove && showActions && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 h-8 w-8"
                  onClick={onRemove}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Action Button */}
          {onProcess && showActions && !isProcessing && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                onClick={onProcess}
                className="bg-primary hover:bg-primary/90 shadow-lg"
              >
                Process Image
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

