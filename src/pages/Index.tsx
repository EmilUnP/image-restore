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
      
      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <header className="text-center mb-8 md:mb-12 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1" />
            <div className="flex items-center justify-center gap-4 flex-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-xl blur-lg opacity-50 animate-pulse-slow" />
                <div className="relative p-4 rounded-xl bg-gradient-to-br from-primary to-accent shadow-glow transform transition-transform hover:scale-110 duration-300 hover:shadow-glow-accent">
                  <ImageIcon className="w-8 h-8 text-primary-foreground" />
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold gradient-text">
                AI Image Optimizer
              </h1>
            </div>
            <div className="flex-1 flex justify-end">
              <KeyboardShortcuts />
            </div>
          </div>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed">
            Enhance image quality or translate text in images with AI-powered technology. Perfect for photos, documents, and multilingual content.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="relative">
              <Sparkles className="w-4 h-4 text-accent animate-pulse-slow relative z-10" />
              <Sparkles className="w-4 h-4 text-primary absolute inset-0 opacity-50 animate-pulse-slow" style={{ animationDelay: '0.5s' }} />
            </div>
            <span className="font-medium">Powered by Gemini AI</span>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto">
          <div className="relative">
            {/* Glassmorphism card */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-3xl blur-xl" />
            <div className="relative bg-card/80 backdrop-blur-xl rounded-3xl shadow-glow p-6 md:p-8 border border-border/50 space-y-6 transition-all duration-300 animate-scale-in hover:shadow-glow-accent">
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
