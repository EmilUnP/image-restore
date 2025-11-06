import { Upload, X, Layers } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface BatchImageUploadProps {
  onImagesSelect: (files: File[]) => void;
  disabled?: boolean;
  maxImages?: number;
}

export const BatchImageUpload = ({ 
  onImagesSelect, 
  disabled = false,
  maxImages = 10 
}: BatchImageUploadProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ file: File; preview: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const generatePreviews = (files: File[]) => {
    const newPreviews: { file: File; preview: string }[] = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push({ file, preview: reader.result as string });
        if (newPreviews.length === files.length) {
          setPreviews(newPreviews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      
      const files = Array.from(e.dataTransfer.files)
        .filter(file => file.type.startsWith("image/"))
        .slice(0, maxImages);
      
      if (files.length > 0) {
        setSelectedFiles(files);
        generatePreviews(files);
        onImagesSelect(files);
      }
    },
    [onImagesSelect, disabled, maxImages]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
        .filter(file => file.type.startsWith("image/"))
        .slice(0, maxImages);
      
      if (files.length > 0) {
        setSelectedFiles(files);
        generatePreviews(files);
        onImagesSelect(files);
      }
    },
    [onImagesSelect, maxImages]
  );

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
    onImagesSelect(newFiles);
  };

  const clearAll = () => {
    setSelectedFiles([]);
    setPreviews([]);
    onImagesSelect([]);
  };

  return (
    <div className="space-y-4">
      <Card className={`border-2 border-dashed transition-all duration-300 ${
        isDragging
          ? "border-primary bg-primary/10 scale-[1.01] shadow-lg"
          : "border-border hover:border-primary hover:bg-accent/5"
      }`}>
        <CardContent className="p-8 md:p-12">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className="relative text-center cursor-pointer"
          >
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileInput}
              disabled={disabled}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
            />
            <div className="flex flex-col items-center gap-4">
              <div className={`p-6 rounded-full bg-gradient-to-br from-primary to-accent transition-transform duration-300 ${
                isDragging ? "scale-110 rotate-6" : "hover:scale-105"
              }`}>
                <Layers className="w-10 h-10 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-semibold mb-2">Upload Multiple Images</h3>
                <p className="text-muted-foreground text-sm md:text-base">
                  Drag and drop or click to select multiple images (up to {maxImages})
                </p>
                <p className="text-xs md:text-sm text-muted-foreground mt-2">
                  Supports JPG, PNG, WEBP, and other image formats
                </p>
              </div>
              {isDragging && (
                <div className="mt-2 text-primary font-medium animate-pulse">
                  Drop your images here
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedFiles.length > 0 && (
        <div className="space-y-3 animate-fade-in">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-sm">
                    {selectedFiles.length} image{selectedFiles.length !== 1 ? 's' : ''} selected
                  </Badge>
                  {selectedFiles.length >= maxImages && (
                    <Badge variant="outline" className="text-xs">
                      Max {maxImages} images
                    </Badge>
                  )}
                </div>
                <Button
                  onClick={clearAll}
                  variant="ghost"
                  size="sm"
                  disabled={disabled}
                  className="hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {previews.map((preview, index) => (
                  <Card
                    key={index}
                    className="relative group overflow-hidden border-border hover:border-primary transition-all duration-200 cursor-pointer"
                  >
                    <div className="relative aspect-square bg-muted/20">
                      <img
                        src={preview.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(index);
                          }}
                          variant="destructive"
                          size="sm"
                          className="gap-2"
                          disabled={disabled}
                        >
                          <X className="w-4 h-4" />
                          Remove
                        </Button>
                      </div>
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary" className="text-xs bg-black/60 text-white border-0">
                          #{index + 1}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-2">
                      <p className="text-xs text-muted-foreground truncate" title={preview.file.name}>
                        {preview.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(preview.file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

