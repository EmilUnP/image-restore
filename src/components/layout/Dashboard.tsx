import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Image as ImageIcon,
  TrendingUp,
  Clock,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

interface DashboardProps {
  onFunctionSelect?: (func: any) => void;
}

const quickStats = [
  { label: 'Projects Created', value: '0', icon: ImageIcon, color: 'text-primary', bgColor: 'bg-primary/10' },
  { label: 'Images Processed', value: '0', icon: TrendingUp, color: 'text-green-400', bgColor: 'bg-green-500/10' },
  { label: 'Time Saved', value: '0h', icon: Clock, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
];

export const Dashboard = ({ onFunctionSelect }: DashboardProps) => {
  const { user } = useAuthContext();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="space-y-8 py-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur-xl opacity-50 animate-pulse-slow" />
                <div className="relative p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent animate-gradient">
                  Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! 👋
                </h1>
                <p className="text-lg text-muted-foreground mt-2">
                  Ready to transform your images with AI? Choose a tool to get started.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card 
                key={index}
                className="border border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-xl hover:shadow-primary/20 bg-gradient-to-br from-card/95 via-card/90 to-card/95 hover:-translate-y-1 group overflow-hidden relative"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-accent/0 group-hover:from-primary/5 group-hover:via-primary/5 group-hover:to-accent/5 transition-all duration-500" />
                
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        {stat.label}
                      </p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent group-hover:from-primary group-hover:to-accent transition-all duration-300">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`p-4 rounded-2xl ${stat.bgColor} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg group-hover:shadow-xl`}>
                      <Icon className={`h-6 w-6 ${stat.color} transition-all duration-300`} />
                    </div>
                  </div>
                  
                  {/* Progress bar animation */}
                  <div className="mt-4 h-1 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        width: isVisible ? '0%' : '0%',
                        animationDelay: `${index * 0.2}s`
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Getting Started Section */}
      <Card className="border border-border/50 bg-gradient-to-br from-primary/5 via-primary/5 to-accent/5 hover:shadow-xl hover:shadow-primary/10 transition-all duration-500 overflow-hidden relative group">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-accent/0 to-primary/0 group-hover:from-primary/10 group-hover:via-accent/10 group-hover:to-primary/10 transition-all duration-700" />
        
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/20 group-hover:bg-primary/30 transition-colors">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
            Getting Started
          </CardTitle>
          <CardDescription>
            New to VisionAI? Follow these steps to create your first project
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="space-y-4">
            {[
              { step: 1, title: 'Choose a Tool', desc: 'Select from Image Enhancement, Translation, Icon or Logo Generator', icon: '🎯' },
              { step: 2, title: 'Upload Your Image', desc: 'Add your image or provide a description for generation', icon: '📤' },
              { step: 3, title: 'Configure Settings', desc: 'Adjust parameters and preferences for your project', icon: '⚙️' },
              { step: 4, title: 'Process & Download', desc: 'Let AI work its magic and download your results', icon: '✨' },
            ].map((item, idx) => (
              <div 
                key={item.step} 
                className="flex items-start gap-4 p-5 rounded-xl bg-background/50 hover:bg-background/90 transition-all duration-300 hover:shadow-lg hover:-translate-x-1 group/item border border-transparent hover:border-primary/20"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="flex-shrink-0 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-full blur-md opacity-50 group-hover/item:opacity-100 transition-opacity duration-300" />
                  <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-sm shadow-lg group-hover/item:scale-110 group-hover/item:rotate-6 transition-all duration-300">
                    {item.step}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold group-hover/item:text-primary transition-colors">{item.title}</h4>
                    <span className="text-lg opacity-0 group-hover/item:opacity-100 transition-opacity duration-300">{item.icon}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

