import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Sparkles, 
  Languages, 
  Zap, 
  Palette,
  ArrowRight,
  Check,
  Image as ImageIcon
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
              Start using our AI-powered tools today. No sign-up required.
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

