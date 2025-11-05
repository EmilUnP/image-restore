import { Upload, X } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
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

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

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
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="relative border-2 border-dashed border-border rounded-lg p-12 text-center transition-all hover:border-primary hover:bg-accent/5 cursor-pointer"
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileInput}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        <div className="flex flex-col items-center gap-4">
          <div className="p-6 rounded-full bg-gradient-to-br from-primary to-accent">
            <Upload className="w-10 h-10 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Upload Multiple Images</h3>
            <p className="text-muted-foreground">
              Drag and drop or click to select multiple images (up to {maxImages})
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Supports JPG, PNG, WEBP, and other image formats
            </p>
          </div>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
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
            >
              Clear All
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {previews.map((preview, index) => (
              <div
                key={index}
                className="relative group rounded-lg overflow-hidden border border-border bg-card"
              >
                <img
                  src={preview.preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    onClick={() => removeFile(index)}
                    variant="destructive"
                    size="sm"
                    className="gap-2"
                    disabled={disabled}
                  >
                    <X className="w-4 h-4" />
                    Remove
                  </Button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 text-center truncate px-2">
                  {preview.file.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

