import { analyzeSeo, SeoMetrics } from './seo';
import { analyzeSecurity, SecurityMetrics } from './security';
import { analyzePerformance, PerformanceMetrics } from './performance';

export interface FullAuditResult {
  url: string;
  timestamp: string;
  overallScore: number;
  sections: {
    seo: { score: number; metrics: SeoMetrics; suggestions: string[] };
    security: { score: number; metrics: SecurityMetrics; suggestions: string[] };
    performance: { score: number; metrics: PerformanceMetrics; suggestions: string[] };
  };
}

export async function runFullAudit(url: string): Promise<FullAuditResult> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'NextOptimizerBot/2.0' },
      next: { revalidate: 0 }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    const loadTimeMs = Date.now() - startTime;
    const headers = response.headers;

    const seoResult = analyzeSeo(html);
    const securityResult = analyzeSecurity(url, headers);
    const performanceResult = analyzePerformance(html, loadTimeMs, headers);

    const overallScore = Math.round(
      (seoResult.score * 0.4) + 
      (securityResult.score * 0.3) + 
      (performanceResult.score * 0.3)
    );

    return {
      url,
      timestamp: new Date().toISOString(),
      overallScore,
      sections: {
        seo: seoResult,
        security: securityResult,
        performance: performanceResult
      }
    };
  } catch (error) {
    throw new Error(`Audit failed for ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
