import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { BackButton } from "@/components/shared/BackButton";
import { StepIndicator } from "@/components/shared/StepIndicator";
import { WorkflowHeader } from "@/components/shared/WorkflowHeader";
import { WorkflowCard } from "@/components/shared/WorkflowCard";
import { downloadImage } from "@/lib/utils";
import { toast } from "sonner";
import { Share2, Sparkles, X, Download, Image as ImageIcon, Type, Move, Trash2, Plus } from "lucide-react";
import { generateSuperSocialPost } from "@/lib/api";
import { useImageUpload } from "@/hooks/useImageUpload";

interface SuperPostGenerationWorkflowProps {
  onBack: () => void;
}

interface PlacedImage {
  id: string;
  image: string;
  x: number; // percentage
  y: number; // percentage
  width: number; // percentage
  height: number; // percentage
}

interface PlacedText {
  id: string;
  text: string;
  x: number; // percentage
  y: number; // percentage
  fontSize: number;
  color: string;
}

export const SuperPostGenerationWorkflow = ({ onBack }: SuperPostGenerationWorkflowProps) => {
  const { fileToBase64 } = useImageUpload();
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [style, setStyle] = useState('modern');
  const [placedImages, setPlacedImages] = useState<PlacedImage[]>([]);
  const [placedTexts, setPlacedTexts] = useState<PlacedText[]>([]);
  const [generatedPost, setGeneratedPost] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [actualPrompt, setActualPrompt] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<'se' | 'sw' | 'ne' | 'nw' | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStartData, setResizeStartData] = useState<{ width: number; height: number; mouseX: number; mouseY: number } | null>(null);
  const [newText, setNewText] = useState('');
  const [newTextFontSize, setNewTextFontSize] = useState(24);
  const [newTextColor, setNewTextColor] = useState('#000000');
  const [description, setDescription] = useState('');
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const aspectRatioDimensions: Record<string, { width: number; height: number }> = {
    '1:1': { width: 1024, height: 1024 },
    '16:9': { width: 1920, height: 1080 },
    '9:16': { width: 1080, height: 1920 },
    '4:5': { width: 1080, height: 1350 },
    '1.91:1': { width: 1200, height: 628 },
  };

  const getCanvasDimensions = () => {
    const dimensions = aspectRatioDimensions[aspectRatio] || aspectRatioDimensions['1:1'];
    const maxWidth = 600;
    const maxHeight = 600;
    const ratio = Math.min(maxWidth / dimensions.width, maxHeight / dimensions.height);
    return {
      width: dimensions.width * ratio,
      height: dimensions.height * ratio,
      originalWidth: dimensions.width,
      originalHeight: dimensions.height,
    };
  };

  const handleImageUpload = async (file: File) => {
    try {
      const base64 = await fileToBase64(file);
      const canvasDims = getCanvasDimensions();
      
      // Add image at center with default size
      const newImage: PlacedImage = {
        id: `img-${Date.now()}`,
        image: base64,
        x: 50, // center
        y: 50, // center
        width: 30, // 30% of canvas width
        height: 30, // 30% of canvas height
      };
      
      setPlacedImages([...placedImages, newImage]);
      toast.success('Image added to canvas');
    } catch (error) {
      toast.error('Failed to process image');
      console.error(error);
    }
  };

  const handleAddText = () => {
    if (!newText.trim()) {
      toast.error('Please enter text');
      return;
    }
    
    const newTextElement: PlacedText = {
      id: `text-${Date.now()}`,
      text: newText,
      x: 50, // center
      y: 50, // center
      fontSize: newTextFontSize,
      color: newTextColor,
    };
    
    setPlacedTexts([...placedTexts, newTextElement]);
    setNewText('');
    toast.success('Text added to canvas');
  };

  const handleElementMouseDown = (e: React.MouseEvent, id: string, type: 'image' | 'text') => {
    // Don't start dragging if clicking on a resize handle
    if ((e.target as HTMLElement).closest('[class*="cursor-se-resize"], [class*="cursor-sw-resize"], [class*="cursor-ne-resize"], [class*="cursor-nw-resize"]')) {
      return;
    }
    
    e.stopPropagation();
    setSelectedElement(id);
    setIsDragging(true);
    setIsResizing(false);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const element = type === 'image' 
      ? placedImages.find(img => img.id === id)
      : placedTexts.find(txt => txt.id === id);
    
    if (element) {
      const elementX = (element.x / 100) * rect.width;
      const elementY = (element.y / 100) * rect.height;
      setDragOffset({
        x: e.clientX - rect.left - elementX,
        y: e.clientY - rect.top - elementY,
      });
    }
  };

  const handleResizeStart = (e: React.MouseEvent, id: string, type: 'image' | 'text', handle: 'se' | 'sw' | 'ne' | 'nw') => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedElement(id);
    setIsResizing(true);
    setResizeHandle(handle);
    setIsDragging(false);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const element = type === 'image' 
      ? placedImages.find(img => img.id === id)
      : placedTexts.find(txt => txt.id === id);
    
    if (element) {
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      if (type === 'image') {
        const img = element as PlacedImage;
        setResizeStartData({
          width: img.width,
          height: img.height,
          mouseX,
          mouseY,
        });
      } else {
        const txt = element as PlacedText;
        setResizeStartData({
          width: txt.fontSize,
          height: txt.fontSize,
          mouseX,
          mouseY,
        });
      }
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!canvasRef.current || !selectedElement) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    if (isResizing && resizeHandle && resizeStartData) {
      // Handle resizing
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const deltaX = mouseX - resizeStartData.mouseX;
      const deltaY = mouseY - resizeStartData.mouseY;
      
      const imageIndex = placedImages.findIndex(img => img.id === selectedElement);
      if (imageIndex !== -1) {
        const img = placedImages[imageIndex];
        
        // Calculate size change based on mouse movement
        const widthChange = (deltaX / rect.width) * 100;
        const heightChange = (deltaY / rect.height) * 100;
        
        let newWidth = resizeStartData.width;
        let newHeight = resizeStartData.height;
        
        // Adjust based on which corner is being dragged
        if (resizeHandle === 'se') {
          // Southeast - both increase
          newWidth = resizeStartData.width + widthChange;
          newHeight = resizeStartData.height + heightChange;
        } else if (resizeHandle === 'sw') {
          // Southwest - width decreases, height increases
          newWidth = resizeStartData.width - widthChange;
          newHeight = resizeStartData.height + heightChange;
        } else if (resizeHandle === 'ne') {
          // Northeast - width increases, height decreases
          newWidth = resizeStartData.width + widthChange;
          newHeight = resizeStartData.height - heightChange;
        } else if (resizeHandle === 'nw') {
          // Northwest - both decrease
          newWidth = resizeStartData.width - widthChange;
          newHeight = resizeStartData.height - heightChange;
        }
        
        // Clamp values
        newWidth = Math.max(5, Math.min(80, newWidth));
        newHeight = Math.max(5, Math.min(80, newHeight));
        
        const updated = [...placedImages];
        updated[imageIndex] = { ...updated[imageIndex], width: newWidth, height: newHeight };
        setPlacedImages(updated);
        return;
      }
      
      const textIndex = placedTexts.findIndex(txt => txt.id === selectedElement);
      if (textIndex !== -1) {
        // For text, resize based on horizontal movement
        const fontSizeChange = (deltaX / rect.width) * 100;
        let newFontSize = resizeStartData.width + fontSizeChange;
        newFontSize = Math.max(12, Math.min(72, newFontSize));
        
        const updated = [...placedTexts];
        updated[textIndex] = { ...updated[textIndex], fontSize: newFontSize };
        setPlacedTexts(updated);
      }
      return;
    }
    
    if (isDragging && !isResizing) {
      const x = ((e.clientX - rect.left - dragOffset.x) / rect.width) * 100;
      const y = ((e.clientY - rect.top - dragOffset.y) / rect.height) * 100;
      
      // Clamp to canvas bounds
      const clampedX = Math.max(0, Math.min(100, x));
      const clampedY = Math.max(0, Math.min(100, y));
      
      // Update position
      const imageIndex = placedImages.findIndex(img => img.id === selectedElement);
      if (imageIndex !== -1) {
        const updated = [...placedImages];
        updated[imageIndex] = { ...updated[imageIndex], x: clampedX, y: clampedY };
        setPlacedImages(updated);
        return;
      }
      
      const textIndex = placedTexts.findIndex(txt => txt.id === selectedElement);
      if (textIndex !== -1) {
        const updated = [...placedTexts];
        updated[textIndex] = { ...updated[textIndex], x: clampedX, y: clampedY };
        setPlacedTexts(updated);
      }
    }
  }, [isDragging, isResizing, resizeHandle, selectedElement, dragOffset, placedImages, placedTexts]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
    setResizeStartData(null);
    // Keep selectedElement so user can see selection
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleDeleteElement = (id: string, type: 'image' | 'text') => {
    if (type === 'image') {
      setPlacedImages(placedImages.filter(img => img.id !== id));
    } else {
      setPlacedTexts(placedTexts.filter(txt => txt.id !== id));
    }
    toast.success('Element removed');
  };

  const handleGenerate = async () => {
    if (placedImages.length === 0 && placedTexts.length === 0) {
      toast.error('Please add at least one image or text element to the canvas');
      return;
    }

    setIsGenerating(true);
    try {
      const dimensions = aspectRatioDimensions[aspectRatio] || aspectRatioDimensions['1:1'];
      
      const response = await generateSuperSocialPost({
        aspectRatio,
        style,
        description: description.trim() || undefined,
        placedImages: placedImages.map(img => ({
          image: img.image,
          x: img.x,
          y: img.y,
          width: img.width,
          height: img.height,
        })),
        placedTexts: placedTexts.map(txt => ({
          text: txt.text,
          x: txt.x,
          y: txt.y,
          fontSize: txt.fontSize,
          color: txt.color,
        })),
        canvasWidth: dimensions.width,
        canvasHeight: dimensions.height,
      });

      if (response.error) {
        toast.error(response.error);
        return;
      }

      if (response.generatedPost) {
        setGeneratedPost(response.generatedPost);
        if (response.actualPrompt) {
          setActualPrompt(response.actualPrompt);
        }
        toast.success('Super post generated successfully!');
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate super post');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedPost) return;
    downloadImage(generatedPost, `super-post-${Date.now()}.png`);
    toast.success('Post downloaded!');
  };

  const handleReset = () => {
    setPlacedImages([]);
    setPlacedTexts([]);
    setGeneratedPost(null);
    setActualPrompt(null);
    setSelectedElement(null);
    setNewText('');
    setDescription('');
  };

  const canvasDims = getCanvasDimensions();

  return (
    <div className="space-y-6 animate-fade-in">
      <WorkflowHeader
        icon={Sparkles}
        title="Super Post Generation"
        description="Create advanced social posts by visually planning your layout. Add images and text at specific positions, then let AI generate the final post."
        iconColor="text-purple-400"
        iconBgColor="bg-purple-500/20"
        backButton={<BackButton onClick={onBack} variant="floating" />}
      />

      <div className="mb-6">
        <StepIndicator steps={[
          { number: 1, label: "Plan Layout", status: !generatedPost ? "current" : "completed" },
          { number: 2, label: "Result", status: generatedPost ? "current" : "upcoming" },
        ]} />
      </div>

      {!generatedPost ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Canvas - Left Side (2 columns) */}
          <div className="lg:col-span-2">
            <WorkflowCard 
              title="Layout Canvas" 
              description="Drag images and text to position them. This is your visual plan for the final post."
            >
              <div className="space-y-4">
                <div 
                  ref={canvasRef}
                  className="relative border-2 border-primary/30 rounded-xl bg-gradient-to-br from-slate-900/50 to-slate-800/50 overflow-hidden"
                  style={{ 
                    width: `${canvasDims.width}px`, 
                    height: `${canvasDims.height}px`,
                    maxWidth: '100%',
                    margin: '0 auto'
                  }}
                  onClick={() => setSelectedElement(null)}
                >
                  {/* Placed Images */}
                  {placedImages.map((img) => (
                    <div
                      key={img.id}
                      className={`absolute cursor-move transition-all ${
                        selectedElement === img.id ? 'ring-2 ring-primary ring-offset-2 z-10' : ''
                      }`}
                      style={{
                        left: `${img.x}%`,
                        top: `${img.y}%`,
                        width: `${img.width}%`,
                        height: `${img.height}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      onMouseDown={(e) => handleElementMouseDown(e, img.id, 'image')}
                    >
                      <div className="relative w-full h-full group">
                        <img
                          src={img.image}
                          alt="Placed"
                          className="w-full h-full object-contain rounded-lg border-2 border-primary/50 shadow-lg"
                          draggable={false}
                        />
                        {selectedElement === img.id && (
                          <>
                            {/* Resize handles - larger and easier to grab */}
                            <div
                              className="absolute -bottom-2 -right-2 w-6 h-6 bg-primary border-2 border-white rounded-full cursor-se-resize z-30 hover:scale-125 hover:bg-primary/90 transition-transform shadow-lg"
                              onMouseDown={(e) => handleResizeStart(e, img.id, 'image', 'se')}
                              style={{ touchAction: 'none' }}
                            />
                            <div
                              className="absolute -bottom-2 -left-2 w-6 h-6 bg-primary border-2 border-white rounded-full cursor-sw-resize z-30 hover:scale-125 hover:bg-primary/90 transition-transform shadow-lg"
                              onMouseDown={(e) => handleResizeStart(e, img.id, 'image', 'sw')}
                              style={{ touchAction: 'none' }}
                            />
                            <div
                              className="absolute -top-2 -right-2 w-6 h-6 bg-primary border-2 border-white rounded-full cursor-ne-resize z-30 hover:scale-125 hover:bg-primary/90 transition-transform shadow-lg"
                              onMouseDown={(e) => handleResizeStart(e, img.id, 'image', 'ne')}
                              style={{ touchAction: 'none' }}
                            />
                            <div
                              className="absolute -top-2 -left-2 w-6 h-6 bg-primary border-2 border-white rounded-full cursor-nw-resize z-30 hover:scale-125 hover:bg-primary/90 transition-transform shadow-lg"
                              onMouseDown={(e) => handleResizeStart(e, img.id, 'image', 'nw')}
                              style={{ touchAction: 'none' }}
                            />
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 rounded-full bg-destructive/90 hover:bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity z-20"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteElement(img.id, 'image');
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Placed Texts */}
                  {placedTexts.map((txt) => (
                    <div
                      key={txt.id}
                      className={`absolute cursor-move transition-all ${
                        selectedElement === txt.id ? 'ring-2 ring-primary ring-offset-2 z-10' : ''
                      }`}
                      style={{
                        left: `${txt.x}%`,
                        top: `${txt.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      onMouseDown={(e) => handleElementMouseDown(e, txt.id, 'text')}
                    >
                      <div className="relative group px-2 py-1 bg-white/90 rounded border-2 border-primary/50 shadow-lg">
                        <p
                          style={{
                            fontSize: `${txt.fontSize}px`,
                            color: txt.color,
                            fontWeight: 'bold',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {txt.text}
                        </p>
                        {selectedElement === txt.id && (
                          <>
                            {/* Resize handles for text (font size) - larger */}
                            <div
                              className="absolute -bottom-2 -right-2 w-5 h-5 bg-primary border-2 border-white rounded-full cursor-se-resize z-30 hover:scale-125 hover:bg-primary/90 transition-transform shadow-lg"
                              onMouseDown={(e) => handleResizeStart(e, txt.id, 'text', 'se')}
                              style={{ touchAction: 'none' }}
                            />
                            <div
                              className="absolute -bottom-2 -left-2 w-5 h-5 bg-primary border-2 border-white rounded-full cursor-sw-resize z-30 hover:scale-125 hover:bg-primary/90 transition-transform shadow-lg"
                              onMouseDown={(e) => handleResizeStart(e, txt.id, 'text', 'sw')}
                              style={{ touchAction: 'none' }}
                            />
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive/90 hover:bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity z-20"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteElement(txt.id, 'text');
                          }}
                        >
                          <X className="h-2.5 w-2.5" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {placedImages.length === 0 && placedTexts.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Add images and text to plan your layout</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-xs text-muted-foreground text-center space-y-1">
                  <p>Click and drag elements to reposition them</p>
                  <p>Click an element to select it, then drag the corner handles to resize</p>
                </div>
              </div>
            </WorkflowCard>
          </div>

          {/* Controls - Right Side (1 column) */}
          <div className="space-y-6">
            {/* Add Image */}
            <WorkflowCard title="Add Image" description="Upload images to place on canvas">
              <div className="space-y-3">
                <ImageUpload
                  onImageSelect={handleImageUpload}
                  label="Upload Image"
                  description="Click to select"
                />
              </div>
            </WorkflowCard>

            {/* Add Text */}
            <WorkflowCard title="Add Text" description="Add text elements to your layout">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-sm">Text Content</Label>
                  <Input
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    placeholder="Enter text..."
                    className="bg-card/50 border-primary/30"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Font Size</Label>
                    <Input
                      type="number"
                      value={newTextFontSize}
                      onChange={(e) => setNewTextFontSize(Number(e.target.value))}
                      min="12"
                      max="72"
                      className="bg-card/50 border-primary/30 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Color</Label>
                    <Input
                      type="color"
                      value={newTextColor}
                      onChange={(e) => setNewTextColor(e.target.value)}
                      className="h-9 bg-card/50 border-primary/30"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleAddText}
                  disabled={!newText.trim()}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Text
                </Button>
              </div>
            </WorkflowCard>

            {/* Description */}
            <WorkflowCard title="Post Description" description="Optional: Add details about your vision for the final post">
              <div className="space-y-2">
                <Label className="text-sm">Description (Optional)</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what you want in the final post... e.g., 'A motivational post with a gorilla holding a banana, text saying don't be like goril, modern and bold style'"
                  rows={4}
                  className="bg-card/50 border-primary/30 resize-none text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  This helps AI understand your vision better and generate a more accurate post.
                </p>
              </div>
            </WorkflowCard>

            {/* Settings */}
            <WorkflowCard title="Settings" description="Configure post style and aspect ratio">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Aspect Ratio</Label>
                  <Select value={aspectRatio} onValueChange={setAspectRatio}>
                    <SelectTrigger className="bg-card/50 border-primary/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1:1">Square (1:1)</SelectItem>
                      <SelectItem value="16:9">Landscape (16:9)</SelectItem>
                      <SelectItem value="9:16">Portrait (9:16)</SelectItem>
                      <SelectItem value="4:5">Instagram (4:5)</SelectItem>
                      <SelectItem value="1.91:1">Facebook (1.91:1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Style</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger className="bg-card/50 border-primary/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="minimalist">Minimalist</SelectItem>
                      <SelectItem value="bold">Bold</SelectItem>
                      <SelectItem value="elegant">Elegant</SelectItem>
                      <SelectItem value="playful">Playful</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                      <SelectItem value="creative">Creative</SelectItem>
                      <SelectItem value="vintage">Vintage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </WorkflowCard>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || (placedImages.length === 0 && placedTexts.length === 0)}
              className="w-full h-12 bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/90 hover:to-accent/90 font-semibold shadow-lg shadow-primary/30"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Post
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <WorkflowCard
          title="Post Generated Successfully"
          description={`${style} style • ${aspectRatio} ratio`}
        >
          <div className="space-y-5">
            <div className="relative group">
              <div className="w-full max-h-[500px] rounded-xl border-2 border-primary/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-6 flex items-center justify-center overflow-hidden shadow-2xl">
                <img
                  src={generatedPost}
                  alt="Generated super post"
                  className="w-full h-full object-contain max-h-[450px] rounded-lg"
                />
              </div>
            </div>

            {actualPrompt && (
              <div className="p-4 bg-gradient-to-br from-card/60 to-card/40 backdrop-blur-sm rounded-xl border-2 border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <p className="text-xs font-semibold uppercase">AI Prompt</p>
                </div>
                <p className="text-xs text-foreground/80 font-mono line-clamp-3 bg-background/30 p-2 rounded-lg">
                  {actualPrompt}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleDownload}
                className="flex-1 bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                className="border-primary/30 hover:bg-primary/10"
              >
                New Post
              </Button>
            </div>
          </div>
        </WorkflowCard>
      )}
    </div>
  );
};

