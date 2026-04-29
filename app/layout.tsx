import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Script from "next/script";

// Force re-compile after emergency restore: 2026-04-29T17:42
export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000')),
  title: "Next.js Optimizer Suite: Universal Monitoring & Analytics", 
  description: "Secure, high-performance cache revalidation, system health monitoring, and analytics for Next.js applications. Maximize your digital performance today.",
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en-US',
    },
  },
  openGraph: {
    title: "Next.js Optimizer Suite: Universal Monitoring & Analytics",
    description: "Secure, high-performance cache revalidation and system health monitoring for Next.js applications.",
    url: '/',
    siteName: 'Next.js Optimizer Suite',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Next.js Optimizer Suite",
    description: "High-performance cache revalidation and monitoring for Next.js apps.",
    creator: '@abirmajid',
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "Next.js Optimizer Suite",
      "operatingSystem": "Web",
      "applicationCategory": "DeveloperApplication",
      "description": "Secure, high-performance cache revalidation and health monitoring for Next.js applications.",
      "url": "https://nextjs-optimizer-suite.vercel.app"
    },
    {
      "@type": "Organization",
      "name": "Next.js Optimizer",
      "url": "https://nextjs-optimizer-suite.vercel.app",
      "logo": "https://nextjs-optimizer-suite.vercel.app/logo.png",
      "sameAs": [
        "https://linkedin.com/company/nextjsoptimizer"
      ]
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        {/* Schema.org Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>

        {/* Official Analytics Tracking Tool (Next.js Optimized) */}
        <Script 
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX" 
          strategy="afterInteractive" 
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX');
          `}
        </Script>
      </body>
    </html>
  );
}
