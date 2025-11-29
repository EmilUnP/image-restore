import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Sparkles, 
  Languages, 
  Zap, 
  Palette,
  ArrowRight,
  Check,
  Rocket
} from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import MagicBento, { BentoCardProps } from "./MagicBento";
import LightRays from "./LightRays";

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
  return (
    <div className="min-h-screen bg-slate-950 relative">
      {/* Simple Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-slate-950">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="space-y-20 relative -mt-20 pt-20">
        {/* Hero Section - Starts immediately after header (header is 80px/h-20) */}
        <section className="text-center w-full relative pt-2 lg:pt-4 pb-12 lg:pb-16 overflow-hidden" style={{ minHeight: '600px' }}>
          {/* Light Rays Animation - Full width, layered with soft colors */}
          <div style={{ width: '100%', height: '600px', position: 'absolute', top: 0, left: 0, zIndex: 1, pointerEvents: 'none', mixBlendMode: 'screen' }}>
            {/* Soft Blue Rays - Larger and lighter */}
            <div className="absolute inset-0" style={{ opacity: 0.55, mixBlendMode: 'screen' }}>
              <LightRays
                raysOrigin="top-center"
                raysColor="#7dd3fc"
                raysSpeed={1.2}
                lightSpread={2.2}
                rayLength={3.0}
                followMouse={true}
                mouseInfluence={0.15}
                noiseAmount={0.08}
                distortion={0.03}
                saturation={0.75}
                fadeDistance={1.8}
              />
            </div>
            {/* Soft Green Rays - Largest spread */}
            <div className="absolute inset-0" style={{ opacity: 0.5, mixBlendMode: 'screen' }}>
              <LightRays
                raysOrigin="top-center"
                raysColor="#86efac"
                raysSpeed={1.5}
                lightSpread={2.5}
                rayLength={3.2}
                followMouse={true}
                mouseInfluence={0.12}
                noiseAmount={0.1}
                distortion={0.04}
                saturation={0.7}
                fadeDistance={2.0}
              />
            </div>
            {/* Soft Yellow/Amber Rays - Warm accent */}
            <div className="absolute inset-0" style={{ opacity: 0.45, mixBlendMode: 'screen' }}>
              <LightRays
                raysOrigin="top-center"
                raysColor="#fde68a"
                raysSpeed={1.3}
                lightSpread={2.0}
                rayLength={2.8}
                followMouse={true}
                mouseInfluence={0.1}
                noiseAmount={0.09}
                distortion={0.025}
                saturation={0.7}
                fadeDistance={1.7}
              />
            </div>
            {/* Soft Cyan Accent - Subtle highlight */}
            <div className="absolute inset-0" style={{ opacity: 0.4, mixBlendMode: 'screen' }}>
              <LightRays
                raysOrigin="top-center"
                raysColor="#6ee7b7"
                raysSpeed={1.4}
                lightSpread={1.8}
                rayLength={2.5}
                followMouse={true}
                mouseInfluence={0.08}
                noiseAmount={0.07}
                distortion={0.02}
                saturation={0.65}
                fadeDistance={1.6}
              />
            </div>
          </div>
          
          {/* Hero Content - Centered container with wider max-width */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight">
              <span className="block text-slate-100">Transform Your</span>
              <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Images with AI
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Professional AI-powered image optimization, translation, and generation tools.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                size="lg"
                className="rounded-2xl bg-gradient-to-r from-primary via-primary to-accent hover:opacity-90 font-bold text-lg px-10 py-7 shadow-xl shadow-primary/30"
                onClick={() => {
                  onFunctionSelect('enhance');
                }}
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="rounded-2xl border-2 border-slate-700 font-semibold text-lg px-10 py-7 hover:bg-slate-800 hover:border-primary/50"
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
        <section className="relative space-y-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12 relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-100">
            Your AI Workspace
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
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
      </section>

        {/* Features Grid */}
        <section id="features" className="space-y-16 relative px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 relative z-10">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-slate-100 via-primary to-slate-100 bg-clip-text text-transparent relative">
              Everything You Need
              <span className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent opacity-30 blur-xl animate-gradient bg-[length:200%_auto]">
                Everything You Need
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto">
              Powerful AI tools to enhance, translate, and create images
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {getFeatures(onFunctionSelect).map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="group relative overflow-hidden cursor-pointer border border-slate-700/70 hover:border-primary/60 bg-gradient-to-br from-slate-800/95 via-slate-800/90 to-slate-800/95 backdrop-blur-xl transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 opacity-0"
                  onClick={() => onFunctionSelect(feature.function)}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards'
                  }}
                >
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-accent/0 group-hover:from-primary/10 group-hover:via-primary/5 group-hover:to-accent/10 transition-all duration-500 rounded-lg opacity-0 group-hover:opacity-100" />
                  
                  {/* Animated border glow */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/0 via-primary/20 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
                  
                  <CardHeader className="relative z-10 p-6">
                    <div className="flex flex-col items-center text-center space-y-5">
                      {/* Icon with enhanced animation */}
                      <div className="relative">
                        <div className={`absolute inset-0 ${feature.bgColor} rounded-xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-500`} />
                        <div className={`relative p-4 rounded-xl ${feature.bgColor} group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}>
                          <Icon className={`h-7 w-7 ${feature.color} relative z-10`} />
                        </div>
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <CardTitle className="text-xl font-bold text-slate-100 group-hover:text-primary transition-colors duration-300">
                          {feature.title}
                        </CardTitle>
                        <CardDescription className="text-sm leading-relaxed text-slate-300 group-hover:text-slate-200 transition-colors">
                          {feature.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="relative z-10 p-6 pt-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full group-hover:text-primary group-hover:bg-primary/10 font-medium rounded-lg transition-all duration-300"
                    >
                      Try Now
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="relative px-4 sm:px-6 lg:px-8">
          {/* Background glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-accent/15 to-primary/15 rounded-3xl blur-3xl opacity-60" />
          
          <div className="relative bg-gradient-to-br from-slate-800/95 via-slate-800/90 to-slate-800/95 backdrop-blur-xl rounded-3xl p-8 md:p-12 lg:p-16 border-2 border-slate-700/70 shadow-2xl shadow-black/50 overflow-hidden">
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 opacity-0 hover:opacity-100 transition-opacity duration-500" />
            
            <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
              <div className="space-y-8">
                <div>
                  <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-slate-100 via-primary to-slate-100 bg-clip-text text-transparent">
                    Why Choose VisionAI?
                  </h2>
                  <p className="text-lg sm:text-xl text-slate-300 leading-relaxed">
                    Experience the future of image processing with our advanced AI technology.
                  </p>
                </div>
                <ul className="space-y-5">
                  {benefits.map((benefit, index) => (
                    <li 
                      key={index} 
                      className="flex items-center gap-4 group/benefit opacity-0"
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animation: 'fadeInLeft 0.6s ease-out forwards'
                      }}
                    >
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover/benefit:scale-110 group-hover/benefit:rotate-3 transition-all duration-300 shadow-lg">
                        <Check className="h-6 w-6 text-primary font-bold" />
                      </div>
                      <span className="text-base font-medium text-slate-200 group-hover/benefit:text-primary transition-colors duration-300">
                        {benefit}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 rounded-3xl blur-2xl opacity-50" />
                <div className="relative bg-gradient-to-br from-slate-800/95 via-slate-800/90 to-slate-800/95 backdrop-blur-xl rounded-3xl p-8 border-2 border-slate-700/70 shadow-xl">
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
                          className="group/feature flex items-center gap-4 p-5 rounded-2xl hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-700/30 transition-all duration-300 cursor-pointer hover:shadow-lg hover:-translate-y-1 opacity-0"
                          style={{
                            animationDelay: `${idx * 150}ms`,
                            animation: 'fadeInRight 0.6s ease-out forwards'
                          }}
                        >
                          <div className={`p-4 rounded-2xl ${item.bg} group-hover/feature:scale-110 group-hover/feature:rotate-3 transition-all duration-300 shadow-lg`}>
                            <ItemIcon className={`h-6 w-6 ${item.color}`} />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-slate-100 group-hover/feature:text-primary transition-colors">{item.title}</h3>
                            <p className="text-sm text-slate-400 group-hover/feature:text-slate-300 transition-colors">{item.desc}</p>
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
        <section className="relative text-center px-4 sm:px-6 lg:px-8">
          {/* Background glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-accent/25 to-primary/25 rounded-3xl blur-3xl opacity-60" />
          
          <div className="relative bg-gradient-to-br from-slate-800/95 via-slate-800/90 to-slate-800/95 backdrop-blur-xl rounded-3xl p-12 lg:p-16 border-2 border-primary/40 shadow-2xl shadow-primary/30 overflow-hidden">
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 opacity-0 hover:opacity-100 transition-opacity duration-500" />
            
            {/* Floating particles effect */}
            <div className="absolute top-0 left-1/4 w-2 h-2 bg-primary rounded-full opacity-50 animate-pulse" style={{ animationDelay: '0s' }} />
            <div className="absolute bottom-0 right-1/4 w-3 h-3 bg-accent rounded-full opacity-50 animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-primary rounded-full opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />
            
            <div className="max-w-3xl mx-auto space-y-8 relative z-10">
              <div>
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
                  className="relative rounded-2xl bg-gradient-to-r from-primary via-primary to-accent hover:opacity-90 font-bold text-lg px-10 py-7 shadow-2xl shadow-primary/40 hover:shadow-primary/60 transition-all duration-500 overflow-hidden group hover:scale-105"
                  onClick={() => onFunctionSelect('enhance')}
                >
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-accent via-primary to-accent bg-[length:200%_100%] animate-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out">
                    <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
                  </div>
                  
                  <span className="relative z-10 flex items-center gap-2">
                    Get Started Free
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
