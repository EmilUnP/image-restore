import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Languages } from "lucide-react";

type AppFunction = 'enhance' | 'translate' | null;

interface FunctionSelectorProps {
  onFunctionSelect: (func: AppFunction) => void;
}

export const FunctionSelector = ({ onFunctionSelect }: FunctionSelectorProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Choose Your Function</h2>
        <p className="text-muted-foreground">Select what you'd like to do with your images</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Image Quality Improver */}
        <Card 
          className="border-border hover:border-primary transition-all cursor-pointer hover:shadow-lg"
          onClick={() => onFunctionSelect('enhance')}
        >
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-lg bg-gradient-to-br from-primary to-accent">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl">Image Quality Improver</CardTitle>
            </div>
            <CardDescription>
              Enhance image quality using AI. Improve sharpness, reduce noise, enhance colors, and restore old photos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground mb-4">
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                Enhance photos, documents, and portraits
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                Multiple enhancement modes available
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                Adjustable intensity levels
              </li>
            </ul>
            <Button 
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
              onClick={() => onFunctionSelect('enhance')}
            >
              Use Image Quality Improver
            </Button>
          </CardContent>
        </Card>

        {/* Text Translation */}
        <Card 
          className="border-border hover:border-primary transition-all cursor-pointer hover:shadow-lg"
          onClick={() => onFunctionSelect('translate')}
        >
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-lg bg-gradient-to-br from-accent to-primary">
                <Languages className="w-6 h-6 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl">Text Translation</CardTitle>
            </div>
            <CardDescription>
              Translate text on images to any language while keeping the original image quality and style intact.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground mb-4">
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                Translate text in images to any language
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                Preserves original image quality
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                AI-powered translation
              </li>
            </ul>
            <Button 
              className="w-full bg-gradient-to-r from-accent to-primary hover:opacity-90"
              onClick={() => onFunctionSelect('translate')}
            >
              Use Text Translation
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

