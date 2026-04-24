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
      icon: <Terminal className="h-6 w-6 text-purple-600" />,
      links: [
        { label: "Implementation", href: "/docs/master#web-implementation-javascript-node-js" },
        { label: "API Reference", href: "/docs/api" },
        { label: "Webhook Events", href: "/docs/master#webhooks" },
      ]
    },
    {
      title: "Mobile & SDKs",
      description: "Connect your Android or iOS apps to NexPulse.",
      icon: <Smartphone className="h-6 w-6 text-green-600" />,
      links: [
        { label: "iOS Integration", href: "/docs/master#ios-implementation-swift" },
        { label: "Android Integration", href: "/docs/master#android-implementation-kotlin" },
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <Navbar />
      
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 py-12 md:py-20">
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 font-bold text-[10px] uppercase tracking-widest mb-6">
            <Book className="h-3 w-3" /> Documentation
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
            Everything you need to <span className="text-blue-600">master</span> NexPulse.
          </h1>
          <p className="text-xl text-zinc-500 dark:text-zinc-400 leading-relaxed">
            From high-level analogies to machine-level API specs. Choose your path below to start optimizing.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {categories.map((cat, i) => (
            <Card key={i} className="p-8 flex flex-col h-full border-none shadow-xl shadow-zinc-200/50 dark:shadow-none dark:bg-zinc-900/50">
              <div className="h-12 w-12 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center shadow-sm mb-6">
                {cat.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{cat.title}</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8 flex-1">
                {cat.description}
              </p>
              <div className="space-y-3">
                {cat.links.map((link, j) => (
                  <Link 
                    key={j} 
                    href={link.href} 
                    className="flex items-center justify-between group p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    <span className="text-sm font-semibold group-hover:text-blue-600 transition-colors">{link.label}</span>
                    <ArrowRight className="h-4 w-4 text-zinc-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* HELP SECTION */}
        <div className="mt-24 p-12 bg-zinc-900 rounded-[32px] text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] -mr-48 -mt-48" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-3xl font-bold mb-4">Still have questions?</h2>
              <p className="text-zinc-400 max-w-md">
                Our support team is active on Discord and via email. We're here to help you optimize.
              </p>
            </div>
            <div className="flex gap-4">
              <Link href="mailto:tabir8431@gmail.com">
                <button className="bg-white text-black px-8 py-4 rounded-2xl font-bold hover:bg-zinc-200 transition-colors">
                  Email Support
                </button>
              </Link>
              <Link href="https://discord.gg/your-invite">
                <button className="bg-zinc-800 text-white px-8 py-4 rounded-2xl font-bold hover:bg-zinc-700 transition-colors">
                  Join Discord
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="border-t py-12 bg-white dark:bg-zinc-950">
        <div className="container mx-auto px-4 text-center">
           <p className="text-sm text-zinc-500">© 2026 NexPulse. Powered by Open Source.</p>
        </div>
      </footer>
    </div>
  );
}
