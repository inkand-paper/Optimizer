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
        /* Functional status colors (STRICTLY for data signals) */
        "status-up":    "rgb(var(--status-up) / <alpha-value>)",
        "status-down":  "rgb(var(--status-down) / <alpha-value>)",
        "status-warn":  "rgb(var(--status-warn) / <alpha-value>)",

        /* Semantic design tokens */
        background:     "rgb(var(--background) / <alpha-value>)",
        foreground:     "rgb(var(--foreground) / <alpha-value>)",
        card: {
          DEFAULT: "rgb(var(--card) / <alpha-value>)",
          foreground: "rgb(var(--card-foreground) / <alpha-value>)",
        },
        "surface-raised": "rgb(var(--surface-raised) / <alpha-value>)",
        muted: {
          DEFAULT: "rgb(var(--muted) / <alpha-value>)",
          foreground: "rgb(var(--muted-foreground) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",
          foreground: "rgb(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--secondary) / <alpha-value>)",
          foreground: "rgb(var(--secondary-foreground) / <alpha-value>)",
        },
        border:         "rgb(var(--border) / <alpha-value>)",
        "border-strong":"rgb(var(--border-strong) / <alpha-value>)",
        input:          "rgb(var(--input) / <alpha-value>)",
        ring:           "rgb(var(--ring) / <alpha-value>)",
        destructive: {
          DEFAULT: "rgb(var(--destructive) / <alpha-value>)",
          foreground: "rgb(var(--destructive-foreground) / <alpha-value>)",
        },

        /* Backward compatibility aliases */
        "np-teal":     "rgb(var(--np-teal) / <alpha-value>)",
        "np-crimson":  "rgb(var(--np-crimson) / <alpha-value>)",
        "np-amber":    "rgb(var(--np-amber) / <alpha-value>)",
        "np-ink":      "rgb(var(--np-ink) / <alpha-value>)",
        "np-vellum":   "rgb(var(--np-vellum) / <alpha-value>)",
        "np-obsidian": "rgb(var(--np-obsidian) / <alpha-value>)",
        "np-steel":    "rgb(var(--np-steel) / <alpha-value>)",
        "np-slate":    "rgb(var(--np-slate) / <alpha-value>)",
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
