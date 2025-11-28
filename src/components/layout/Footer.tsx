import { Sparkles, Github, Twitter, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="relative z-[300] border-t border-slate-700/60 bg-slate-900" style={{ isolation: 'isolate' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 relative">
          {/* Brand Section */}
          <div className="space-y-4 relative">
            <div className="flex items-center gap-3 relative">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary via-primary/90 to-accent shadow-lg relative z-10">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div className="relative z-10">
                <span className="font-extrabold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent block">
                  VisionAI
                </span>
                <p className="text-xs text-slate-300 uppercase tracking-wider">AI Image Studio</p>
              </div>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed relative z-10">
              Professional AI-powered image optimization, translation, and generation tools.
            </p>
            <div className="flex items-center gap-2 relative z-10">
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-slate-200 hover:text-primary hover:bg-primary/10">
                <Github className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-slate-200 hover:text-accent hover:bg-accent/10">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-slate-200 hover:text-primary hover:bg-primary/10">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Product Links */}
          <div className="relative z-10">
            <h3 className="font-bold text-base mb-4 text-white">
              Product
            </h3>
            <ul className="space-y-2.5 text-sm">
              {['Features', 'Pricing', 'Integrations', 'API'].map((item) => (
                <li key={item}>
                  {item === 'Pricing' ? (
                    <Link 
                      to="/pricing"
                      className="text-slate-200 hover:text-primary transition-colors duration-200"
                    >
                      {item}
                    </Link>
                  ) : (
                    <a 
                      href={`#${item.toLowerCase()}`} 
                      className="text-slate-200 hover:text-primary transition-colors duration-200"
                    >
                      {item}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div className="relative z-10">
            <h3 className="font-bold text-base mb-4 text-white">
              Resources
            </h3>
            <ul className="space-y-2.5 text-sm">
              {['Documentation', 'Guides', 'Blog', 'Support'].map((item) => (
                <li key={item}>
                  <a 
                    href={`#${item.toLowerCase()}`} 
                    className="text-slate-200 hover:text-primary transition-colors duration-200"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="relative z-10">
            <h3 className="font-bold text-base mb-4 text-white">
              Company
            </h3>
            <ul className="space-y-2.5 text-sm">
              {['About', 'Careers', 'Privacy', 'Terms'].map((item) => (
                <li key={item}>
                  <a 
                    href={`#${item.toLowerCase()}`} 
                    className="text-slate-200 hover:text-primary transition-colors duration-200"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-slate-700/60 relative z-10">
          <p className="text-sm text-slate-300 text-center">
            © {new Date().getFullYear()} VisionAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
