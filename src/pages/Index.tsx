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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <header className="text-center mb-8 md:mb-12 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1" />
            <div className="flex items-center justify-center gap-3 flex-1">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg transform transition-transform hover:scale-110 duration-300">
                <ImageIcon className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                AI Image Optimizer
              </h1>
            </div>
            <div className="flex-1 flex justify-end">
              <KeyboardShortcuts />
            </div>
          </div>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Enhance image quality or translate text in images with AI-powered technology. Perfect for photos, documents, and multilingual content.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-accent animate-pulse-slow" />
            <span>Powered by Gemini AI</span>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto">
          <div className="bg-card rounded-2xl shadow-strong p-6 md:p-8 border border-border space-y-6 transition-all duration-300 animate-scale-in">
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
        </main>
      </div>
    </div>
  );
};

export default Index;
