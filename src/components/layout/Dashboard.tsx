import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Sparkles, 
  Languages, 
  Zap, 
  Palette,
  ArrowRight,
  Image as ImageIcon,
  TrendingUp,
  Clock,
  CheckCircle2
} from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";

type AppFunction = 'enhance' | 'translate' | 'icons' | 'logos' | null;

interface DashboardProps {
  onFunctionSelect: (func: AppFunction) => void;
}

const functions = [
  {
    id: 'enhance' as AppFunction,
    name: 'Image Enhancement',
    description: 'Enhance image quality using AI. Improve sharpness, reduce noise, enhance colors.',
    icon: Sparkles,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    gradient: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    id: 'translate' as AppFunction,
    name: 'Text Translation',
    description: 'Translate text in images to any language while preserving the original design.',
    icon: Languages,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950',
    gradient: 'from-green-500/20 to-emerald-500/20',
  },
  {
    id: 'icons' as AppFunction,
    name: 'Icon Generator',
    description: 'Generate custom icons for your projects. Create multiple variants instantly.',
    icon: Zap,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950',
    gradient: 'from-purple-500/20 to-pink-500/20',
  },
  {
    id: 'logos' as AppFunction,
    name: 'Logo Generator',
    description: 'Create professional logos for your brand. Generate unique designs with AI.',
    icon: Palette,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950',
    gradient: 'from-orange-500/20 to-amber-500/20',
  },
];

const quickStats = [
  { label: 'Projects Created', value: '0', icon: ImageIcon, color: 'text-primary' },
  { label: 'Images Processed', value: '0', icon: TrendingUp, color: 'text-green-600' },
  { label: 'Time Saved', value: '0h', icon: Clock, color: 'text-blue-600' },
];

export const Dashboard = ({ onFunctionSelect }: DashboardProps) => {
  const { user } = useAuthContext();

  return (
    <div className="space-y-8 py-8">
      {/* Welcome Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
              Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! 👋
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Ready to transform your images with AI? Choose a tool to get started.
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card 
                key={index}
                className="border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-card/95 to-card/90"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-muted">
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* AI Tools Grid */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">AI Tools</h2>
          <p className="text-muted-foreground">
            Select a tool to start creating and transforming your images
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {functions.map((func) => {
            const Icon = func.icon;
            return (
              <Card
                key={func.id}
                className="group relative overflow-hidden cursor-pointer border border-border/50 hover:border-primary/30 bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                onClick={() => onFunctionSelect(func.id)}
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${func.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                </div>

                <CardHeader className="relative z-10 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-4 rounded-xl ${func.bgColor} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <Icon className={`h-6 w-6 ${func.color}`} />
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                  <CardTitle className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {func.name}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {func.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10 p-6 pt-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full group-hover:text-primary group-hover:bg-primary/10 font-medium rounded-lg transition-all duration-300"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Getting Started Section */}
      <Card className="border border-border/50 bg-gradient-to-br from-primary/5 via-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Getting Started
          </CardTitle>
          <CardDescription>
            New to VisionAI? Follow these steps to create your first project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { step: 1, title: 'Choose a Tool', desc: 'Select from Image Enhancement, Translation, Icon or Logo Generator' },
              { step: 2, title: 'Upload Your Image', desc: 'Add your image or provide a description for generation' },
              { step: 3, title: 'Configure Settings', desc: 'Adjust parameters and preferences for your project' },
              { step: 4, title: 'Process & Download', desc: 'Let AI work its magic and download your results' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4 p-4 rounded-xl bg-background/50 hover:bg-background/80 transition-colors">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-sm">
                  {item.step}
                </div>
                <div>
                  <h4 className="font-semibold mb-1">{item.title}</h4>
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

