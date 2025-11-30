import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Sparkles, 
  Languages, 
  Zap, 
  Palette,
  Share2,
  Eraser,
  X,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

type AppFunction = 'enhance' | 'translate' | 'icons' | 'logos' | 'social' | 'remove' | null;

interface SidebarProps {
  selectedFunction: AppFunction;
  onFunctionSelect: (func: AppFunction) => void;
  onClose?: () => void;
  isOpen?: boolean;
  isMinimal?: boolean;
  onToggleMinimal?: () => void;
}

const functions = [
  {
    id: 'enhance' as AppFunction,
    name: 'Image Enhancement',
    description: 'Enhance image quality with AI',
    icon: Sparkles,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  {
    id: 'translate' as AppFunction,
    name: 'Text Translation',
    description: 'Translate text in images',
    icon: Languages,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
  },
  {
    id: 'icons' as AppFunction,
    name: 'Icon Generator',
    description: 'Generate custom icons',
    icon: Zap,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
  },
  {
    id: 'logos' as AppFunction,
    name: 'Logo Generator',
    description: 'Create professional logos',
    icon: Palette,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
  },
  {
    id: 'social' as AppFunction,
    name: 'Social Post Generator',
    description: 'Create stunning social posts',
    icon: Share2,
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
  },
  {
    id: 'remove' as AppFunction,
    name: 'Object Remover',
    description: 'Remove unwanted objects',
    icon: Eraser,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
  },
];

export const Sidebar = ({ 
  selectedFunction, 
  onFunctionSelect, 
  onClose,
  isOpen = true,
  isMinimal = false,
  onToggleMinimal
}: SidebarProps) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/60 transition-all duration-300 lg:translate-x-0 shadow-xl shadow-black/20",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isMinimal ? "w-20" : "w-72"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className={cn(
            "flex h-20 items-center border-b border-slate-700/60 transition-all duration-300",
            isMinimal ? "justify-center px-2" : "justify-between px-6"
          )}>
            {!isMinimal && (
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent rounded-xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-primary via-primary/90 to-accent shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
                    <ImageIcon className="h-5 w-5 text-primary-foreground" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-extrabold bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent tracking-tight">
                    VisionAI
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 -mt-0.5 tracking-wider uppercase">
                    AI Image Studio
                  </span>
                </div>
              </div>
            )}
            {isMinimal && (
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent rounded-xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-primary via-primary/90 to-accent shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
                  <ImageIcon className="h-5 w-5 text-primary-foreground" />
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              {onToggleMinimal && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden lg:flex rounded-xl text-slate-300 hover:text-slate-100 hover:bg-slate-800/50"
                  onClick={onToggleMinimal}
                  title={isMinimal ? "Expand sidebar" : "Minimize sidebar"}
                >
                  {isMinimal ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden rounded-xl text-slate-300 hover:text-slate-100 hover:bg-slate-800/50"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            <div className="mb-6">
              {!isMinimal && (
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">
                  AI Tools
                </h3>
              )}
              <div className={cn("space-y-2", isMinimal && "flex flex-col items-center")}>
                {functions.map((func) => {
                  const Icon = func.icon;
                  const isSelected = selectedFunction === func.id;
                  
                  return (
                    <button
                      key={func.id}
                      onClick={() => {
                        onFunctionSelect(func.id);
                        onClose?.();
                      }}
                      className={cn(
                        "w-full flex items-center rounded-xl text-sm font-medium transition-all duration-200 relative group",
                        "hover:scale-[1.02]",
                        isMinimal ? "justify-center px-3 py-3" : "gap-3 px-4 py-3.5",
                        isSelected
                          ? "bg-slate-800/50 text-primary border border-primary/30 shadow-lg shadow-primary/10"
                          : "text-slate-300 hover:text-slate-100 hover:bg-slate-800/50 border border-transparent"
                      )}
                      title={isMinimal ? func.name : undefined}
                    >
                      <div className={cn(
                        "rounded-xl transition-all duration-200",
                        isMinimal ? "p-2.5" : "p-2.5",
                        isSelected 
                          ? `${func.bgColor} shadow-md scale-110` 
                          : "bg-slate-800/30 group-hover:bg-slate-800/50"
                      )}>
                        <Icon className={cn(
                          "transition-all duration-200",
                          isMinimal ? "h-5 w-5" : "h-5 w-5",
                          isSelected ? func.color : "text-slate-400 group-hover:text-slate-300"
                        )} />
                      </div>
                      {!isMinimal && (
                        <div className="flex-1 text-left">
                          <div className="font-semibold text-slate-100">{func.name}</div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {func.description}
                          </div>
                        </div>
                      )}
                      {isSelected && !isMinimal && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      )}
                      {isSelected && isMinimal && (
                        <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            {!isMinimal && (
              <div className="mt-8 pt-6 border-t border-slate-700/60">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start rounded-xl text-slate-300 hover:text-slate-100 hover:bg-slate-800/50 transition-all duration-200"
                    size="sm"
                  >
                    <Sparkles className="h-4 w-4 mr-2 text-primary" />
                    Recent Projects
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start rounded-xl text-slate-300 hover:text-slate-100 hover:bg-slate-800/50 transition-all duration-200"
                    size="sm"
                  >
                    <Zap className="h-4 w-4 mr-2 text-accent" />
                    Templates
                  </Button>
                </div>
              </div>
            )}
          </nav>

          {/* Footer */}
          {!isMinimal && (
            <div className="border-t border-slate-700/60 p-4">
              <div className="rounded-xl bg-slate-800/50 backdrop-blur-sm p-4 text-center border border-slate-700/70 shadow-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                  <p className="text-xs font-bold text-primary">
                    Powered by Gemini AI
                  </p>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                    AI-Powered Technology
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};


