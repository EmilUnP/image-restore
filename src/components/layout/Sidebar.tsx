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
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                AI Tools
              </h3>
              <div className="space-y-1">
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
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                        "hover:bg-muted/50",
                        isSelected
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <div className={cn(
                        "p-2 rounded-lg",
                        isSelected ? func.bgColor : "bg-muted"
                      )}>
                        <Icon className={cn(
                          "h-4 w-4",
                          isSelected ? func.color : "text-muted-foreground"
                        )} />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{func.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {func.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Quick Actions
              </h3>
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  size="sm"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Recent Projects
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  size="sm"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Templates
                </Button>
              </div>
            </div>
          </nav>

          {/* Footer */}
          <div className="border-t p-4">
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-xs text-muted-foreground mb-2">
                Powered by Gemini AI
              </p>
              <div className="flex items-center justify-center gap-1">
                <Sparkles className="h-3 w-3 text-primary" />
                <span className="text-xs font-medium">AI-Powered</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};


