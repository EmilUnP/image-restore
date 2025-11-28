import { Sparkles, Github, Twitter, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Footer = () => {
  return (
    <footer className="relative border-t border-border/40 bg-gradient-to-b from-background via-background to-background/95 backdrop-blur-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-xl blur-md opacity-50" />
                <div className="relative p-2 rounded-xl bg-gradient-to-br from-primary via-primary/90 to-accent shadow-lg shadow-primary/20">
                  <Sparkles className="h-5 w-5 text-primary-foreground" />
                </div>
              </div>
              <div>
                <span className="font-extrabold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  VisionAI
                </span>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">AI Image Studio</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Professional AI-powered image optimization, translation, and generation tools. Transform your creative workflow with cutting-edge technology.
            </p>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                <Github className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-accent/10 hover:text-accent transition-all">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                <Mail className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-bold text-lg mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Product
            </h3>
            <ul className="space-y-3 text-sm">
              {['Features', 'Pricing', 'Integrations', 'API'].map((item) => (
                <li key={item}>
                  <a 
                    href={`#${item.toLowerCase()}`} 
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium hover:translate-x-1 inline-block transition-transform"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-bold text-lg mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Resources
            </h3>
            <ul className="space-y-3 text-sm">
              {['Documentation', 'Guides', 'Blog', 'Support'].map((item) => (
                <li key={item}>
                  <a 
                    href={`#${item.toLowerCase()}`} 
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium hover:translate-x-1 inline-block transition-transform"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold text-lg mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Company
            </h3>
            <ul className="space-y-3 text-sm">
              {['About', 'Careers', 'Privacy', 'Terms'].map((item) => (
                <li key={item}>
                  <a 
                    href={`#${item.toLowerCase()}`} 
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium hover:translate-x-1 inline-block transition-transform"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border/40 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground font-medium">
            © {new Date().getFullYear()} VisionAI. All rights reserved.
          </p>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold">
            <Sparkles className="h-4 w-4 animate-pulse" />
            <span>Powered by Gemini AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
};


