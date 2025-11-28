import { Button } from "@/components/ui/button";
import { Sparkles, Menu, X, Zap } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export const Header = ({ onMenuClick, showMenuButton = false }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4">
            {showMenuButton && (
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-10 w-10 rounded-xl"
                onClick={() => {
                  setMobileMenuOpen(!mobileMenuOpen);
                  onMenuClick?.();
                }}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            )}
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent rounded-xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-primary via-primary/90 to-accent shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
                  <Sparkles className="h-5 w-5 text-primary-foreground" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent tracking-tight">
                  SINAM AI
                </span>
                <span className="text-[10px] font-medium text-muted-foreground -mt-0.5 tracking-wider uppercase">
                  Image Optimizer
                </span>
              </div>
            </div>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: "Features", href: "#features" },
              { label: "How It Works", href: "#how-it-works" },
              { label: "Pricing", href: "#pricing" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="relative px-4 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-foreground rounded-lg hover:bg-muted/50 group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
              </a>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:flex rounded-xl font-medium"
            >
              Docs
            </Button>
            <Button
              size="sm"
              className="relative rounded-xl bg-gradient-to-r from-primary via-primary to-accent hover:opacity-90 font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 overflow-hidden group"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Get Started
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

