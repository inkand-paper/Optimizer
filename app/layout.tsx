import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

import { InfrastructureProvider } from "@/components/infrastructure-provider";
import { PulseAI } from "@/components/pulse-ai";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000")
  ),
  title: "NexPulse",
  description:
    "The unified observability and resilience console for modern web infrastructure. Real-time synthetic monitors, instant edge cache revalidation, automated incident runbooks, and pre-merge code security audits.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "NexPulse | Infrastructure Observability & Resilience Console",
    description: "Real-time synthetic monitors, instant edge cache revalidation, automated incident runbooks, and pre-merge code security audits across modern frameworks.",
    url: "/",
    siteName: "NexPulse",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body 
        className="min-h-screen flex flex-col bg-background text-foreground antialiased"
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <InfrastructureProvider />
          {children}
          <PulseAI />
        </ThemeProvider>
      </body>
    </html>
  );
}
