import { Upload } from "lucide-react";
import { useCallback } from "react";

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
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
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
      className="relative border-2 border-dashed border-border rounded-lg p-12 text-center transition-all hover:border-primary hover:bg-accent/5 cursor-pointer"
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />
      <div className="flex flex-col items-center gap-4">
        <div className="p-6 rounded-full bg-gradient-to-br from-primary to-accent">
          <Upload className="w-10 h-10 text-primary-foreground" />
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">{label}</h3>
          <p className="text-muted-foreground">{description}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Supports JPG, PNG, WEBP, and other image formats
          </p>
        </div>
      </div>
    </div>
  );
};

