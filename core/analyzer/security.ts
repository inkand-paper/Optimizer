export interface SecurityMetrics {
  isHttps: boolean;
  hasCsp: boolean;
  hasHsts: boolean;
  hasXFrame: boolean;
  hasXssProtection: boolean;
  serverHeader?: string;
}

export function analyzeSecurity(url: string, headers: Headers): { score: number; metrics: SecurityMetrics; suggestions: string[] } {
  const suggestions: string[] = [];
  let score = 0;

  const isHttps = url.startsWith('https:');
  const hasCsp = headers.has('content-security-policy');
  const hasHsts = headers.has('strict-transport-security');
  const hasXFrame = headers.has('x-frame-options');
  const hasXssProtection = headers.has('x-xss-protection');
  const serverHeader = headers.get('server') || undefined;

  if (isHttps) {
    score += 40;
  } else {
    suggestions.push("Site is not using HTTPS. This is a critical security risk.");
  }

  if (hasCsp) {
    score += 20;
  } else {
    suggestions.push("Missing Content-Security-Policy (CSP) header.");
  }

  if (hasHsts) {
    score += 15;
  } else {
    suggestions.push("Missing Strict-Transport-Security (HSTS) header.");
  }

  if (hasXFrame) {
    score += 15;
  } else {
    suggestions.push("Missing X-Frame-Options header (vulnerable to clickjacking).");
  }

  if (hasXssProtection) {
    score += 10;
  } else {
    suggestions.push("Missing X-XSS-Protection header.");
  }

  // Penalty for revealing server info
  if (serverHeader && serverHeader.length > 0) {
    suggestions.push(`Server header reveals information: ${serverHeader}`);
  }

  const metrics: SecurityMetrics = {
    isHttps,
    hasCsp,
    hasHsts,
    hasXFrame,
    hasXssProtection,
    serverHeader
  };

  return { score, metrics, suggestions };
}
