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
import { PLAN_LIMITS } from "@/lib/plans";

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
        <section className="relative pt-24 pb-20 md:pt-40 md:pb-32 overflow-hidden bg-white dark:bg-black">
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-black text-[10px] uppercase tracking-widest mb-8 border border-zinc-200 dark:border-zinc-800 animate-fade-in">
              <Zap className="h-3 w-3 fill-current text-blue-600" />
              <span>Universal Engine v2.0</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9] text-zinc-900 dark:text-white">
              The Engine of <br />
              <span className="text-blue-600">Universal Performance</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-zinc-500 dark:text-zinc-400 mb-12 leading-relaxed font-bold tracking-tight">
              NexPulse is the mission control for your digital infrastructure. 
              Monitor uptime, analyze performance, and synchronize global caches with precision.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="px-10 h-14">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="px-10 h-14">
                  Explore Platform
                </Button>
              </Link>
            </div>
          </div>

          {/* BACKGROUND DECOR - Enterprise Style */}
          <div className="absolute inset-0 -z-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent" />
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent" />
          </div>
        </section>

        {/* PRICING SECTION */}
        <section className="py-24 relative overflow-hidden bg-white dark:bg-black" id="pricing">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight uppercase">
                Enterprise Infrastructure
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto text-[10px] font-black uppercase tracking-[0.3em]">
                Universal monitoring for teams of all sizes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto items-stretch">
              {Object.entries(PLAN_LIMITS).map(([key, plan]) => (
                <Card 
                  key={key}
                  className={cn(
                    "relative p-8 flex flex-col h-full transition-all duration-300 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950",
                    key === 'PRO' && "border-blue-600 ring-2 ring-blue-600/20 dark:ring-blue-500/20 shadow-2xl shadow-blue-500/10 md:scale-105 z-10"
                  )}
                >
                  {key === 'PRO' && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[9px] font-black uppercase tracking-[0.2em] px-5 py-1.5 rounded-sm shadow-xl">
                      Production Standard
                    </div>
                  )}

                  <div className="mb-10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className={cn(
                        "h-12 w-12 rounded-md flex items-center justify-center border",
                        key === 'PRO' 
                          ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20" 
                          : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
                      )}>
                        {key === 'FREE' ? <Globe className="h-6 w-6" /> : key === 'PRO' ? <Zap className="h-6 w-6" /> : <Crown className="h-6 w-6" />}
                      </div>
                      <h3 className="text-2xl font-black uppercase tracking-tighter">{plan.name}</h3>
                    </div>
                    <p className="text-xs mb-8 min-h-[40px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-tight leading-relaxed">
                      {plan.description}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black tracking-tighter">{plan.price}</span>
                      <span className="text-xs font-black uppercase tracking-widest text-zinc-400">/mo</span>
                    </div>
                  </div>

                  <div className="space-y-8 flex-grow">
                    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 border-b border-zinc-100 dark:border-zinc-900 pb-2">
                      Capabilities Matrix
                    </div>
                    <ul className="space-y-4">
                      {plan.features.map((feature, i) => (
                        <li key={i} className={cn(
                          "flex items-center gap-4 text-xs transition-colors",
                          feature.active ? "text-zinc-900 dark:text-zinc-100 font-black" : "text-zinc-300 dark:text-zinc-700 font-bold"
                        )}>
                          <div className={cn(
                            "h-5 w-5 rounded-sm flex items-center justify-center shrink-0 border transition-all",
                            feature.active 
                              ? "bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white text-white dark:text-zinc-900" 
                              : "bg-transparent border-zinc-100 dark:border-zinc-800 text-zinc-200"
                          )}>
                            <Check className="h-3 w-3" />
                          </div>
                          <span className="uppercase tracking-tight">{feature.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link href="/register" className="mt-12 block w-full">
                    <Button 
                      className={cn(
                        "w-full h-14 font-black uppercase tracking-[0.2em] text-[10px]",
                        key === 'PRO' ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20" : ""
                      )}
                      variant={key === 'PRO' ? 'primary' : 'outline'}
                    >
                      {key === 'BUSINESS' ? 'Contact Engineering' : 'Initialize Plan'}
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-24 bg-white dark:bg-black">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md p-12 md:p-24 text-center relative overflow-hidden shadow-sm">
               <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-600/5 via-transparent to-transparent opacity-50" />
               
               <div className="relative z-10 max-w-3xl mx-auto">
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-blue-600 text-white font-black text-[9px] uppercase tracking-[0.3em] mb-8">
                   <Zap className="h-3 w-3 fill-current" />
                   <span>Ready for Deployment</span>
                 </div>
                 <h2 className="text-4xl md:text-7xl font-black mb-8 tracking-tighter leading-[0.85] uppercase text-zinc-900 dark:text-white">
                   The Engine of <br />
                   <span className="text-blue-600">Universal Control</span>
                 </h2>
                 <p className="text-zinc-500 dark:text-zinc-400 mb-12 text-sm md:text-lg font-bold tracking-tight leading-relaxed uppercase">
                   Join engineering teams worldwide using NexPulse to maintain absolute authority over global infrastructure.
                  </p>
                 <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                   <Link href="/register">
                     <Button size="lg" className="h-16 px-12 bg-zinc-900 text-white dark:bg-white dark:text-black font-black uppercase tracking-[0.2em] text-xs">
                       Get Started Now
                     </Button>
                   </Link>
                   <Link href="/login">
                     <Button variant="outline" size="lg" className="h-16 px-12 font-black uppercase tracking-[0.2em] text-xs border-zinc-200 dark:border-zinc-800">
                       Access Console
                     </Button>
                   </Link>
                 </div>
               </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-16 bg-white dark:bg-black">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 font-black text-xl tracking-tighter mb-6">
                <Activity className="h-6 w-6 text-blue-600" />
                <span>NexPulse</span>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed font-bold tracking-tight">
                The premier asset monitoring and performance platform designed for the modern web ecosystem. We provide mission-critical uptime tracking and intelligent action plans.
              </p>
            </div>
            
            <div>
              <h4 className="font-black text-xs uppercase tracking-[0.2em] text-zinc-900 dark:text-white mb-6">Platform</h4>
              <ul className="space-y-4 text-sm text-zinc-500 dark:text-zinc-400 font-bold">
                <li><Link href="/docs" className="hover:text-blue-600 transition-colors">Documentation</Link></li>
                <li><Link href="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link></li>
                <li><Link href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-black text-xs uppercase tracking-[0.2em] text-zinc-900 dark:text-white mb-6">Connect</h4>
              <ul className="space-y-4 text-sm text-zinc-500 dark:text-zinc-400 font-bold">
                <li><Link href="mailto:tabir8431@gmail.com" className="hover:text-blue-600 transition-colors">Technical Support</Link></li>
                <li><Link href="https://github.com/inkand-paper/Optimizer" className="hover:text-blue-600 transition-colors">GitHub</Link></li>
                <li><Link href="https://linkedin.com" className="hover:text-blue-600 transition-colors">LinkedIn</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-zinc-100 dark:border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-xs text-zinc-400 font-bold">
              © 2026 NexPulse Universal. All rights reserved. Built for the modern web.
            </p>
            <div className="flex gap-6">
              <Link href="mailto:tabir8431@gmail.com" aria-label="Email" className="text-zinc-400 hover:text-blue-500 transition-colors">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"></path></svg>
              </Link>
              <Link href="https://linkedin.com" aria-label="LinkedIn" className="text-zinc-400 hover:text-blue-700 transition-colors">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path></svg>
              </Link>
            </div>
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
