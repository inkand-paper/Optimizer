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