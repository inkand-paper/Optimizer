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
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        /* Warm Obsidian tokens */
        "np-gold":     "#B48C3C",
        "np-teal":     "#1D9E75",
        "np-crimson":  "#A32D2D",
        "np-ink":      "#1A1A18",
        "np-vellum":   "#F5F3EE",
        "np-obsidian": "#0D0F11",
        "np-steel":    "#16191E",
        "np-slate":    "#6B6A66",
        /* Semantic aliases */
        background:    "var(--background)",
        foreground:    "var(--foreground)",
        card:          "var(--card)",
        "card-foreground": "var(--card-foreground)",
        muted:         "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        primary:       "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",
        secondary:     "var(--secondary)",
        border:        "var(--border)",
        input:         "var(--input)",
        ring:          "var(--ring)",
        destructive:   "var(--destructive)",
      },
      borderRadius: {
        card: "12px",
        ui:   "8px",
        xl:   "12px",
        lg:   "8px",
        md:   "6px",
        sm:   "4px",
      },
    },
  },
  plugins: [],
};
export default config;
