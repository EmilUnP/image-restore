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

      <div className="grid md:grid-cols-2 gap-8 md:gap-10 lg:gap-12">
        {/* Image Quality Improver */}
        <Card 
          className="border-2 border-border/50 hover:border-primary/70 transition-all duration-700 cursor-pointer hover-lift group relative overflow-hidden bg-gradient-to-br from-card/95 via-card/90 to-card/95 backdrop-blur-md shadow-md hover:shadow-2xl rounded-2xl"
          onClick={() => onFunctionSelect('enhance')}
        >
          {/* Enhanced animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/8 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 group-hover:opacity-80 transition-all duration-1000" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 group-hover:scale-125 transition-all duration-1000" />
          
          <CardHeader className="relative z-10 pb-6 pt-6 px-6">
            <div className="flex items-start gap-5 mb-5">
              <div className="relative flex-shrink-0 group/icon">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-3xl blur-xl opacity-60 group-hover/icon:opacity-90 transition-opacity duration-500 animate-pulse-slow" />
                <div className="relative p-5 rounded-3xl bg-gradient-to-br from-primary via-primary/95 to-accent group-hover/icon:scale-110 group-hover/icon:rotate-3 transition-all duration-500 shadow-glow group-hover/icon:shadow-glow-accent">
                  <Sparkles className="w-7 h-7 md:w-8 md:h-8 text-primary-foreground relative z-10" />
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover/icon:opacity-100 transition-opacity duration-500" />
                </div>
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <CardTitle className="text-2xl md:text-3xl lg:text-4xl font-extrabold mb-3 leading-tight tracking-tight">Image Quality Improver</CardTitle>
                <CardDescription className="text-base md:text-lg text-muted-foreground/90 leading-relaxed font-light">
                  Enhance image quality using AI. Improve sharpness, reduce noise, enhance colors, and restore old photos.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10 space-y-6 px-6 pb-6">
            <ul className="space-y-4 text-base md:text-lg">
              <li className="flex items-center gap-4 transition-all duration-300 group-hover:text-foreground">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 shadow-sm">
                  <span className="text-primary font-bold text-sm">✓</span>
                </div>
                <span className="text-muted-foreground group-hover:text-foreground transition-colors duration-300 font-medium">Enhance photos, documents, and portraits</span>
              </li>
              <li className="flex items-center gap-4 transition-all duration-300 group-hover:text-foreground">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 shadow-sm">
                  <span className="text-primary font-bold text-sm">✓</span>
                </div>
                <span className="text-muted-foreground group-hover:text-foreground transition-colors duration-300 font-medium">Multiple enhancement modes available</span>
              </li>
              <li className="flex items-center gap-4 transition-all duration-300 group-hover:text-foreground">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 shadow-sm">
                  <span className="text-primary font-bold text-sm">✓</span>
                </div>
                <span className="text-muted-foreground group-hover:text-foreground transition-colors duration-300 font-medium">Adjustable intensity levels</span>
              </li>
            </ul>
            <Button 
              className="w-full bg-gradient-to-r from-primary via-primary/95 to-accent hover:from-primary/95 hover:via-primary/90 hover:to-accent/95 text-white font-bold shadow-lg hover:shadow-glow-accent transition-all duration-500 h-14 md:h-16 text-lg md:text-xl rounded-2xl group/btn relative overflow-hidden"
              onClick={() => onFunctionSelect('enhance')}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Use Image Quality Improver
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
            </Button>
          </CardContent>
        </Card>

        {/* Text Translation */}
        <Card 
          className="border-2 border-border/50 hover:border-accent/70 transition-all duration-700 cursor-pointer hover-lift group relative overflow-hidden bg-gradient-to-br from-card/95 via-card/90 to-card/95 backdrop-blur-md shadow-md hover:shadow-2xl rounded-2xl"
          onClick={() => onFunctionSelect('translate')}
        >
          {/* Enhanced animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent/8 via-transparent to-primary/8 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="absolute top-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 group-hover:scale-150 group-hover:opacity-80 transition-all duration-1000" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-all duration-1000" />
          
          <CardHeader className="relative z-10 pb-6 pt-6 px-6">
            <div className="flex items-start gap-5 mb-5">
              <div className="relative flex-shrink-0 group/icon">
                <div className="absolute inset-0 bg-gradient-to-br from-accent to-primary rounded-3xl blur-xl opacity-60 group-hover/icon:opacity-90 transition-opacity duration-500 animate-pulse-slow" />
                <div className="relative p-5 rounded-3xl bg-gradient-to-br from-accent via-accent/95 to-primary group-hover/icon:scale-110 group-hover/icon:rotate-3 transition-all duration-500 shadow-glow group-hover/icon:shadow-glow-accent">
                  <Languages className="w-7 h-7 md:w-8 md:h-8 text-primary-foreground relative z-10" />
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover/icon:opacity-100 transition-opacity duration-500" />
                </div>
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <CardTitle className="text-2xl md:text-3xl lg:text-4xl font-extrabold mb-3 leading-tight tracking-tight">Text Translation</CardTitle>
                <CardDescription className="text-base md:text-lg text-muted-foreground/90 leading-relaxed font-light">
                  Translate text on images to any language while keeping the original image quality and style intact.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10 space-y-6 px-6 pb-6">
            <ul className="space-y-4 text-base md:text-lg">
              <li className="flex items-center gap-4 transition-all duration-300 group-hover:text-foreground">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-accent/30 group-hover:to-accent/20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 shadow-sm">
                  <span className="text-accent font-bold text-sm">✓</span>
                </div>
                <span className="text-muted-foreground group-hover:text-foreground transition-colors duration-300 font-medium">Translate text in images to any language</span>
              </li>
              <li className="flex items-center gap-4 transition-all duration-300 group-hover:text-foreground">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-accent/30 group-hover:to-accent/20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 shadow-sm">
                  <span className="text-accent font-bold text-sm">✓</span>
                </div>
                <span className="text-muted-foreground group-hover:text-foreground transition-colors duration-300 font-medium">Preserves original image quality</span>
              </li>
              <li className="flex items-center gap-4 transition-all duration-300 group-hover:text-foreground">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-accent/30 group-hover:to-accent/20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 shadow-sm">
                  <span className="text-accent font-bold text-sm">✓</span>
                </div>
                <span className="text-muted-foreground group-hover:text-foreground transition-colors duration-300 font-medium">AI-powered translation</span>
              </li>
            </ul>
            <Button 
              className="w-full bg-gradient-to-r from-accent via-accent/95 to-primary hover:from-accent/95 hover:via-accent/90 hover:to-primary/95 text-white font-bold shadow-lg hover:shadow-glow-accent transition-all duration-500 h-14 md:h-16 text-lg md:text-xl rounded-2xl group/btn relative overflow-hidden"
              onClick={() => onFunctionSelect('translate')}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Use Text Translation
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};


