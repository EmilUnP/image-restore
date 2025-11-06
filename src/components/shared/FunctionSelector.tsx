import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Languages } from "lucide-react";

type AppFunction = 'enhance' | 'translate' | null;

interface FunctionSelectorProps {
  onFunctionSelect: (func: AppFunction) => void;
}

export const FunctionSelector = ({ onFunctionSelect }: FunctionSelectorProps) => {
  return (
    <div className="space-y-8">
      <div className="text-center mb-10 animate-fade-in">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 tracking-tight">Choose Your Function</h2>
        <p className="text-muted-foreground text-base md:text-lg">Select what you'd like to do with your images</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 md:gap-8 lg:gap-10">
        {/* Image Quality Improver */}
        <Card 
          className="border-2 border-border/60 hover:border-primary/60 transition-all duration-500 cursor-pointer hover-lift group relative overflow-hidden bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-sm shadow-sm hover:shadow-lg"
          onClick={() => onFunctionSelect('enhance')}
        >
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
          
          <CardHeader className="relative z-10 pb-5">
            <div className="flex items-start gap-4 mb-4">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
                <div className="relative p-4 rounded-2xl bg-gradient-to-br from-primary to-accent group-hover:scale-110 transition-transform duration-300 shadow-glow group-hover:shadow-glow-accent">
                  <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-primary-foreground" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl md:text-2xl lg:text-3xl font-bold mb-2 leading-tight">Image Quality Improver</CardTitle>
                <CardDescription className="text-sm md:text-base text-muted-foreground/90 leading-relaxed">
                  Enhance image quality using AI. Improve sharpness, reduce noise, enhance colors, and restore old photos.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10 space-y-5">
            <ul className="space-y-3.5 text-sm md:text-base">
              <li className="flex items-center gap-3.5 transition-all group-hover:text-foreground">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
                  <span className="text-primary font-bold text-xs">✓</span>
                </div>
                <span className="text-muted-foreground group-hover:text-foreground transition-colors">Enhance photos, documents, and portraits</span>
              </li>
              <li className="flex items-center gap-3.5 transition-all group-hover:text-foreground">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
                  <span className="text-primary font-bold text-xs">✓</span>
                </div>
                <span className="text-muted-foreground group-hover:text-foreground transition-colors">Multiple enhancement modes available</span>
              </li>
              <li className="flex items-center gap-3.5 transition-all group-hover:text-foreground">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
                  <span className="text-primary font-bold text-xs">✓</span>
                </div>
                <span className="text-muted-foreground group-hover:text-foreground transition-colors">Adjustable intensity levels</span>
              </li>
            </ul>
            <Button 
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold shadow-md hover:shadow-glow-accent transition-all duration-300 h-12 md:h-14 text-base md:text-lg rounded-xl"
              onClick={() => onFunctionSelect('enhance')}
            >
              Use Image Quality Improver
            </Button>
          </CardContent>
        </Card>

        {/* Text Translation */}
        <Card 
          className="border-2 border-border/60 hover:border-accent/60 transition-all duration-500 cursor-pointer hover-lift group relative overflow-hidden bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-sm shadow-sm hover:shadow-lg"
          onClick={() => onFunctionSelect('translate')}
        >
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute top-0 left-0 w-40 h-40 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
          
          <CardHeader className="relative z-10 pb-5">
            <div className="flex items-start gap-4 mb-4">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-accent to-primary rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
                <div className="relative p-4 rounded-2xl bg-gradient-to-br from-accent to-primary group-hover:scale-110 transition-transform duration-300 shadow-glow group-hover:shadow-glow-accent">
                  <Languages className="w-6 h-6 md:w-7 md:h-7 text-primary-foreground" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl md:text-2xl lg:text-3xl font-bold mb-2 leading-tight">Text Translation</CardTitle>
                <CardDescription className="text-sm md:text-base text-muted-foreground/90 leading-relaxed">
                  Translate text on images to any language while keeping the original image quality and style intact.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10 space-y-5">
            <ul className="space-y-3.5 text-sm md:text-base">
              <li className="flex items-center gap-3.5 transition-all group-hover:text-foreground">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-all duration-300 group-hover:scale-110">
                  <span className="text-accent font-bold text-xs">✓</span>
                </div>
                <span className="text-muted-foreground group-hover:text-foreground transition-colors">Translate text in images to any language</span>
              </li>
              <li className="flex items-center gap-3.5 transition-all group-hover:text-foreground">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-all duration-300 group-hover:scale-110">
                  <span className="text-accent font-bold text-xs">✓</span>
                </div>
                <span className="text-muted-foreground group-hover:text-foreground transition-colors">Preserves original image quality</span>
              </li>
              <li className="flex items-center gap-3.5 transition-all group-hover:text-foreground">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-all duration-300 group-hover:scale-110">
                  <span className="text-accent font-bold text-xs">✓</span>
                </div>
                <span className="text-muted-foreground group-hover:text-foreground transition-colors">AI-powered translation</span>
              </li>
            </ul>
            <Button 
              className="w-full bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-white font-semibold shadow-md hover:shadow-glow-accent transition-all duration-300 h-12 md:h-14 text-base md:text-lg rounded-xl"
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


