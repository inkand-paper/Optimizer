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
        {/* HERO SECTION - Engineering Studio Aesthetic */}
        <section className="relative pt-32 pb-24 md:pt-48 md:pb-40 overflow-hidden bg-background">
          <div className="absolute inset-0 engineering-grid opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-background to-transparent z-10" />
          
          <div className="container mx-auto px-4 text-center relative z-20">
            <div className="text-blue-600 text-[10px] font-black uppercase tracking-[0.4em] mb-10 animate-slide-up flex items-center justify-center gap-3">
               <div className="h-1 w-4 bg-blue-600 rounded-full" />
               Infrastructure Intelligence Engine v2.0
               <div className="h-1 w-4 bg-blue-600 rounded-full" />
            </div>
            
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter mb-10 leading-[0.85] text-zinc-900 dark:text-white uppercase animate-slide-up">
              Infrastructure <br />
              <span className="text-blue-600">Humanly</span> Interpreted
            </h1>
            
            <p className="max-w-3xl mx-auto text-xl md:text-2xl text-zinc-500 dark:text-zinc-400 mb-16 leading-relaxed font-bold tracking-tight uppercase animate-slide-up [animation-delay:200ms]">
              NexPulse is the mission control for modern engineering units. 
              Absolute authority over global uptime, performance, and cache synchronization.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-slide-up [animation-delay:400ms]">
              <Link href="/register">
                <Button size="lg" className="h-18 px-12 shadow-2xl">
                  Initialize Account <ArrowRight className="ml-3 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="h-18 px-12 dark:glass-edge">
                  Explore Console
                </Button>
              </Link>
            </div>
          </div>

          {/* BACKGROUND DECOR - Soft Diffusion */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none" />
        </section>

        {/* PRICING SECTION - Architectural Studio Style */}
        <section className="py-32 bg-white dark:bg-black relative" id="pricing">
          <div className="container mx-auto px-4">
            <div className="text-center mb-24">
               <div className="text-blue-600 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Pricing Protocol</div>
              <h2 className="text-4xl md:text-7xl font-black mb-6 tracking-tighter uppercase leading-none text-zinc-900 dark:text-white">
                Engineering Tiers
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed">
                Universal monitoring protocols for teams that demand absolute precision.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-7xl mx-auto items-stretch">
              {Object.entries(PLAN_LIMITS).map(([key, plan]) => (
                <Card 
                  key={key}
                  className={cn(
                    "p-10 flex flex-col h-full group",
                    key === 'PRO' && "border-blue-600 shadow-2xl shadow-blue-500/10 md:scale-105 z-10"
                  )}
                >
                  {key === 'PRO' && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[9px] font-black uppercase tracking-[0.3em] px-6 py-2 rounded-sm shadow-xl">
                      Standard Issue
                    </div>
                  )}

                  <div className="mb-12">
                    <div className="flex items-center gap-5 mb-8">
                      <div className={cn(
                        "h-14 w-14 rounded-md flex items-center justify-center border transition-all duration-500 tactile-button",
                        key === 'PRO' 
                          ? "bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-500/20" 
                          : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/5 text-zinc-900 dark:text-zinc-100 dark:glass-edge"
                      )}>
                        {key === 'FREE' ? <Globe className="h-7 w-7" /> : key === 'PRO' ? <Zap className="h-7 w-7" /> : <Crown className="h-7 w-7" />}
                      </div>
                      <h3 className="text-3xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white">{plan.name}</h3>
                    </div>
                    <p className="text-[10px] mb-10 min-h-[48px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest leading-relaxed">
                      {plan.description}
                    </p>
                    <div className="flex items-baseline gap-2 text-zinc-900 dark:text-white">
                      <span className="text-6xl font-black tracking-tighter">{plan.price}</span>
                      <span className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">/mo</span>
                    </div>
                  </div>

                  <div className="space-y-10 flex-grow">
                    <div className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-400 border-b border-zinc-100 dark:border-zinc-900/50 pb-3">
                      Capabilities Matrix
                    </div>
                    <ul className="space-y-5">
                      {plan.features.map((feature, i) => (
                        <li key={i} className={cn(
                          "flex items-center gap-5 text-[10px] transition-colors",
                          feature.active ? "text-zinc-900 dark:text-zinc-100 font-black uppercase tracking-widest" : "text-zinc-300 dark:text-zinc-700 font-bold uppercase tracking-widest"
                        )}>
                          <div className={cn(
                            "h-5 w-5 rounded-sm flex items-center justify-center shrink-0 border transition-all duration-500",
                            feature.active 
                              ? "bg-blue-600 border-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.3)]" 
                              : "bg-transparent border-zinc-100 dark:border-white/5 text-zinc-200"
                          )}>
                            <Check className="h-3 w-3" />
                          </div>
                          <span>{feature.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link href="/register" className="mt-14 block w-full">
                    <Button 
                      variant={key === 'PRO' ? 'primary' : 'outline'}
                      className="w-full h-16"
                    >
                      {key === 'BUSINESS' ? 'Contact Engineering' : 'Initialize Protocol'}
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA SECTION - Handcrafted Studio Identity */}
        <section className="py-32 bg-white dark:bg-black">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="bg-card border border-zinc-200/50 dark:border-white/5 rounded-md p-16 md:p-32 text-center relative overflow-hidden soft-diffusion dark:glass-edge">
               <div className="absolute inset-0 engineering-grid opacity-[0.02] dark:opacity-[0.04] pointer-events-none" />
               <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-600/[0.03] via-transparent to-transparent pointer-events-none" />
               
               <div className="relative z-10 max-w-4xl mx-auto">
                 <div className="text-blue-600 text-[10px] font-black uppercase tracking-[0.4em] mb-10 flex items-center justify-center gap-2">
                    <div className="h-1 w-4 bg-blue-600 rounded-full" />
                    Operational Readiness Protocol
                 </div>
                 <h2 className="text-5xl md:text-8xl font-black mb-12 tracking-tighter leading-[0.85] uppercase text-zinc-900 dark:text-white">
                   The Engine of <br />
                   <span className="text-blue-600">Universal Control</span>
                 </h2>
                 <p className="text-zinc-500 dark:text-zinc-400 mb-16 text-lg md:text-xl font-bold tracking-tight leading-relaxed uppercase max-w-2xl mx-auto">
                   Join world-class engineering units utilizing NexPulse to maintain absolute authority over the global web ecosystem.
                  </p>
                 <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                   <Link href="/register">
                     <Button size="lg" className="h-18 px-16 shadow-2xl">
                       Get Started Now
                     </Button>
                   </Link>
                   <Link href="/login">
                     <Button variant="outline" size="lg" className="h-18 px-16 dark:glass-edge">
                       Access Console
                     </Button>
                   </Link>
                 </div>
               </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-100 dark:border-zinc-900/50 py-24 bg-white dark:bg-black">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 font-black text-2xl tracking-tighter mb-8 text-zinc-900 dark:text-white uppercase">
                <Activity className="h-7 w-7 text-blue-600" />
                <span>NexPulse</span>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed font-bold tracking-tight uppercase">
                The premier infrastructure intelligence platform. Mission-critical uptime tracking and human-curated performance audits for the modern era.
              </p>
            </div>
            
            <div>
              <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-zinc-900 dark:text-white mb-8">Platform</h4>
              <ul className="space-y-5 text-[10px] text-zinc-500 dark:text-zinc-400 font-black uppercase tracking-widest">
                <li><Link href="/docs" className="hover:text-blue-600 transition-colors">Documentation</Link></li>
                <li><Link href="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link></li>
                <li><Link href="#pricing" className="hover:text-blue-600 transition-colors">Pricing Protocol</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-zinc-900 dark:text-white mb-8">Engineering</h4>
              <ul className="space-y-5 text-[10px] text-zinc-500 dark:text-zinc-400 font-black uppercase tracking-widest">
                <li><Link href="mailto:tabir8431@gmail.com" className="hover:text-blue-600 transition-colors">Technical Support</Link></li>
                <li><Link href="https://github.com/inkand-paper/Optimizer" className="hover:text-blue-600 transition-colors">Source Code</Link></li>
                <li><Link href="https://linkedin.com" className="hover:text-blue-600 transition-colors">LinkedIn</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-10 border-t border-zinc-100 dark:border-zinc-900/50 flex flex-col md:flex-row items-center justify-between gap-8">
            <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em]">
              © 2026 NexPulse Universal Intelligence. All rights reserved. Built for absolute precision.
            </p>
            <div className="flex gap-8">
              <Link href="mailto:tabir8431@gmail.com" aria-label="Email" className="text-zinc-400 hover:text-blue-600 transition-colors">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"></path></svg>
              </Link>
              <Link href="https://linkedin.com" aria-label="LinkedIn" className="text-zinc-400 hover:text-blue-600 transition-colors">
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
