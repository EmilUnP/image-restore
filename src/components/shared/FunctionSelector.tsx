import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Languages, Zap, Palette, Share2, Eraser, BarChart3, Users } from "lucide-react";

type AppFunction = 'enhance' | 'translate' | 'icons' | 'logos' | 'social' | 'remove' | 'infographic' | 'uniform-styling' | null;

interface FunctionSelectorProps {
  onFunctionSelect: (func: AppFunction) => void;
}

export const FunctionSelector = ({ onFunctionSelect }: FunctionSelectorProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Choose Your Function</h2>
        <p className="text-muted-foreground text-sm">Select what you'd like to do with your images</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Image Quality Improver */}
        <Card 
          className="border hover:border-primary/60 transition-all duration-500 cursor-pointer group relative overflow-hidden hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-2 bg-gradient-to-br from-card via-card to-card/95"
          onClick={() => onFunctionSelect('enhance')}
        >
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-accent/0 group-hover:from-primary/5 group-hover:via-primary/5 group-hover:to-accent/5 transition-all duration-500 pointer-events-none" />
          
          <CardHeader className="pb-4 relative z-10">
            <div className="flex items-start gap-4">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg group-hover:blur-xl group-hover:bg-primary/30 transition-all duration-500" />
                <div className="relative p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg group-hover:shadow-xl">
                  <Sparkles className="w-6 h-6 text-primary transition-transform duration-300 group-hover:scale-110" />
                </div>
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <CardTitle className="text-xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">Image Quality Improver</CardTitle>
                <CardDescription className="text-sm">
                  Enhance image quality using AI. Improve sharpness, reduce noise, enhance colors, and restore old photos.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary text-xs font-bold">✓</span>
                </div>
                <span className="text-muted-foreground">Enhance photos, documents, and portraits</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary text-xs font-bold">✓</span>
                </div>
                <span className="text-muted-foreground">Multiple enhancement modes available</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary text-xs font-bold">✓</span>
                </div>
                <span className="text-muted-foreground">Adjustable intensity levels</span>
              </li>
            </ul>
            <Button 
              className="w-full group-hover:shadow-lg group-hover:shadow-primary/30"
              onClick={() => onFunctionSelect('enhance')}
            >
              Use Image Quality Improver
            </Button>
          </CardContent>
        </Card>

        {/* Text Translation */}
        <Card 
          className="border hover:border-accent/60 transition-all duration-500 cursor-pointer group relative overflow-hidden hover:shadow-xl hover:shadow-accent/20 hover:-translate-y-2 bg-gradient-to-br from-card via-card to-card/95"
          onClick={() => onFunctionSelect('translate')}
        >
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent/0 via-accent/0 to-primary/0 group-hover:from-accent/5 group-hover:via-accent/5 group-hover:to-primary/5 transition-all duration-500 pointer-events-none" />
          
          <CardHeader className="pb-4 relative z-10">
            <div className="flex items-start gap-4">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-accent/20 rounded-xl blur-lg group-hover:blur-xl group-hover:bg-accent/30 transition-all duration-500" />
                <div className="relative p-3 rounded-xl bg-accent/10 group-hover:bg-accent/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg group-hover:shadow-xl">
                  <Languages className="w-6 h-6 text-accent transition-transform duration-300 group-hover:scale-110" />
                </div>
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <CardTitle className="text-xl font-bold mb-2 group-hover:text-accent transition-colors duration-300">Text Translation</CardTitle>
                <CardDescription className="text-sm">
                  Translate text on images to any language while keeping the original image quality and style intact.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-3 group/item">
                <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                  <span className="text-accent text-xs font-bold">✓</span>
                </div>
                <span className="text-muted-foreground group-hover/item:text-foreground transition-colors">Translate text in images to any language</span>
              </li>
              <li className="flex items-center gap-3 group/item">
                <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                  <span className="text-accent text-xs font-bold">✓</span>
                </div>
                <span className="text-muted-foreground group-hover/item:text-foreground transition-colors">Preserves original image quality</span>
              </li>
              <li className="flex items-center gap-3 group/item">
                <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                  <span className="text-accent text-xs font-bold">✓</span>
                </div>
                <span className="text-muted-foreground group-hover/item:text-foreground transition-colors">AI-powered translation</span>
              </li>
            </ul>
            <Button 
              className="w-full group-hover:shadow-lg group-hover:shadow-accent/30"
              onClick={() => onFunctionSelect('translate')}
            >
              Use Text Translation
            </Button>
          </CardContent>
        </Card>

        {/* Icon Generation */}
        <Card 
          className="border hover:border-primary/60 transition-all duration-500 cursor-pointer group relative overflow-hidden hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-2 bg-gradient-to-br from-card via-card to-card/95"
          onClick={() => onFunctionSelect('icons')}
        >
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-accent/0 group-hover:from-primary/5 group-hover:via-primary/5 group-hover:to-accent/5 transition-all duration-500 pointer-events-none" />
          
          <CardHeader className="pb-4 relative z-10">
            <div className="flex items-start gap-4">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg group-hover:blur-xl group-hover:bg-primary/30 transition-all duration-500" />
                <div className="relative p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg group-hover:shadow-xl">
                  <Zap className="w-6 h-6 text-primary transition-transform duration-300 group-hover:scale-110" />
                </div>
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <CardTitle className="text-xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">Icon Generator</CardTitle>
                <CardDescription className="text-sm">
                  Generate or upgrade powerful icons and web elements using AI. Create custom icons from text descriptions or enhance existing ones.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-3 group/item">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                  <span className="text-primary text-xs font-bold">✓</span>
                </div>
                <span className="text-muted-foreground group-hover/item:text-foreground transition-colors">Generate icons from text descriptions</span>
              </li>
              <li className="flex items-center gap-3 group/item">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                  <span className="text-primary text-xs font-bold">✓</span>
                </div>
                <span className="text-muted-foreground group-hover/item:text-foreground transition-colors">Upgrade existing icons with AI</span>
              </li>
              <li className="flex items-center gap-3 group/item">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                  <span className="text-primary text-xs font-bold">✓</span>
                </div>
                <span className="text-muted-foreground group-hover/item:text-foreground transition-colors">Export in multiple sizes for web projects</span>
              </li>
            </ul>
            <Button 
              className="w-full group-hover:shadow-lg group-hover:shadow-primary/30"
              onClick={() => onFunctionSelect('icons')}
            >
              Use Icon Generator
            </Button>
          </CardContent>
        </Card>

        {/* Logo Generation */}
        <Card 
          className="border hover:border-accent/60 transition-all duration-500 cursor-pointer group relative overflow-hidden hover:shadow-xl hover:shadow-accent/20 hover:-translate-y-2 bg-gradient-to-br from-card via-card to-card/95"
          onClick={() => onFunctionSelect('logos')}
        >
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent/0 via-accent/0 to-primary/0 group-hover:from-accent/5 group-hover:via-accent/5 group-hover:to-primary/5 transition-all duration-500 pointer-events-none" />
          
          <CardHeader className="pb-4 relative z-10">
            <div className="flex items-start gap-4">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-accent/20 rounded-xl blur-lg group-hover:blur-xl group-hover:bg-accent/30 transition-all duration-500" />
                <div className="relative p-3 rounded-xl bg-accent/10 group-hover:bg-accent/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg group-hover:shadow-xl">
                  <Palette className="w-6 h-6 text-accent transition-transform duration-300 group-hover:scale-110" />
                </div>
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <CardTitle className="text-xl font-bold mb-2 group-hover:text-accent transition-colors duration-300">Logo Generator</CardTitle>
                <CardDescription className="text-sm">
                  Create professional logos for your brand or business using AI. Generate unique logo designs from text descriptions or upgrade existing logos.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-3 group/item">
                <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                  <span className="text-accent text-xs font-bold">✓</span>
                </div>
                <span className="text-muted-foreground group-hover/item:text-foreground transition-colors">Generate professional logos from descriptions</span>
              </li>
              <li className="flex items-center gap-3 group/item">
                <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                  <span className="text-accent text-xs font-bold">✓</span>
                </div>
                <span className="text-muted-foreground group-hover/item:text-foreground transition-colors">Upgrade existing logos with AI</span>
              </li>
              <li className="flex items-center gap-3 group/item">
                <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                  <span className="text-accent text-xs font-bold">✓</span>
                </div>
                <span className="text-muted-foreground group-hover/item:text-foreground transition-colors">Multiple styles and customization options</span>
              </li>
            </ul>
            <Button 
              className="w-full group-hover:shadow-lg group-hover:shadow-accent/30"
              onClick={() => onFunctionSelect('logos')}
            >
              Use Logo Generator
            </Button>
          </CardContent>
        </Card>

        {/* Social Post Generation */}
        <Card 
          className="border hover:border-primary/60 transition-all duration-500 cursor-pointer group relative overflow-hidden hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-2 bg-gradient-to-br from-card via-card to-card/95"
          onClick={() => onFunctionSelect('social')}
        >
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-accent/0 group-hover:from-primary/5 group-hover:via-primary/5 group-hover:to-accent/5 transition-all duration-500 pointer-events-none" />
          
          <CardHeader className="pb-4 relative z-10">
            <div className="flex items-start gap-4">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg group-hover:blur-xl group-hover:bg-primary/30 transition-all duration-500" />
                <div className="relative p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg group-hover:shadow-xl">
                  <Share2 className="w-6 h-6 text-primary transition-transform duration-300 group-hover:scale-110" />
                </div>
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <CardTitle className="text-xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">Social Post Generator</CardTitle>
                <CardDescription className="text-sm">
                  Create stunning social media posts. Generate from scratch, use reference images, or combine multiple inspirations.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-3 group/item">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                  <span className="text-primary text-xs font-bold">✓</span>
                </div>
                <span className="text-muted-foreground group-hover/item:text-foreground transition-colors">Generate posts from text descriptions</span>
              </li>
              <li className="flex items-center gap-3 group/item">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                  <span className="text-primary text-xs font-bold">✓</span>
                </div>
                <span className="text-muted-foreground group-hover/item:text-foreground transition-colors">Use reference images for inspiration</span>
              </li>
              <li className="flex items-center gap-3 group/item">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                  <span className="text-primary text-xs font-bold">✓</span>
                </div>
                <span className="text-muted-foreground group-hover/item:text-foreground transition-colors">Multiple aspect ratios and styles</span>
              </li>
            </ul>
            <Button 
              className="w-full group-hover:shadow-lg group-hover:shadow-primary/30"
              onClick={() => onFunctionSelect('social')}
            >
              Use Social Post Generator
            </Button>
          </CardContent>
        </Card>

        {/* Object Remover */}
        <Card 
          className="border hover:border-accent/60 transition-all duration-500 cursor-pointer group relative overflow-hidden hover:shadow-xl hover:shadow-accent/20 hover:-translate-y-2 bg-gradient-to-br from-card via-card to-card/95"
          onClick={() => onFunctionSelect('remove')}
        >
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent/0 via-accent/0 to-primary/0 group-hover:from-accent/5 group-hover:via-accent/5 group-hover:to-primary/5 transition-all duration-500 pointer-events-none" />
          
          <CardHeader className="pb-4 relative z-10">
            <div className="flex items-start gap-4">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-accent/20 rounded-xl blur-lg group-hover:blur-xl group-hover:bg-accent/30 transition-all duration-500" />
                <div className="relative p-3 rounded-xl bg-accent/10 group-hover:bg-accent/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg group-hover:shadow-xl">
                  <Eraser className="w-6 h-6 text-accent transition-transform duration-300 group-hover:scale-110" />
                </div>
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <CardTitle className="text-xl font-bold mb-2 group-hover:text-accent transition-colors duration-300">Object Remover</CardTitle>
                <CardDescription className="text-sm">
                  Remove unwanted objects from images with AI-powered precision. Select areas to clean and get professional results.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-3 group/item">
                <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                  <span className="text-accent text-xs font-bold">✓</span>
                </div>
                <span className="text-muted-foreground group-hover/item:text-foreground transition-colors">Interactive selection tool</span>
              </li>
              <li className="flex items-center gap-3 group/item">
                <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                  <span className="text-accent text-xs font-bold">✓</span>
                </div>
                <span className="text-muted-foreground group-hover/item:text-foreground transition-colors">AI-powered inpainting</span>
              </li>
              <li className="flex items-center gap-3 group/item">
                <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                  <span className="text-accent text-xs font-bold">✓</span>
                </div>
                <span className="text-muted-foreground group-hover/item:text-foreground transition-colors">Seamless object removal</span>
              </li>
            </ul>
            <Button 
              className="w-full group-hover:shadow-lg group-hover:shadow-accent/30"
              onClick={() => onFunctionSelect('remove')}
            >
              Use Object Remover
            </Button>
          </CardContent>
        </Card>

        {/* Infographic Generator */}
        <Card 
          className="border hover:border-primary/60 transition-all duration-500 cursor-pointer group relative overflow-hidden hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-2 bg-gradient-to-br from-card via-card to-card/95"
          onClick={() => onFunctionSelect('infographic')}
        >
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-accent/0 group-hover:from-primary/5 group-hover:via-primary/5 group-hover:to-accent/5 transition-all duration-500 pointer-events-none" />
          
          <CardHeader className="pb-4 relative z-10">
            <div className="flex items-start gap-4">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg group-hover:blur-xl group-hover:bg-primary/30 transition-all duration-500" />
                <div className="relative p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg group-hover:shadow-xl">
                  <BarChart3 className="w-6 h-6 text-primary transition-transform duration-300 group-hover:scale-110" />
                </div>
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <CardTitle className="text-xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">Infographic Generator</CardTitle>
                <CardDescription className="text-sm">
                  Create powerful infographics with AI. Add elements, generate designs, and customize your visualizations like PowerPoint with AI power.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-3 group/item">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                  <span className="text-primary text-xs font-bold">✓</span>
                </div>
                <span className="text-muted-foreground group-hover/item:text-foreground transition-colors">Generate infographics from topics</span>
              </li>
              <li className="flex items-center gap-3 group/item">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                  <span className="text-primary text-xs font-bold">✓</span>
                </div>
                <span className="text-muted-foreground group-hover/item:text-foreground transition-colors">Add/remove elements like PowerPoint</span>
              </li>
              <li className="flex items-center gap-3 group/item">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                  <span className="text-primary text-xs font-bold">✓</span>
                </div>
                <span className="text-muted-foreground group-hover/item:text-foreground transition-colors">Text, images, shapes, and charts</span>
              </li>
            </ul>
            <Button 
              className="w-full group-hover:shadow-lg group-hover:shadow-primary/30"
              onClick={() => onFunctionSelect('infographic')}
            >
              Use Infographic Generator
            </Button>
          </CardContent>
        </Card>

        {/* Uniform Image Styling */}
        <Card 
          className="border hover:border-primary/60 transition-all duration-500 cursor-pointer group relative overflow-hidden hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-2 bg-gradient-to-br from-card via-card to-card/95"
          onClick={() => onFunctionSelect('uniform-styling')}
        >
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-accent/0 group-hover:from-primary/5 group-hover:via-primary/5 group-hover:to-accent/5 transition-all duration-500 pointer-events-none" />
          
          <CardHeader className="pb-4 relative z-10">
            <div className="flex items-start gap-4">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg group-hover:blur-xl group-hover:bg-primary/30 transition-all duration-500" />
                <div className="relative p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg group-hover:shadow-xl">
                  <Users className="w-6 h-6 text-primary transition-transform duration-300 group-hover:scale-110" />
                </div>
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <CardTitle className="text-xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">Uniform Image Styling</CardTitle>
                <CardDescription className="text-sm">
                  Transform multiple images to match the same style, background, and design. Perfect for team photos and employee headshots.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary text-xs font-bold">✓</span>
                </div>
                <span className="text-muted-foreground">Batch process multiple images</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary text-xs font-bold">✓</span>
                </div>
                <span className="text-muted-foreground">Consistent styling across all images</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary text-xs font-bold">✓</span>
                </div>
                <span className="text-muted-foreground">Professional headshots & team photos</span>
              </li>
            </ul>
            <Button 
              className="w-full mt-4 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => onFunctionSelect('uniform-styling')}
            >
              <Users className="w-4 h-4 mr-2" />
              Start Uniform Styling
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};


