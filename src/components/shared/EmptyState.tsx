import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  tips?: string[];
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  tips,
}: EmptyStateProps) => {
  return (
    <Card className="border-dashed">
      <CardContent className="p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-muted">
            <Icon className="w-12 h-12 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">{title}</h3>
            <p className="text-muted-foreground max-w-md mx-auto">{description}</p>
          </div>
          {tips && tips.length > 0 && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg text-left max-w-md w-full">
              <p className="text-sm font-medium mb-2">💡 Tips:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {action && (
            <Button onClick={action.onClick} className="mt-4">
              {action.label}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

