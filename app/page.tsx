import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Button, Card } from "@/components/ui-elements";
import { cn } from "@/lib/utils";
import { 
  Zap, 
  Shield, 
  Smartphone, 
  Globe, 
  ArrowRight, 
  Database,
  BarChart3,
  Crown,
  Check
} from "lucide-react";

/**
 * [ENTRY-LEVEL DEFINITION] - Landing Page
 * Think of this as the "Front Door" and "Billboard" of your application. 
 * Its job is to explain what the product does in 5 seconds and get people to sign up.
 */
export default function Home() {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background transition-colors duration-500">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 font-medium text-xs mb-6 border border-blue-200 dark:border-blue-800 animate-fade-in">
              <Zap className="h-3 w-3 fill-current" />
              <span>Universal Engine v2.0</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500">
              The Universal Engine <br />
              for Web Performance
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-zinc-600 dark:text-zinc-400 mb-10 leading-relaxed">
              NexPulse is your mission control for the modern web. 
              Monitor uptime across distributed networks, analyze performance in real-time, 
              and synchronize global caches with enterprise-grade security.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="rounded-full px-8 shadow-blue-500/25 shadow-xl">
                  Get Started for Free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="rounded-full px-8">
                  Explore Features
                </Button>
              </Link>
            </div>
          </div>

          {/* BACKGROUND DECOR */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-0 opacity-20 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 filter blur-[128px] rounded-full animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500 filter blur-[128px] rounded-full delay-700 animate-pulse" />
          </div>
        </section>

        {/* PRICING SECTION */}
        <section className="py-24 relative overflow-hidden" id="pricing">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
                Outcome-Driven Pricing
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
                Select the plan that matches your growth. From personal projects to global agencies.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto items-stretch">
              {[
                {
                  id: "FREE",
                  name: "Starter",
                  price: "$0",
                  description: "Perfect for testing personal projects and side assets.",
                  icon: Globe,
                  color: "zinc",
                  popular: false,
                  features: [
                    { text: "1 Production Site", active: true },
                    { text: "500 Checks / mo", active: true },
                    { text: "50 Global Purges / mo", active: true },
                    { text: "Performance Diagnosis", active: false },
                    { text: "White-label Portals", active: false },
                  ]
                },
                {
                  id: "PRO",
                  name: "Professional",
                  price: "$29",
                  description: "High-performance tools for production-grade apps.",
                  icon: Zap,
                  color: "blue",
                  popular: true,
                  features: [
                    { text: "10 Universal Assets", active: true },
                    { text: "25,000 Checks / mo", active: true },
                    { text: "2,500 Purges / mo", active: true },
                    { text: "Performance Diagnosis", active: true },
                    { text: "White-label Portals", active: false },
                  ]
                },
                {
                  id: "BUSINESS",
                  name: "Agency",
                  price: "$129",
                  description: "Scale your agency with 1-click white-label control.",
                  icon: Crown,
                  color: "purple",
                  popular: false,
                  features: [
                    { text: "Unlimited Assets", active: true },
                    { text: "Unlimited Checks / mo", active: true },
                    { text: "Unlimited Purges / mo", active: true },
                    { text: "White-label Portals", active: true },
                    { text: "1-Click Reporting", active: true },
                  ]
                }
              ].map((plan) => (
                <div 
                  key={plan.id}
                  className={cn(
                    "relative group p-8 md:p-10 rounded-[40px] border transition-all duration-500 hover:scale-[1.02] flex flex-col",
                    plan.popular 
                      ? "bg-blue-600 border-blue-500 shadow-2xl shadow-blue-600/20 z-20 scale-105" 
                      : "bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                  )}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-blue-600 text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-full shadow-lg">
                      Most Popular
                    </div>
                  )}
    
                  <div className="flex flex-col h-full">
                    <div className="mb-8">
                      <div className={cn(
                        "h-14 w-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm",
                        plan.popular ? "bg-white/20 text-white" : 
                        plan.id === 'BUSINESS' ? "bg-purple-500/10 text-purple-600" :
                        "bg-blue-600/10 text-blue-600"
                      )}>
                        <plan.icon className="h-7 w-7" />
                      </div>
                      <h3 className={cn("text-2xl font-black mb-2", plan.popular ? "text-white" : "text-zinc-900 dark:text-white")}>
                        {plan.name}
                      </h3>
                      <p className={cn("text-sm mb-6 leading-relaxed", plan.popular ? "text-white/70" : "text-zinc-500")}>
                        {plan.description}
                      </p>
                      <div className="flex items-baseline gap-1">
                        <span className={cn("text-5xl font-black", plan.popular ? "text-white" : "text-zinc-900 dark:text-white")}>
                          {plan.price}
                        </span>
                        <span className={cn("text-sm font-medium", plan.popular ? "text-white/60" : "text-zinc-400")}>
                          /month
                        </span>
                      </div>
                    </div>
    
                    <div className="space-y-6 flex-1">
                       <div className={cn("text-[10px] font-black uppercase tracking-[0.2em]", plan.popular ? "text-white/60" : "text-zinc-400")}>
                          Plan Capabilities
                       </div>
                       <ul className="space-y-4">
                          {plan.features.map((feature, i) => (
                            <li key={i} className={cn("flex items-center gap-3 text-sm", feature.active ? (plan.popular ? "text-white" : "text-zinc-700 dark:text-zinc-300 font-medium") : "text-zinc-400 opacity-40")}>
                               <div className={cn("h-5 w-5 rounded-full flex items-center justify-center shrink-0", plan.popular ? "bg-white/20" : "bg-blue-600/10")}>
                                  <Check className={cn("h-3 w-3", plan.popular ? "text-white" : "text-blue-600")} />
                               </div>
                               <span className="flex-1">{feature.text}</span>
                            </li>
                          ))}
                       </ul>
                    </div>
    
                    <Link href="/signup" className="mt-10 block w-full">
                      <Button 
                        className={cn(
                          "w-full h-14 rounded-2xl font-bold transition-all active:scale-95 text-base",
                          plan.popular 
                            ? "bg-white text-blue-600 hover:bg-zinc-50 shadow-xl" 
                            : "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90"
                        )}
                      >
                        {plan.id === 'BUSINESS' ? 'Contact Sales' : 'Get Started'}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-24">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="bg-blue-600 rounded-3xl p-8 md:p-16 text-center text-white shadow-2xl shadow-blue-500/20 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 -mr-32 -mt-32 rounded-full" />
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 -ml-32 -mb-32 rounded-full" />
               
               <h2 className="text-3xl md:text-5xl font-bold mb-6 relative z-10">
                 Ready to optimize your workflow?
               </h2>
               <p className="text-blue-100 mb-10 text-lg relative z-10">
                 Join developers using NexPulse to manage and monitor any web property.
                </p>
               <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                 <Link href="/register">
                   <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 border-none px-8">
                     Start for Free
                   </Button>
                 </Link>
                 <Link href="/login">
                   <Button variant="ghost" size="lg" className="text-white hover:bg-white/10 px-8">
                     Sign In
                   </Button>
                 </Link>
               </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-zinc-50/50 dark:bg-zinc-950">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Activity className="h-5 w-5 text-blue-600" />
            <span>NexPulse</span>
          </div>
          <p className="text-sm text-zinc-500">
            © 2026 NexPulse. Universal Web Insights.
          </p>
          <div className="flex gap-8 text-sm text-zinc-500 flex-wrap justify-center">
            <Link href="/docs" className="hover:text-blue-600 transition-colors">Platform Documentation</Link>
            <Link href="mailto:tabir8431@gmail.com" className="hover:text-blue-600 transition-colors">Technical Support</Link>
            <Link href="https://github.com/inkand-paper/Optimizer" className="hover:text-blue-600 transition-colors">GitHub Repository</Link>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col items-center gap-6">
          <p className="text-xs text-zinc-400 text-center max-w-2xl">
            NexPulse Universal is the premier asset monitoring and performance platform designed for the modern web ecosystem. We provide mission-critical uptime tracking, intelligent cache revalidation, and automated SEO authority tools that work across any framework. By centralizing your digital infrastructure, NexPulse ensures unwavering reliability and peak performance for engineering teams and agencies worldwide.
          </p>
          <div className="flex justify-center gap-6">
            <Link href="mailto:tabir8431@gmail.com" aria-label="Email" className="text-zinc-400 hover:text-blue-500 transition-colors">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"></path></svg>
            </Link>
            <Link href="https://linkedin.com/company/nextjsoptimizer" aria-label="LinkedIn" className="text-zinc-400 hover:text-blue-700 transition-colors">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path></svg>
            </Link>
            <Link href="https://discord.gg/your-invite" aria-label="Discord" className="text-zinc-400 hover:text-indigo-500 transition-colors">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"></path></svg>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Activity(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
