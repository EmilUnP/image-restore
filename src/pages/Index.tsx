import { useState, useEffect } from "react";
import { FunctionSelector } from "@/components/shared/FunctionSelector";
import { EnhancementWorkflow } from "@/components/enhancement/EnhancementWorkflow";
import { TranslationWorkflow } from "@/components/translation/TranslationWorkflow";
import { KeyboardShortcuts } from "@/components/shared/KeyboardShortcuts";
import { Sparkles, Image as ImageIcon } from "lucide-react";

type AppFunction = 'enhance' | 'translate' | null;

const Index = () => {
  const [selectedFunction, setSelectedFunction] = useState<AppFunction>(null);

  const handleFunctionSelect = (func: AppFunction) => {
    setSelectedFunction(func);
  };

  const handleBack = () => {
    setSelectedFunction(null);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to go back
      if (e.key === "Escape" && selectedFunction) {
        handleBack();
      }
      // Ctrl/Cmd + K to go to function selector
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (selectedFunction) {
          handleBack();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedFunction]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-accent/10 animate-gradient pointer-events-none" />
      
      {/* Decorative elements */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-float pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-float pointer-events-none" style={{ animationDelay: '1s' }} />
      
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
        {/* Header */}
        <header className="text-center mb-10 md:mb-16 space-y-5 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1 hidden md:block" />
            <div className="flex items-center justify-center gap-4 md:gap-6 flex-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-2xl blur-xl opacity-60 animate-pulse-slow" />
                <div className="relative p-4 md:p-5 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-glow transform transition-all duration-300 hover:scale-110 hover:shadow-glow-accent">
                  <ImageIcon className="w-7 h-7 md:w-8 md:h-8 text-primary-foreground" />
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold gradient-text tracking-tight">
                AI Image Optimizer
              </h1>
            </div>
            <div className="flex-1 flex justify-end hidden md:flex">
              <KeyboardShortcuts />
            </div>
          </div>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto text-balance leading-relaxed px-4">
            Enhance image quality or translate text in images with AI-powered technology. Perfect for photos, documents, and multilingual content.
          </p>
          <div className="flex items-center justify-center gap-2.5 text-sm md:text-base text-muted-foreground pt-2">
            <div className="relative">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-accent animate-pulse-slow relative z-10" />
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-primary absolute inset-0 opacity-50 animate-pulse-slow" style={{ animationDelay: '0.5s' }} />
            </div>
            <span className="font-medium">Powered by Gemini AI</span>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto">
          <div className="relative">
            {/* Glassmorphism card */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-3xl blur-2xl" />
            <div className="relative bg-card/90 backdrop-blur-xl rounded-3xl shadow-glow p-6 md:p-10 lg:p-12 border border-border/50 space-y-8 transition-all duration-500 animate-scale-in hover:shadow-glow-accent hover:border-border/70">
              {!selectedFunction ? (
                <div className="animate-fade-in">
                  <FunctionSelector onFunctionSelect={handleFunctionSelect} />
                </div>
              ) : selectedFunction === 'enhance' ? (
                <div className="animate-slide-in">
                  <EnhancementWorkflow onBack={handleBack} />
                </div>
              ) : (
                <div className="animate-slide-in">
                  <TranslationWorkflow onBack={handleBack} />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
