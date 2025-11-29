import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sparkles,
  Languages,
  Zap,
  Palette,
  ArrowRight,
  Check,
  Rocket,
} from "lucide-react";
import MagicBento from "./MagicBento";
import LightRays from "./LightRays";

type AppFunction = 'enhance' | 'translate' | 'icons' | 'logos' | null;

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

          <div className="relative z-10 max-w-7xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">
                  Next-Generation AI Technology
                </span>
              </div>
            </div>
            
            {/* Heading */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight">
              <span className="block text-slate-100">Transform Your</span>
              <span className="block mt-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  Images with AI
              </span>
            </h1>
            
            {/* Description */}
            <p className="text-xl sm:text-2xl text-slate-300 max-w-3xl mx-auto">
              Professional AI-powered image optimization, translation, and generation tools.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 font-bold text-lg px-8 py-6"
                onClick={() => onFunctionSelect('enhance')}
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-slate-700 font-semibold text-lg px-8 py-6 hover:bg-slate-800 hover:border-primary/50"
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Learn More
              </Button>
            </div>
          </div>
        </section>

        {/* Bento Grid Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="text-center space-y-4 mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-primary text-sm font-semibold">
                <Sparkles className="h-4 w-4" />
                <span>AI-Powered Platform</span>
              </div>
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
                    icon: Sparkles,
                  },
                  {
                    color: 'transparent',
                    title: 'Lightning Fast',
                    description: 'Results in seconds',
                    label: 'Speed',
                    icon: Zap,
                  },
                ]}
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="text-center space-y-4 mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 border border-accent/30 text-accent text-sm font-semibold">
                <Zap className="h-4 w-4" />
                <span>Feature Set</span>
            </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-slate-100 via-primary to-slate-100 bg-clip-text text-transparent">
                Everything You Need
            </h2>
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto">
              Powerful AI tools to enhance, translate, and create images
            </p>
          </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                    className="group cursor-pointer border border-slate-700/70 hover:border-primary/60 bg-slate-800/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-1"
                  onClick={() => onFunctionSelect(feature.function)}
                  >
                    <CardHeader className="p-6">
                      <div className="flex flex-col items-center text-center space-y-4">
                        {/* Icon */}
                        <div className={`p-4 rounded-xl ${feature.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className={`h-8 w-8 ${feature.color}`} />
                      </div>
                      
                        {/* Title and Description */}
                        <div className="space-y-2">
                          <CardTitle className="text-xl font-bold text-slate-100 group-hover:text-primary transition-colors">
                          {feature.title}
                        </CardTitle>
                          <CardDescription className="text-sm text-slate-300 leading-relaxed">
                          {feature.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  
                    <CardContent className="p-6 pt-0">
                    <Button
                      variant="ghost"
                      size="sm"
                        className="w-full group-hover:text-primary group-hover:bg-primary/10 font-medium"
                    >
                      Try Now
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 md:p-12 lg:p-16 border border-slate-700/70">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                {/* Left Side */}
              <div className="space-y-8">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6 border border-primary/20">
                  <Check className="h-3 w-3" />
                  <span>Why Choose Us</span>
                </div>
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-slate-100 via-primary to-slate-100 bg-clip-text text-transparent">
                      Why Choose VisionAI?
                </h2>
                <p className="text-lg sm:text-xl text-slate-300 leading-relaxed">
                  Experience the future of image processing with our advanced AI technology.
                </p>
              </div>
                  
                  {/* Benefits List */}
                  <ul className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <li 
                      key={index} 
                        className="flex items-center gap-4"
                      >
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          <Check className="h-5 w-5 text-primary font-bold" />
                      </div>
                        <span className="text-base font-medium text-slate-200">
                        {benefit}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              
                {/* Right Side */}
                  <div className="space-y-6">
                    {[
                      { icon: Sparkles, title: "Fast Processing", desc: "Get results in seconds", color: "text-blue-400", bg: "bg-blue-500/10" },
                      { icon: Zap, title: "High Quality", desc: "Professional-grade output", color: "text-green-400", bg: "bg-green-500/10" },
                      { icon: Palette, title: "Easy to Use", desc: "No technical skills required", color: "text-purple-400", bg: "bg-purple-500/10" },
                    ].map((item, idx) => {
                      const ItemIcon = item.icon;
                      return (
                        <div 
                          key={idx} 
                        className="flex items-center gap-4 p-5 rounded-2xl hover:bg-slate-700/50 transition-all duration-300"
                      >
                        <div className={`p-4 rounded-2xl ${item.bg}`}>
                            <ItemIcon className={`h-6 w-6 ${item.color}`} />
                          </div>
                          <div>
                          <h3 className="font-bold text-lg text-slate-100">{item.title}</h3>
                          <p className="text-sm text-slate-400">{item.desc}</p>
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
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 backdrop-blur-sm rounded-3xl p-12 lg:p-16 border border-primary/40 text-center">
              <div className="space-y-8">
              <div>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 text-primary text-xs font-semibold mb-6">
                    <Rocket className="h-3 w-3" />
                  <span>Get Started Now</span>
                </div>
                  <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-slate-100 via-primary to-slate-100 bg-clip-text text-transparent mb-4">
                    Ready to Transform Your Images?
                </h2>
                <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                  Start using our AI-powered tools today. Sign in to get started.
                </p>
              </div>
              
              <div className="pt-4">
                <Button
                  size="lg"
                    className="bg-gradient-to-r from-primary to-accent hover:opacity-90 font-bold text-lg px-10 py-7 shadow-xl shadow-primary/30"
                  onClick={() => onFunctionSelect('enhance')}
                >
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
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
