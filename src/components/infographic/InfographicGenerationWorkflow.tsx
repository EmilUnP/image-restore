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
import { BarChart3, Sparkles, X, Download, Image as ImageIcon, Type, Move, Trash2, Plus, Square, Circle, Triangle, TrendingUp } from "lucide-react";
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
  const [isResizing, setIsResizing] = useState(false);
  const [resizeInfo, setResizeInfo] = useState<{
    elementId: string;
    handle: 'se' | 'sw' | 'ne' | 'nw';
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    startXPercent: number;
    startYPercent: number;
  } | null>(null);
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
    const target = e.target as HTMLElement;
    if (target.closest('.resize-handle') || target.hasAttribute('data-resize-handle')) {
      return;
    }
    
    if (isResizing) {
      return;
    }
    
    e.stopPropagation();
    setSelectedElement(id);
    setIsDragging(true);
    setIsResizing(false);
    setResizeInfo(null);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const element = elements.find(el => el.id === id);
    
    if (element) {
      const elementX = (element.x / 100) * rect.width;
      const elementY = (element.y / 100) * rect.height;
      setDragOffset({
        x: e.clientX - rect.left - elementX,
        y: e.clientY - rect.top - elementY,
      });
    }
  };

  const handleResizeStart = (e: React.MouseEvent, id: string, handle: 'se' | 'sw' | 'ne' | 'nw') => {
    e.stopPropagation();
    e.preventDefault();
    e.nativeEvent.stopImmediatePropagation();
    
    setIsResizing(true);
    setIsDragging(false);
    setSelectedElement(id);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const element = elements.find(el => el.id === id);
    
    if (!element || !element.width || !element.height) return;
    
    const startX = e.clientX;
    const startY = e.clientY;
    
    setResizeInfo({
      elementId: id,
      handle,
      startX,
      startY,
      startWidth: element.width,
      startHeight: element.height,
      startXPercent: element.x,
      startYPercent: element.y,
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    if (isResizing && resizeInfo) {
      requestAnimationFrame(() => {
        const deltaX = e.clientX - resizeInfo.startX;
        const deltaY = e.clientY - resizeInfo.startY;
        
        const deltaXPercent = (deltaX / rect.width) * 100;
        const deltaYPercent = (deltaY / rect.height) * 100;
        
        setElements(prev => {
          const elementIndex = prev.findIndex(el => el.id === resizeInfo.elementId);
          if (elementIndex === -1) return prev;
          
          const element = prev[elementIndex];
          if (!element.width || !element.height) return prev;
          
          let newWidth = resizeInfo.startWidth;
          let newHeight = resizeInfo.startHeight;
          let newX = resizeInfo.startXPercent;
          let newY = resizeInfo.startYPercent;
          
          switch (resizeInfo.handle) {
            case 'se':
              newWidth = resizeInfo.startWidth + deltaXPercent;
              newHeight = resizeInfo.startHeight + deltaYPercent;
              break;
            case 'sw':
              newWidth = resizeInfo.startWidth - deltaXPercent;
              newHeight = resizeInfo.startHeight + deltaYPercent;
              newX = resizeInfo.startXPercent - (deltaXPercent / 2);
              break;
            case 'ne':
              newWidth = resizeInfo.startWidth + deltaXPercent;
              newHeight = resizeInfo.startHeight - deltaYPercent;
              newY = resizeInfo.startYPercent - (deltaYPercent / 2);
              break;
            case 'nw':
              newWidth = resizeInfo.startWidth - deltaXPercent;
              newHeight = resizeInfo.startHeight - deltaYPercent;
              newX = resizeInfo.startXPercent - (deltaXPercent / 2);
              newY = resizeInfo.startYPercent - (deltaYPercent / 2);
              break;
          }
          
          newWidth = Math.max(5, Math.min(80, newWidth));
          newHeight = Math.max(5, Math.min(80, newHeight));
          newX = Math.max(0, Math.min(100, newX));
          newY = Math.max(0, Math.min(100, newY));
          
          const updated = [...prev];
          updated[elementIndex] = { 
            ...updated[elementIndex], 
            width: newWidth, 
            height: newHeight,
            x: newX,
            y: newY,
          };
          return updated;
        });
      });
      return;
    }
    
    if (isDragging && selectedElement && !isResizing && !resizeInfo) {
      requestAnimationFrame(() => {
        const x = ((e.clientX - rect.left - dragOffset.x) / rect.width) * 100;
        const y = ((e.clientY - rect.top - dragOffset.y) / rect.height) * 100;
        
        const clampedX = Math.max(0, Math.min(100, x));
        const clampedY = Math.max(0, Math.min(100, y));
        
        setElements(prev => {
          const elementIndex = prev.findIndex(el => el.id === selectedElement);
          if (elementIndex !== -1) {
            const updated = [...prev];
            updated[elementIndex] = { ...updated[elementIndex], x: clampedX, y: clampedY };
            return updated;
          }
          return prev;
        });
      });
    }
  }, [isDragging, isResizing, resizeInfo, selectedElement, dragOffset, elements]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeInfo(null);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const handleDeleteElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
    toast.success('Element removed');
  };

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
            <div className="relative group px-2 py-1 bg-white/90 rounded border-2 border-primary/50 shadow-lg">
              <div
                className="cursor-move"
                onMouseDown={(e) => {
                  const target = e.target as HTMLElement;
                  if (!target.closest('.resize-handle') && !target.hasAttribute('data-resize-handle')) {
                    handleElementMouseDown(e, element.id);
                  }
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
                <>
                  <div
                    data-resize-handle="true"
                    className="resize-handle absolute -bottom-2 -right-2 w-4 h-4 bg-primary border-2 border-white rounded-full cursor-se-resize z-[100] hover:scale-125"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleResizeStart(e, element.id, 'se');
                    }}
                  />
                  <div
                    data-resize-handle="true"
                    className="resize-handle absolute -bottom-2 -left-2 w-4 h-4 bg-primary border-2 border-white rounded-full cursor-sw-resize z-[100] hover:scale-125"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleResizeStart(e, element.id, 'sw');
                    }}
                  />
                </>
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
                  const target = e.target as HTMLElement;
                  if (!target.closest('.resize-handle') && !target.hasAttribute('data-resize-handle')) {
                    handleElementMouseDown(e, element.id);
                  }
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
                <>
                  <div
                    data-resize-handle="true"
                    className="resize-handle absolute -bottom-2 -right-2 w-5 h-5 bg-primary border-2 border-white rounded-full cursor-se-resize z-[100] hover:scale-125"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleResizeStart(e, element.id, 'se');
                    }}
                  />
                  <div
                    data-resize-handle="true"
                    className="resize-handle absolute -bottom-2 -left-2 w-5 h-5 bg-primary border-2 border-white rounded-full cursor-sw-resize z-[100] hover:scale-125"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleResizeStart(e, element.id, 'sw');
                    }}
                  />
                  <div
                    data-resize-handle="true"
                    className="resize-handle absolute -top-2 -right-2 w-5 h-5 bg-primary border-2 border-white rounded-full cursor-ne-resize z-[100] hover:scale-125"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleResizeStart(e, element.id, 'ne');
                    }}
                  />
                  <div
                    data-resize-handle="true"
                    className="resize-handle absolute -top-2 -left-2 w-5 h-5 bg-primary border-2 border-white rounded-full cursor-nw-resize z-[100] hover:scale-125"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleResizeStart(e, element.id, 'nw');
                    }}
                  />
                </>
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
                  const target = e.target as HTMLElement;
                  if (!target.closest('.resize-handle') && !target.hasAttribute('data-resize-handle')) {
                    handleElementMouseDown(e, element.id);
                  }
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
                <>
                  <div
                    data-resize-handle="true"
                    className="resize-handle absolute -bottom-2 -right-2 w-5 h-5 bg-primary border-2 border-white rounded-full cursor-se-resize z-[100] hover:scale-125"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleResizeStart(e, element.id, 'se');
                    }}
                  />
                  <div
                    data-resize-handle="true"
                    className="resize-handle absolute -bottom-2 -left-2 w-5 h-5 bg-primary border-2 border-white rounded-full cursor-sw-resize z-[100] hover:scale-125"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleResizeStart(e, element.id, 'sw');
                    }}
                  />
                  <div
                    data-resize-handle="true"
                    className="resize-handle absolute -top-2 -right-2 w-5 h-5 bg-primary border-2 border-white rounded-full cursor-ne-resize z-[100] hover:scale-125"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleResizeStart(e, element.id, 'ne');
                    }}
                  />
                  <div
                    data-resize-handle="true"
                    className="resize-handle absolute -top-2 -left-2 w-5 h-5 bg-primary border-2 border-white rounded-full cursor-nw-resize z-[100] hover:scale-125"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleResizeStart(e, element.id, 'nw');
                    }}
                  />
                </>
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
                  const target = e.target as HTMLElement;
                  if (!target.closest('.resize-handle') && !target.hasAttribute('data-resize-handle')) {
                    handleElementMouseDown(e, element.id);
                  }
                }}
              >
                <div className="w-full h-full rounded-lg border-2 border-dashed border-primary/50 bg-primary/5 shadow-lg flex items-center justify-center">
                  <BarChart3 className="w-1/3 h-1/3 text-primary/50" />
                  <span className="absolute bottom-2 text-xs text-primary/70">{element.chartType} chart</span>
                </div>
              </div>
              {isSelected && (
                <>
                  <div
                    data-resize-handle="true"
                    className="resize-handle absolute -bottom-2 -right-2 w-5 h-5 bg-primary border-2 border-white rounded-full cursor-se-resize z-[100] hover:scale-125"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleResizeStart(e, element.id, 'se');
                    }}
                  />
                  <div
                    data-resize-handle="true"
                    className="resize-handle absolute -bottom-2 -left-2 w-5 h-5 bg-primary border-2 border-white rounded-full cursor-sw-resize z-[100] hover:scale-125"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleResizeStart(e, element.id, 'sw');
                    }}
                  />
                  <div
                    data-resize-handle="true"
                    className="resize-handle absolute -top-2 -right-2 w-5 h-5 bg-primary border-2 border-white rounded-full cursor-ne-resize z-[100] hover:scale-125"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleResizeStart(e, element.id, 'ne');
                    }}
                  />
                  <div
                    data-resize-handle="true"
                    className="resize-handle absolute -top-2 -left-2 w-5 h-5 bg-primary border-2 border-white rounded-full cursor-nw-resize z-[100] hover:scale-125"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleResizeStart(e, element.id, 'nw');
                    }}
                  />
                </>
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
                  className="relative border-2 border-primary/30 rounded-xl bg-gradient-to-br from-slate-900/50 to-slate-800/50 overflow-hidden"
                  style={{ 
                    width: `${canvasDims.width}px`, 
                    height: `${canvasDims.height}px`,
                    maxWidth: '100%',
                    margin: '0 auto'
                  }}
                  onClick={() => setSelectedElement(null)}
                >
                  {/* Render all elements */}
                  {elements.map((element) => {
                    const rendered = renderElement(element);
                    return rendered ? { ...rendered, key: element.id } : null;
                  })}

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
                  <p>Click and drag elements to reposition them</p>
                  <p>Click an element to select it, then drag the corner handles to resize</p>
                </div>
              </div>
            </WorkflowCard>
          </div>

          {/* Controls - Right Side (1 column) */}
          <div className="space-y-4">
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
              <WorkflowCard title="Add Image" description="Upload images">
                <ImageUpload
                  onImageSelect={handleImageUpload}
                  label="Upload Image"
                  description="Click to select"
                />
              </WorkflowCard>

              {/* Add Text */}
              <WorkflowCard title="Add Text" description="Add text elements">
                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Text Content</Label>
                    <Input
                      value={newText}
                      onChange={(e) => setNewText(e.target.value)}
                      placeholder="Enter text..."
                      className="bg-card/50 border-primary/30 h-9 text-sm"
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
                        className="bg-card/50 border-primary/30 text-sm h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Color</Label>
                      <Input
                        type="color"
                        value={newTextColor}
                        onChange={(e) => setNewTextColor(e.target.value)}
                        className="h-8 bg-card/50 border-primary/30"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleAddText}
                    disabled={!newText.trim()}
                    className="w-full bg-primary hover:bg-primary/90 h-9 text-sm"
                    size="sm"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Add Text
                  </Button>
                </div>
              </WorkflowCard>

              {/* Add Shape */}
              <WorkflowCard title="Add Shape" description="Add shape elements">
                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Shape Type</Label>
                    <Select value={newShapeType} onValueChange={(v) => setNewShapeType(v as typeof newShapeType)}>
                      <SelectTrigger className="bg-card/50 border-primary/30 h-9 text-sm">
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
                      className="h-8 bg-card/50 border-primary/30"
                    />
                  </div>
                  <Button
                    onClick={handleAddShape}
                    className="w-full bg-primary hover:bg-primary/90 h-9 text-sm"
                    size="sm"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Add Shape
                  </Button>
                </div>
              </WorkflowCard>

              {/* Add Chart */}
              <WorkflowCard title="Add Chart" description="Add chart placeholders">
                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Chart Type</Label>
                    <Select value={newChartType} onValueChange={(v) => setNewChartType(v as typeof newChartType)}>
                      <SelectTrigger className="bg-card/50 border-primary/30 h-9 text-sm">
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
                    className="w-full bg-primary hover:bg-primary/90 h-9 text-sm"
                    size="sm"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Add Chart
                  </Button>
                </div>
              </WorkflowCard>
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
              <WorkflowCard title="Settings" description="Configure infographic style">
                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <Label className="text-xs">Aspect Ratio</Label>
                    <Select value={aspectRatio} onValueChange={setAspectRatio}>
                      <SelectTrigger className="bg-card/50 border-primary/30 h-9 text-sm">
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
                      <SelectTrigger className="bg-card/50 border-primary/30 h-9 text-sm">
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
              </WorkflowCard>

              {/* Description */}
              <WorkflowCard title="Additional Details" description="Optional: Add more context">
                <div className="space-y-1.5">
                  <Label className="text-xs">Description (Optional)</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add more details about your infographic..."
                    rows={3}
                    className="bg-card/50 border-primary/30 resize-none text-xs"
                  />
                </div>
              </WorkflowCard>
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
