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
    "The universal command center for modern web assets. Monitor health, analyse performance, revalidate cache, and audit source code across any framework.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "NexPulse | Any Framework, One Dashboard",
    description: "Universal performance monitoring, cache revalidation, and AI-powered code auditing.",
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
