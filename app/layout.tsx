import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000')),
  title: "NexPulse Universal: High-Performance Asset Monitoring & Purge Engine", 
  description: "The universal command center for modern web assets. Monitor health, analyze performance, and revalidate cache across any framework with NexPulse Universal.",
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "NexPulse Universal: Any Framework, One Dashboard",
    description: "Universal performance monitoring and cache revalidation for the modern web.",
    url: '/',
    siteName: 'NexPulse Universal',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "NexPulse Universal",
    description: "The universal performance command center for modern web apps.",
    creator: '@abirmajid',
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "NexPulse Universal",
      "operatingSystem": "Web",
      "applicationCategory": "DeveloperApplication",
      "description": "Universal high-performance cache revalidation and health monitoring for all modern web frameworks.",
      "url": "https://nextjs-optimizer-suite.vercel.app",
      "author": {
        "@type": "Organization",
        "name": "Next.js Optimizer",
        "url": "https://nextjs-optimizer-suite.vercel.app"
      }
    },
    {
      "@type": "Organization",
      "name": "NexPulse",
      "url": "https://nextjs-optimizer-suite.vercel.app",
      "logo": "https://nextjs-optimizer-suite.vercel.app/logo.png",
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "tabir8431@gmail.com",
        "contactType": "technical support"
      }
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} h-full antialiased`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300 font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
