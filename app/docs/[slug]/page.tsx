import * as React from "react";
import fs from "fs";
import path from "path";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { ArrowLeft, BookOpen, Clock, Tag, ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui-elements";

import { MermaidInitializer } from "@/components/mermaid-initializer";

function renderMarkdownAsCards(md: string) {
  const normalizedMd = md.replace(/\r\n/g, '\n');
  
  const sections = normalizedMd.split(/\n(?=## )/);
  const intro = sections.shift() || "";

  const renderedIntro = intro
    .replace(/^# (.*$)/gm, '<h1 class="text-4xl md:text-7xl font-black mb-10 tracking-tighter text-zinc-900 dark:text-white uppercase leading-[0.9]">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-zinc-900 dark:text-white uppercase tracking-tight">$1</strong>')
    .split('\n\n').filter(Boolean).map(p => p.startsWith('<') ? p : `<p class="text-lg text-zinc-500 dark:text-zinc-400 font-bold tracking-tight leading-relaxed mb-10 uppercase">${p}</p>`).join('\n');

  const renderedSections = sections.map(section => {
    const rawSection = section.replace(/^## /, '');
    const lines = rawSection.split('\n');
    const title = lines.shift() || "";
    const sectionId = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let content = lines.join('\n');

    // 1. Handle Mermaid
    content = content.replace(/```mermaid\n([\s\S]*?)```/g, '<div class="mermaid bg-zinc-50 dark:bg-zinc-950 p-8 rounded-md border border-zinc-200 dark:border-zinc-800 my-10 flex justify-center shadow-sm">$1</div>');

    // 2. Handle Highlighted Code Blocks
    content = content.replace(/```(\w+)\n([\s\S]*?)```/g, (match, lang, code) => {
      const displayLang = lang.toUpperCase();
      return `<div class="relative group my-10">
        <div class="absolute -top-3 right-4 flex items-center gap-2 px-3 py-1 bg-zinc-900 dark:bg-white border border-zinc-800 dark:border-zinc-200 rounded-sm shadow-xl z-10">
          <div class="h-2 w-2 rounded-full bg-blue-500"></div>
          <span class="text-[9px] font-black uppercase tracking-[0.2em] text-white dark:text-zinc-900">${displayLang}</span>
        </div>
        <div class="rounded-md overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-xl">
          <pre class="bg-zinc-950 text-zinc-100 p-8 pt-10 overflow-x-auto custom-scrollbar !whitespace-pre">
            <code class="language-${lang} text-xs font-mono leading-relaxed !whitespace-pre !break-normal inline-block min-w-full">${code.trim()}</code>
          </pre>
        </div>
      </div>`;
    });

    // 3. Handle Standard Code Blocks
    content = content.replace(/```([\s\S]*?)```/g, '<div class="relative group my-10"><div class="rounded-md overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-xl"><pre class="bg-zinc-950 text-zinc-100 p-8 overflow-x-auto custom-scrollbar !whitespace-pre"><code class="text-xs font-mono leading-relaxed !whitespace-pre !break-normal inline-block min-w-full">$1</code></pre></div></div>');

    // 4. Tables
    content = content.replace(/((?:\|.+\|\n?)+)/g, (match) => {
      const rows = match.trim().split('\n');
      if (rows.length < 2) return match;
      const headerRow = rows.shift() || "";
      rows.shift(); 
      
      const headerCells = headerRow.split('|').filter(c => c.trim() !== "").map(c => c.trim());
      const headerHtml = `<thead class="bg-zinc-50 dark:bg-zinc-900"><tr>${headerCells.map(c => `<th class="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">${c}</th>`).join('')}</tr></thead>`;
      
      const bodyRowsHtml = rows.map(row => {
        const cells = row.split('|').filter(c => c.trim() !== "").map(c => c.trim());
        return `<tr class="border-b border-zinc-100 dark:border-zinc-900 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">${cells.map(c => `<td class="p-5 text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-tight">${c}</td>`).join('')}</tr>`;
      }).join('');
      
      return `<div class="overflow-x-auto my-10 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm"><table class="w-full text-left border-collapse">${headerHtml}<tbody class="divide-y border-zinc-100 dark:divide-zinc-900">${bodyRowsHtml}</tbody></table></div>`;
    });

    // 5. Basic Inline
    content = content
      .replace(/^### (.*$)/gm, '<h3 class="text-2xl font-black mb-6 mt-12 text-zinc-900 dark:text-white uppercase tracking-tighter border-b border-zinc-100 dark:border-zinc-900 pb-2">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-zinc-900 dark:text-white uppercase tracking-tight">$1</strong>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-500 font-black uppercase tracking-tight transition-colors underline decoration-2 underline-offset-4">$1</a>')
      .replace(/^> (.*$)/gm, '<div class="bg-zinc-50 dark:bg-zinc-900/50 border-l-4 border-blue-600 p-6 my-10 rounded-sm shadow-sm"><p class="text-xs font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 leading-loose">$1</p></div>')
      .replace(/^\- (.*$)/gm, '<li class="flex items-start gap-4 mb-4"><div class="h-2 w-2 rounded-sm bg-blue-600 mt-1.5 shrink-0 shadow-lg shadow-blue-500/20"></div><span class="text-xs font-black uppercase tracking-tight text-zinc-600 dark:text-zinc-400 leading-relaxed">$1</span></li>');

    // 6. Paragraphs
    content = content.split('\n\n').filter(Boolean).map(p => {
      const trimmed = p.trim();
      if (trimmed.startsWith('<div') || trimmed.startsWith('<section') || trimmed.startsWith('<h3') || trimmed.startsWith('<li')) return trimmed;
      return `<p class="mb-6 text-xs font-bold uppercase tracking-tight text-zinc-500 dark:text-zinc-400 leading-relaxed">${trimmed}</p>`;
    }).join('\n');

    return `
      <section id="${sectionId}" class="mb-16 scroll-mt-32">
        <div class="bg-white dark:bg-zinc-950 rounded-md p-8 md:p-16 border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
          <div class="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-600/10 transition-all duration-700" />
          <h2 class="text-3xl md:text-5xl font-black mb-12 tracking-tighter text-zinc-900 dark:text-white uppercase leading-none border-l-4 border-blue-600 pl-8">${title}</h2>
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
      <div className="min-h-screen flex flex-col bg-white dark:bg-black">
        <MermaidInitializer />
        <Navbar />
        
        <main className="flex-1 w-full max-w-[1000px] mx-auto px-4 py-20 md:py-32">
          <Link 
            href="/docs" 
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-blue-600 transition-all mb-16 group font-black text-[10px] uppercase tracking-[0.3em]"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Return to Protocols
          </Link>

          <div className="flex items-center gap-6 mb-12 border-b border-zinc-100 dark:border-zinc-900 pb-8">
            <div className="px-3 py-1 rounded-sm bg-blue-600 text-white text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-2 shadow-lg shadow-blue-500/20">
              <BookOpen className="h-3 w-3 fill-current" /> 
              <span>Engineering Guideline</span>
            </div>
            <div className="flex items-center gap-2 text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em]">
              <Clock className="h-3 w-3" /> 
              <span>Transmission: 5m</span>
            </div>
          </div>

          <div 
            className="docs-content"
            dangerouslySetInnerHTML={{ __html: renderedIntro }}
          />

          <div 
            className="docs-content mt-16"
            dangerouslySetInnerHTML={{ __html: renderedSections }}
          />

          <div className="mt-32 p-12 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md relative overflow-hidden">
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-blue-600/5 via-transparent to-transparent opacity-50" />
            <div class="relative z-10">
              <h4 className="text-xl font-black mb-8 uppercase tracking-tighter">Support Escalation Matrix</h4>
              <div className="grid sm:grid-cols-2 gap-4">
                 <Link href="mailto:tabir8431@gmail.com" className="p-6 rounded-md bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 hover:border-blue-600 transition-all shadow-sm group">
                    <p className="font-black text-xs mb-1 uppercase tracking-tight text-zinc-900 dark:text-white group-hover:text-blue-600 transition-colors">Direct Engineering Liaison</p>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">SLA: 24 Hour Response Time</p>
                 </Link>
                 <Link href="https://github.com/inkand-paper/Optimizer" className="p-6 rounded-md bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 hover:border-blue-600 transition-all shadow-sm group">
                    <p className="font-black text-xs mb-1 uppercase tracking-tight text-zinc-900 dark:text-white group-hover:text-blue-600 transition-colors">Protocol Issue Log</p>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Public Repository Tracking</p>
                 </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  } catch (e) {
    notFound();
  }
}
