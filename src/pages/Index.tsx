import { useState } from "react";
import { FunctionSelector } from "@/components/shared/FunctionSelector";
import { EnhancementWorkflow } from "@/components/enhancement/EnhancementWorkflow";
import { TranslationWorkflow } from "@/components/translation/TranslationWorkflow";
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <header className="text-center mb-12 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent">
              <ImageIcon className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI Image Optimizer
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Enhance image quality or translate text in images with AI-powered technology. Perfect for photos, documents, and multilingual content.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-accent" />
            <span>Powered by Gemini AI</span>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto">
          <div className="bg-card rounded-2xl shadow-strong p-8 border border-border space-y-6">
            {!selectedFunction ? (
              <FunctionSelector onFunctionSelect={handleFunctionSelect} />
            ) : selectedFunction === 'enhance' ? (
              <EnhancementWorkflow onBack={handleBack} />
            ) : (
              <TranslationWorkflow onBack={handleBack} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
