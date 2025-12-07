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
  const [generatedContext, setGeneratedContext] = useState<string | null>(null);
  const [generatedHashtags, setGeneratedHashtags] = useState<string[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
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
    e.stopPropagation();
    setSelectedElement(id);
    setIsDragging(true);
    
    const canvas = canvasRef.current;
    if (!canvas) {
      setIsDragging(false);
      return;
    }
    
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
    } else {
      setIsDragging(false);
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Handle dragging
    if (isDragging && selectedElement) {
      const x = ((e.clientX - rect.left - dragOffset.x) / rect.width) * 100;
      const y = ((e.clientY - rect.top - dragOffset.y) / rect.height) * 100;
      
      // Clamp to canvas bounds
      const clampedX = Math.max(0, Math.min(100, x));
      const clampedY = Math.max(0, Math.min(100, y));
      
      // Update position
      setPlacedImages(prev => {
        const imageIndex = prev.findIndex(img => img.id === selectedElement);
        if (imageIndex !== -1) {
          const updated = [...prev];
          updated[imageIndex] = { ...updated[imageIndex], x: clampedX, y: clampedY };
          return updated;
        }
        return prev;
      });
      
      setPlacedTexts(prev => {
        const textIndex = prev.findIndex(txt => txt.id === selectedElement);
        if (textIndex !== -1) {
          const updated = [...prev];
          updated[textIndex] = { ...updated[textIndex], x: clampedX, y: clampedY };
          return updated;
        }
        return prev;
      });
    }
  }, [isDragging, selectedElement, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
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
    if (selectedElement === id) {
      setSelectedElement(null);
    }
    toast.success('Element removed');
  };

  const handleUpdateText = (id: string, updates: Partial<PlacedText>) => {
    setPlacedTexts(placedTexts.map(txt => 
      txt.id === id ? { ...txt, ...updates } : txt
    ));
    toast.success('Text updated');
  };

  const selectedElementData = selectedElement 
    ? placedTexts.find(txt => txt.id === selectedElement) || placedImages.find(img => img.id === selectedElement)
    : null;

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
        if (response.context) {
          setGeneratedContext(response.context);
        }
        if (response.hashtags && Array.isArray(response.hashtags)) {
          setGeneratedHashtags(response.hashtags);
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
    setGeneratedContext(null);
    setGeneratedHashtags([]);
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
                  className="relative border-2 border-primary/40 rounded-xl bg-gradient-to-br from-background via-background/95 to-primary/5 overflow-hidden shadow-2xl shadow-primary/10"
                  style={{ 
                    width: `${canvasDims.width}px`, 
                    height: `${canvasDims.height}px`,
                    maxWidth: '100%',
                    margin: '0 auto',
                    backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                  }}
                  onClick={() => setSelectedElement(null)}
                >
                  {/* Placed Images */}
                  {placedImages.map((img) => (
                    <div
                      key={img.id}
                      className={`absolute transition-all ${
                        selectedElement === img.id ? 'ring-2 ring-primary ring-offset-2 z-20' : 'z-10'
                      }`}
                      style={{
                        left: `${img.x}%`,
                        top: `${img.y}%`,
                        width: `${img.width}%`,
                        height: `${img.height}%`,
                        transform: 'translate(-50%, -50%)',
                        pointerEvents: selectedElement === img.id ? 'auto' : 'auto',
                      }}
                    >
                      <div className="relative w-full h-full group">
                        <div
                          className="w-full h-full cursor-move"
                          onMouseDown={(e) => {
                            handleElementMouseDown(e, img.id, 'image');
                          }}
                        >
                          <img
                            src={img.image}
                            alt="Placed"
                            className="w-full h-full object-contain rounded-lg border-2 border-primary/50 shadow-lg pointer-events-none"
                            draggable={false}
                          />
                        </div>
                        {selectedElement === img.id && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-1 bg-primary/90 text-primary-foreground text-xs font-semibold rounded-md shadow-lg z-[100] whitespace-nowrap">
                            Selected
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 rounded-full bg-destructive/90 hover:bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity z-40"
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
                      className={`absolute transition-all ${
                        selectedElement === txt.id ? 'ring-2 ring-primary ring-offset-2 z-20' : 'z-10'
                      }`}
                      style={{
                        left: `${txt.x}%`,
                        top: `${txt.y}%`,
                        transform: 'translate(-50%, -50%)',
                        pointerEvents: 'auto',
                      }}
                    >
                      <div className={`relative group px-2 py-1 rounded border-2 shadow-lg transition-all ${
                        selectedElement === txt.id
                          ? 'bg-primary/10 border-primary ring-2 ring-primary/50'
                          : 'bg-white/90 border-primary/50 hover:border-primary/70'
                      }`}>
                        <div
                          className="cursor-move"
                          onMouseDown={(e) => {
                            handleElementMouseDown(e, txt.id, 'text');
                          }}
                          onDoubleClick={() => {
                            setSelectedElement(txt.id);
                          }}
                        >
                          <p
                            style={{
                              fontSize: `${txt.fontSize}px`,
                              color: txt.color,
                              fontWeight: 'bold',
                              whiteSpace: 'nowrap',
                              pointerEvents: 'none',
                            }}
                          >
                            {txt.text}
                          </p>
                        </div>
                        {selectedElement === txt.id && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-1 bg-primary/90 text-primary-foreground text-xs font-semibold rounded-md shadow-lg z-[100] whitespace-nowrap">
                            Selected
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive/90 hover:bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity z-40"
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
                  <p className="font-semibold text-foreground mb-2">How to use:</p>
                  <div className="space-y-1.5 text-left bg-background/50 p-3 rounded-lg border border-primary/20">
                    <p>• <span className="font-semibold">Move:</span> Click and drag elements to reposition them</p>
                    <p>• <span className="font-semibold">Select:</span> Click an element to select it</p>
                    <p>• <span className="font-semibold">Edit:</span> Double-click text or use the editor panel when selected</p>
                  </div>
                  {selectedElementData && 'text' in selectedElementData && (
                    <p className="text-accent font-semibold mt-2 animate-pulse">✓ Text selected - Use the editor panel on the right to modify</p>
                  )}
                </div>
              </div>
            </WorkflowCard>
          </div>

          {/* Controls - Right Side (1 column) */}
          <div className="space-y-4">
            {/* Edit Selected Element Section */}
            {selectedElementData && 'text' in selectedElementData && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-accent/80 flex items-center gap-2">
                    <Type className="w-3.5 h-3.5" />
                    Edit Text
                  </h3>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
                </div>

                <WorkflowCard 
                  title="Edit Text Element"
                  description="Modify selected text properties"
                >
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Text Content</Label>
                      <Input
                        value={selectedElementData.text}
                        onChange={(e) => handleUpdateText(selectedElementData.id, { text: e.target.value })}
                        placeholder="Enter text..."
                        className="bg-card/50 border-accent/30 h-9 text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Font Size</Label>
                        <Input
                          type="number"
                          value={selectedElementData.fontSize}
                          onChange={(e) => handleUpdateText(selectedElementData.id, { fontSize: Number(e.target.value) })}
                          min="12"
                          max="72"
                          className="bg-card/50 border-accent/30 text-sm h-8"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Color</Label>
                        <Input
                          type="color"
                          value={selectedElementData.color}
                          onChange={(e) => handleUpdateText(selectedElementData.id, { color: e.target.value })}
                          className="h-8 bg-card/50 border-accent/30"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={() => setSelectedElement(null)}
                      variant="outline"
                      className="w-full border-accent/30 hover:bg-accent/10 h-9 text-sm"
                      size="sm"
                    >
                      <X className="w-3.5 h-3.5 mr-1.5" />
                      Close Editor
                    </Button>
                  </div>
                </WorkflowCard>
              </div>
            )}

            {/* Section: Add Content */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-2">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-primary/80 flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5" />
                  Add Content
                </h3>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              </div>

              {/* Add Image */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-accent/5 border border-primary/20 backdrop-blur-sm hover:border-primary/30 transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <ImageIcon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Add Image</h4>
                    <p className="text-xs text-muted-foreground">Upload images to place on canvas</p>
                  </div>
                </div>
                <ImageUpload
                  onImageSelect={handleImageUpload}
                  label="Upload Image"
                  description="Click to select"
                />
              </div>

              {/* Add Text */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-accent/10 via-accent/5 to-primary/5 border border-accent/20 backdrop-blur-sm hover:border-accent/30 transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-accent/20">
                    <Type className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Add Text</h4>
                    <p className="text-xs text-muted-foreground">Add text elements to your layout</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Text Content</Label>
                    <Input
                      value={newText}
                      onChange={(e) => setNewText(e.target.value)}
                      placeholder="Enter text..."
                      className="bg-background/80 border-primary/30 h-9 text-sm focus:border-primary/60"
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
                        className="bg-background/80 border-primary/30 text-sm h-8 focus:border-primary/60"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Color</Label>
                      <Input
                        type="color"
                        value={newTextColor}
                        onChange={(e) => setNewTextColor(e.target.value)}
                        className="h-8 bg-background/80 border-primary/30 cursor-pointer"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleAddText}
                    disabled={!newText.trim()}
                    className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 h-9 text-sm shadow-lg shadow-primary/20"
                    size="sm"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Add Text
                  </Button>
                </div>
              </div>
            </div>

            {/* Section: Configuration */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-2">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-primary/80 flex items-center gap-2">
                  <Move className="w-3.5 h-3.5" />
                  Configuration
                </h3>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              </div>

              {/* Settings */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-accent/5 border border-primary/20 backdrop-blur-sm hover:border-primary/30 transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Move className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Settings</h4>
                    <p className="text-xs text-muted-foreground">Configure post style and aspect ratio</p>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <Label className="text-xs">Aspect Ratio</Label>
                    <Select value={aspectRatio} onValueChange={setAspectRatio}>
                      <SelectTrigger className="bg-background/80 border-primary/30 h-9 text-sm focus:border-primary/60">
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
                  <div className="space-y-1">
                    <Label className="text-xs">Style</Label>
                    <Select value={style} onValueChange={setStyle}>
                      <SelectTrigger className="bg-background/80 border-primary/30 h-9 text-sm focus:border-primary/60">
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
              </div>

              {/* Description */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-accent/10 via-accent/5 to-primary/5 border border-accent/20 backdrop-blur-sm hover:border-accent/30 transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-accent/20">
                    <Type className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Post Description</h4>
                    <p className="text-xs text-muted-foreground">Optional: Add details about your vision</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Description (Optional)</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your vision..."
                    rows={3}
                    className="bg-background/80 border-primary/30 resize-none text-xs focus:border-primary/60"
                  />
                </div>
              </div>
            </div>

            {/* Section: Generation */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-2">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-primary/80 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate
                </h3>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              </div>

              {/* Info Card */}
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-accent/5 border border-primary/20 backdrop-blur-sm">
                <div className="flex items-start gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/20 mt-0.5">
                    <Type className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-xs font-semibold text-foreground">Quick Tips</p>
                    <ul className="text-xs text-muted-foreground space-y-0.5 list-disc list-inside">
                      <li>Drag elements to reposition</li>
                      <li>Click to select elements</li>
                      <li>Add at least one element</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || (placedImages.length === 0 && placedTexts.length === 0)}
                className="w-full h-12 bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/90 hover:to-accent/90 font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300"
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

              {/* Status Info */}
              {(placedImages.length > 0 || placedTexts.length > 0) && (
                <div className="p-2.5 rounded-lg bg-card/40 border border-primary/10 text-center">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{placedImages.length + placedTexts.length}</span> element{placedImages.length + placedTexts.length === 1 ? '' : 's'} on canvas
                  </p>
                </div>
              )}
            </div>
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

            {/* Generated Context and Hashtags */}
            {(generatedContext || generatedHashtags.length > 0) && (
              <div className="space-y-3">
                {generatedContext && (
                  <div className="p-4 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/5 backdrop-blur-sm rounded-xl border-2 border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Type className="w-4 h-4 text-primary" />
                      <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Generated Caption</p>
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed">{generatedContext}</p>
                  </div>
                )}
                
                {generatedHashtags.length > 0 && (
                  <div className="p-4 bg-gradient-to-br from-accent/10 via-accent/5 to-primary/5 backdrop-blur-sm rounded-xl border-2 border-accent/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Share2 className="w-4 h-4 text-accent" />
                      <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Suggested Hashtags</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {generatedHashtags.map((hashtag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 rounded-lg bg-background/50 border border-accent/30 text-sm text-foreground/90"
                        >
                          #{hashtag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

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

