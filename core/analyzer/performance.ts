export interface PerformanceMetrics {
  loadTimeMs: number;
  scriptCount: number;
  imageCount: number;
  cssCount: number;
  isCompressed: boolean;
}

export function analyzePerformance(html: string, loadTimeMs: number, headers: Headers): { score: number; metrics: PerformanceMetrics; suggestions: string[] } {
  const suggestions: string[] = [];
  let score = 0;

  const scriptCount = (html.match(/<script/gi) || []).length;
  const imageCount = (html.match(/<img/gi) || []).length;
  const cssCount = (html.match(/<link rel="stylesheet"/gi) || []).length;
  const isCompressed = headers.get('content-encoding') === 'gzip' || headers.get('content-encoding') === 'br';

  // Scoring based on load time
  if (loadTimeMs < 500) {
    score += 50;
  } else if (loadTimeMs < 1000) {
    score += 40;
  } else if (loadTimeMs < 2000) {
    score += 25;
    suggestions.push("Load time is a bit slow (over 1s).");
  } else {
    score += 10;
    suggestions.push("Load time is very slow (over 2s). Consider optimizing assets.");
  }

  // Assets scoring
  if (scriptCount < 10) score += 15;
  else suggestions.push(`High number of scripts (${scriptCount}). Consider bundling or lazy loading.`);

  if (cssCount < 5) score += 15;
  else suggestions.push(`High number of CSS files (${cssCount}). Consider merging them.`);

  if (isCompressed) {
    score += 20;
  } else {
    suggestions.push("Content is not compressed (Gzip/Brotli). This increases load time.");
  }

  const metrics: PerformanceMetrics = {
    loadTimeMs,
    scriptCount,
    imageCount,
    cssCount,
    isCompressed
  };

  return { score, metrics, suggestions };
}
