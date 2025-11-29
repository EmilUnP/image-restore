import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Mail, Lock } from "lucide-react";
import { toast } from "sonner";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogin: (email: string, password: string) => Promise<void>;
  isLoading?: boolean;
}

export const LoginDialog = ({ 
  open, 
  onOpenChange, 
  onLogin,
  isLoading = false 
}: LoginDialogProps) => {
  const [email, setEmail] = useState("demo@visionai.com");
  const [password, setPassword] = useState("demo123");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onLogin(email, password);
      toast.success("Welcome to VisionAI!");
      // Dialog will be closed by parent component
    } catch (error) {
      toast.error("Login failed. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-slate-800/50 backdrop-blur-xl border-slate-700/70 shadow-2xl shadow-primary/20 rounded-2xl p-8">
        {/* Gradient glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 rounded-lg opacity-50 pointer-events-none" />
        
        <DialogHeader className="relative z-10">
          <div className="flex items-center justify-center mb-6">
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />
              {/* Icon container */}
              <div className="relative p-4 rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-accent shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>
          <DialogTitle className="text-3xl font-extrabold text-center bg-gradient-to-r from-slate-100 via-primary to-slate-100 bg-clip-text text-transparent mb-2">
            Welcome to VisionAI
          </DialogTitle>
          <DialogDescription className="text-center text-slate-300 text-base">
            Sign in to access all features and manage your projects
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 mt-6 relative z-10">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-200 font-medium">
              Email
            </Label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12 h-12 bg-slate-900/50 border-slate-700/70 text-slate-100 placeholder:text-slate-500 focus:border-primary/50 focus:ring-primary/20 focus:ring-2 transition-all duration-300"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-200 font-medium">
              Password
            </Label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-12 h-12 bg-slate-900/50 border-slate-700/70 text-slate-100 placeholder:text-slate-500 focus:border-primary/50 focus:ring-primary/20 focus:ring-2 transition-all duration-300"
                required
              />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 p-4 rounded-xl backdrop-blur-sm">
            <p className="text-xs text-slate-300 text-center leading-relaxed">
              <span className="font-semibold text-primary">Demo Mode:</span> Use any email and password to login
            </p>
          </div>
          
          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-primary via-primary to-accent hover:opacity-90 font-bold text-base shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:scale-[1.02] transition-all duration-300"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

