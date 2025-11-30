import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  iconColor?: string;
  iconBgColor?: string;
  backButton?: ReactNode;
}

export const WorkflowHeader = ({
  icon: Icon,
  title,
  description,
  iconColor = "text-primary",
  iconBgColor = "bg-primary/20",
  backButton,
}: WorkflowHeaderProps) => {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div className="flex items-center gap-4 flex-1">
        <div className={cn(
          "p-3 rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10 border border-primary/20 backdrop-blur-sm shadow-lg shadow-primary/10",
          iconBgColor
        )}>
          <Icon className={cn("w-6 h-6", iconColor)} />
        </div>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
      {backButton && (
        <div className="flex-shrink-0">
          {backButton}
        </div>
      )}
    </div>
  );
};

