import * as React from "react";
import fs from "fs";
import path from "path";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { ArrowLeft, BookOpen, Clock, Mail, GitBranch } from "lucide-react";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui-elements";
import { MermaidInitializer } from "@/components/mermaid-initializer";

function escapeHtml(str: string) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderMarkdownAsCards(md: string) {
  const normalized = md.replace(/\r\n/g, "\n");

  // Split into intro + ## sections
  const parts = normalized.split(/(?=^## )/m);
  const introRaw = parts[0] || "";
  const sectionParts = parts.slice(1);

  // Render intro
  const renderedIntro = introRaw
    .replace(/^# (.*)$/m, '<h1 style="font-size:2.5rem;font-weight:700;margin-bottom:1rem;line-height:1.2;color:inherit">$1</h1>')
    .split("\n\n")
    .filter(Boolean)
    .map((p) => {
      const t = p.trim();
      if (t.startsWith("<h1")) return t;
      const formatted = t
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/`(.*?)`/g, '<code style="font-family:monospace;font-size:0.85em;background:rgba(128,128,128,0.15);padding:2px 6px;border-radius:4px">$1</code>');
      return `<p style="font-size:1rem;color:var(--muted-foreground);line-height:1.7;margin-bottom:1rem">${formatted}</p>`;
    })
    .join("\n");

  // Render each ## section into a card
  const renderedSections = sectionParts.map((section) => {
    // strip leading ##
    const body = section.replace(/^## /, "");
    const lines = body.split("\n");
    const title = lines.shift() || "";
    let content = lines.join("\n");

    // Mermaid diagrams
    content = content.replace(/```mermaid[ \t]*\n([\s\S]*?)```/g, (_m, code) =>
      `<div class="mermaid np-codeblock" style="border-color:rgba(180,140,60,0.25);padding:2rem;margin:1.5rem 0;display:flex;justify-content:center">${code}</div>`
    );

    // Fenced code blocks with language
    content = content.replace(/```(\w+)[ \t]*\n([\s\S]*?)```/g, (_m, lang, code) =>
      `<div class="np-codeblock" style="margin:1.5rem 0;padding:0;overflow:hidden">
        <div style="border-bottom:1px solid var(--border);padding:0.75rem 1rem;display:flex;align-items:center;gap:0.5rem">
          <span style="height:8px;width:8px;border-radius:50%;background:#B48C3C;display:inline-block"></span>
          <span style="font-family:monospace;color:#B48C3C;font-size:0.75rem;font-weight:600">${lang.toUpperCase()}</span>
        </div>
        <pre style="padding:1.25rem;margin:0;overflow-x:auto;background:transparent;color:inherit;font-family:inherit"><code>${escapeHtml(code.trim())}</code></pre>
      </div>`
    );

    // Generic code blocks
    content = content.replace(/```[ \t]*\n([\s\S]*?)```/g, (_m, code) =>
      `<pre class="np-codeblock" style="margin:1.5rem 0"><code>${escapeHtml(code.trim())}</code></pre>`
    );

    // Tables
    content = content.replace(/((?:\|.+\|\n?)+)/g, (match) => {
      const rows = match.trim().split("\n");
      if (rows.length < 2) return match;
      const headerRow = rows.shift() || "";
      rows.shift(); // separator
      const headerCells = headerRow.split("|").filter((c) => c.trim()).map((c) => c.trim());
      const headerHtml = `<thead><tr>${headerCells.map((c) => `<th style="padding:0.75rem 1rem;font-size:0.7rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:var(--muted-foreground);border-bottom:1px solid var(--border);text-align:left">${c}</th>`).join("")}</tr></thead>`;
      const bodyHtml = rows.map((row) => {
        const cells = row.split("|").filter((c) => c.trim()).map((c) => c.trim());
        return `<tr style="border-bottom:1px solid var(--border)">${cells.map((c) => `<td style="padding:0.75rem 1rem;font-size:0.85rem;color:var(--foreground)">${c}</td>`).join("")}</tr>`;
      }).join("");
      return `<div style="overflow-x:auto;margin:1.5rem 0;border:1px solid var(--border);border-radius:8px"><table style="width:100%;border-collapse:collapse;background:var(--card)">${headerHtml}<tbody>${bodyHtml}</tbody></table></div>`;
    });

    // ### headings
    content = content.replace(/^### (.*)$/gm, '<h3 style="font-size:1.15rem;font-weight:600;margin:2rem 0 0.75rem;color:inherit">$1</h3>');

    // Blockquotes
    content = content.replace(/^> (.*)$/gm, '<div style="border-left:2px solid #B48C3C;padding:0.75rem 1rem;margin:1rem 0;background:rgba(180,140,60,0.05);border-radius:0 6px 6px 0"><p style="font-size:0.9rem;color:var(--muted-foreground);margin:0">$1</p></div>');

    // Inline bold + code + links
    content = content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/`(.*?)`/g, '<code style="font-family:monospace;font-size:0.85em;background:rgba(128,128,128,0.15);padding:2px 6px;border-radius:4px;color:inherit">$1</code>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="color:#B48C3C;text-decoration:underline;text-underline-offset:3px">$1</a>');

    // Unordered lists — collect consecutive - lines
    content = content.replace(/(^- .+(\n- .+)*)/gm, (match) => {
      const items = match.split("\n").filter(Boolean).map((line) => {
        const text = line.replace(/^- /, "").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/`(.*?)`/g, '<code style="font-family:monospace;font-size:0.85em;background:rgba(128,128,128,0.15);padding:2px 6px;border-radius:4px">$1</code>');
        return `<li style="display:flex;align-items:flex-start;gap:0.75rem;margin-bottom:0.6rem"><span style="height:6px;width:6px;min-width:6px;border-radius:50%;background:#B48C3C;margin-top:0.55rem;display:inline-block"></span><span style="font-size:0.9rem;color:var(--muted-foreground);line-height:1.6">${text}</span></li>`;
      }).join("");
      return `<ul style="margin:1rem 0;padding:0;list-style:none">${items}</ul>`;
    });

    // Paragraphs
    content = content.split("\n\n").filter(Boolean).map((p) => {
      const t = p.trim();
      if (t.startsWith("<") || t === "") return t;
      return `<p style="font-size:0.9rem;color:var(--muted-foreground);line-height:1.7;margin-bottom:0.9rem">${t}</p>`;
    }).join("\n");

    const sectionId = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    return `
      <section id="${sectionId}" style="margin-bottom:2.5rem;scroll-margin-top:6rem">
        <div class="np-card" style="padding:2rem 2.5rem;position:relative;overflow:hidden">
          <div style="position:absolute;top:-4rem;right:-4rem;width:8rem;height:8rem;background:rgba(180,140,60,0.04);border-radius:50%;filter:blur(40px);pointer-events:none"></div>
          <h2 style="font-size:1.4rem;font-weight:600;margin-bottom:1.5rem;border-left:3px solid #B48C3C;padding-left:1rem;color:inherit;line-height:1.3">${title}</h2>
          <div style="color:var(--foreground)">${content}</div>
        </div>
      </section>
    `;
  }).join("");

  return { renderedIntro, renderedSections };
}

export default async function DocDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const fileMap: Record<string, string> = {
    "concepts": "CONCEPTS.md",
    "master": "MASTER_GUIDE.md",
    "api": "API_DOCS.md",
    "android": "ANDROID_INTEGRATION.md",
    "webhooks": "MASTER_GUIDE.md",
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
            className="mb-12"
            dangerouslySetInnerHTML={{ __html: renderedIntro }}
          />

          <div
            dangerouslySetInnerHTML={{ __html: renderedSections }}
          />

          <Card className="mt-20 p-10 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-np-gold/5 blur-[60px] pointer-events-none" />
            <div className="relative z-10">
              <h4 className="text-[20px] font-semibold mb-4 tracking-tight">Need further clarification?</h4>
              <p className="text-[14px] text-muted-foreground mb-6">Our engineering team is available for direct support.</p>
              <div className="flex justify-center gap-4 flex-wrap">
                <a href="mailto:nexpulse.team@gmail.com" className="np-btn-primary h-10 px-6 text-[13px] inline-flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email Support
                </a>
                <Link href="https://github.com/inkand-paper/Optimizer" className="np-btn-outline h-10 px-6 text-[13px] inline-flex items-center gap-2">
                  <GitBranch className="h-4 w-4" /> Open Issue
                </Link>
                <Link href="https://discord.gg/nexpulse" className="np-btn-outline h-10 px-6 text-[13px] inline-flex items-center gap-2">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg> Discord
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
