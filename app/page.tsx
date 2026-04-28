import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Button, Card } from "@/components/ui-elements";
import { 
  Zap, 
  Shield, 
  Smartphone, 
  Globe, 
  ArrowRight, 
  Database,
  BarChart3
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
              <span>Next.js 15+ Optimized</span>
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

        {/* FEATURES GRID */}
        <section className="py-24 bg-zinc-50 dark:bg-zinc-900/30 border-y">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Enterprise-Ready Infrastructure</h2>
              <p className="text-zinc-500 dark:text-zinc-400">Scalable, secure, and built for modern engineering teams.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-8 hover:shadow-lg transition-shadow border-none dark:bg-zinc-900/50">
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Military-Grade Security</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                  Advanced SHA-256 hashing and secure HttpOnly session architecture. 
                  Integrated SSRF protection keeps your internal network invisible to the world.
                </p>
              </Card>

              <Card className="p-8 hover:shadow-lg transition-shadow border-none dark:bg-zinc-900/50">
                <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-6">
                  <Smartphone className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Universal API & SDKs</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                  Built for the entire stack. Integrate real-time pulse triggers into Kotlin, 
                  Swift, Go, or Python with zero configuration overhead.
                </p>
              </Card>

              <Card className="p-8 hover:shadow-lg transition-shadow border-none dark:bg-zinc-900/50">
                <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-6">
                  <Database className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Distributed Reliability</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                  Powered by global Redis state for stateful rate-limiting and 
                  asynchronous monitoring tasks. Built to scale from 1 to 1M requests.
                </p>
              </Card>
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
          <div className="flex gap-8 text-sm text-zinc-500">
            <Link href="/docs" className="hover:text-blue-600 transition-colors">Documentation</Link>
            <Link href="mailto:tabir8431@gmail.com" className="hover:text-blue-600 transition-colors">Support</Link>
            <Link href="https://discord.gg/your-invite" className="hover:text-blue-600 transition-colors">Discord</Link>
            <Link href="https://github.com/inkand-paper/Optimizer" className="hover:text-blue-600 transition-colors">GitHub</Link>
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
