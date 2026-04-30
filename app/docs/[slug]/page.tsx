import * as React from "react";
import fs from "fs";
import path from "path";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { ArrowLeft, BookOpen, Clock, Mail, Github } from "lucide-react";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui-elements";

import { MermaidInitializer } from "@/components/mermaid-initializer";

function renderMarkdownAsCards(md: string) {
  const normalizedMd = md.replace(/\r\n/g, '\n');
  
  const sections = normalizedMd.split(/\n(?=## )/);
  const intro = sections.shift() || "";

  const renderedIntro = intro
    .replace(/^# (.*$)/gm, '<h1 class="text-4xl md:text-5xl font-semibold mb-6 tracking-tight text-foreground">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
    .split('\n\n').filter(Boolean).map(p => p.startsWith('<') ? p : `<p class="text-[16px] text-muted-foreground leading-relaxed mb-6">${p}</p>`).join('\n');

  const renderedSections = sections.map(section => {
    const rawSection = section.replace(/^## /, '');
    const lines = rawSection.split('\n');
    const title = lines.shift() || "";
    const sectionId = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let content = lines.join('\n');

    // 1. Handle Mermaid
    content = content.replace(/```mermaid\n([\s\S]*?)```/g, '<div class="mermaid my-8 flex justify-center p-8 rounded-card" style="background:#0D0F11;border:0.5px solid rgba(180,140,60,0.2)">$1</div>');

    // 2. Handle Highlighted Code Blocks
    content = content.replace(/```(\w+)\n([\s\S]*?)```/g, (match, lang, code) => {
      const displayLang = lang.toUpperCase();
      return `<div class="relative my-8">
        <div class="flex items-center gap-2 px-4 py-2.5 rounded-t-card" style="background:#0D0F11;border:0.5px solid rgba(255,255,255,0.07);border-bottom:none">
          <span class="h-2 w-2 rounded-full" style="background:#B48C3C"></span>
          <span class="mono-gold font-semibold">${displayLang}</span>
        </div>
        <pre class="np-codeblock rounded-t-none rounded-b-card overflow-x-auto np-scroll" style="margin:0">
          <code class="language-${lang}">${code.trim()}</code>
        </pre>
      </div>`;
    });

    // 3. Handle Standard Code Blocks
    content = content.replace(/```([\s\S]*?)```/g, '<div class="my-8"><pre class="np-codeblock rounded-card overflow-x-auto np-scroll" style="margin:0"><code>$1</code></pre></div>');

    // 4. Tables
    content = content.replace(/((?:\|.+\|\n?)+)/g, (match) => {
      const rows = match.trim().split('\n');
      if (rows.length < 2) return match;
      const headerRow = rows.shift() || "";
      rows.shift(); 
      
      const headerCells = headerRow.split('|').filter(c => c.trim() !== "").map(c => c.trim());
      const headerHtml = `<thead class="bg-muted/40"><tr>${headerCells.map(c => `<th class="px-5 py-3.5 label-category text-muted-foreground border-b border-border">${c}</th>`).join('')}</tr></thead>`;
      
      const bodyRowsHtml = rows.map(row => {
        const cells = row.split('|').filter(c => c.trim() !== "").map(c => c.trim());
        return `<tr class="border-b border-border hover:bg-muted/20 transition-colors">${cells.map(c => `<td class="px-5 py-3.5 text-[13px] font-medium text-foreground">${c}</td>`).join('')}</tr>`;
      }).join('');
      
      return `<div class="overflow-x-auto my-8 border border-border rounded-ui shadow-sm"><table class="w-full text-left border-collapse bg-card">${headerHtml}<tbody class="divide-y divide-border">${bodyRowsHtml}</tbody></table></div>`;
    });

    // 5. Basic Inline
    content = content
      .replace(/^### (.*$)/gm, '<h3 class="text-[20px] font-semibold mb-4 mt-10 text-foreground">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-np-gold hover:text-np-gold/80 transition-colors underline decoration-1 underline-offset-4">$1</a>')
      .replace(/^> (.*$)/gm, '<div class="bg-np-gold/5 border-l-2 border-np-gold p-4 my-8 rounded-r-ui"><p class="text-[14px] font-medium text-muted-foreground">$1</p></div>')
      .replace(/^\- (.*$)/gm, '<li class="flex items-start gap-3 mb-3"><div class="h-1.5 w-1.5 rounded-full bg-np-gold mt-2 shrink-0"></div><span class="text-[14px] text-muted-foreground leading-relaxed">$1</span></li>');

    // 6. Paragraphs
    content = content.split('\n\n').filter(Boolean).map(p => {
      const trimmed = p.trim();
      if (trimmed.startsWith('<div') || trimmed.startsWith('<section') || trimmed.startsWith('<h3') || trimmed.startsWith('<li')) return trimmed;
      return `<p class="mb-4 text-[14px] text-muted-foreground leading-relaxed">${trimmed}</p>`;
    }).join('\n');

    return `
      <section id="${sectionId}" class="mb-12 scroll-mt-32">
        <div class="np-card p-6 md:p-10 relative overflow-hidden group">
          <div class="absolute -top-16 -right-16 w-32 h-32 bg-np-gold/5 rounded-full blur-3xl group-hover:bg-np-gold/10 transition-colors duration-700 pointer-events-none" />
          <h2 class="text-2xl md:text-3xl font-semibold mb-8 text-foreground border-l-2 border-np-gold pl-5">${title}</h2>
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
      <div className="min-h-screen flex flex-col bg-background">
        <MermaidInitializer />
        <Navbar />
        
        <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-16 md:py-24">
          <Link 
            href="/docs" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-np-gold transition-colors mb-12 group font-semibold text-[11px] uppercase tracking-widest"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Return to Knowledge Base
          </Link>

          <div className="flex items-center gap-4 mb-10 pb-6 border-b border-border">
            <div className="px-3 py-1.5 rounded-ui bg-np-gold/10 text-np-gold text-[11px] font-semibold uppercase tracking-widest flex items-center gap-1.5 border border-np-gold/20">
              <BookOpen className="h-3.5 w-3.5" /> 
              <span>Protocol Document</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
              <Clock className="h-3.5 w-3.5" /> 
              <span>5m Read</span>
            </div>
          </div>

          <div 
            className="docs-content"
            dangerouslySetInnerHTML={{ __html: renderedIntro }}
          />

          <div 
            className="docs-content mt-12"
            dangerouslySetInnerHTML={{ __html: renderedSections }}
          />

          {/* Support CTA Footer matching other pages */}
          <Card className="mt-20 p-10 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-np-gold/5 blur-[60px] pointer-events-none" />
            <div className="relative z-10">
              <h4 className="text-[20px] font-semibold mb-4 tracking-tight">Need further clarification?</h4>
              <p className="text-[14px] text-muted-foreground mb-6">Our engineering team is available for direct support.</p>
              <div className="flex justify-center gap-4">
                 <Link href="mailto:tabir8431@gmail.com" className="np-btn-primary h-10 px-6 text-[13px] gap-2">
                    <Mail className="h-4 w-4" /> Email Support
                 </Link>
                 <Link href="https://github.com/inkand-paper/Optimizer" className="np-btn-outline h-10 px-6 text-[13px] gap-2">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.185 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.2 22 16.447 22 12.021 22 6.484 17.523 2 12 2z"/></svg> 
                    Open Issue
                 </Link>
              </div>
            </div>
          </Card>
        </main>
      </div>
    );
  } catch (e) {
    notFound();
  }
}
