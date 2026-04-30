import * as React from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Card } from "@/components/ui-elements";
import { 
  Book, 
  Terminal, 
  Smartphone, 
  Compass, 
  ArrowRight,
  Shield,
  Zap,
  Activity,
  Webhook
} from "lucide-react";

export default function DocsPage() {
  const categories = [
    {
      title: "Getting Started",
      description: "Learn the core concepts and get NexPulse running in minutes.",
      icon: <Compass className="h-6 w-6 text-blue-600" />,
      links: [
        { label: "Core Concepts", href: "/docs/concepts", file: "CONCEPTS.md" },
        { label: "Master Guide", href: "/docs/master", file: "MASTER_GUIDE.md" },
      ]
    },
    {
      title: "Technical Specs",
      description: "Detailed API documentation and integration snippets.",
      icon: <Terminal className="h-6 w-6 text-blue-600" />,
      links: [
        { label: "Implementation", href: "/docs/master#web-implementation-javascript-node-js" },
        { label: "API Reference", href: "/docs/api" },
        { label: "Webhook Events", href: "/docs/master#webhooks" },
      ]
    },
    {
      title: "Mobile & SDKs",
      description: "Connect your Android or iOS apps to NexPulse.",
      icon: <Smartphone className="h-6 w-6 text-blue-600" />,
      links: [
        { label: "iOS Integration", href: "/docs/master#ios-implementation-swift" },
        { label: "Android Integration", href: "/docs/master#android-implementation-kotlin" },
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black">
      <Navbar />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-blue-600 text-white font-black text-[9px] uppercase tracking-[0.3em] mb-8 shadow-lg shadow-blue-500/20">
            <Book className="h-3 w-3 fill-current" /> 
            <span>Knowledge Base v2.0</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.85] uppercase text-zinc-900 dark:text-white">
            Architecting <br />
            <span className="text-blue-600">Universal Authority</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 font-bold tracking-tight leading-relaxed max-w-2xl uppercase">
            From high-level system analogies to machine-level API protocols. Everything required to maintain absolute control over your infrastructure.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {categories.map((cat, i) => (
            <Card key={i} className="p-8 flex flex-col h-full border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="h-14 w-14 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-md flex items-center justify-center shadow-md mb-8">
                {React.cloneElement(cat.icon as React.ReactElement<any>, { className: "h-7 w-7 text-blue-600" })}
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">{cat.title}</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-10 flex-1 leading-relaxed">
                {cat.description}
              </p>
              <div className="space-y-3">
                {cat.links.map((link, j) => (
                  <Link 
                    key={j} 
                    href={link.href} 
                    className="flex items-center justify-between group p-4 rounded-md border border-zinc-100 dark:border-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-all"
                  >
                    <span className="text-xs font-black uppercase tracking-tight text-zinc-600 dark:text-zinc-400 group-hover:text-blue-600 transition-colors">{link.label}</span>
                    <ArrowRight className="h-4 w-4 text-zinc-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* HELP SECTION */}
        <div className="mt-32 p-12 md:p-24 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md text-center relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-600/5 via-transparent to-transparent opacity-50" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-zinc-900 dark:bg-white text-white dark:text-black font-black text-[9px] uppercase tracking-[0.3em] mb-8">
              <Activity className="h-3 w-3 fill-current" />
              <span>Network Support</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter leading-none uppercase text-zinc-900 dark:text-white">
              Stalled Deployment? <br />
              <span className="text-blue-600">Connect to Engineering</span>
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 mb-12 text-sm md:text-lg font-bold tracking-tight leading-relaxed uppercase">
              Our support team maintains active protocols on Discord and via encrypted email. We are here to ensure your architecture remains optimal.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="mailto:nexpulse.team@gmail.com">
                <Button size="lg" className="h-16 px-12 bg-zinc-900 text-white dark:bg-white dark:text-black font-black uppercase tracking-[0.2em] text-xs shadow-xl">
                  Email Support
                </Button>
              </Link>
              <Link href="https://discord.gg/R35wamng">
                <Button variant="outline" size="lg" className="h-16 px-12 font-black uppercase tracking-[0.2em] text-xs border-zinc-200 dark:border-zinc-800">
                  Join Discord
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="border-t border-zinc-100 dark:border-zinc-900 py-16 bg-white dark:bg-black">
        <div className="container mx-auto px-4 text-center">
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
             © 2026 NexPulse Universal Infrastructure. All Protocols Reserved.
           </p>
        </div>
      </footer>
    </div>
  );
}
