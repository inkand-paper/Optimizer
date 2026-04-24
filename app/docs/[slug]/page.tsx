import * as React from "react";
import fs from "fs";
import path from "path";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { ArrowLeft, BookOpen, Clock, Tag } from "lucide-react";
import { notFound } from "next/navigation";

import { MermaidInitializer } from "@/components/mermaid-initializer";

function renderMarkdownAsCards(md: string) {
  const normalizedMd = md.replace(/\r\n/g, '\n');
  
  // Use a more robust split that preserves the H2 headers
  const sections = normalizedMd.split(/\n(?=## )/);
  const intro = sections.shift() || "";

  const renderedIntro = intro
    .replace(/^# (.*$)/gm, '<h1 class="text-4xl md:text-6xl font-black mb-8 tracking-tight text-zinc-900 dark:text-white">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-zinc-900 dark:text-white">$1</strong>')
    .split('\n\n').filter(Boolean).map(p => p.startsWith('<') ? p : `<p class="text-xl text-zinc-500 dark:text-zinc-400 leading-relaxed mb-8">${p}</p>`).join('\n');

  const renderedSections = sections.map(section => {
    const rawSection = section.replace(/^## /, '');
    const lines = rawSection.split('\n');
    const title = lines.shift() || "";
    const sectionId = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let content = lines.join('\n');

    // 1. Handle Mermaid
    content = content.replace(/```mermaid\n([\s\S]*?)```/g, '<div class="mermaid bg-white dark:bg-zinc-900 p-8 rounded-3xl border dark:border-zinc-800 my-8 flex justify-center">$1</div>');

    // 2. Handle Highlighted Code Blocks
    content = content.replace(/```(\w+)\n([\s\S]*?)```/g, (match, lang, code) => {
      const displayLang = lang.toUpperCase();
      let icon = '<div class="h-2 w-2 rounded-full bg-zinc-500"></div>';
      
      if (lang === 'swift') icon = '<svg class="h-4 w-4 text-orange-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12.162 14.5c.325.263.663.513 1.013.738 1.412.913 2.925 1.575 4.537 1.988-1.55 1.113-3.237 1.838-5.012 2.163-.125.025-.138.013-.088-.1.45-.9 1.138-1.788 2-2.613-.675-.125-1.325-.338-1.95-.625-.325-.15-.65-.325-.963-.512-1.637-1.025-3.087-2.313-4.287-3.813C6.462 10.512 5.8 9.075 5.438 7.55c1.075 1.538 2.375 2.875 3.862 3.963 1.05.775 2.188 1.4 3.388 1.838-.138-.45-.225-.913-.263-1.388-.038-.55 0-1.1.113-1.638-1.125.075-2.225.325-3.275.75-1.125.463-2.175 1.075-3.125 1.825 1.162-1.313 2.588-2.375 4.188-3.138.4-.188.812-.35 1.225-.488.512-.163 1.037-.288 1.575-.363.15-.025.3-.038.45-.05.613-.038 1.238-.013 1.85.088-.013-.013-.025-.013-.038-.025-1.575-.6-3.175-.9-4.825-.9C6.912 8 4.225 10.325 3 13.562c2.162.275 4.1.913 5.837 1.888-.312.162-.612.337-.9.537-.562.4-.4.538-.15.425 2.1-1 4.512-1.538 6.975-1.538-2.613 2.1-3.9 4.8-3.9 8.1 0 1.35.3 2.55.9 3.6-1.5-.3-2.925-.9-4.2-1.8 1.2-.3 2.325-.75 3.375-1.35.375-.225.75-.45 1.125-.712z"/></svg>';
      if (lang === 'javascript' || lang === 'js') icon = '<svg class="h-4 w-4 text-yellow-400" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h18v18H3V3zm15.525 15.111c-.344-.659-.838-1.218-1.447-1.542-.609-.324-1.286-.486-1.984-.486-.698 0-1.362.162-1.95.486-.588.324-1.053.791-1.353 1.341l1.554.96c.201-.351.464-.627.766-.807.302-.18.618-.27.915-.27s.588.08.852.24.471.4.6.72c.129.32.193.67.193 1.05 0 .39-.064.75-.193 1.08-.129.33-.328.6-.6.81-.271.21-.555.315-.852.315-.312 0-.6-.085-.863-.255-.262-.17-.481-.42-.657-.75l-1.635 1c.36.63.855 1.11 1.485 1.44s1.305.495 2.025.495c.744 0 1.449-.17 2.055-.51s1.083-.815 1.431-1.425.522-1.305.522-2.085c0-.792-.174-1.488-.522-2.148z"/></svg>';
      if (lang === 'python') icon = '<svg class="h-4 w-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2v1.13l-.02.53-.05.46-.11.4-.18.35-.26.3-.33.25-.43.19-.58.11H11.1l-.31.03-.38.08-.3.12-.35.22-.3.27-.24.35-.19.4-.13.47-.08.56-.03.62V10.3l.03.62.08.56.13.47.19.4.24.35.3.27.35.22.3.12.38.08.31.03h3.15l.58.11.43.19.33.25.26.3.18.35.11.4.05.46.02.53V15.4l-.02.2-.04.26-.1.3-.16.33-.25.34-.34.34-.45.32-.59.3-.73.26-.9.2-.17.03h-1.13l-.9-.2-.73-.26-.59-.3-.45-.32-.34-.34-.25-.34-.16-.33-.1-.3-.04-.26-.02-.2V14.4l.02-.53.05-.46.11-.4.18-.35.26-.3.33-.25.43-.19.58-.11H14.4l.31-.03.38-.08.3-.12.35-.22.3-.27.24-.35.19-.4.13-.47.08-.56.03-.62V8.3l-.03-.62-.08-.56-.13-.47-.19-.4-.24-.35-.3-.27-.35-.22-.3-.12-.38-.08-.31-.03h-3.15l-.58-.11-.43-.19-.33-.25-.26-.3-.18-.35-.11-.4-.05-.46-.02-.53V3.4l.02-.2.04-.26.1-.3.16-.33.25-.34.34-.34.45-.32.59-.3.73-.26.9-.2.17-.03H14.25z"/></svg>';
      if (lang === 'go') icon = '<svg class="h-4 w-4 text-cyan-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>';
      if (lang === 'ruby') icon = '<svg class="h-4 w-4 text-red-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L3 9l9 13 9-13-9-7z"/></svg>';
      if (lang === 'kotlin') icon = '<svg class="h-4 w-4 text-purple-400" viewBox="0 0 24 24" fill="currentColor"><path d="M2 2l10 10L22 2v20H2V2z"/></svg>';

      return `<div class="relative group my-8">
        <div class="absolute -top-4 right-6 flex items-center gap-2 px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-full shadow-lg z-10">
          ${icon}
          <span class="text-[10px] font-black uppercase tracking-widest text-zinc-400">${displayLang}</span>
        </div>
        <pre class="bg-zinc-950 text-zinc-100 p-8 pt-10 rounded-[32px] overflow-x-auto border border-zinc-800 shadow-2xl !whitespace-pre">
          <code class="language-${lang} text-sm font-mono leading-relaxed !whitespace-pre !break-normal" onload="Prism.highlightElement(this)">${code.trim()}</code>
        </pre>
      </div>`;
    });

    // 3. Handle Standard Code Blocks
    content = content.replace(/```([\s\S]*?)```/g, '<div class="relative group my-8"><pre class="bg-zinc-950 text-zinc-100 p-6 rounded-2xl overflow-x-auto border border-zinc-800 shadow-2xl !whitespace-pre"><code class="text-sm font-mono leading-relaxed !whitespace-pre !break-normal">$1</code></pre></div>');

    // 4. Tables
    content = content.replace(/((?:\|.+\|\n?)+)/g, (match) => {
      const rows = match.trim().split('\n');
      if (rows.length < 2) return match;
      const headerRow = rows.shift() || "";
      rows.shift(); // separator
      
      const headerCells = headerRow.split('|').filter(c => c.trim() !== "").map(c => c.trim());
      const headerHtml = `<thead class="bg-zinc-50 dark:bg-zinc-800/50"><tr>${headerCells.map(c => `<th class="p-4 text-xs font-black uppercase tracking-widest text-zinc-500">${c}</th>`).join('')}</tr></thead>`;
      
      const bodyRowsHtml = rows.map(row => {
        const cells = row.split('|').filter(c => c.trim() !== "").map(c => c.trim());
        return `<tr class="border-b dark:border-zinc-800">${cells.map(c => `<td class="p-4 text-sm text-zinc-600 dark:text-zinc-400">${c}</td>`).join('')}</tr>`;
      }).join('');
      
      return `<div class="overflow-x-auto my-8 border dark:border-zinc-800 rounded-2xl shadow-sm"><table class="w-full text-left border-collapse">${headerHtml}<tbody class="divide-y dark:divide-zinc-800">${bodyRowsHtml}</tbody></table></div>`;
    });

    // 5. Basic Inline
    content = content
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mb-4 mt-8 text-zinc-900 dark:text-white">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 hover:underline font-medium">$1</a>')
      .replace(/^> (.*$)/gm, '<div class="bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-600 p-4 my-6 rounded-r-xl"><p class="italic text-blue-900 dark:text-blue-300">$1</p></div>')
      .replace(/^\- (.*$)/gm, '<li class="flex items-start gap-3 mb-3"><span class="h-1.5 w-1.5 rounded-full bg-blue-600 mt-2 shrink-0"></span><span class="text-zinc-600 dark:text-zinc-400">$1</span></li>');

    // 6. Paragraphs (More surgical)
    content = content.split('\n\n').filter(Boolean).map(p => {
      const trimmed = p.trim();
      if (trimmed.startsWith('<div') || trimmed.startsWith('<section') || trimmed.startsWith('<h3') || trimmed.startsWith('<li')) return trimmed;
      return `<p class="mb-4 leading-relaxed text-zinc-600 dark:text-zinc-400">${trimmed}</p>`;
    }).join('\n');

    return `
      <section id="${sectionId}" class="mb-12 scroll-mt-24">
        <div class="bg-white dark:bg-zinc-900 rounded-[32px] p-8 md:p-12 border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-none transition-all duration-500">
          <h2 class="text-2xl md:text-3xl font-black mb-8 tracking-tight text-zinc-900 dark:text-white">${title}</h2>
          <div class="prose prose-zinc dark:prose-invert max-w-none">
            ${content}
          </div>
        </div>
      </section>
    `;
  }).join('');

  return { renderedIntro, renderedSections };
}

export default async function DocDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const fileMap: Record<string, string> = {
    "concepts": "CONCEPTS.md",
    "master": "MASTER_GUIDE.md",
    "api": "API_DOCS.md",
    "android": "ANDROID_INTEGRATION.md",
    "webhooks": "MASTER_GUIDE.md" 
  };

  const fileName = fileMap[slug];
  if (!fileName) notFound();

  try {
    const filePath = path.join(process.cwd(), fileName);
    const content = fs.readFileSync(filePath, "utf-8");
    const { renderedIntro, renderedSections } = renderMarkdownAsCards(content);

    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950">
        <MermaidInitializer />
        <Navbar />
        
        <main className="flex-1 w-full max-w-[900px] mx-auto px-4 py-12 md:py-20">
          <Link 
            href="/docs" 
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-blue-600 transition-colors mb-12 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Documentation
          </Link>

          <div className="flex items-center gap-4 mb-8">
            <div className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
              <BookOpen className="h-3 w-3" /> Technical Guide
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              <Clock className="h-3 w-3" /> 5 Min Read
            </div>
          </div>

          <div 
            dangerouslySetInnerHTML={{ __html: renderedIntro }}
          />

          <div 
            dangerouslySetInnerHTML={{ __html: renderedSections }}
          />

          <div className="mt-20 pt-12 border-t border-zinc-100 dark:border-zinc-800">
            <h4 className="text-sm font-bold mb-6">Need more help?</h4>
            <div className="grid sm:grid-cols-2 gap-4">
               <Link href="mailto:tabir8431@gmail.com" className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors border border-transparent hover:border-blue-200">
                  <p className="font-bold text-sm mb-1">Email Support</p>
                  <p className="text-xs text-zinc-500">Response within 24 hours</p>
               </Link>
               <Link href="https://github.com/inkand-paper/Optimizer" className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-transparent">
                  <p className="font-bold text-sm mb-1">Open Issue</p>
                  <p className="text-xs text-zinc-500">Report bugs on GitHub</p>
               </Link>
            </div>
          </div>
        </main>
      </div>
    );
  } catch (e) {
    notFound();
  }
}
