import { Upload, Image as ImageIcon } from "lucide-react";
import { useCallback, useState } from "react";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
}

export const ImageUpload = ({ 
  onImageSelect, 
  disabled,
  label = "Upload Image",
  description = "Drag and drop or click to select an image"
}: ImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        onImageSelect(file);
      }
    },
    [onImageSelect, disabled]
  );

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

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onImageSelect(file);
      }
    },
    [onImageSelect]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-all duration-300 cursor-pointer bg-card/50 backdrop-blur-sm ${
        isDragging
          ? "border-primary bg-primary/10 scale-[1.01] shadow-md ring-2 ring-primary/20"
          : "border-border/50 hover:border-primary/60 hover:bg-card/80 hover:shadow-md"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
      />
      <div className="flex flex-col items-center gap-2 relative z-0">
        <div className={`relative transition-all duration-300 ${
          isDragging ? "scale-105" : ""
        }`}>
          <div className="relative p-2 rounded-lg bg-primary/10">
            {isDragging ? (
              <ImageIcon className="w-6 h-6 text-primary animate-pulse" />
            ) : (
              <Upload className="w-6 h-6 text-primary transition-transform duration-300 hover:scale-110" />
            )}
          </div>
        </div>
        <div className="space-y-0.5">
          <h3 className="text-sm font-semibold">{label}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        {isDragging && (
          <div className="mt-1 px-3 py-1 rounded-md bg-primary/20 border border-primary/30">
            <p className="text-primary font-medium text-xs animate-pulse">
              Drop your image here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

