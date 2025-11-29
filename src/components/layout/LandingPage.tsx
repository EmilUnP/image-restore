import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sparkles,
  Languages,
  Zap,
  Palette,
  Share2,
  ArrowRight,
  Check,
  Rocket,
  Upload,
  Settings,
  Wand2,
  Download,
} from "lucide-react";
import MagicBento from "./MagicBento";
import LightRays from "./LightRays";

type AppFunction = 'enhance' | 'translate' | 'icons' | 'logos' | 'social' | null;

interface LandingPageProps {
  onFunctionSelect: (func: AppFunction) => void;
}

const features = [
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
  {
    icon: Share2,
    title: "Social Post Generator",
    description: "Create stunning social media posts. Generate from scratch, use reference images, or combine multiple inspirations.",
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
    function: 'social' as AppFunction,
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
  return (
    <div className="min-h-screen">
      <div className="relative">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Light rays background, constrained to hero only */}
          <div className="pointer-events-none absolute inset-0 z-0">
            {/* Soft cyan rays */}
            <LightRays
              raysOrigin="top-center"
              raysColor="#22d3ee"
              raysSpeed={1.4}
              lightSpread={2.2}
              rayLength={3.0}
              followMouse={true}
              mouseInfluence={0.18}
              noiseAmount={0.08}
              distortion={0.04}
              saturation={1.1}
              fadeDistance={2.0}
            />
            {/* Warm accent rays */}
            <LightRays
              raysOrigin="top-center"
              raysColor="#f97316"
              raysSpeed={1.1}
              lightSpread={1.8}
              rayLength={2.6}
              followMouse={false}
              mouseInfluence={0}
              noiseAmount={0.04}
              distortion={0.02}
              saturation={1.0}
              fadeDistance={1.6}
            />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto text-center space-y-10 animate-fade-in">
            {/* Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-tight">
                <span className="block text-slate-100 drop-shadow-lg">Transform Your</span>
                <span className="block mt-3 bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent animate-gradient drop-shadow-2xl">
                  Images with AI
                </span>
              </h1>
              
              {/* Description */}
              <p className="text-xl sm:text-2xl md:text-3xl text-slate-300 max-w-4xl mx-auto leading-relaxed font-light">
                Professional AI-powered image optimization, translation, and generation tools.
                <span className="block mt-2 text-lg sm:text-xl text-slate-400">
                  Enhance quality, translate text, generate icons, logos, and social posts—all in one platform.
                </span>
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-5 justify-center pt-6">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/90 hover:to-accent/90 font-bold text-lg px-10 py-7 shadow-2xl shadow-primary/40 hover:shadow-primary/60 transition-all duration-300 rounded-xl hover:scale-105"
                onClick={() => onFunctionSelect('enhance')}
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-primary/40 bg-card/40 backdrop-blur-sm font-semibold text-lg px-10 py-7 hover:bg-primary/10 hover:border-primary/70 transition-all duration-300 rounded-xl hover:scale-105"
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Explore Features
              </Button>
            </div>

            {/* Stats or Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 max-w-4xl mx-auto">
              {[
                { label: 'AI Models', value: '5+' },
                { label: 'Languages', value: '100+' },
                { label: 'Quality', value: '4K' },
                { label: 'Speed', value: '<5s' },
              ].map((stat, idx) => (
                <div 
                  key={idx}
                  className="p-4 rounded-xl bg-card/40 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105"
                >
                  <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bento Grid Section - Features */}
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-slate-100 via-primary to-slate-100 bg-clip-text text-transparent">
                Your AI Workspace
              </h2>
              <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto">
                Everything you need in one powerful platform
              </p>
            </div>

            {/* MagicBento Grid */}
            <div className="relative z-10">
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
                glowColor="14, 211, 238"
                cards={[
                  {
                    color: 'transparent',
                    title: 'Start Creating with AI',
                    description: 'Transform your images with powerful AI tools. Enhance quality, translate text, generate icons and logos.',
                    label: 'Get Started',
                    icon: Rocket,
                    image: 'get start.png',
                    imagePosition: 'background',
                    onClick: () => onFunctionSelect('enhance'),
                  },
                  {
                    color: 'transparent',
                    title: 'Icon Generator',
                    description: 'Create multiple variants instantly',
                    label: 'Icons',
                    icon: Zap,
                    image: 'icons.png',
                    imagePosition: 'background',
                    onClick: () => onFunctionSelect('icons'),
                  },
                  {
                    color: 'transparent',
                    title: 'Logo Generator',
                    description: 'Create professional logos',
                    label: 'Logos',
                    icon: Palette,
                    image: 'logos.png',
                    imagePosition: 'background',
                    onClick: () => onFunctionSelect('logos'),
                  },
                  {
                    color: 'transparent',
                    title: 'Multi-Language',
                    description: 'Translate text in images to 100+ languages',
                    label: 'Translate',
                    icon: Languages,
                    image: 'translate.png',
                    imagePosition: 'background',
                    onClick: () => onFunctionSelect('translate'),
                  },
                  {
                    color: 'transparent',
                    title: 'Batch Processing',
                    description: 'Process multiple images at once',
                    label: 'Batch',
                    icon: Sparkles,
                    image: 'batch.png',
                    imagePosition: 'background',
                  },
                  {
                    color: 'transparent',
                    title: 'Lightning Fast',
                    description: 'Results in seconds',
                    label: 'Speed',
                    icon: Zap,
                    image: 'speed.png',
                    imagePosition: 'background',
                  },
                ]}
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="text-center space-y-4 mb-20">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                How It Works
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
                Transform your images in just a few simple steps. Our AI-powered platform makes it easy.
              </p>
            </div>

            {/* Steps */}
            <div className="relative">
              {/* Connection Line (Desktop) */}
              <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 z-0" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                {[
                  {
                    step: 1,
                    icon: Settings,
                    title: "Choose Your Tool",
                    description: "Select from image enhancement, translation, icon generation, logo creation, or social post generation.",
                    color: "text-blue-400",
                    bg: "bg-blue-500/20",
                    border: "border-blue-500/30",
                  },
                  {
                    step: 2,
                    icon: Upload,
                    title: "Upload or Describe",
                    description: "Upload your image or provide a description. Our AI understands your needs and preferences.",
                    color: "text-green-400",
                    bg: "bg-green-500/20",
                    border: "border-green-500/30",
                  },
                  {
                    step: 3,
                    icon: Wand2,
                    title: "AI Processing",
                    description: "Our advanced AI models process your request. Get professional results in seconds, not hours.",
                    color: "text-purple-400",
                    bg: "bg-purple-500/20",
                    border: "border-purple-500/30",
                  },
                  {
                    step: 4,
                    icon: Download,
                    title: "Download & Use",
                    description: "Download your enhanced, translated, or generated image. High-quality results ready for any use case.",
                    color: "text-orange-400",
                    bg: "bg-orange-500/20",
                    border: "border-orange-500/30",
                  },
                ].map((stepData, index) => {
                  const StepIcon = stepData.icon;
                  return (
                    <div
                      key={index}
                      className="relative group animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {/* Step Number Badge */}
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-xl shadow-primary/30 border-4 border-background">
                          <span className="text-lg font-bold text-white">{stepData.step}</span>
                        </div>
                      </div>

                      <Card className="pt-8 pb-6 px-6 border-2 bg-card/60 backdrop-blur-xl hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-2 rounded-2xl overflow-hidden relative group">
                        {/* Gradient overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-accent/0 group-hover:from-primary/10 group-hover:to-accent/10 transition-all duration-300 z-0" />
                        
                        <CardHeader className="p-0 pb-4 relative z-10">
                          <div className="flex flex-col items-center text-center space-y-4">
                            {/* Icon */}
                            <div className={`p-5 rounded-2xl ${stepData.bg} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-primary/20 group-hover:shadow-xl group-hover:shadow-primary/40 mt-4`}>
                              <StepIcon className={`h-10 w-10 ${stepData.color} transition-all duration-300`} />
                            </div>
                            
                            {/* Title and Description */}
                            <div className="space-y-3">
                              <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                                {stepData.title}
                              </CardTitle>
                              <CardDescription className="text-sm text-muted-foreground leading-relaxed min-h-[4rem]">
                                {stepData.description}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center mt-16">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/90 hover:to-accent/90 font-bold text-lg px-10 py-7 shadow-2xl shadow-primary/40 hover:shadow-primary/60 transition-all duration-300 rounded-xl hover:scale-105"
                onClick={() => onFunctionSelect('enhance')}
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-7xl mx-auto">
            <div className="bg-card/60 backdrop-blur-xl rounded-3xl p-8 md:p-12 lg:p-16 border-2 border-primary/30 shadow-2xl shadow-primary/10 relative overflow-hidden">
              {/* Decorative gradient overlay */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl -z-0" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-accent/20 to-primary/20 rounded-full blur-3xl -z-0" />
              
              <div className="grid md:grid-cols-2 gap-16 items-center relative z-10">
                {/* Left Side */}
                <div className="space-y-8 animate-fade-in">
                  <div className="space-y-4">
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                      Why Choose VisionAI?
                    </h2>
                    <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                      Experience the future of image processing with our advanced AI technology.
                    </p>
                  </div>
                  
                  {/* Benefits List */}
                  <ul className="space-y-4">
                    {benefits.map((benefit, index) => (
                      <li 
                        key={index} 
                        className="flex items-center gap-4 p-4 rounded-xl bg-card/40 backdrop-blur-sm border border-primary/20 hover:border-primary/40 hover:bg-card/60 transition-all duration-300 group"
                      >
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/20">
                          <Check className="h-6 w-6 text-primary font-bold" />
                        </div>
                        <span className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                          {benefit}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Right Side */}
                <div className="space-y-6 animate-fade-in">
                  {[
                    { icon: Sparkles, title: "Fast Processing", desc: "Get results in seconds", color: "text-blue-400", bg: "bg-blue-500/20" },
                    { icon: Zap, title: "High Quality", desc: "Professional-grade output up to 4K", color: "text-green-400", bg: "bg-green-500/20" },
                    { icon: Palette, title: "Easy to Use", desc: "No technical skills required", color: "text-purple-400", bg: "bg-purple-500/20" },
                  ].map((item, idx) => {
                    const ItemIcon = item.icon;
                    return (
                      <div 
                        key={idx} 
                        className="flex items-center gap-5 p-6 rounded-2xl bg-card/40 backdrop-blur-sm border-2 border-primary/20 hover:border-primary/50 hover:bg-card/60 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/20 group"
                      >
                        <div className={`p-4 rounded-2xl ${item.bg} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                          <ItemIcon className={`h-7 w-7 ${item.color}`} />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-card/80 via-card/60 to-card/80 backdrop-blur-xl rounded-3xl p-12 lg:p-20 border-2 border-primary/40 shadow-2xl shadow-primary/20 text-center relative overflow-hidden">
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10 animate-gradient opacity-50" />
              <div className="absolute top-0 right-0 w-72 h-72 bg-primary/20 rounded-full blur-3xl -z-0" />
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/20 rounded-full blur-3xl -z-0" />
              
              <div className="space-y-8 relative z-10 animate-fade-in">
                <div className="space-y-4">
                  <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-4 drop-shadow-lg">
                    Ready to Transform Your Images?
                  </h2>
                  <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    Start using our AI-powered tools today. Enhance, translate, generate—all in one powerful platform.
                  </p>
                </div>
                
                <div className="pt-6 flex flex-col sm:flex-row gap-5 justify-center">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/90 hover:to-accent/90 font-bold text-lg px-12 py-8 shadow-2xl shadow-primary/40 hover:shadow-primary/60 transition-all duration-300 rounded-xl hover:scale-105"
                    onClick={() => onFunctionSelect('enhance')}
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                  
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-primary/40 bg-card/40 backdrop-blur-sm font-semibold text-lg px-12 py-8 hover:bg-primary/10 hover:border-primary/70 transition-all duration-300 rounded-xl hover:scale-105"
                    onClick={() => {
                      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Explore Features
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
