import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Sparkles, Zap, ArrowRight, Crown, Rocket } from "lucide-react";
import { useState } from "react";

interface PricingTier {
  name: string;
  price: string;
  priceYearly: string;
  description: string;
  features: string[];
  popular?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  cta: string;
  color: string;
}

const pricingTiers: PricingTier[] = [
  {
    name: "Starter",
    price: "$9",
    priceYearly: "$7",
    description: "Perfect for individuals getting started with AI image tools",
    features: [
      "50 image enhancements per month",
      "25 translations per month",
      "10 icon generations per month",
      "5 logo generations per month",
      "Standard quality output",
      "Email support",
    ],
    icon: Sparkles,
    cta: "Get Started",
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "Professional",
    price: "$29",
    priceYearly: "$24",
    description: "For professionals and small teams who need more power",
    features: [
      "500 image enhancements per month",
      "250 translations per month",
      "100 icon generations per month",
      "50 logo generations per month",
      "High quality output",
      "Priority support",
      "Batch processing",
      "API access",
    ],
    popular: true,
    icon: Zap,
    cta: "Start Free Trial",
    color: "from-primary to-accent",
  },
  {
    name: "Enterprise",
    price: "$99",
    priceYearly: "$79",
    description: "For large teams and organizations with advanced needs",
    features: [
      "Unlimited image enhancements",
      "Unlimited translations",
      "Unlimited icon generations",
      "Unlimited logo generations",
      "Premium quality output",
      "24/7 dedicated support",
      "Advanced batch processing",
      "Custom API limits",
      "Team collaboration",
      "Custom integrations",
      "SLA guarantee",
    ],
    icon: Crown,
    cta: "Contact Sales",
    color: "from-purple-500 to-pink-500",
  },
];

export const PricingPage = () => {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="space-y-24 py-16 relative">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto relative">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight animate-slide-up">
          <span className="block">Simple, Transparent</span>
          <span className="block bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
            Pricing
          </span>
        </h1>
        <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light animate-fade-in" style={{ animationDelay: '0.1s' }}>
          Choose the perfect plan for your needs. All plans include our core AI-powered features.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 pt-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <span className={`text-sm font-medium transition-colors ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
            Monthly
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className="relative inline-flex h-8 w-14 items-center rounded-full bg-primary/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-gradient-to-r from-primary to-accent transition-transform ${
                isYearly ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm font-medium transition-colors ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
            Yearly
          </span>
          {isYearly && (
            <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-semibold">
              Save 20%
            </span>
          )}
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {pricingTiers.map((tier, index) => {
            const Icon = tier.icon;
            return (
              <Card
                key={tier.name}
                className={`group relative overflow-hidden transition-all duration-500 border-2 ${
                  tier.popular
                    ? 'border-primary/50 bg-gradient-to-br from-card via-card/95 to-card/90 shadow-2xl shadow-primary/20 scale-105 md:scale-105'
                    : 'border-border/50 bg-gradient-to-br from-card/95 to-card/90 hover:border-primary/30 hover:shadow-xl'
                } backdrop-blur-sm animate-scale-in`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Popular Badge */}
                {tier.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                    <div className="px-4 py-1 rounded-full bg-gradient-to-r from-primary to-accent text-white text-xs font-bold shadow-lg">
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${tier.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                <CardHeader className="relative z-10 p-6 lg:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${tier.color} bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`h-6 w-6 bg-gradient-to-br ${tier.color} bg-clip-text text-transparent`} />
                    </div>
                    <CardTitle className="text-2xl font-extrabold">{tier.name}</CardTitle>
                  </div>
                  
                  <CardDescription className="text-sm mb-6 min-h-[40px]">
                    {tier.description}
                  </CardDescription>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-extrabold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        {isYearly ? tier.priceYearly : tier.price}
                      </span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    {isYearly && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Billed annually (${isYearly ? parseInt(tier.priceYearly.replace('$', '')) * 12 : parseInt(tier.price.replace('$', '')) * 12}/year)
                      </p>
                    )}
                  </div>

                  <Button
                    className={`w-full relative overflow-hidden ${
                      tier.popular
                        ? 'bg-gradient-to-r from-primary via-primary to-accent hover:opacity-90 font-bold shadow-lg shadow-primary/30'
                        : 'bg-gradient-to-r from-primary/90 to-accent/90 hover:from-primary hover:to-accent font-semibold'
                    } transition-all duration-300 group/btn`}
                    size="lg"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {tier.cta}
                      <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                  </Button>
                </CardHeader>

                <CardContent className="relative z-10 p-6 lg:p-8 pt-0">
                  <div className="space-y-4">
                    <div className="text-sm font-semibold text-muted-foreground mb-4">Features included:</div>
                    {tier.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3 group/item">
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                            <Check className="h-3 w-3 text-primary" />
                          </div>
                        </div>
                        <span className="text-sm text-foreground group-hover/item:text-primary transition-colors">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative max-w-4xl mx-auto">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about our pricing
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              question: "Can I change plans later?",
              answer: "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.",
            },
            {
              question: "What payment methods do you accept?",
              answer: "We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.",
            },
            {
              question: "Is there a free trial?",
              answer: "Yes! Professional and Enterprise plans come with a 14-day free trial. No credit card required.",
            },
            {
              question: "Do you offer refunds?",
              answer: "We offer a 30-day money-back guarantee on all annual plans. Monthly plans can be cancelled anytime.",
            },
            {
              question: "What happens if I exceed my limits?",
              answer: "You'll be notified when you're approaching your limits. You can upgrade your plan or purchase additional credits.",
            },
            {
              question: "Is my data secure?",
              answer: "Absolutely. We use enterprise-grade encryption and never share your data with third parties. Your images are processed securely and deleted after 30 days.",
            },
          ].map((faq, idx) => (
            <Card
              key={idx}
              className="border border-border/50 bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-sm hover:border-primary/30 transition-all duration-300"
            >
              <CardHeader>
                <CardTitle className="text-lg font-bold">{faq.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {faq.answer}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative text-center space-y-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20 rounded-3xl blur-3xl" />
        <div className="relative bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10 backdrop-blur-xl rounded-3xl p-12 lg:p-16 border-2 border-primary/20 shadow-2xl">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
              Ready to Get Started?
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Join thousands of users transforming their images with VisionAI. Start your free trial today.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="relative rounded-2xl bg-gradient-to-r from-primary via-primary to-accent hover:opacity-90 font-bold text-lg px-10 py-7 shadow-2xl shadow-primary/40 hover:shadow-primary/50 transition-all duration-300 overflow-hidden group"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Start Free Trial
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-2xl border-2 border-primary/30 font-semibold text-lg px-10 py-7 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 backdrop-blur-sm"
              >
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

