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
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <section className="text-center space-y-8 max-w-5xl mx-auto relative">
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border border-primary/20 text-primary text-sm font-semibold mb-6 shadow-lg shadow-primary/10 backdrop-blur-sm">
          <Sparkles className="h-4 w-4 animate-pulse" />
          <span>Powered by Gemini AI</span>
        </div>
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-tight">
          <span className="block">Transform Your</span>
          <span className="block bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
            Images with AI
          </span>
        </h1>
        <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
          Professional AI-powered image optimization, translation, and generation tools. Transform your creative workflow with cutting-edge technology.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Button
            size="lg"
            className="relative rounded-2xl bg-gradient-to-r from-primary via-primary to-accent hover:opacity-90 font-bold text-lg px-8 py-6 shadow-2xl shadow-primary/30 hover:shadow-primary/40 transition-all duration-300 overflow-hidden group"
            onClick={() => {
              // This will trigger login if not authenticated
              onFunctionSelect('enhance');
            }}
          >
            <span className="relative z-10 flex items-center gap-2">
              Get Started Free
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-2xl border-2 font-semibold text-lg px-8 py-6 hover:bg-muted/50 transition-all duration-300"
            onClick={() => {
              document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Learn More
          </Button>
        </div>
      </section>

      {/* Bento Grid Section */}
      <section className="relative space-y-8">
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
            <Layers className="h-3 w-3" />
            <span>Platform</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Your AI Workspace
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need in one powerful platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 auto-rows-fr">
          {/* Hero Tile - Large */}
          <Card 
            className="group relative overflow-hidden col-span-12 md:col-span-7 row-span-2 cursor-pointer border-2 hover:border-primary/50 bg-gradient-to-br from-primary/5 via-primary/5 to-accent/5 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl"
            onClick={() => onFunctionSelect('enhance')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-accent/0 group-hover:from-primary/10 group-hover:via-primary/10 group-hover:to-accent/10 transition-all duration-500" />
            <CardHeader className="relative z-10 p-8 lg:p-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Rocket className="h-6 w-6 text-primary" />
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold">
                  <Sparkles className="h-3 w-3" />
                  <span>New</span>
                </div>
              </div>
              <CardTitle className="text-3xl lg:text-4xl font-extrabold mb-4 group-hover:text-primary transition-colors">
                Start Creating with AI
              </CardTitle>
              <CardDescription className="text-base lg:text-lg text-muted-foreground leading-relaxed mb-6">
                Transform your images with our powerful AI tools. Enhance quality, translate text, generate icons and logos - all in one place.
              </CardDescription>
              <Button
                size="lg"
                className="relative rounded-xl bg-gradient-to-r from-primary via-primary to-accent hover:opacity-90 font-bold shadow-xl shadow-primary/30 group-hover:shadow-primary/40 transition-all duration-300"
              >
                <span className="flex items-center gap-2">
                  Explore Tools
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </CardHeader>
          </Card>

          {/* Stats Tile */}
          <Card className="group relative overflow-hidden col-span-12 md:col-span-5 cursor-pointer border-2 hover:border-primary/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl"
            onClick={() => onFunctionSelect('icons')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/10 group-hover:to-purple-500/10 transition-all duration-500" />
            <CardHeader className="relative z-10 p-6 lg:p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-purple-500/10 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                    10K+
                  </div>
                  <div className="text-xs text-muted-foreground">Icons Generated</div>
                </div>
              </div>
              <CardTitle className="text-xl font-bold mb-2 group-hover:text-purple-600 transition-colors">
                Icon Generator
              </CardTitle>
              <CardDescription className="text-sm">
                Create multiple variants instantly
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Multi-language Tile */}
          <Card className="group relative overflow-hidden col-span-12 md:col-span-4 cursor-pointer border-2 hover:border-primary/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl"
            onClick={() => onFunctionSelect('translate')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-green-500/0 group-hover:from-green-500/10 group-hover:to-green-500/10 transition-all duration-500" />
            <CardHeader className="relative z-10 p-6 lg:p-8">
              <div className="p-3 rounded-xl bg-green-500/10 group-hover:scale-110 transition-transform duration-300 mb-4 w-fit">
                <Languages className="h-5 w-5 text-green-600" />
              </div>
              <CardTitle className="text-xl font-bold mb-2 group-hover:text-green-600 transition-colors">
                Multi-Language
              </CardTitle>
              <CardDescription className="text-sm">
                Translate text in images to 100+ languages
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Batch Processing Tile */}
          <Card className="group relative overflow-hidden col-span-12 md:col-span-4 cursor-pointer border-2 hover:border-primary/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:to-blue-500/10 transition-all duration-500" />
            <CardHeader className="relative z-10 p-6 lg:p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-blue-500/10 group-hover:scale-110 transition-transform duration-300">
                  <Layers className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                    Batch
                  </div>
                </div>
              </div>
              <CardTitle className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                Process Multiple
              </CardTitle>
              <CardDescription className="text-sm">
                Handle multiple images at once
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Prompt Memory Tile */}
          <Card className="group relative overflow-hidden col-span-12 md:col-span-4 cursor-pointer border-2 hover:border-primary/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-500/0 group-hover:from-orange-500/10 group-hover:to-orange-500/10 transition-all duration-500" />
            <CardHeader className="relative z-10 p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-orange-500/10 group-hover:scale-110 transition-transform duration-300">
                  <Copy className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg font-bold mb-1 group-hover:text-orange-600 transition-colors">
                    Prompt Memory
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Copy & reuse AI prompts
                  </CardDescription>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-muted/50 text-xs font-mono text-muted-foreground group-hover:text-foreground transition-colors">
                View actual prompts sent to AI
              </div>
            </CardHeader>
          </Card>

          {/* Speed Tile */}
          <Card className="group relative overflow-hidden col-span-12 md:col-span-6 cursor-pointer border-2 hover:border-primary/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-cyan-500/0 group-hover:from-cyan-500/10 group-hover:to-cyan-500/10 transition-all duration-500" />
            <CardHeader className="relative z-10 p-6 lg:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-cyan-500/10 group-hover:scale-110 transition-transform duration-300">
                      <Clock className="h-5 w-5 text-cyan-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold group-hover:text-cyan-600 transition-colors">
                        Lightning Fast
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Results in seconds
                      </CardDescription>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full w-3/4 group-hover:w-full transition-all duration-1000" />
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">Processing speed</div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Logo Generator Tile */}
          <Card className="group relative overflow-hidden col-span-12 md:col-span-6 cursor-pointer border-2 hover:border-primary/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl"
            onClick={() => onFunctionSelect('logos')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-500/0 group-hover:from-orange-500/10 group-hover:to-orange-500/10 transition-all duration-500" />
            <CardHeader className="relative z-10 p-6 lg:p-8">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-orange-500/10 group-hover:scale-110 transition-transform duration-300">
                      <Palette className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold group-hover:text-orange-600 transition-colors">
                        Logo Generator
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Create professional logos
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 group-hover:text-orange-600"
                  >
                    Try Now
                    <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Stats Row Tile */}
          <Card className="group relative overflow-hidden col-span-12 cursor-pointer border-2 hover:border-primary/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-accent/0 to-primary/0 group-hover:from-primary/5 group-hover:via-accent/5 group-hover:to-primary/5 transition-all duration-500" />
            <CardContent className="relative z-10 p-6 lg:p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { icon: Users, label: "Active Users", value: "50K+", color: "text-blue-600", bg: "bg-blue-500/10" },
                  { icon: TrendingUp, label: "Images Processed", value: "1M+", color: "text-green-600", bg: "bg-green-500/10" },
                  { icon: FileText, label: "Languages", value: "100+", color: "text-purple-600", bg: "bg-purple-500/10" },
                  { icon: Zap, label: "Uptime", value: "99.9%", color: "text-orange-600", bg: "bg-orange-500/10" },
                ].map((stat, idx) => {
                  const StatIcon = stat.icon;
                  return (
                    <div key={idx} className="text-center group/item">
                      <div className={`inline-flex p-3 rounded-xl ${stat.bg} mb-3 group-hover/item:scale-110 transition-transform duration-300`}>
                        <StatIcon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                      <div className={`text-2xl font-extrabold ${stat.color} mb-1`}>
                        {stat.value}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {stat.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="space-y-16 relative">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
            <Zap className="h-3 w-3" />
            <span>Features</span>
          </div>
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
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 text-primary text-xs font-semibold mb-4">
              <Zap className="h-3 w-3" />
              <span>Get Started</span>
            </div>
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

