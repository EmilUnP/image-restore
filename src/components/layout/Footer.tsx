import { Sparkles, Github, Twitter, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="relative border-t border-slate-700/60 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 backdrop-blur-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-6 relative z-30">
            <div className="flex items-center gap-3">
              <div className="relative z-30">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-xl blur-md opacity-50" />
                <div className="relative p-2 rounded-xl bg-gradient-to-br from-primary via-primary/90 to-accent shadow-lg shadow-primary/20">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="relative z-30">
                <span className="font-extrabold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent block">
                  VisionAI
                </span>
                <p className="text-[10px] text-slate-300 uppercase tracking-wider">AI Image Studio</p>
              </div>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed relative z-30">
              Professional AI-powered image optimization, translation, and generation tools. Transform your creative workflow with cutting-edge technology.
            </p>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/20 hover:text-primary transition-all text-slate-400 hover:text-primary">
                <Github className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-accent/20 hover:text-accent transition-all text-slate-400 hover:text-accent">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/20 hover:text-primary transition-all text-slate-400 hover:text-primary">
                <Mail className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Product */}
          <div className="relative z-30">
            <h3 className="font-bold text-lg mb-6 text-slate-100">
              Product
            </h3>
            <ul className="space-y-3 text-sm">
              {['Features', 'Pricing', 'Integrations', 'API'].map((item) => (
                <li key={item}>
                  {item === 'Pricing' ? (
                    <Link 
                      to="/pricing"
                      className="text-slate-300 hover:text-primary transition-colors duration-200 font-medium hover:translate-x-1 inline-block transition-transform"
                    >
                      {item}
                    </Link>
                  ) : (
                    <a 
                      href={`#${item.toLowerCase()}`} 
                      className="text-slate-300 hover:text-primary transition-colors duration-200 font-medium hover:translate-x-1 inline-block transition-transform"
                    >
                      {item}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="relative z-30">
            <h3 className="font-bold text-lg mb-6 text-slate-100">
              Resources
            </h3>
            <ul className="space-y-3 text-sm">
              {['Documentation', 'Guides', 'Blog', 'Support'].map((item) => (
                <li key={item}>
                  <a 
                    href={`#${item.toLowerCase()}`} 
                    className="text-slate-300 hover:text-primary transition-colors duration-200 font-medium hover:translate-x-1 inline-block transition-transform"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="relative z-30">
            <h3 className="font-bold text-lg mb-6 text-slate-100">
              Company
            </h3>
            <ul className="space-y-3 text-sm">
              {['About', 'Careers', 'Privacy', 'Terms'].map((item) => (
                <li key={item}>
                  <a 
                    href={`#${item.toLowerCase()}`} 
                    className="text-slate-300 hover:text-primary transition-colors duration-200 font-medium hover:translate-x-1 inline-block transition-transform"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-700/60 flex flex-col sm:flex-row justify-between items-center gap-4 relative z-30">
          <p className="text-sm text-slate-300 font-medium">
            © {new Date().getFullYear()} VisionAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};


