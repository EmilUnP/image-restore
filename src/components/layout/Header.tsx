import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sparkles, Menu, X, Zap, User, LogOut } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/contexts/AuthContext";
import { LoginDialog } from "@/components/auth/LoginDialog";
import { Link, useNavigate, useLocation } from "react-router-dom";

interface HeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
  onProfileClick?: () => void;
  onLogoClick?: () => void;
  loginDialogOpen?: boolean;
  onLoginDialogOpenChange?: (open: boolean) => void;
}

export const Header = ({ 
  onMenuClick, 
  showMenuButton = false, 
  onProfileClick,
  onLogoClick,
  loginDialogOpen: externalLoginOpen,
  onLoginDialogOpenChange: setExternalLoginOpen
}: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [internalLoginOpen, setInternalLoginOpen] = useState(false);
  const { user, login, logout, isLoading } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use external state if provided, otherwise use internal state
  const loginOpen = externalLoginOpen !== undefined ? externalLoginOpen : internalLoginOpen;
  const setLoginOpen = setExternalLoginOpen || setInternalLoginOpen;

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onLogoClick) {
      // Use callback if provided (for viewMode-based navigation)
      onLogoClick();
    } else {
      // Fallback to router navigation
      if (location.pathname === '/') {
        // If already on landing page, scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Navigate to landing page
        navigate('/');
      }
    }
  };

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
    setLoginOpen(false);
  };

  const handleLogout = () => {
    logout();
  };

  const userInitials = user?.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "";

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-700/60 bg-slate-900/95 backdrop-blur-xl supports-[backdrop-filter]:bg-slate-900/90 shadow-lg shadow-black/20 transition-all duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-4">
              {showMenuButton && (
                  <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden h-10 w-10 rounded-xl text-slate-300 hover:text-slate-100 hover:bg-slate-800/50 transition-all duration-300 hover:scale-110"
                  onClick={() => {
                    setMobileMenuOpen(!mobileMenuOpen);
                    onMenuClick?.();
                  }}
                >
                  {mobileMenuOpen ? (
                    <X className="h-5 w-5 transition-transform duration-300 rotate-90" />
                  ) : (
                    <Menu className="h-5 w-5 transition-transform duration-300" />
                  )}
                </Button>
              )}
              <Link 
                to="/" 
                onClick={handleLogoClick}
                className="flex items-center gap-3 group cursor-pointer"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent rounded-xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity duration-300 animate-pulse-slow" />
                  <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-primary via-primary/90 to-accent shadow-lg shadow-primary/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <Sparkles className="h-5 w-5 text-primary-foreground transition-transform duration-300 group-hover:scale-110" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-extrabold bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent tracking-tight">
                    VisionAI
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 -mt-0.5 tracking-wider uppercase">
                    AI Image Studio
                  </span>
                </div>
              </Link>
            </div>

            {/* Navigation - Desktop */}
            {!user && (
              <nav className="hidden md:flex items-center gap-1">
                {[
                  { label: "Features", href: "#features", isHash: true },
                  { label: "How It Works", href: "#how-it-works", isHash: true },
                  { label: "Pricing", href: "/pricing", isHash: false },
                ].map((item) => {
                  const handleClick = (e: React.MouseEvent) => {
                    if (item.isHash) {
                      e.preventDefault();
                      // If we're on the landing page, just scroll to the section
                      if (location.pathname === '/') {
                        const element = document.querySelector(item.href);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      } else {
                        // If we're on a different page, navigate to landing page with hash
                        navigate(`/${item.href}`);
                      }
                    }
                  };

                  if (item.isHash) {
                    return (
                      <a
                        key={item.label}
                        href={item.href}
                        onClick={handleClick}
                        className="relative px-4 py-2 text-sm font-medium text-slate-300 transition-all duration-200 hover:text-slate-100 rounded-lg hover:bg-slate-800/50 group cursor-pointer"
                      >
                        {item.label}
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
                      </a>
                    );
                  }

                  return (
                    <Link
                      key={item.label}
                      to={item.href}
                      className="relative px-4 py-2 text-sm font-medium text-slate-300 transition-all duration-200 hover:text-slate-100 rounded-lg hover:bg-slate-800/50 group"
                    >
                      {item.label}
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
                    </Link>
                  );
                })}
              </nav>
            )}

            {/* CTA Button / User Menu */}
            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden sm:flex rounded-xl font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-800/50"
                    onClick={onProfileClick}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-10 w-10 cursor-pointer" onClick={onProfileClick}>
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-xl text-slate-300 hover:text-slate-100 hover:bg-slate-800/50"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  size="sm"
                  className="relative rounded-xl bg-gradient-to-r from-primary via-primary to-accent hover:opacity-90 font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 overflow-hidden group"
                  onClick={() => setLoginOpen(true)}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Login
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <LoginDialog
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onLogin={handleLogin}
        isLoading={isLoading}
      />
    </>
  );
};

