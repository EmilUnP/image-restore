import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Sparkles, Zap, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EnhancementMode {
  id: string;
  name: string;
  description: string;
}

interface EnhancementModeSelectorProps {
  mode: string;
  intensity: string;
  onModeChange: (mode: string) => void;
  onIntensityChange: (intensity: string) => void;
  disabled?: boolean;
}

export const EnhancementModeSelector = ({
  mode,
  intensity,
  onModeChange,
  onIntensityChange,
  disabled = false,
}: EnhancementModeSelectorProps) => {
  const [modes, setModes] = useState<EnhancementMode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModes = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${API_URL}/api/enhancement-modes`);
        if (response.ok) {
          const data = await response.json();
          setModes(data.modes || []);
        }
      } catch (error) {
        console.error('Failed to fetch enhancement modes:', error);
        // Fallback modes if API fails
        setModes([
          { id: 'photo', name: 'Photo', description: 'Enhance general photographs' },
          { id: 'document', name: 'Document', description: 'Perfect for scanned documents' },
          { id: 'portrait', name: 'Portrait', description: 'Optimized for portraits' },
          { id: 'landscape', name: 'Landscape', description: 'Enhance landscape photos' },
          { id: 'lowlight', name: 'Low Light', description: 'Brighten dark images' },
          { id: 'art', name: 'Art', description: 'Enhance artwork and illustrations' },
          { id: 'old', name: 'Old Photo', description: 'Restore vintage images' },
          { id: 'product', name: 'Product', description: 'Perfect for product photos' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchModes();
  }, []);

  const intensityValue = intensity === 'low' ? 1 : intensity === 'high' ? 3 : 2;
  const handleIntensitySliderChange = (value: number[]) => {
    const val = value[0];
    if (val <= 1.5) {
      onIntensityChange('low');
    } else if (val >= 2.5) {
      onIntensityChange('high');
    } else {
      onIntensityChange('medium');
    }
  };

  const modeIcons: Record<string, string> = {
    document: '📄',
    photo: '📷',
    portrait: '👤',
    landscape: '🏞️',
    lowlight: '🌙',
    art: '🎨',
    old: '🖼️',
    product: '📦',
  };

  if (loading) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Loading Enhancement Modes...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhancement Mode Selection */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Enhancement Mode
          </CardTitle>
          <CardDescription>
            Choose the best enhancement type for your image
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={mode}
            onValueChange={onModeChange}
            disabled={disabled}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {modes.map((enhancementMode) => (
              <div key={enhancementMode.id}>
                <RadioGroupItem
                  value={enhancementMode.id}
                  id={enhancementMode.id}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={enhancementMode.id}
                  className="flex flex-col items-center justify-between rounded-lg border-2 border-border bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                >
                  <div className="text-2xl mb-2">
                    {modeIcons[enhancementMode.id] || '✨'}
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-sm mb-1">
                      {enhancementMode.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {enhancementMode.description}
                    </div>
                  </div>
                  {mode === enhancementMode.id && (
                    <Badge className="mt-2" variant="default">
                      Selected
                    </Badge>
                  )}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Enhancement Intensity */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Enhancement Intensity
          </CardTitle>
          <CardDescription>
            Adjust the strength of enhancements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium">Intensity Level</Label>
              <Badge variant="outline" className="capitalize">
                {intensity}
              </Badge>
            </div>
            <Slider
              value={[intensityValue]}
              onValueChange={handleIntensitySliderChange}
              min={1}
              max={3}
              step={1}
              disabled={disabled}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Subtle</span>
              <span>Balanced</span>
              <span>Aggressive</span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              <strong>Low:</strong> Subtle enhancements, preserves original character
            </p>
            <p>
              <strong>Medium:</strong> Balanced improvements for most images
            </p>
            <p>
              <strong>High:</strong> Maximum quality improvements, may be more dramatic
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

