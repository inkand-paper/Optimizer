"use client";

import { useEffect, useCallback } from "react";
import Script from "next/script";
import { useParams } from "next/navigation";

export function MermaidInitializer() {
  const params = useParams();
  const slug = params?.slug;

  const initMermaid = useCallback(() => {
    // @ts-ignore
    if (typeof window !== "undefined" && window.mermaid) {
      // @ts-ignore
      window.mermaid.initialize({
        startOnLoad: false,
        theme: "dark",
        securityLevel: "loose",
        fontFamily: "monospace",
        themeVariables: {
          background: "#0a0a0a",
          primaryColor: "#B48C3C",
          primaryTextColor: "#fff",
          primaryBorderColor: "#B48C3C",
          lineColor: "#B48C3C80",
          secondaryColor: "#1a1a1a",
          tertiaryColor: "#2a2a2a",
          clusterBkg: "#0d0d0d",
          clusterBorder: "#B48C3C33",
        },
      });

      const elements = document.querySelectorAll(".mermaid");
      elements.forEach(async (el, index) => {
        if (el.getAttribute("data-processed")) return;
        el.setAttribute("data-processed", "true");

        try {
          const code = el.textContent || "";
          const id = `mermaid-svg-${Date.now()}-${index}`;
          // @ts-ignore
          const { svg } = await window.mermaid.render(id, code);
          el.innerHTML = svg;
        } catch (e) {
          console.error("Mermaid render error:", e);
        }
      });
    }

    // Trigger Prism highlighting
    // @ts-ignore
    if (typeof window !== "undefined" && window.Prism) {
      // @ts-ignore
      window.Prism.highlightAll();
    }
  }, []);

  useEffect(() => {
    initMermaid();
  }, [slug, initMermaid]);

  useEffect(() => {
    if (document.readyState === "complete") {
      initMermaid();
    } else {
      window.addEventListener("load", initMermaid);
      return () => window.removeEventListener("load", initMermaid);
    }
  }, [initMermaid]);

  return (
    <>
      {/* Font Awesome 6 (Free) */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />

      {/* Prism Theme */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css"
      />

      {/* Mermaid Script */}
      <Script
        src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"
        strategy="afterInteractive"
        onReady={initMermaid}
      />

      {/* Prism Core */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"
        strategy="afterInteractive"
        onReady={initMermaid}
      />

      {/* Prism Autoloader */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js"
        strategy="afterInteractive"
      />
    </>
  );
}
