import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Sparkles, 
  Languages, 
  Zap, 
  Palette,
  ArrowRight,
  Check,
  Image as ImageIcon,
  Copy,
  Clock,
  Users,
  TrendingUp,
  Layers,
  FileText,
  Rocket
} from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";

type AppFunction = 'enhance' | 'translate' | 'icons' | 'logos' | null;

interface LandingPageProps {
  onFunctionSelect: (func: AppFunction) => void;
}

const getFeatures = (onFunctionSelect: (func: AppFunction) => void) => [
  {
    icon: Sparkles,
    title: "Image Enhancement",
    description: "Enhance image quality using AI. Improve sharpness, reduce noise, enhance colors, and restore old photos.",
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    function: 'enhance' as AppFunction,
  },
  {
    icon: Languages,
    title: "Text Translation",
    description: "Translate text in images to any language while preserving the original design and formatting.",
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-950",
    function: 'translate' as AppFunction,
  },
  {
    icon: Zap,
    title: "Icon Generator",
    description: "Generate custom icons for your projects. Create multiple variants in the same style instantly.",
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-950",
    function: 'icons' as AppFunction,
  },
  {
    icon: Palette,
    title: "Logo Generator",
    description: "Create professional logos for your brand. Generate unique designs with AI-powered creativity.",
    color: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-950",
    function: 'logos' as AppFunction,
  },
];

const benefits = [
  "AI-powered quality enhancement",
  "Multi-language support",
  "Batch processing",
  "High-resolution output",
  "Fast processing times",
  "No watermarks",
];

export const LandingPage = ({ onFunctionSelect }: LandingPageProps) => {
  const { isAuthenticated } = useAuthContext();

  return (
    <div className="space-y-32 py-16 relative">
      {/* Advanced Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/25 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/25 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-r from-primary/15 via-accent/15 to-primary/15 rounded-full blur-[120px] animate-rotate-slow" />
        
        {/* Animated particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-primary/40 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Gradient mesh */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            background: `
              radial-gradient(circle at 20% 30%, hsl(var(--primary) / 0.15) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, hsl(var(--accent) / 0.15) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.1) 0%, transparent 70%)
            `,
          }} />
        </div>
      </div>

      {/* Hero Section */}
      <section className="text-center space-y-8 max-w-6xl mx-auto relative min-h-[80vh] flex flex-col justify-center items-center">
        {/* Floating geometric shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Large floating hexagon */}
          <div className="absolute top-20 left-10 w-32 h-32 opacity-10 animate-float" style={{ animationDelay: '0.5s', animationDuration: '6s' }}>
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon points="50,5 90,25 90,75 50,95 10,75 10,25" fill="currentColor" className="text-primary" />
            </svg>
          </div>
          
          {/* Floating circle */}
          <div className="absolute top-40 right-20 w-24 h-24 opacity-10 animate-float" style={{ animationDelay: '1.5s', animationDuration: '8s' }}>
            <div className="w-full h-full rounded-full border-2 border-accent" />
          </div>

          {/* Floating triangle */}
          <div className="absolute bottom-40 left-20 w-20 h-20 opacity-10 animate-float" style={{ animationDelay: '2.5s', animationDuration: '7s' }}>
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon points="50,10 90,90 10,90" fill="currentColor" className="text-accent" />
            </svg>
          </div>

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `
              linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }} />
        </div>

        {/* Main Heading with advanced effects */}
        <div className="relative z-10 space-y-4">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-extrabold tracking-tight leading-[0.9]">
            <span className="block animate-slide-up">Transform Your</span>
            <span className="block relative mt-2">
              <span className="bg-gradient-to-r from-primary via-primary via-accent to-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_auto] relative">
                Images with AI
              </span>
              {/* Glow effect */}
              <span className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_auto] blur-xl opacity-50 -z-10">
                Images with AI
              </span>
            </span>
          </h1>
          
          {/* Animated underline */}
          <div className="flex justify-center mt-4">
            <div className="h-1 w-32 bg-gradient-to-r from-transparent via-primary to-transparent animate-scale-pulse" />
          </div>
        </div>

        {/* Description */}
        <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light animate-fade-in relative z-10" style={{ animationDelay: '0.2s' }}>
          Professional AI-powered image optimization, translation, and generation tools. Transform your creative workflow with cutting-edge technology.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 relative z-10 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <Button
            size="lg"
            className="relative rounded-2xl bg-gradient-to-r from-primary via-primary to-accent hover:opacity-90 font-bold text-lg px-10 py-7 shadow-2xl shadow-primary/40 hover:shadow-primary/60 transition-all duration-500 overflow-hidden group hover:scale-105"
            onClick={() => {
              onFunctionSelect('enhance');
            }}
          >
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-accent via-primary to-accent bg-[length:200%_100%] animate-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out">
              <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
            </div>
            
            <span className="relative z-10 flex items-center gap-2">
              Get Started Free
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            className="rounded-2xl border-2 border-primary/30 font-semibold text-lg px-10 py-7 hover:bg-primary/10 hover:border-primary/50 transition-all duration-500 backdrop-blur-sm hover:scale-105 relative overflow-hidden group"
            onClick={() => {
              document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="relative z-10">Learn More</span>
          </Button>
        </div>

        {/* Visual showcase - Image processing preview */}
        <div className="relative z-10 mt-16 w-full max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="relative rounded-3xl overflow-hidden border border-border/50 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-xl p-8 shadow-2xl">
            {/* Grid of feature previews */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: ImageIcon, label: "Enhance", color: "from-blue-500/20 to-cyan-500/20" },
                { icon: Languages, label: "Translate", color: "from-green-500/20 to-emerald-500/20" },
                { icon: Zap, label: "Generate", color: "from-purple-500/20 to-pink-500/20" },
              ].map((item, idx) => {
                const ItemIcon = item.icon;
                return (
                  <div
                    key={idx}
                    className="relative group/item p-6 rounded-2xl bg-gradient-to-br from-card/50 to-card/30 border border-border/30 hover:border-primary/30 transition-all duration-500 hover:scale-105 hover:shadow-lg"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover/item:opacity-100 transition-opacity duration-500 rounded-2xl`} />
                    <div className="relative z-10 text-center">
                      <div className="inline-flex p-4 rounded-xl bg-primary/10 group-hover/item:bg-primary/20 mb-3 transition-colors">
                        <ItemIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-sm font-semibold">{item.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Animated progress indicator */}
            <div className="mt-6 flex items-center gap-2">
              <div className="flex-1 h-1 bg-muted/50 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary via-accent to-primary rounded-full w-3/4 animate-shimmer-slow" style={{
                  backgroundSize: '200% 100%',
                }} />
              </div>
              <span className="text-xs text-muted-foreground font-mono">AI Processing...</span>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Section */}
      <section className="relative space-y-8">
        {/* Section background effects */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-full blur-3xl animate-mesh-move" />
        </div>

        <div className="text-center space-y-4 mb-16 relative z-10">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent animate-slide-up relative">
            Your AI Workspace
            <span className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent opacity-30 blur-xl animate-gradient bg-[length:200%_auto]">
              Your AI Workspace
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Everything you need in one powerful platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-5">
          {/* Hero Tile - Balanced Size */}
          <Card 
            className="group relative overflow-hidden col-span-12 md:col-span-6 lg:col-span-5 cursor-pointer border border-border/50 hover:border-primary/30 bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-sm transition-all duration-700 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 animate-scale-in"
            onClick={() => onFunctionSelect('enhance')}
            style={{ animationDelay: '0.1s' }}
          >
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-accent/0 group-hover:from-primary/8 group-hover:via-primary/5 group-hover:to-accent/8 transition-all duration-700" />
            {/* Shimmer effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
            </div>
            <CardHeader className="relative z-10 p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="relative p-3 rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 group-hover:from-primary/25 group-hover:to-accent/25 transition-all duration-500 shadow-lg group-hover:shadow-primary/20 group-hover:scale-110 group-hover:rotate-3">
                  <Rocket className="h-5 w-5 text-primary animate-float" style={{ animationDelay: '0.5s' }} />
                </div>
              </div>
              <CardTitle className="text-2xl lg:text-3xl font-extrabold mb-3 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent group-hover:animate-gradient bg-[length:200%_auto] transition-all duration-500">
                Start Creating with AI
              </CardTitle>
              <CardDescription className="text-sm lg:text-base text-muted-foreground leading-relaxed mb-6">
                Transform your images with powerful AI tools. Enhance quality, translate text, generate icons and logos.
              </CardDescription>
              <Button
                size="lg"
                className="relative rounded-lg bg-gradient-to-r from-primary via-primary to-accent hover:opacity-90 font-semibold shadow-lg shadow-primary/20 group-hover:shadow-primary/30 transition-all duration-500 overflow-hidden group/btn"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Explore Tools
                  <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
              </Button>
            </CardHeader>
          </Card>

          {/* Icon Generator Tile */}
          <Card className="group relative overflow-hidden col-span-12 md:col-span-6 lg:col-span-4 cursor-pointer border border-border/50 hover:border-primary/30 bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-sm transition-all duration-700 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 animate-scale-in"
            onClick={() => onFunctionSelect('icons')}
            style={{ animationDelay: '0.2s' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-accent/0 group-hover:from-primary/8 group-hover:to-accent/8 transition-all duration-700" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
            </div>
            <CardHeader className="relative z-10 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="relative p-3 rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 group-hover:from-primary/25 group-hover:to-accent/25 transition-all duration-500 shadow-lg group-hover:shadow-primary/20 group-hover:scale-110 group-hover:rotate-3">
                  <Zap className="h-5 w-5 text-primary animate-pulse" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-extrabold bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                    10K+
                  </div>
                  <div className="text-xs text-muted-foreground">Icons Generated</div>
                </div>
              </div>
              <CardTitle className="text-xl font-bold mb-2 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent group-hover:from-primary group-hover:to-accent transition-all duration-500">
                Icon Generator
              </CardTitle>
              <CardDescription className="text-sm">
                Create multiple variants instantly
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Logo Generator Tile */}
          <Card className="group relative overflow-hidden col-span-12 md:col-span-6 lg:col-span-3 cursor-pointer border border-border/50 hover:border-primary/30 bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-sm transition-all duration-700 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 animate-scale-in"
            onClick={() => onFunctionSelect('logos')}
            style={{ animationDelay: '0.3s' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-accent/0 group-hover:from-primary/8 group-hover:to-accent/8 transition-all duration-700" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
            </div>
            <CardHeader className="relative z-10 p-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 group-hover:from-primary/25 group-hover:to-accent/25 transition-all duration-500 shadow-lg group-hover:shadow-primary/20 group-hover:scale-110 group-hover:rotate-3 mb-4 w-fit">
                <Palette className="h-5 w-5 text-primary animate-float" style={{ animationDelay: '0.7s' }} />
              </div>
              <CardTitle className="text-lg font-bold mb-2 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent group-hover:from-primary group-hover:to-accent transition-all duration-500">
                Logo Generator
              </CardTitle>
              <CardDescription className="text-sm mb-4">
                Create professional logos
              </CardDescription>
              <Button
                variant="ghost"
                size="sm"
                className="w-full group-hover:text-primary transition-colors"
              >
                Try Now
                <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardHeader>
          </Card>

          {/* Multi-language Tile */}
          <Card className="group relative overflow-hidden col-span-12 md:col-span-6 lg:col-span-4 cursor-pointer border border-border/50 hover:border-primary/30 bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-sm transition-all duration-700 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 animate-scale-in"
            onClick={() => onFunctionSelect('translate')}
            style={{ animationDelay: '0.4s' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-accent/0 group-hover:from-primary/8 group-hover:to-accent/8 transition-all duration-700" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
            </div>
            <CardHeader className="relative z-10 p-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 group-hover:from-primary/25 group-hover:to-accent/25 transition-all duration-500 shadow-lg group-hover:shadow-primary/20 group-hover:scale-110 group-hover:rotate-3 mb-4 w-fit">
                <Languages className="h-5 w-5 text-primary animate-float" style={{ animationDelay: '0.8s' }} />
              </div>
              <CardTitle className="text-xl font-bold mb-2 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent group-hover:from-primary group-hover:to-accent transition-all duration-500">
                Multi-Language
              </CardTitle>
              <CardDescription className="text-sm">
                Translate text in images to 100+ languages
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Batch Processing Tile */}
          <Card className="group relative overflow-hidden col-span-12 md:col-span-6 lg:col-span-4 cursor-pointer border border-border/50 hover:border-primary/30 bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-sm transition-all duration-700 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 animate-scale-in"
            style={{ animationDelay: '0.5s' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-accent/0 group-hover:from-primary/8 group-hover:to-accent/8 transition-all duration-700" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
            </div>
            <CardHeader className="relative z-10 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 group-hover:from-primary/25 group-hover:to-accent/25 transition-all duration-500 shadow-lg group-hover:shadow-primary/20 group-hover:scale-110 group-hover:rotate-3">
                  <Layers className="h-5 w-5 text-primary" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-extrabold bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                    Batch
                  </div>
                </div>
              </div>
              <CardTitle className="text-xl font-bold mb-2 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent group-hover:from-primary group-hover:to-accent transition-all duration-500">
                Process Multiple
              </CardTitle>
              <CardDescription className="text-sm">
                Handle multiple images at once
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Speed Tile */}
          <Card className="group relative overflow-hidden col-span-12 md:col-span-6 lg:col-span-4 cursor-pointer border border-border/50 hover:border-primary/30 bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-sm transition-all duration-700 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 animate-scale-in"
            style={{ animationDelay: '0.6s' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-accent/0 group-hover:from-primary/8 group-hover:to-accent/8 transition-all duration-700" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
            </div>
            <CardHeader className="relative z-10 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 group-hover:from-primary/25 group-hover:to-accent/25 transition-all duration-500 shadow-lg group-hover:shadow-primary/20 group-hover:scale-110 group-hover:rotate-3">
                  <Clock className="h-5 w-5 text-primary animate-pulse" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent group-hover:from-primary group-hover:to-accent transition-all duration-500">
                    Lightning Fast
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Results in seconds
                  </CardDescription>
                </div>
              </div>
              <div className="mt-4">
                <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary via-primary to-accent rounded-full w-3/4 group-hover:w-full transition-all duration-1000 ease-out relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer-slow" />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-2">Processing speed</div>
              </div>
            </CardHeader>
          </Card>

          {/* Prompt Memory Tile */}
          <Card className="group relative overflow-hidden col-span-12 md:col-span-6 lg:col-span-4 cursor-pointer border border-border/50 hover:border-primary/30 bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-sm transition-all duration-700 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 animate-scale-in"
            style={{ animationDelay: '0.7s' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-accent/0 group-hover:from-primary/8 group-hover:to-accent/8 transition-all duration-700" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
            </div>
            <CardHeader className="relative z-10 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 group-hover:from-primary/25 group-hover:to-accent/25 transition-all duration-500 shadow-lg group-hover:shadow-primary/20 group-hover:scale-110 group-hover:rotate-3">
                  <Copy className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg font-bold mb-1 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent group-hover:from-primary group-hover:to-accent transition-all duration-500">
                    Prompt Memory
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Copy & reuse AI prompts
                  </CardDescription>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border/50 text-xs font-mono text-muted-foreground group-hover:text-foreground group-hover:bg-muted/50 transition-all duration-500">
                View actual prompts sent to AI
              </div>
            </CardHeader>
          </Card>

        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="space-y-16 relative">
        <div className="text-center space-y-4">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Everything You Need
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful AI tools to enhance, translate, and create images
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {getFeatures(onFunctionSelect).map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="group relative overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer border-2 hover:border-primary/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm"
                onClick={() => onFunctionSelect(feature.function)}
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-accent/0 group-hover:from-primary/5 group-hover:via-primary/5 group-hover:to-accent/5 transition-all duration-500" />
                
                <CardHeader className="relative z-10">
                  <div className="flex items-start gap-4">
                    <div className={`relative p-4 rounded-2xl ${feature.bgColor} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <Icon className={`h-7 w-7 ${feature.color} relative z-10`} />
                    </div>
                    <div className="flex-1 pt-1">
                      <CardTitle className="text-2xl mb-3 font-bold group-hover:text-primary transition-colors">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="text-base leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <Button
                    variant="ghost"
                    className="w-full group-hover:text-primary font-semibold rounded-xl"
                  >
                    Try Now
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10 rounded-3xl blur-3xl" />
        <div className="relative bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 lg:p-16 border-2 border-border/50 shadow-2xl">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-8">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
                  <Sparkles className="h-3 w-3" />
                  <span>Benefits</span>
                </div>
                <h2 className="text-4xl sm:text-5xl font-extrabold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Why Choose VisionAI?
                </h2>
                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                  Experience the future of image processing with our advanced AI technology.
                </p>
              </div>
              <ul className="space-y-5">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-4 group">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Check className="h-5 w-5 text-primary font-bold" />
                    </div>
                    <span className="text-base font-medium text-foreground group-hover:text-primary transition-colors">
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20 rounded-3xl blur-3xl animate-pulse-slow" />
              <div className="relative bg-gradient-to-br from-background via-background to-background/80 backdrop-blur-xl rounded-3xl p-8 lg:p-10 border-2 border-border/50 shadow-2xl">
                <div className="space-y-6">
                  {[
                    { icon: ImageIcon, title: "Fast Processing", desc: "Get results in seconds", color: "text-blue-600", bg: "bg-blue-500/10" },
                    { icon: Sparkles, title: "High Quality", desc: "Professional-grade output", color: "text-green-600", bg: "bg-green-500/10" },
                    { icon: Zap, title: "Easy to Use", desc: "No technical skills required", color: "text-purple-600", bg: "bg-purple-500/10" },
                  ].map((item, idx) => {
                    const ItemIcon = item.icon;
                    return (
                      <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-muted/50 transition-all duration-300 group">
                        <div className={`p-4 rounded-2xl ${item.bg} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                          <ItemIcon className={`h-6 w-6 ${item.color}`} />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative text-center space-y-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20 rounded-3xl blur-3xl" />
        <div className="relative bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10 backdrop-blur-xl rounded-3xl p-12 lg:p-16 border-2 border-primary/20 shadow-2xl">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
              Ready to Transform Your Images?
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Start using our AI-powered tools today. Sign in to get started.
            </p>
            <div className="pt-4">
              <Button
                size="lg"
                className="relative rounded-2xl bg-gradient-to-r from-primary via-primary to-accent hover:opacity-90 font-bold text-lg px-10 py-7 shadow-2xl shadow-primary/40 hover:shadow-primary/50 transition-all duration-300 overflow-hidden group"
                onClick={() => onFunctionSelect('enhance')}
              >
                <span className="relative z-10 flex items-center gap-2">
                  Get Started Free
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

