import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // Dynamically resolve the base URL using standard Vercel environment variables or localhost fallback
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard/settings/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
