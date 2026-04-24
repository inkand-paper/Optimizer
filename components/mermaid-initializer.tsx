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
        startOnLoad: true,
        theme: "neutral",
        securityLevel: "loose",
      });
      // @ts-ignore
      window.mermaid.contentLoaded();
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
    // Wait for CDN script to load or check if already present
    if (document.readyState === "complete") {
      initMermaid();
    } else {
      window.addEventListener("load", initMermaid);
      return () => window.removeEventListener("load", initMermaid);
    }
  }, [initMermaid]);

  return (
    <>
      {/* Prism Theme - Tomorrow Night for a premium look */}
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
      
      {/* Prism Script */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"
        strategy="afterInteractive"
        onReady={initMermaid}
      />
      
      {/* Prism Autoloader - Handles all languages dynamically */}
      <Script 
        src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js" 
        strategy="afterInteractive"
      />
    </>
  );
}
