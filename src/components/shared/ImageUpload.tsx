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
      className={`relative border-2 border-dashed rounded-2xl p-8 md:p-12 lg:p-16 text-center transition-all duration-500 cursor-pointer bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm ${
        isDragging
          ? "border-primary bg-primary/10 scale-[1.02] shadow-glow-accent"
          : "border-border/60 hover:border-primary/60 hover:bg-accent/5 hover:shadow-md"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
      />
      <div className="flex flex-col items-center gap-5 md:gap-6">
        <div className={`relative p-6 md:p-7 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-glow transition-all duration-300 ${
          isDragging ? "scale-110 rotate-6 shadow-glow-accent" : "hover:scale-105 hover:shadow-glow-accent"
        }`}>
          {isDragging ? (
            <ImageIcon className="w-10 h-10 md:w-12 md:h-12 text-primary-foreground animate-pulse" />
          ) : (
            <Upload className="w-10 h-10 md:w-12 md:h-12 text-primary-foreground" />
          )}
        </div>
        <div className="space-y-2">
          <h3 className="text-xl md:text-2xl font-bold tracking-tight">{label}</h3>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-md mx-auto">{description}</p>
          <p className="text-xs md:text-sm text-muted-foreground/80 mt-3">
            Supports JPG, PNG, WEBP, and other image formats
          </p>
        </div>
        {isDragging && (
          <div className="mt-2 text-primary font-semibold text-base md:text-lg animate-pulse">
            Drop your image here
          </div>
        )}
      </div>
    </div>
  );
};

