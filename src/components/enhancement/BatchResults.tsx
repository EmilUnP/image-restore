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
            <div className="flex items-center justify-between">
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
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download All
                  </Button>
                )}
              </div>
            </div>
            <Progress value={progress} className="h-2" />
            {isProcessing && processingCount > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing {processingCount} image{processingCount !== 1 ? 's' : ''}...</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image) => (
          <Card key={image.id} className="border-border overflow-hidden">
            <CardContent className="p-0">
              <div className="relative">
                {/* Original Image */}
                <div className="relative aspect-square bg-muted/20">
                  <img
                    src={image.original}
                    alt={image.fileName}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge variant="outline" className="bg-background/80">
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
                <div className="relative aspect-square bg-muted/20 border-t border-border">
                  <img
                    src={image.enhanced}
                    alt={`Enhanced ${image.fileName}`}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge variant="default" className="bg-primary/80">
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
                    className="w-full gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

