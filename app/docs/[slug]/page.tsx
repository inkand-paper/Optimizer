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

interface TocItem {
  id: string;
  title: string;
  level: number;
}

function renderMarkdownAsCards(md: string) {
  const normalized = md.replace(/\r\n/g, "\n");
  const toc: TocItem[] = [];

  // Split into intro + ## sections
  const parts = normalized.split(/(?=^## )/m);
  const introRaw = parts[0] || "";
  const sectionParts = parts.slice(1);

  // Render intro
  const renderedIntro = introRaw
    .replace(/^# (.*)$/m, '<h1 style="font-size:2.25rem;font-weight:700;margin-bottom:1rem;line-height:1.2;color:inherit">$1</h1>')
    .split("\n\n")
    .filter(Boolean)
    .map((p) => {
      const t = p.trim();
      if (t.startsWith("<h1")) return t;
      const formatted = t
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/`(.*?)`/g, '<code style="font-family:monospace;font-size:0.85em;background:var(--muted);padding:2px 6px;border-radius:4px;border:1px solid var(--border)">$1</code>');
      return `<p style="font-size:0.95rem;color:var(--muted-foreground);line-height:1.7;margin-bottom:1rem">${formatted}</p>`;
    })
    .join("\n");

  // Render each ## section into a card
  const renderedSections = sectionParts.map((section) => {
    // strip leading ##
    const body = section.replace(/^## /, "");
    const lines = body.split("\n");
    const rawTitle = lines.shift() || "";
    const title = rawTitle.trim();
    let content = lines.join("\n");

    const sectionId = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const cleanSectionTitle = title.replace(/^[0-9.]+\s*/, "").replace(/[📋🛠️📊🔒✅🎨📂]/g, "").trim();
    toc.push({ id: sectionId, title: cleanSectionTitle || title, level: 2 });

    // 1. Extract and protect code blocks
    const placeholders: string[] = [];

    // Mermaid diagrams
    content = content.replace(/```mermaid[ \t]*\n([\s\S]*?)```/g, (_m, code) => {
      const idx = placeholders.length;
      placeholders.push(`<pre class="mermaid np-codeblock language-none" style="border:1px solid var(--border);padding:2rem;margin:1.5rem 0;display:flex;justify-content:center;background:var(--muted);border-radius:8px;overflow:hidden">${code.trim()}</pre>`);
      return `__BLOCK_${idx}__`;
    });

    // Fenced code blocks with language
    content = content.replace(/```(\w+)[ \t]*\n([\s\S]*?)```/g, (_m, lang, code) => {
      const idx = placeholders.length;
      placeholders.push(
        `<div class="np-codeblock" style="margin:1.5rem 0;padding:0;overflow:hidden;border:1px solid var(--border);border-radius:8px">
          <div style="border-bottom:1px solid var(--border);padding:0.5rem 1rem;display:flex;align-items:center;justify-content:space-between;background:var(--muted)">
            <span style="font-family:monospace;color:var(--muted-foreground);font-size:0.75rem;font-weight:600">${lang.toUpperCase()}</span>
          </div>
          <pre style="padding:1.25rem;margin:0;overflow-x:auto;background:var(--card);color:inherit;font-family:inherit"><code>${escapeHtml(code.trim())}</code></pre>
        </div>`
      );
      return `__BLOCK_${idx}__`;
    });

    // Generic code blocks
    content = content.replace(/```[ \t]*\n([\s\S]*?)```/g, (_m, code) => {
      const idx = placeholders.length;
      placeholders.push(`<pre class="np-codeblock" style="margin:1.5rem 0;border:1px solid var(--border);border-radius:8px;padding:1.25rem;background:var(--card)"><code>${escapeHtml(code.trim())}</code></pre>`);
      return `__BLOCK_${idx}__`;
    });

    // Tables
    content = content.replace(/((?:\|.+\|\n?)+)/g, (match) => {
      const rows = match.trim().split("\n");
      if (rows.length < 2) return match;
      const headerRow = rows.shift() || "";
      rows.shift(); // separator
      const headerCells = headerRow.split("|").filter((c) => c.trim()).map((c) => c.trim());
      const headerHtml = `<thead><tr>${headerCells.map((c) => `<th style="padding:0.75rem 1rem;font-size:0.75rem;font-weight:600;color:var(--muted-foreground);border-bottom:1px solid var(--border);text-align:left">${c}</th>`).join("")}</tr></thead>`;
      const bodyHtml = rows.map((row) => {
        const cells = row.split("|").filter((c) => c.trim()).map((c) => c.trim());
        return `<tr style="border-bottom:1px solid var(--border)">${cells.map((c) => `<td style="padding:0.75rem 1rem;font-size:0.85rem;color:var(--foreground)">${c}</td>`).join("")}</tr>`;
      }).join("");
      return `<div style="overflow-x:auto;margin:1.5rem 0;border:1px solid var(--border);border-radius:8px"><table style="width:100%;border-collapse:collapse;background:var(--card)">${headerHtml}<tbody>${bodyHtml}</tbody></table></div>`;
    });

    // ### headings (give IDs for anchor navigation)
    content = content.replace(/^### (.*)$/gm, (_m, h3Title) => {
      const cleanH3 = h3Title.trim();
      const h3Id = cleanH3.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const cleanDisplay = cleanH3.replace(/^[0-9.]+\s*/, "").replace(/[`]/g, "").trim();
      toc.push({ id: h3Id, title: cleanDisplay || cleanH3, level: 3 });
      return `<h3 id="${h3Id}" style="font-size:1.1rem;font-weight:600;margin:2rem 0 0.75rem;scroll-margin-top:6rem;color:inherit">${cleanH3}</h3>`;
    });

    // Blockquotes
    content = content.replace(/^> (.*)$/gm, '<div style="border-left:2px solid var(--foreground);padding:0.75rem 1rem;margin:1rem 0;background:var(--muted);border-radius:0 6px 6px 0"><p style="font-size:0.9rem;color:var(--muted-foreground);margin:0">$1</p></div>');

    // Inline bold + code + links
    content = content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/`(.*?)`/g, '<code style="font-family:monospace;font-size:0.85em;background:var(--muted);padding:2px 6px;border-radius:4px;border:1px solid var(--border);color:inherit">$1</code>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="color:var(--foreground);text-decoration:underline;text-underline-offset:3px">$1</a>');

    // Unordered lists — collect consecutive - lines
    content = content.replace(/(^- .+(\n- .+)*)/gm, (match) => {
      const items = match.split("\n").filter(Boolean).map((line) => {
        const text = line.replace(/^- /, "");
        return `<li style="display:flex;align-items:flex-start;gap:0.75rem;margin-bottom:0.6rem"><span style="height:5px;width:5px;min-width:5px;border-radius:50%;background:var(--muted-foreground);margin-top:0.6rem;display:inline-block"></span><span style="font-size:0.9rem;color:var(--muted-foreground);line-height:1.6">${text}</span></li>`;
      }).join("");
      return `<ul style="margin:1rem 0;padding:0;list-style:none">${items}</ul>`;
    });

    // Paragraphs
    content = content.split("\n\n").filter(Boolean).map((p) => {
      const t = p.trim();
      if (t.startsWith("<") || t === "") return t;
      if (/^__BLOCK_\d+__$/.test(t)) return t;
      return `<p style="font-size:0.9rem;color:var(--muted-foreground);line-height:1.7;margin-bottom:0.9rem">${t}</p>`;
    }).join("\n");

    // 2. Restore code blocks
    content = content.replace(/__BLOCK_(\d+)__/g, (_match, p1) => {
      return placeholders[parseInt(p1, 10)] || _match;
    });

    return `
      <section id="${sectionId}" style="margin-bottom:2.5rem;scroll-margin-top:6rem">
        <div class="np-card" style="padding:2rem 2.5rem;background:var(--card);border:1px solid var(--border);border-radius:8px">
          <h2 style="font-size:1.35rem;font-weight:600;margin-bottom:1.5rem;border-left:2px solid var(--foreground);padding-left:0.75rem;color:inherit;line-height:1.3">${title}</h2>
          <div style="color:var(--foreground)">${content}</div>
        </div>
      </section>
    `;
  }).join("");

  return { renderedIntro, renderedSections, toc };
}

const DOC_SECTIONS = [
  {
    category: "Guides",
    items: [
      { slug: "master", label: "Master Guide" },
      { slug: "features", label: "Features & Analogies" },
      { slug: "concepts", label: "Core Concepts" },
      { slug: "android", label: "Android SDK" },
    ],
  },
  {
    category: "Reference",
    items: [
      { slug: "api", label: "API Reference" },
      { slug: "deployment", label: "Deployment Checklist" },
      { slug: "agents", label: "AI Directives" },
    ],
  },
];

export default async function DocDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const fileMap: Record<string, string> = {
    "features": "PRODUCT_DOCUMENTATION.md",
    "concepts": "CONCEPTS.md",
    "master": "MASTER_GUIDE.md",
    "api": "API_DOCS.md",
    "android": "ANDROID_INTEGRATION.md",
    "deployment": "DEPLOYMENT_CHECKLIST.md",
    "agents": "AGENTS.md",
    "webhooks": "MASTER_GUIDE.md",
  };

  const fileName = fileMap[slug];
  if (!fileName) notFound();

  let content: string;
  let renderedIntro: string;
  let renderedSections: string;
  let toc: TocItem[] = [];

  try {
    const filePath = path.join(process.cwd(), "docs-content", fileName);
    content = fs.readFileSync(filePath, "utf-8");
    const rendered = renderMarkdownAsCards(content);
    renderedIntro = rendered.renderedIntro;
    renderedSections = rendered.renderedSections;
    toc = rendered.toc;
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MermaidInitializer />
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="flex gap-8 items-start">
          {/* Left Navigation Tree */}
          <aside className="hidden lg:block w-56 shrink-0 sticky top-24 space-y-6">
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium text-xs mb-2 group"
            >
              <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
              All documentation
            </Link>

            {DOC_SECTIONS.map((section) => (
              <div key={section.category} className="space-y-2">
                <p className="text-xs font-semibold text-foreground">{section.category}</p>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = item.slug === slug;
                    return (
                      <Link
                        key={item.slug}
                        href={`/docs/${item.slug}`}
                        className={`block text-xs py-1.5 px-2.5 rounded-ui transition-colors ${
                          isActive
                            ? "bg-muted text-foreground font-semibold"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </aside>

          {/* Main Article Content */}
          <article className="flex-1 min-w-0 max-w-3xl">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border">
              <div className="px-2.5 py-1 rounded bg-muted text-foreground text-xs font-medium flex items-center gap-1.5 border border-border">
                <BookOpen className="h-3 w-3" />
                <span>Reference</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>5m read</span>
              </div>
            </div>

            <div
              className="mb-10"
              dangerouslySetInnerHTML={{ __html: renderedIntro }}
            />

            <div
              dangerouslySetInnerHTML={{ __html: renderedSections }}
            />

            <Card className="mt-16 p-8 text-center bg-card border border-border/50">
              <h4 className="text-lg font-semibold mb-2">Need direct engineering assistance?</h4>
              <p className="text-xs text-muted-foreground mb-6">Our team is active on email, GitHub, and Discord.</p>
              <div className="flex justify-center gap-3 flex-wrap">
                <a href="https://mail.google.com/mail/?view=cm&fs=1&to=nexpulse.team@gmail.com" target="_blank" rel="noopener noreferrer" className="np-btn-primary h-9 px-4 text-xs inline-flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" /> Email support
                </a>
                <Link href="https://github.com/inkand-paper/Optimizer" className="np-btn-outline h-9 px-4 text-xs inline-flex items-center gap-2">
                  <GitBranch className="h-3.5 w-3.5" /> Open issue
                </Link>
              </div>
            </Card>
          </article>

          {/* Right In-page Table of Contents */}
          {toc.length > 0 && (
            <aside className="hidden xl:block w-56 shrink-0 sticky top-24">
              <p className="text-xs font-semibold text-foreground mb-3">On this page</p>
              <nav className="space-y-1 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
                {toc.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={`block text-xs py-1 transition-colors text-muted-foreground hover:text-foreground line-clamp-1 ${
                      item.level === 3 ? "pl-3 text-[11px]" : "font-medium"
                    }`}
                  >
                    {item.title}
                  </a>
                ))}
              </nav>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}
