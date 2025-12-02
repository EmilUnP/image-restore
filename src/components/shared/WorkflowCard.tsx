import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface WorkflowCardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

export const WorkflowCard = ({
  title,
  description,
  children,
  className,
  headerClassName,
  contentClassName,
}: WorkflowCardProps) => {
  return (
    <Card className={cn(
      "p-4 bg-card/60 backdrop-blur-xl border border-primary/30 shadow-xl shadow-primary/10 rounded-xl transition-all duration-500 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 relative overflow-hidden group",
      className
    )}>
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-accent/0 group-hover:from-primary/5 group-hover:via-primary/5 group-hover:to-accent/5 transition-all duration-500 pointer-events-none" />
      
      {(title || description) && (
        <CardHeader className={cn("pb-2 border-b border-primary/20 px-0 pt-0 relative z-10", headerClassName)}>
          {title && (
            <CardTitle className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-300">{title}</CardTitle>
          )}
          {description && (
            <CardDescription className="text-xs mt-0.5">{description}</CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent className={cn("pt-3 px-0 relative z-10", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
};

