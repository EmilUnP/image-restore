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

      <div className="grid md:grid-cols-2 gap-6 md:gap-8">
        {/* Image Quality Improver */}
        <Card 
          className="border-2 border-border hover:border-primary/50 transition-all duration-300 cursor-pointer hover-lift group relative overflow-hidden bg-gradient-to-br from-card to-card/50 backdrop-blur-sm"
          onClick={() => onFunctionSelect('enhance')}
        >
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
          
          <CardHeader className="relative z-10 pb-4">
            <div className="flex items-center gap-4 mb-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative p-4 rounded-xl bg-gradient-to-br from-primary to-accent group-hover:scale-110 transition-transform duration-300 shadow-glow group-hover:shadow-glow-accent">
                  <Sparkles className="w-6 h-6 text-primary-foreground" />
                </div>
              </div>
              <CardTitle className="text-2xl md:text-3xl font-bold">Image Quality Improver</CardTitle>
            </div>
            <CardDescription className="text-base text-muted-foreground/80 leading-relaxed">
              Enhance image quality using AI. Improve sharpness, reduce noise, enhance colors, and restore old photos.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10 space-y-4">
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3 transition-all group-hover:text-foreground">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <span className="text-primary font-bold text-xs">✓</span>
                </div>
                <span>Enhance photos, documents, and portraits</span>
              </li>
              <li className="flex items-center gap-3 transition-all group-hover:text-foreground">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <span className="text-primary font-bold text-xs">✓</span>
                </div>
                <span>Multiple enhancement modes available</span>
              </li>
              <li className="flex items-center gap-3 transition-all group-hover:text-foreground">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <span className="text-primary font-bold text-xs">✓</span>
                </div>
                <span>Adjustable intensity levels</span>
              </li>
            </ul>
            <Button 
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold shadow-md hover:shadow-glow-accent transition-all duration-300 h-12 text-base"
              onClick={() => onFunctionSelect('enhance')}
            >
              Use Image Quality Improver
            </Button>
          </CardContent>
        </Card>

        {/* Text Translation */}
        <Card 
          className="border-2 border-border hover:border-accent/50 transition-all duration-300 cursor-pointer hover-lift group relative overflow-hidden bg-gradient-to-br from-card to-card/50 backdrop-blur-sm"
          onClick={() => onFunctionSelect('translate')}
        >
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute top-0 left-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl -translate-y-1/2 -translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
          
          <CardHeader className="relative z-10 pb-4">
            <div className="flex items-center gap-4 mb-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-accent to-primary rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative p-4 rounded-xl bg-gradient-to-br from-accent to-primary group-hover:scale-110 transition-transform duration-300 shadow-glow group-hover:shadow-glow-accent">
                  <Languages className="w-6 h-6 text-primary-foreground" />
                </div>
              </div>
              <CardTitle className="text-2xl md:text-3xl font-bold">Text Translation</CardTitle>
            </div>
            <CardDescription className="text-base text-muted-foreground/80 leading-relaxed">
              Translate text on images to any language while keeping the original image quality and style intact.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10 space-y-4">
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3 transition-all group-hover:text-foreground">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <span className="text-accent font-bold text-xs">✓</span>
                </div>
                <span>Translate text in images to any language</span>
              </li>
              <li className="flex items-center gap-3 transition-all group-hover:text-foreground">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <span className="text-accent font-bold text-xs">✓</span>
                </div>
                <span>Preserves original image quality</span>
              </li>
              <li className="flex items-center gap-3 transition-all group-hover:text-foreground">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <span className="text-accent font-bold text-xs">✓</span>
                </div>
                <span>AI-powered translation</span>
              </li>
            </ul>
            <Button 
              className="w-full bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-white font-semibold shadow-md hover:shadow-glow-accent transition-all duration-300 h-12 text-base"
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

