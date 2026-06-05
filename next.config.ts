import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for ESM-only packages like p-queue
  transpilePackages: ["p-queue", "p-limit", "eventemitter3", "p-timeout"],

  // Required for Docker standalone deployment
  output: "standalone",
  allowedDevOrigins: ["turbine-importer-anyway.ngrok-free.dev", "localhost:3000"],
  
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // Logging for production observability
  logging: {
    fetches: {
      fullUrl: true,
    }
  },

  // Image Optimization - allow Gravatar and data URIs; optimize everything else
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www.gravatar.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  
  // Strict Security Headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Content-Security-Policy",
            value: [
              // script-src: removed unsafe-eval globally; mermaid and next/image need it at runtime
              // so we allow it only via nonce in production (Vercel auto-injects).
              // unsafe-inline kept for Next.js inline hydration scripts.
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://vercel.live",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https: http://localhost:3000 ws://localhost:3000 wss://localhost:3000",
              "worker-src 'self' blob:",
            ].join('; '),
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          }
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  // Suppresses source map uploading logs during bundling
  silent: true,
  org: "inkand-paper",
  project: "nexpulse",

  // Upload a larger set of source maps for prettier stack traces
  widenClientFileUpload: true,
});
