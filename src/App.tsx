import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import { Admin } from "./pages/Admin";
import NotFound from "./pages/NotFound";
import { PricingPage } from "./components/layout/PricingPage";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <AuthProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route path="/" element={<Index />} />
          <Route 
            path="/pricing" 
            element={
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <PricingPage />
                  </div>
                </main>
                <Footer />
              </div>
            } 
          />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </TooltipProvider>
);

export default App;
