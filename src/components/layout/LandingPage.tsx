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
import MagicBento, { BentoCardProps } from "./MagicBento";

type AppFunction = 'enhance' | 'translate' | 'icons' | 'logos' | null;

interface LandingPageProps {
  onFunctionSelect: (func: AppFunction) => void;
}

const getFeatures = (onFunctionSelect: (func: AppFunction) => void) => [
  {
    icon: Sparkles,
    title: "Image Enhancement",
    description: "Enhance image quality using AI. Improve sharpness, reduce noise, enhance colors, and restore old photos.",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    function: 'enhance' as AppFunction,
  },
  {
    icon: Languages,
    title: "Text Translation",
    description: "Translate text in images to any language while preserving the original design and formatting.",
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    function: 'translate' as AppFunction,
  },
  {
    icon: Zap,
    title: "Icon Generator",
    description: "Generate custom icons for your projects. Create multiple variants in the same style instantly.",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    function: 'icons' as AppFunction,
  },
  {
    icon: Palette,
    title: "Logo Generator",
    description: "Create professional logos for your brand. Generate unique designs with AI-powered creativity.",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
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
    <div className="space-y-24 py-8 lg:py-12 relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Advanced Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-slate-950">
        {/* Animated gradient orbs - darker tones */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/15 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-full blur-[120px] animate-rotate-slow" />
        
        {/* Animated particles - darker */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-primary/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Gradient mesh - darker tones */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            background: `
              radial-gradient(circle at 20% 30%, hsl(var(--primary) / 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, hsl(var(--accent) / 0.1) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.08) 0%, transparent 70%)
            `,
          }} />
        </div>
      </div>

      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-6xl mx-auto relative pt-8 lg:pt-12 pb-12 lg:pb-16">
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

          {/* Grid pattern overlay - darker */}
          <div className="absolute inset-0 opacity-[0.08]" style={{
            backgroundImage: `
              linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }} />
        </div>

        {/* Main Heading with advanced effects */}
        <div className="relative z-10 space-y-3">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight leading-[0.95]">
            <span className="block animate-slide-up text-slate-100">Transform Your</span>
            <span className="block relative mt-1">
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
          <div className="flex justify-center mt-3">
            <div className="h-1 w-32 bg-gradient-to-r from-transparent via-primary to-transparent animate-scale-pulse" />
          </div>
        </div>

        {/* Description */}
        <p className="text-lg sm:text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-light animate-fade-in relative z-10" style={{ animationDelay: '0.2s' }}>
          Professional AI-powered image optimization, translation, and generation tools. Transform your creative workflow with cutting-edge technology.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 relative z-10 animate-fade-in" style={{ animationDelay: '0.3s' }}>
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
        <div className="relative z-10 mt-12 w-full max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <div className="relative rounded-3xl overflow-hidden border border-slate-700/70 bg-gradient-to-br from-slate-800/90 to-slate-800/80 backdrop-blur-xl p-8 shadow-2xl shadow-black/50">
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
                    className="relative group/item p-6 rounded-2xl bg-gradient-to-br from-slate-800/70 to-slate-800/60 border border-slate-700/60 hover:border-primary/60 transition-all duration-500 hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover/item:opacity-100 transition-opacity duration-500 rounded-2xl`} />
                    <div className="relative z-10 text-center">
                      <div className="inline-flex p-4 rounded-xl bg-primary/10 group-hover/item:bg-primary/20 mb-3 transition-colors">
                        <ItemIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-sm font-semibold text-slate-200">{item.label}</div>
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
              <span className="text-xs text-slate-400 font-mono">AI Processing...</span>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Section */}
      <section className="relative space-y-8">
        {/* Section background effects - darker */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/8 via-accent/8 to-primary/8 rounded-full blur-3xl animate-mesh-move opacity-60" />
        </div>

        <div className="text-center space-y-4 mb-16 relative z-10">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-slate-100 via-primary to-slate-100 bg-clip-text text-transparent animate-slide-up relative">
            Your AI Workspace
            <span className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent opacity-30 blur-xl animate-gradient bg-[length:200%_auto]">
              Your AI Workspace
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Everything you need in one powerful platform
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4">
          <MagicBento
            textAutoHide={true}
            enableStars={true}
            enableSpotlight={true}
            enableBorderGlow={true}
            enableTilt={true}
            enableMagnetism={true}
            clickEffect={true}
            spotlightRadius={300}
            particleCount={12}
            glowColor="132, 0, 255"
            cards={[
              {
                color: 'transparent',
                title: 'Start Creating with AI',
                description: 'Transform your images with powerful AI tools. Enhance quality, translate text, generate icons and logos.',
                label: 'Get Started',
                icon: Rocket,
                onClick: () => onFunctionSelect('enhance'),
              },
              {
                color: 'transparent',
                title: 'Icon Generator',
                description: 'Create multiple variants instantly',
                label: 'Icons',
                icon: Zap,
                onClick: () => onFunctionSelect('icons'),
              },
              {
                color: 'transparent',
                title: 'Logo Generator',
                description: 'Create professional logos',
                label: 'Logos',
                icon: Palette,
                onClick: () => onFunctionSelect('logos'),
              },
              {
                color: 'transparent',
                title: 'Multi-Language',
                description: 'Translate text in images to 100+ languages',
                label: 'Translate',
                icon: Languages,
                onClick: () => onFunctionSelect('translate'),
              },
              {
                color: 'transparent',
                title: 'Batch Processing',
                description: 'Process multiple images at once',
                label: 'Batch',
                icon: Layers,
              },
              {
                color: 'transparent',
                title: 'Lightning Fast',
                description: 'Results in seconds',
                label: 'Speed',
                icon: Clock,
              },
            ]}
          />
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="space-y-16 relative">
        <div className="text-center space-y-4">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
            Everything You Need
          </h2>
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto">
            Powerful AI tools to enhance, translate, and create images
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {getFeatures(onFunctionSelect).map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border border-slate-700/70 hover:border-primary/60 bg-gradient-to-br from-slate-800/95 to-slate-800/90 backdrop-blur-sm shadow-xl shadow-black/30"
                onClick={() => onFunctionSelect(feature.function)}
              >
                {/* Gradient overlay on hover - darker */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-accent/0 group-hover:from-primary/8 group-hover:to-accent/8 transition-all duration-300" />
                
                <CardHeader className="relative z-10 p-5">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className={`relative p-3 rounded-xl ${feature.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`h-6 w-6 ${feature.color} relative z-10`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg font-bold mb-2 text-slate-100 group-hover:text-primary transition-colors">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="text-sm leading-relaxed text-slate-300">
                        {feature.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10 p-5 pt-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full group-hover:text-primary font-medium rounded-lg"
                  >
                    Try Now
                    <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-accent/15 to-primary/15 rounded-3xl blur-3xl opacity-60" />
        <div className="relative bg-gradient-to-br from-slate-800/95 via-slate-800/90 to-slate-800/90 backdrop-blur-xl rounded-3xl p-8 md:p-12 lg:p-16 border-2 border-slate-700/70 shadow-2xl shadow-black/50">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-8">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
                  <Sparkles className="h-3 w-3" />
                  <span>Benefits</span>
                </div>
                <h2 className="text-4xl sm:text-5xl font-extrabold mb-4 bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
                  Why Choose VisionAI?
                </h2>
                <p className="text-lg sm:text-xl text-slate-300 leading-relaxed">
                  Experience the future of image processing with our advanced AI technology.
                </p>
              </div>
              <ul className="space-y-5">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-4 group">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Check className="h-5 w-5 text-primary font-bold" />
                    </div>
                    <span className="text-base font-medium text-slate-200 group-hover:text-primary transition-colors">
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-accent/25 to-primary/25 rounded-3xl blur-3xl animate-pulse-slow opacity-50" />
              <div className="relative bg-gradient-to-br from-slate-800/95 via-slate-800/90 to-slate-800/95 backdrop-blur-xl rounded-3xl p-8 lg:p-10 border-2 border-slate-700/70 shadow-2xl shadow-black/50">
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
                          <p className="text-sm text-slate-400">{item.desc}</p>
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
        <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-accent/25 to-primary/25 rounded-3xl blur-3xl opacity-60" />
        <div className="relative bg-gradient-to-br from-slate-800/95 via-slate-800/90 to-slate-800/95 backdrop-blur-xl rounded-3xl p-12 lg:p-16 border-2 border-primary/40 shadow-2xl shadow-black/50">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-slate-100 via-slate-200 to-slate-300 bg-clip-text text-transparent">
              Ready to Transform Your Images?
            </h2>
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
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

