import type { SeoMetrics } from '@/core/analyzer/seo';
import type { SecurityMetrics } from '@/core/analyzer/security';
import type { PerformanceMetrics } from '@/core/analyzer/performance';

// Request types
export interface RevalidateRequest {
  path?: string;
  tag?: string;
}

// Response types
export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: {
    seconds: number;
    minutes: number;
    hours: string;
  };
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  environment: string;
  version: string;
  endpoints: {
    health: string;
    revalidate: string;
  };
}

export interface RevalidateResponse {
  success: boolean;
  revalidated?: {
    type: 'path' | 'tag';
    value: string;
  };
  timestamp?: string;
  error?: string;
  message?: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  timestamp?: string;
}

// Analysis types
export interface AnalyzeRequest {
  url: string;
}

export interface AnalyzeResponse {
  success: boolean;
  results: {
    url: string;
    overallScore: number;
    sections: {
      seo: { score: number; metrics: SeoMetrics; suggestions: string[] };
      security: { score: number; metrics: SecurityMetrics; suggestions: string[] };
      performance: { score: number; metrics: PerformanceMetrics; suggestions: string[] };
    };
  };
  aiInsight?: string | null;
  timestamp: string;
}

