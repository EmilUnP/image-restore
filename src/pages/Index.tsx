import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { LandingPage } from "@/components/layout/LandingPage";
import { ProfilePage } from "@/components/profile/ProfilePage";
import { EnhancementWorkflow } from "@/components/enhancement/EnhancementWorkflow";
import { TranslationWorkflow } from "@/components/translation/TranslationWorkflow";
import { IconGenerationWorkflow } from "@/components/icons/IconGenerationWorkflow";
import { LogoGenerationWorkflow } from "@/components/logos/LogoGenerationWorkflow";
import { useAuthContext } from "@/contexts/AuthContext";

type AppFunction = 'enhance' | 'translate' | 'icons' | 'logos' | null;
type ViewMode = 'landing' | 'profile' | 'function';

const Index = () => {
  const [selectedFunction, setSelectedFunction] = useState<AppFunction>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('landing');
  const { isAuthenticated } = useAuthContext();

  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  const handleFunctionSelect = (func: AppFunction) => {
    if (!isAuthenticated) {
      // If not logged in, show login dialog
      setLoginDialogOpen(true);
      return;
    }
    setSelectedFunction(func);
    setViewMode('function');
  };

  const handleBack = () => {
    setSelectedFunction(null);
    setViewMode('landing');
  };

  const handleProfileClick = () => {
    setViewMode('profile');
    setSelectedFunction(null);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to go back
      if (e.key === "Escape") {
        if (selectedFunction) {
          handleBack();
        } else if (viewMode === 'profile') {
          setViewMode('landing');
        }
      }
      // Ctrl/Cmd + K to toggle sidebar (only when logged in)
      if ((e.ctrlKey || e.metaKey) && e.key === "k" && isAuthenticated) {
        e.preventDefault();
        setSidebarOpen(!sidebarOpen);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedFunction, sidebarOpen, viewMode, isAuthenticated]);

  // Close sidebar on mobile when function is selected
  useEffect(() => {
    if (selectedFunction) {
      setSidebarOpen(false);
    }
  }, [selectedFunction]);

  // Auto-open sidebar on desktop when logged in
  useEffect(() => {
    if (isAuthenticated && !selectedFunction && viewMode === 'landing') {
      setSidebarOpen(true);
    }
  }, [isAuthenticated, selectedFunction, viewMode]);

  // After successful login, close dialog
  useEffect(() => {
    if (isAuthenticated && loginDialogOpen) {
      setLoginDialogOpen(false);
    }
  }, [isAuthenticated, loginDialogOpen]);

  const showLandingPage = !isAuthenticated && !selectedFunction && viewMode !== 'profile';
  
  return (
    <div className={`min-h-screen flex flex-col ${showLandingPage ? 'bg-slate-950' : 'bg-gradient-to-br from-background via-background to-accent/5'}`}>
      {/* Background Effects - Only show when NOT on landing page */}
      {!showLandingPage && (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl" />
        </div>
      )}

      <Header 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        showMenuButton={isAuthenticated}
        onProfileClick={handleProfileClick}
        loginDialogOpen={loginDialogOpen}
        onLoginDialogOpenChange={setLoginDialogOpen}
      />
      
      <div className="flex flex-1 relative">
        {/* Sidebar - Only show when logged in */}
        {isAuthenticated && (
          <Sidebar
            selectedFunction={selectedFunction}
            onFunctionSelect={handleFunctionSelect}
            onClose={() => setSidebarOpen(false)}
            isOpen={sidebarOpen}
          />
        )}

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 relative ${isAuthenticated ? 'lg:ml-72' : ''} ${showLandingPage ? '' : 'z-10'}`}>
          {showLandingPage ? (
            <LandingPage onFunctionSelect={handleFunctionSelect} />
          ) : (
            <div className={`container mx-auto px-4 sm:px-6 lg:px-8 ${!selectedFunction && !isAuthenticated ? 'py-4 lg:py-6' : 'py-8 lg:py-12'}`}>
              {viewMode === 'profile' ? (
                <ProfilePage onBack={() => setViewMode('landing')} />
              ) : !selectedFunction ? null : selectedFunction === 'enhance' ? (
                <EnhancementWorkflow onBack={handleBack} />
              ) : selectedFunction === 'translate' ? (
                <TranslationWorkflow onBack={handleBack} />
              ) : selectedFunction === 'icons' ? (
                <IconGenerationWorkflow onBack={handleBack} />
              ) : (
                <LogoGenerationWorkflow onBack={handleBack} />
              )}
            </div>
          )}
        </main>
      </div>

      {!isAuthenticated && <Footer />}
    </div>
  );
};

export default Index;
