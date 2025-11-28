import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Sparkles, 
  Languages, 
  Zap, 
  Palette,
  X,
  Image as ImageIcon
} from "lucide-react";

type AppFunction = 'enhance' | 'translate' | 'icons' | 'logos' | null;

interface SidebarProps {
  selectedFunction: AppFunction;
  onFunctionSelect: (func: AppFunction) => void;
  onClose?: () => void;
  isOpen?: boolean;
}

const functions = [
  {
    id: 'enhance' as AppFunction,
    name: 'Image Enhancement',
    description: 'Enhance image quality with AI',
    icon: Sparkles,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
  },
  {
    id: 'translate' as AppFunction,
    name: 'Text Translation',
    description: 'Translate text in images',
    icon: Languages,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950',
  },
  {
    id: 'icons' as AppFunction,
    name: 'Icon Generator',
    description: 'Generate custom icons',
    icon: Zap,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950',
  },
  {
    id: 'logos' as AppFunction,
    name: 'Logo Generator',
    description: 'Create professional logos',
    icon: Palette,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950',
  },
];

export const Sidebar = ({ 
  selectedFunction, 
  onFunctionSelect, 
  onClose,
  isOpen = true 
}: SidebarProps) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-72 bg-gradient-to-b from-background via-background to-background/95 border-r border-border/40 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 shadow-xl",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-20 items-center justify-between border-b border-border/40 px-6 bg-gradient-to-r from-primary/5 via-transparent to-accent/5">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-xl blur-md opacity-40" />
                <div className="relative p-2 rounded-xl bg-gradient-to-br from-primary via-primary/90 to-accent shadow-lg shadow-primary/20">
                  <ImageIcon className="h-5 w-5 text-primary-foreground" />
                </div>
              </div>
              <div>
                <span className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Tools
                </span>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">AI Functions</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-xl"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            <div className="mb-6">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 px-2">
                AI Tools
              </h3>
              <div className="space-y-2">
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
                        "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 relative group",
                        "hover:scale-[1.02]",
                        isSelected
                          ? "bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 text-primary border-2 border-primary/30 shadow-lg shadow-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60 border-2 border-transparent"
                      )}
                    >
                      <div className={cn(
                        "p-2.5 rounded-xl transition-all duration-200",
                        isSelected 
                          ? `${func.bgColor} shadow-md scale-110` 
                          : "bg-muted group-hover:bg-muted/80"
                      )}>
                        <Icon className={cn(
                          "h-5 w-5 transition-all duration-200",
                          isSelected ? func.color : "text-muted-foreground group-hover:text-foreground"
                        )} />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold">{func.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {func.description}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 pt-6 border-t border-border/40">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 px-2">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start rounded-xl hover:bg-muted/60 transition-all duration-200"
                  size="sm"
                >
                  <Sparkles className="h-4 w-4 mr-2 text-primary" />
                  Recent Projects
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start rounded-xl hover:bg-muted/60 transition-all duration-200"
                  size="sm"
                >
                  <Zap className="h-4 w-4 mr-2 text-accent" />
                  Templates
                </Button>
              </div>
            </div>
          </nav>

          {/* Footer */}
          <div className="border-t border-border/40 p-4 bg-gradient-to-r from-primary/5 via-transparent to-accent/5">
            <div className="rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 p-4 text-center border border-primary/20 shadow-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                <p className="text-xs font-bold text-primary">
                  Powered by Gemini AI
                </p>
              </div>
              <div className="flex items-center justify-center gap-1">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  AI-Powered Technology
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};


