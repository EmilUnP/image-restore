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
import { BarChart3, Sparkles, X, Download, Image as ImageIcon, Type, Move, Trash2, Plus, Square, Circle, Triangle, TrendingUp, ChevronUp, ChevronDown } from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";
import { generateInfographic } from "@/lib/api";

interface InfographicGenerationWorkflowProps {
  onBack: () => void;
}

interface InfographicElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'chart';
  x: number; // percentage
  y: number; // percentage
  width?: number; // percentage (for image, shape, chart)
  height?: number; // percentage (for image, shape, chart)
  // Text properties
  text?: string;
  fontSize?: number;
  color?: string;
  // Image properties
  image?: string;
  // Shape properties
  shapeType?: 'rectangle' | 'circle' | 'triangle';
  // Chart properties
  chartType?: 'bar' | 'line' | 'pie';
}

export const InfographicGenerationWorkflow = ({ onBack }: InfographicGenerationWorkflowProps) => {
  const { fileToBase64 } = useImageUpload();
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [style, setStyle] = useState('modern');
  const [elements, setElements] = useState<InfographicElement[]>([]);
  const [generatedInfographic, setGeneratedInfographic] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [actualPrompt, setActualPrompt] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Form states for adding elements
  const [prompt, setPrompt] = useState('');
  const [description, setDescription] = useState('');
  const [newText, setNewText] = useState('');
  const [newTextFontSize, setNewTextFontSize] = useState(24);
  const [newTextColor, setNewTextColor] = useState('#000000');
  const [newShapeType, setNewShapeType] = useState<'rectangle' | 'circle' | 'triangle'>('rectangle');
  const [newShapeColor, setNewShapeColor] = useState('#3b82f6');
  const [newChartType, setNewChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const aspectRatioDimensions: Record<string, { width: number; height: number }> = {
    '1:1': { width: 1920, height: 1920 },
    '16:9': { width: 1920, height: 1080 },
    '9:16': { width: 1080, height: 1920 },
    '4:3': { width: 1920, height: 1440 },
    '3:4': { width: 1440, height: 1920 },
    'A4': { width: 2480, height: 3508 },
  };

  const getCanvasDimensions = () => {
    const dimensions = aspectRatioDimensions[aspectRatio] || aspectRatioDimensions['16:9'];
    const maxWidth = 700;
    const maxHeight = 500;
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
      
      const newElement: InfographicElement = {
        id: `img-${Date.now()}`,
        type: 'image',
        image: base64,
        x: 50,
        y: 50,
        width: 30,
        height: 30,
      };
      
      setElements([...elements, newElement]);
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
    
    const newElement: InfographicElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      text: newText,
      x: 50,
      y: 50,
      fontSize: newTextFontSize,
      color: newTextColor,
    };
    
    setElements([...elements, newElement]);
    setNewText('');
    toast.success('Text added to canvas');
  };

  const handleAddShape = () => {
    const newElement: InfographicElement = {
      id: `shape-${Date.now()}`,
      type: 'shape',
      shapeType: newShapeType,
      x: 50,
      y: 50,
      width: 15,
      height: 15,
      color: newShapeColor,
    };
    
    setElements([...elements, newElement]);
    toast.success('Shape added to canvas');
  };

  const handleAddChart = () => {
    const newElement: InfographicElement = {
      id: `chart-${Date.now()}`,
      type: 'chart',
      chartType: newChartType,
      x: 50,
      y: 50,
      width: 30,
      height: 30,
    };
    
    setElements([...elements, newElement]);
    toast.success('Chart placeholder added to canvas');
  };

  const handleElementMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedElement(id);
    setIsDragging(true);
    
    const canvas = canvasRef.current;
    if (!canvas) {
      setIsDragging(false);
      return;
    }
    
    const rect = canvas.getBoundingClientRect();
    const element = elements.find(el => el.id === id);
    
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
      
      const clampedX = Math.max(0, Math.min(100, x));
      const clampedY = Math.max(0, Math.min(100, y));
      
      setElements(prevElements =>
        prevElements.map(el =>
          el.id === selectedElement
            ? { ...el, x: clampedX, y: clampedY }
            : el
        )
      );
    }
  }, [isDragging, selectedElement, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
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

  const handleDeleteElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
    toast.success('Element removed');
  };

  const handleUpdateElement = (id: string, updates: Partial<InfographicElement>) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
    toast.success('Element updated');
  };


  const selectedElementData = selectedElement ? elements.find(el => el.id === selectedElement) : null;

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a topic/description for the infographic');
      return;
    }

    setIsGenerating(true);
    try {
      const dimensions = aspectRatioDimensions[aspectRatio] || aspectRatioDimensions['16:9'];
      
      const response = await generateInfographic({
        prompt,
        style,
        aspectRatio,
        description: description.trim() || undefined,
        elements: elements.map(el => ({
          type: el.type,
          x: el.x,
          y: el.y,
          width: el.width,
          height: el.height,
          text: el.text,
          fontSize: el.fontSize,
          color: el.color,
          image: el.image,
          shapeType: el.shapeType,
          chartType: el.chartType,
        })),
        canvasWidth: dimensions.width,
        canvasHeight: dimensions.height,
      });

      if (response.error) {
        toast.error(response.error);
        return;
      }

      if (response.generatedInfographic) {
        setGeneratedInfographic(response.generatedInfographic);
        if (response.actualPrompt) {
          setActualPrompt(response.actualPrompt);
        }
        toast.success('Infographic generated successfully!');
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate infographic');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedInfographic) return;
    downloadImage(generatedInfographic, `infographic-${Date.now()}.png`);
    toast.success('Infographic downloaded!');
  };

  const handleReset = () => {
    setElements([]);
    setGeneratedInfographic(null);
    setActualPrompt(null);
    setSelectedElement(null);
    setPrompt('');
    setDescription('');
  };

  const canvasDims = getCanvasDimensions();

  const renderElement = (element: InfographicElement) => {
    const isSelected = selectedElement === element.id;
    
    switch (element.type) {
      case 'text':
        return (
          <div
            key={element.id}
            className={`absolute transition-all ${isSelected ? 'ring-2 ring-primary ring-offset-2 z-20' : 'z-10'}`}
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className={`relative group px-2 py-1 rounded border-2 shadow-lg transition-all ${
              isSelected 
                ? 'bg-primary/10 border-primary ring-2 ring-primary/50' 
                : 'bg-white/90 border-primary/50 hover:border-primary/70'
            }`}>
              <div
                className="cursor-move"
                onMouseDown={(e) => {
                  handleElementMouseDown(e, element.id);
                }}
                onDoubleClick={() => {
                  setSelectedElement(element.id);
                }}
              >
                <p
                  style={{
                    fontSize: `${element.fontSize}px`,
                    color: element.color,
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                  }}
                >
                  {element.text}
                </p>
              </div>
              {isSelected && (
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
                  handleDeleteElement(element.id);
                }}
              >
                <X className="h-2.5 w-2.5" />
              </Button>
            </div>
          </div>
        );
      
      case 'image':
        return (
          <div
            key={element.id}
            className={`absolute transition-all ${isSelected ? 'ring-2 ring-primary ring-offset-2 z-20' : 'z-10'}`}
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              width: `${element.width}%`,
              height: `${element.height}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="relative w-full h-full group">
              <div
                className="w-full h-full cursor-move"
                onMouseDown={(e) => {
                  handleElementMouseDown(e, element.id);
                }}
              >
                <img
                  src={element.image}
                  alt="Element"
                  className="w-full h-full object-contain rounded-lg border-2 border-primary/50 shadow-lg pointer-events-none"
                  draggable={false}
                />
              </div>
              {isSelected && (
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
                  handleDeleteElement(element.id);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        );
      
      case 'shape':
        const ShapeIcon = element.shapeType === 'circle' ? Circle : element.shapeType === 'triangle' ? Triangle : Square;
        return (
          <div
            key={element.id}
            className={`absolute transition-all ${isSelected ? 'ring-2 ring-primary ring-offset-2 z-20' : 'z-10'}`}
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              width: `${element.width}%`,
              height: `${element.height}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="relative w-full h-full group">
              <div
                className="w-full h-full cursor-move"
                onMouseDown={(e) => {
                  handleElementMouseDown(e, element.id);
                }}
              >
                <div
                  className="w-full h-full rounded-lg border-2 border-primary/50 shadow-lg flex items-center justify-center"
                  style={{ backgroundColor: element.color }}
                >
                  <ShapeIcon className="w-1/2 h-1/2 text-white/50" />
                </div>
              </div>
              {isSelected && (
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
                  handleDeleteElement(element.id);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        );
      
      case 'chart':
        return (
          <div
            key={element.id}
            className={`absolute transition-all ${isSelected ? 'ring-2 ring-primary ring-offset-2 z-20' : 'z-10'}`}
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              width: `${element.width}%`,
              height: `${element.height}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="relative w-full h-full group">
              <div
                className="w-full h-full cursor-move"
                onMouseDown={(e) => {
                  handleElementMouseDown(e, element.id);
                }}
              >
                <div className="w-full h-full rounded-lg border-2 border-dashed border-primary/50 bg-primary/5 shadow-lg flex items-center justify-center">
                  <BarChart3 className="w-1/3 h-1/3 text-primary/50" />
                  <span className="absolute bottom-2 text-xs text-primary/70">{element.chartType} chart</span>
                </div>
              </div>
              {isSelected && (
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
                  handleDeleteElement(element.id);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <WorkflowHeader
        icon={BarChart3}
        title="Infographic Generator"
        description="Create powerful infographics with AI. Add elements, generate designs, and customize your visualizations like PowerPoint with AI power."
        iconColor="text-cyan-400"
        iconBgColor="bg-cyan-500/20"
        backButton={<BackButton onClick={onBack} variant="floating" />}
      />

      <div className="mb-6">
        <StepIndicator steps={[
          { number: 1, label: "Configure", status: !generatedInfographic ? "current" : "completed" },
          { number: 2, label: "Result", status: generatedInfographic ? "current" : "upcoming" },
        ]} />
      </div>

      {!generatedInfographic ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Canvas - Left Side (2 columns) */}
          <div className="lg:col-span-2">
            <WorkflowCard 
              title="Infographic Canvas" 
              description="Add elements to plan your infographic layout. AI will generate the final design."
            >
              <div className="space-y-4">
                {/* Topic/Prompt Input */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">Infographic Topic <span className="text-destructive">*</span></Label>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., 'Statistics about renewable energy adoption in 2024' or 'How to create a successful startup'"
                    rows={3}
                    className="bg-card/50 border-primary/30 resize-none"
                  />
                </div>

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
                  {/* Render all elements */}
                  {elements.map((element) => renderElement(element))}

                  {elements.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Add elements to plan your infographic</p>
                        <p className="text-xs mt-1">Or just enter a topic and let AI generate everything</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-xs text-muted-foreground text-center space-y-1">
                  <p className="font-semibold text-foreground mb-2">How to use:</p>
                  <div className="space-y-1.5 text-left bg-background/50 p-3 rounded-lg border border-primary/20">
                    <p>• <span className="font-semibold">Move:</span> Click and drag elements to reposition them</p>
                    <p>• <span className="font-semibold">Select:</span> Click an element to select it</p>
                    <p>• <span className="font-semibold">Edit:</span> Double-click an element or use the editor panel when selected</p>
                  </div>
                  {selectedElementData && (
                    <p className="text-accent font-semibold mt-2 animate-pulse">✓ Element selected - Use the editor panel on the right to modify</p>
                  )}
                </div>
              </div>
            </WorkflowCard>
          </div>

          {/* Controls - Right Side (1 column) */}
          <div className="space-y-4">
            {/* Edit Selected Element Section */}
            {selectedElementData && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-accent/80 flex items-center gap-2">
                    <Type className="w-3.5 h-3.5" />
                    Edit Element
                  </h3>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
                </div>

                <WorkflowCard 
                  title={`Edit ${selectedElementData.type.charAt(0).toUpperCase() + selectedElementData.type.slice(1)}`}
                  description="Modify selected element properties"
                >
                  <div className="space-y-3">
                    {selectedElementData.type === 'text' && (
                      <>
                        <div className="space-y-1">
                          <Label className="text-xs">Text Content</Label>
                          <Input
                            value={selectedElementData.text || ''}
                            onChange={(e) => handleUpdateElement(selectedElementData.id, { text: e.target.value })}
                            placeholder="Enter text..."
                            className="bg-card/50 border-accent/30 h-9 text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-xs">Font Size</Label>
                            <Input
                              type="number"
                              value={selectedElementData.fontSize || 24}
                              onChange={(e) => handleUpdateElement(selectedElementData.id, { fontSize: Number(e.target.value) })}
                              min="12"
                              max="72"
                              className="bg-card/50 border-accent/30 text-sm h-8"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Color</Label>
                            <Input
                              type="color"
                              value={selectedElementData.color || '#000000'}
                              onChange={(e) => handleUpdateElement(selectedElementData.id, { color: e.target.value })}
                              className="h-8 bg-card/50 border-accent/30"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {selectedElementData.type === 'shape' && (
                      <>
                        <div className="space-y-1">
                          <Label className="text-xs">Shape Type</Label>
                          <Select 
                            value={selectedElementData.shapeType || 'rectangle'} 
                            onValueChange={(v) => handleUpdateElement(selectedElementData.id, { shapeType: v as typeof newShapeType })}
                          >
                            <SelectTrigger className="bg-card/50 border-accent/30 h-9 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="rectangle">Rectangle</SelectItem>
                              <SelectItem value="circle">Circle</SelectItem>
                              <SelectItem value="triangle">Triangle</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Color</Label>
                          <Input
                            type="color"
                            value={selectedElementData.color || '#3b82f6'}
                            onChange={(e) => handleUpdateElement(selectedElementData.id, { color: e.target.value })}
                            className="h-8 bg-card/50 border-accent/30"
                          />
                        </div>
                      </>
                    )}

                    {selectedElementData.type === 'chart' && (
                      <div className="space-y-1">
                        <Label className="text-xs">Chart Type</Label>
                        <Select 
                          value={selectedElementData.chartType || 'bar'} 
                          onValueChange={(v) => handleUpdateElement(selectedElementData.id, { chartType: v as typeof newChartType })}
                        >
                          <SelectTrigger className="bg-card/50 border-accent/30 h-9 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bar">Bar Chart</SelectItem>
                            <SelectItem value="line">Line Chart</SelectItem>
                            <SelectItem value="pie">Pie Chart</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}


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

            {/* Add Elements Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-2">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-primary/80 flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5" />
                  Add Elements
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
                    <p className="text-xs text-muted-foreground">Upload images</p>
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
                    <p className="text-xs text-muted-foreground">Add text elements</p>
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

              {/* Add Shape */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-accent/5 border border-primary/20 backdrop-blur-sm hover:border-primary/30 transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Square className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Add Shape</h4>
                    <p className="text-xs text-muted-foreground">Add shape elements</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Shape Type</Label>
                    <Select value={newShapeType} onValueChange={(v) => setNewShapeType(v as typeof newShapeType)}>
                      <SelectTrigger className="bg-background/80 border-primary/30 h-9 text-sm focus:border-primary/60">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rectangle">Rectangle</SelectItem>
                        <SelectItem value="circle">Circle</SelectItem>
                        <SelectItem value="triangle">Triangle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Color</Label>
                    <Input
                      type="color"
                      value={newShapeColor}
                      onChange={(e) => setNewShapeColor(e.target.value)}
                      className="h-8 bg-background/80 border-primary/30 cursor-pointer"
                    />
                  </div>
                  <Button
                    onClick={handleAddShape}
                    className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 h-9 text-sm shadow-lg shadow-primary/20"
                    size="sm"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Add Shape
                  </Button>
                </div>
              </div>

              {/* Add Chart */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-accent/10 via-accent/5 to-primary/5 border border-accent/20 backdrop-blur-sm hover:border-accent/30 transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-accent/20">
                    <BarChart3 className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Add Chart</h4>
                    <p className="text-xs text-muted-foreground">Add chart placeholders</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Chart Type</Label>
                    <Select value={newChartType} onValueChange={(v) => setNewChartType(v as typeof newChartType)}>
                      <SelectTrigger className="bg-background/80 border-accent/30 h-9 text-sm focus:border-accent/60">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bar">Bar Chart</SelectItem>
                        <SelectItem value="line">Line Chart</SelectItem>
                        <SelectItem value="pie">Pie Chart</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleAddChart}
                    className="w-full bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 h-9 text-sm shadow-lg shadow-accent/20"
                    size="sm"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Add Chart
                  </Button>
                </div>
              </div>
            </div>

            {/* Configuration Section */}
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
                    <p className="text-xs text-muted-foreground">Configure infographic style</p>
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
                        <SelectItem value="4:3">Standard (4:3)</SelectItem>
                        <SelectItem value="3:4">Portrait (3:4)</SelectItem>
                        <SelectItem value="A4">A4 Document</SelectItem>
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
                        <SelectItem value="data">Data-Driven</SelectItem>
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
                    <h4 className="text-sm font-semibold text-foreground">Additional Details</h4>
                    <p className="text-xs text-muted-foreground">Optional: Add more context</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Description (Optional)</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add more details about your infographic..."
                    rows={3}
                    className="bg-background/80 border-primary/30 resize-none text-xs focus:border-primary/60"
                  />
                </div>
              </div>
            </div>

            {/* Generation Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-2">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-primary/80 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate
                </h3>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
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
                    Generate Infographic
                  </>
                )}
              </Button>

              {/* Status Info */}
              {elements.length > 0 && (
                <div className="p-2.5 rounded-lg bg-card/40 border border-primary/10 text-center">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{elements.length}</span> element{elements.length === 1 ? '' : 's'} on canvas
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <WorkflowCard
          title="Infographic Generated Successfully"
          description={`${style} style • ${aspectRatio} ratio`}
        >
          <div className="space-y-5">
            <div className="relative group">
              <div className="w-full max-h-[600px] rounded-xl border-2 border-primary/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-6 flex items-center justify-center overflow-hidden shadow-2xl">
                <img
                  src={generatedInfographic}
                  alt="Generated infographic"
                  className="w-full h-full object-contain max-h-[550px] rounded-lg"
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
                New Infographic
              </Button>
            </div>
          </div>
        </WorkflowCard>
      )}
    </div>
  );
};
