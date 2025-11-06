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
      className={`relative border-2 border-dashed rounded-xl p-8 md:p-12 text-center transition-all duration-300 cursor-pointer ${
        isDragging
          ? "border-primary bg-primary/10 scale-[1.02] shadow-lg"
          : "border-border hover:border-primary hover:bg-accent/5"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
      />
      <div className="flex flex-col items-center gap-4">
        <div className={`p-6 rounded-full bg-gradient-to-br from-primary to-accent transition-transform duration-300 ${
          isDragging ? "scale-110 rotate-6" : "hover:scale-105"
        }`}>
          {isDragging ? (
            <ImageIcon className="w-10 h-10 text-primary-foreground animate-pulse" />
          ) : (
            <Upload className="w-10 h-10 text-primary-foreground" />
          )}
        </div>
        <div>
          <h3 className="text-lg md:text-xl font-semibold mb-2">{label}</h3>
          <p className="text-muted-foreground text-sm md:text-base">{description}</p>
          <p className="text-xs md:text-sm text-muted-foreground mt-2">
            Supports JPG, PNG, WEBP, and other image formats
          </p>
        </div>
        {isDragging && (
          <div className="mt-2 text-primary font-medium animate-pulse">
            Drop your image here
          </div>
        )}
      </div>
    </div>
  );
};

