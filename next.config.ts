import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Docker standalone deployment
  output: "standalone",
  
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // Logging for production observability
  logging: {
    fetches: {
      fullUrl: true,
    }
  }
};

export default nextConfig;
