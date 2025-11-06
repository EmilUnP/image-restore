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
      className={`relative border-2 border-dashed rounded-3xl p-10 md:p-14 lg:p-20 text-center transition-all duration-700 cursor-pointer bg-gradient-to-br from-card/60 via-card/40 to-card/60 backdrop-blur-md ${
        isDragging
          ? "border-primary/80 bg-primary/15 scale-[1.02] shadow-glow-accent ring-4 ring-primary/20"
          : "border-border/50 hover:border-primary/70 hover:bg-gradient-to-br hover:from-accent/8 hover:via-transparent hover:to-primary/8 hover:shadow-xl hover:scale-[1.01]"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {/* Animated background effect */}
      <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 transition-opacity duration-700 ${
        isDragging ? "opacity-100" : "group-hover:opacity-100"
      }`} />
      
      <input
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
      />
      <div className="flex flex-col items-center gap-6 md:gap-8 relative z-0">
        <div className={`relative group/icon transition-all duration-700 ${
          isDragging ? "scale-110 rotate-6" : "hover:scale-110 hover:rotate-3"
        }`}>
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-3xl blur-2xl opacity-60 group-hover/icon:opacity-80 transition-opacity duration-500" />
          <div className={`relative p-7 md:p-8 rounded-3xl bg-gradient-to-br from-primary via-primary/95 to-accent shadow-glow transition-all duration-500 ${
            isDragging ? "shadow-glow-accent animate-scale-pulse" : "hover:shadow-glow-accent"
          }`}>
            {isDragging ? (
              <ImageIcon className="w-12 h-12 md:w-14 md:h-14 text-primary-foreground animate-pulse relative z-10" />
            ) : (
              <Upload className="w-12 h-12 md:w-14 md:h-14 text-primary-foreground relative z-10 transition-transform duration-500 group-hover/icon:scale-110" />
            )}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover/icon:opacity-100 transition-opacity duration-500" />
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">{label}</h3>
          <p className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-lg mx-auto font-light">{description}</p>
          <p className="text-sm md:text-base text-muted-foreground/70 mt-4 font-medium">
            Supports JPG, PNG, WEBP, and other image formats
          </p>
        </div>
        {isDragging && (
          <div className="mt-4 px-6 py-3 rounded-2xl bg-primary/20 backdrop-blur-sm border border-primary/30">
            <p className="text-primary font-bold text-lg md:text-xl animate-pulse">
              Drop your image here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

