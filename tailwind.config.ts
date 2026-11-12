import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      screens: { xs: "375px" },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        /* Functional status colors */
        "np-teal":     "var(--np-teal)",
        "np-crimson":  "var(--np-crimson)",
        "np-amber":    "var(--np-amber)",

        /* Monochromatic neutral aliases */
        "np-gold":     "var(--np-gold)",
        "np-ink":      "var(--np-ink)",
        "np-vellum":   "var(--np-vellum)",
        "np-obsidian": "var(--np-obsidian)",
        "np-steel":    "var(--np-steel)",
        "np-slate":    "var(--np-slate)",

        /* Semantic design tokens */
        background:    "var(--background)",
        foreground:    "var(--foreground)",
        card:          "var(--card)",
        "card-foreground": "var(--card-foreground)",
        muted:         "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        primary:       "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",
        secondary:     "var(--secondary)",
        "secondary-foreground": "var(--secondary-foreground)",
        border:        "var(--border)",
        "border-strong": "var(--border-strong)",
        input:         "var(--input)",
        ring:          "var(--ring)",
        destructive:   "var(--destructive)",
        "destructive-foreground": "var(--destructive-foreground)",
      },
      borderRadius: {
        card: "8px",
        ui:   "6px",
        xl:   "10px",
        lg:   "8px",
        md:   "6px",
        sm:   "4px",
      },
    },
  },
  plugins: [],
};

export default config;
