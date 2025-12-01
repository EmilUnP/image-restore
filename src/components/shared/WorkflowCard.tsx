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
      "p-4 bg-card/60 backdrop-blur-xl border border-primary/30 shadow-xl shadow-primary/10 rounded-xl transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20",
      className
    )}>
      {(title || description) && (
        <CardHeader className={cn("pb-2 border-b border-primary/20 px-0 pt-0", headerClassName)}>
          {title && (
            <CardTitle className="text-sm font-semibold text-foreground">{title}</CardTitle>
          )}
          {description && (
            <CardDescription className="text-xs mt-0.5">{description}</CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent className={cn("pt-3 px-0", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
};

