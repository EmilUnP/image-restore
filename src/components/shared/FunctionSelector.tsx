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
      <div className="text-center mb-8 animate-fade-in">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">Choose Your Function</h2>
        <p className="text-muted-foreground">Select what you'd like to do with your images</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        {/* Image Quality Improver */}
        <Card 
          className="border-border hover:border-primary transition-all duration-300 cursor-pointer hover:shadow-xl hover:scale-[1.02] group relative overflow-hidden"
          onClick={() => onFunctionSelect('enhance')}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-lg bg-gradient-to-br from-primary to-accent group-hover:scale-110 transition-transform duration-300 shadow-md">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <CardTitle className="text-xl md:text-2xl">Image Quality Improver</CardTitle>
            </div>
            <CardDescription className="text-balance">
              Enhance image quality using AI. Improve sharpness, reduce noise, enhance colors, and restore old photos.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <ul className="space-y-2 text-sm text-muted-foreground mb-4">
              <li className="flex items-center gap-2 transition-colors group-hover:text-foreground">
                <span className="text-primary font-bold">✓</span>
                Enhance photos, documents, and portraits
              </li>
              <li className="flex items-center gap-2 transition-colors group-hover:text-foreground">
                <span className="text-primary font-bold">✓</span>
                Multiple enhancement modes available
              </li>
              <li className="flex items-center gap-2 transition-colors group-hover:text-foreground">
                <span className="text-primary font-bold">✓</span>
                Adjustable intensity levels
              </li>
            </ul>
            <Button 
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 hover:shadow-lg transition-all duration-300"
              onClick={() => onFunctionSelect('enhance')}
            >
              Use Image Quality Improver
            </Button>
          </CardContent>
        </Card>

        {/* Text Translation */}
        <Card 
          className="border-border hover:border-primary transition-all duration-300 cursor-pointer hover:shadow-xl hover:scale-[1.02] group relative overflow-hidden"
          onClick={() => onFunctionSelect('translate')}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-lg bg-gradient-to-br from-accent to-primary group-hover:scale-110 transition-transform duration-300 shadow-md">
                <Languages className="w-6 h-6 text-primary-foreground" />
              </div>
              <CardTitle className="text-xl md:text-2xl">Text Translation</CardTitle>
            </div>
            <CardDescription className="text-balance">
              Translate text on images to any language while keeping the original image quality and style intact.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <ul className="space-y-2 text-sm text-muted-foreground mb-4">
              <li className="flex items-center gap-2 transition-colors group-hover:text-foreground">
                <span className="text-primary font-bold">✓</span>
                Translate text in images to any language
              </li>
              <li className="flex items-center gap-2 transition-colors group-hover:text-foreground">
                <span className="text-primary font-bold">✓</span>
                Preserves original image quality
              </li>
              <li className="flex items-center gap-2 transition-colors group-hover:text-foreground">
                <span className="text-primary font-bold">✓</span>
                AI-powered translation
              </li>
            </ul>
            <Button 
              className="w-full bg-gradient-to-r from-accent to-primary hover:opacity-90 hover:shadow-lg transition-all duration-300"
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

