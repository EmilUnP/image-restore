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
      "p-6 bg-card/60 backdrop-blur-xl border border-primary/30 shadow-xl shadow-primary/10 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20",
      className
    )}>
      {(title || description) && (
        <CardHeader className={cn("pb-3 border-b border-primary/20", headerClassName)}>
          {title && (
            <CardTitle className="text-lg font-semibold text-foreground">{title}</CardTitle>
          )}
          {description && (
            <CardDescription className="text-sm mt-1">{description}</CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent className={cn("pt-6", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
};

