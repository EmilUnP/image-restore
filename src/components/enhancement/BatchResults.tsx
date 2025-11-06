import { Download, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProcessedImage {
  id: string;
  original: string;
  enhanced: string | null;
  fileName: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}

interface BatchResultsProps {
  images: ProcessedImage[];
  onDownload: (image: ProcessedImage) => void;
  onDownloadAll: () => void;
  isProcessing: boolean;
}

export const BatchResults = ({
  images,
  onDownload,
  onDownloadAll,
  isProcessing,
}: BatchResultsProps) => {
  const completedCount = images.filter(img => img.status === 'completed').length;
  const processingCount = images.filter(img => img.status === 'processing').length;
  const errorCount = images.filter(img => img.status === 'error').length;
  const totalCount = images.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const allCompleted = completedCount === totalCount && totalCount > 0;

  return (
    <div className="space-y-6">
      {/* Progress Summary */}
      <Card className="border-border">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">Processing Progress</h3>
                <p className="text-sm text-muted-foreground">
                  {completedCount} of {totalCount} images completed
                  {errorCount > 0 && ` • ${errorCount} failed`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {allCompleted && (
                  <Button
                    onClick={onDownloadAll}
                    size="sm"
                    className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  >
                    <Download className="w-4 h-4" />
                    Download All ({completedCount})
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Progress value={progress} className="h-3" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{Math.round(progress)}% complete</span>
                {isProcessing && processingCount > 0 && (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Processing {processingCount} image{processingCount !== 1 ? 's' : ''}...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {images.map((image) => (
          <Card key={image.id} className="border-border overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
            <CardContent className="p-0">
              <div className="relative">
                {/* Original Image */}
                <div className="relative aspect-square bg-muted/20 group">
                  <img
                    src={image.original}
                    alt={image.fileName}
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge variant="outline" className="bg-background/90 backdrop-blur-sm">
                      Original
                    </Badge>
                  </div>
                </div>

                {/* Status Overlay */}
                {image.status === 'processing' && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <Loader2 className="w-8 h-8 animate-spin text-white mx-auto" />
                      <p className="text-white text-sm">Processing...</p>
                    </div>
                  </div>
                )}

                {image.status === 'error' && (
                  <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <XCircle className="w-8 h-8 text-red-500 mx-auto" />
                      <p className="text-red-500 text-sm font-medium">Error</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Image */}
              {image.enhanced && (
                <div className="relative aspect-square bg-muted/20 border-t border-border group">
                  <img
                    src={image.enhanced}
                    alt={`Enhanced ${image.fileName}`}
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge variant="default" className="bg-primary/90 backdrop-blur-sm">
                      Enhanced
                    </Badge>
                  </div>
                </div>
              )}

              {/* Image Info and Actions */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate flex-1" title={image.fileName}>
                    {image.fileName}
                  </p>
                  <div className="flex items-center gap-2">
                    {image.status === 'completed' && (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    )}
                    {image.status === 'error' && (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                </div>

                {image.error && (
                  <p className="text-xs text-red-500">{image.error}</p>
                )}

                {image.status === 'completed' && image.enhanced && (
                  <Button
                    onClick={() => onDownload(image)}
                    size="sm"
                    variant="outline"
                    className="w-full gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                )}
                {image.status === 'error' && (
                  <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 p-2 rounded">
                    {image.error || "Processing failed"}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

