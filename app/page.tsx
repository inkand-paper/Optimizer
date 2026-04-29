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
          <div className="flex gap-8 text-sm text-zinc-500 flex-wrap justify-center">
            <Link href="/docs" className="hover:text-blue-600 transition-colors">Documentation</Link>
            <Link href="mailto:tabir8431@gmail.com" className="hover:text-blue-600 transition-colors">Support</Link>
            <Link href="https://github.com/inkand-paper/Optimizer" className="hover:text-blue-600 transition-colors">GitHub</Link>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800 flex justify-center gap-6">
          <Link href="https://twitter.com/abirmajid" aria-label="X (Twitter)" className="text-zinc-400 hover:text-blue-500 transition-colors">
             <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
          </Link>
          <Link href="https://facebook.com" aria-label="Facebook" className="text-zinc-400 hover:text-blue-600 transition-colors">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"></path></svg>
          </Link>
          <Link href="https://linkedin.com/in/abirmajid" aria-label="LinkedIn" className="text-zinc-400 hover:text-blue-700 transition-colors">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path></svg>
          </Link>
          <Link href="https://instagram.com" aria-label="Instagram" className="text-zinc-400 hover:text-pink-600 transition-colors">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"></path></svg>
          </Link>
          <Link href="https://youtube.com" aria-label="YouTube" className="text-zinc-400 hover:text-red-600 transition-colors">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.501 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path></svg>
          </Link>
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
