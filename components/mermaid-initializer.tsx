"use client";

import { useEffect } from "react";
import Script from "next/script";
import { useParams } from "next/navigation";

export function MermaidInitializer() {
  const params = useParams();
  const slug = params?.slug;

  useEffect(() => {
    const renderDiagrams = async () => {
      try {
        // Dynamically import mermaid to prevent SSR window errors
        const mermaid = (await import("mermaid")).default;
        
        mermaid.initialize({
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

        const elements = document.querySelectorAll<HTMLElement>(".mermaid");
        
        // Remove data-processed so they re-render if the slug changed
        elements.forEach(el => {
            el.removeAttribute('data-processed');
        });

        if (elements.length > 0) {
            await mermaid.run({ nodes: elements });
        }

        // Trigger Prism highlighting natively
        // @ts-expect-error Wait for dynamic import resolution
        if (typeof window !== "undefined" && window.Prism) {
          // @ts-expect-error Wait for dynamic import resolution
          window.Prism.highlightAll();
        }
      } catch (error) {
        console.error("Failed to render Mermaid diagram:", error);
      }
    };

    renderDiagrams();
  }, [slug]);

  return (
    <>
      {/* Prism Theme */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css"
      />

      {/* Prism Core */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"
        strategy="afterInteractive"
      />

      {/* Prism Autoloader */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js"
        strategy="afterInteractive"
      />
    </>
  );
}
