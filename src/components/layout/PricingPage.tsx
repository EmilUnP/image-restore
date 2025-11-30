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
    <div className="min-h-screen bg-slate-950 space-y-24 py-16 relative">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-slate-950" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl" />
      </div>

      {/* Header Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto relative px-4 sm:px-6 lg:px-8">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight">
          <span className="block text-slate-100">Simple, Transparent</span>
          <span className="block bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
            Pricing
          </span>
        </h1>
        <p className="text-xl sm:text-2xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Choose the perfect plan for your needs. All plans include our core AI-powered features.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 pt-6">
          <span className={`text-sm font-medium transition-colors ${!isYearly ? 'text-slate-100' : 'text-slate-400'}`}>
            Monthly
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className="relative inline-flex h-8 w-14 items-center rounded-full bg-primary/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-gradient-to-r from-primary to-accent transition-transform ${
                isYearly ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm font-medium transition-colors ${isYearly ? 'text-slate-100' : 'text-slate-400'}`}>
            Yearly
          </span>
          {isYearly && (
            <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-semibold border border-green-500/20">
              Save 20%
            </span>
          )}
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 max-w-7xl mx-auto">
          {pricingTiers.map((tier, index) => {
            const Icon = tier.icon;
            return (
              <div
                key={tier.name}
                className={`group relative ${
                  tier.popular ? 'md:-mt-4 md:mb-4' : ''
                }`}
              >
                {/* Popular Badge */}
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30">
                    <div className="px-5 py-1.5 rounded-full bg-gradient-to-r from-primary via-accent to-primary text-white text-xs font-bold shadow-xl shadow-primary/50 backdrop-blur-md border border-primary/30 animate-pulse">
                      ⭐ Most Popular
                    </div>
                  </div>
                )}

                <Card
                  className={`relative overflow-hidden transition-all duration-500 border ${
                    tier.popular
                      ? 'border-primary/60 bg-slate-800/50 backdrop-blur-sm shadow-2xl shadow-primary/30 scale-105 md:scale-110'
                      : 'border-slate-700/70 bg-slate-800/50 backdrop-blur-sm hover:border-primary/60 hover:shadow-xl hover:shadow-primary/20 hover:scale-[1.02]'
                  }`}
                >
                  {/* Animated gradient border glow */}
                  <div className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                    tier.popular ? 'opacity-100' : ''
                  }`}>
                    <div className={`absolute inset-0 rounded-lg bg-gradient-to-br ${tier.color} blur-xl opacity-20`} />
                  </div>

                  {/* Inner gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${tier.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 ${
                    tier.popular ? 'opacity-[0.05]' : ''
                  }`} />

                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </div>

                  <CardHeader className="relative z-10 p-8 lg:p-10 pb-6">
                    {/* Icon and Title */}
                    <div className="flex flex-col gap-4 mb-6">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${tier.color} shadow-lg shadow-primary/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
                          {tier.name}
                        </CardTitle>
                        <CardDescription className="text-sm text-slate-300 leading-relaxed min-h-[48px]">
                          {tier.description}
                        </CardDescription>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-8 pb-8 border-b border-slate-700/70">
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className={`text-5xl font-black bg-gradient-to-br ${tier.color} bg-clip-text text-transparent`}>
                          {isYearly ? tier.priceYearly : tier.price}
                        </span>
                        <span className="text-lg text-slate-400 font-medium">/month</span>
                      </div>
                      {isYearly && (
                        <p className="text-xs text-slate-500 mt-2">
                          Billed annually (${isYearly ? parseInt(tier.priceYearly.replace('$', '')) * 12 : parseInt(tier.price.replace('$', '')) * 12}/year)
                        </p>
                      )}
                    </div>

                    {/* CTA Button */}
                    <Button
                      className={`w-full relative overflow-hidden h-12 rounded-xl font-bold text-base ${
                        tier.popular
                          ? 'bg-gradient-to-r from-primary via-accent to-primary hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.02]'
                          : 'bg-slate-800/50 hover:bg-primary/10 border border-slate-700/70 hover:border-primary/50 hover:text-primary'
                      } transition-all duration-300 group/btn`}
                      size="lg"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {tier.cta}
                        <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </span>
                      {tier.popular && (
                        <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                      )}
                    </Button>
                  </CardHeader>

                  <CardContent className="relative z-10 p-8 lg:p-10 pt-6">
                    <div className="space-y-3.5">
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-5">
                        What's Included
                      </div>
                      {tier.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3 group/item">
                          <div className="flex-shrink-0 mt-0.5">
                            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover/item:scale-110 group-hover/item:bg-opacity-30 transition-all duration-300">
                              <Check className="h-3.5 w-3.5 text-primary font-bold" />
                            </div>
                          </div>
                          <span className="text-sm text-slate-300 group-hover/item:text-primary transition-colors leading-relaxed">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-slate-100 via-primary to-slate-100 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-slate-300">
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
              className="border border-slate-700/70 bg-slate-800/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300"
            >
              <CardHeader>
                <CardTitle className="text-lg font-bold text-slate-100">{faq.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed text-slate-300">
                  {faq.answer}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative text-center space-y-8 px-4 sm:px-6 lg:px-8">
        <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-800/30 backdrop-blur-sm rounded-3xl p-12 lg:p-16 border border-primary/40 shadow-xl shadow-primary/30">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-slate-100 via-primary to-slate-100 bg-clip-text text-transparent">
              Ready to Get Started?
            </h2>
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
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
                className="rounded-2xl border-2 border-slate-700 font-semibold text-lg px-10 py-7 hover:bg-slate-800 hover:border-primary/50 transition-all duration-300 backdrop-blur-sm"
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

