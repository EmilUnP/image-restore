import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { LandingPage } from "@/components/layout/LandingPage";
import { EnhancementWorkflow } from "@/components/enhancement/EnhancementWorkflow";
import { TranslationWorkflow } from "@/components/translation/TranslationWorkflow";
import { IconGenerationWorkflow } from "@/components/icons/IconGenerationWorkflow";
import { LogoGenerationWorkflow } from "@/components/logos/LogoGenerationWorkflow";

type AppFunction = 'enhance' | 'translate' | 'icons' | 'logos' | null;

const Index = () => {
  const [selectedFunction, setSelectedFunction] = useState<AppFunction>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      // Ctrl/Cmd + K to toggle sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSidebarOpen(!sidebarOpen);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedFunction, sidebarOpen]);

  // Close sidebar on mobile when function is selected
  useEffect(() => {
    if (selectedFunction) {
      setSidebarOpen(false);
    }
  }, [selectedFunction]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        showMenuButton={true}
      />
      
      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <Sidebar
          selectedFunction={selectedFunction}
          onFunctionSelect={handleFunctionSelect}
          onClose={() => setSidebarOpen(false)}
          isOpen={sidebarOpen}
        />

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 transition-all duration-300">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {!selectedFunction ? (
              <LandingPage onFunctionSelect={handleFunctionSelect} />
            ) : selectedFunction === 'enhance' ? (
              <EnhancementWorkflow onBack={handleBack} />
            ) : selectedFunction === 'translate' ? (
              <TranslationWorkflow onBack={handleBack} />
            ) : selectedFunction === 'icons' ? (
              <IconGenerationWorkflow onBack={handleBack} />
            ) : (
              <LogoGenerationWorkflow onBack={handleBack} />
            )}
          </div>
        </main>
      </div>

      {!selectedFunction && <Footer />}
    </div>
  );
};

export default Index;
