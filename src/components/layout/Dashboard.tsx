import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Image as ImageIcon,
  TrendingUp,
  Clock,
  CheckCircle2
} from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";

interface DashboardProps {
  onFunctionSelect?: (func: any) => void;
}

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

