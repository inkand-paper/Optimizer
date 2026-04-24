import { describe, it, expect } from 'vitest';
import { analyzePerformance } from '../../core/analyzer/performance';

function makeHeaders(entries: Record<string, string>): Headers {
  const h = new Headers();
  for (const [k, v] of Object.entries(entries)) h.set(k, v);
  return h;
}

const FAST_HTML  = '<html>' + '<script src="a.js"></script>'.repeat(5) + '<link rel="stylesheet" />'.repeat(2) + '</html>';
const HEAVY_HTML = '<html>' + '<script src="a.js"></script>'.repeat(15) + '<link rel="stylesheet" />'.repeat(7) + '</html>';
const GZIP_HEADERS = makeHeaders({ 'content-encoding': 'gzip' });
const BROTLI_HEADERS = makeHeaders({ 'content-encoding': 'br' });
const EMPTY_HEADERS = makeHeaders({});

describe('Performance Analyzer', () => {
  it('should return score, metrics, and suggestions', () => {
    const result = analyzePerformance(FAST_HTML, 300, GZIP_HEADERS);
    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('metrics');
    expect(result).toHaveProperty('suggestions');
  });

  it('should give full score for fast load + few assets + gzip', () => {
    const result = analyzePerformance(FAST_HTML, 300, GZIP_HEADERS);
    // < 500ms(50) + <10 scripts(15) + <5 css(15) + compressed(20) = 100
    expect(result.score).toBe(100);
    expect(result.suggestions).toHaveLength(0);
  });

  it('should award 50 points for sub-500ms load time', () => {
    const result = analyzePerformance(FAST_HTML, 400, GZIP_HEADERS);
    expect(result.score).toBeGreaterThanOrEqual(50);
  });

  it('should award 40 points for 500–999ms load time', () => {
    const result = analyzePerformance(FAST_HTML, 750, GZIP_HEADERS);
    // 40 + 15 + 15 + 20 = 90
    expect(result.score).toBe(90);
  });

  it('should penalise load time over 2 seconds', () => {
    const result = analyzePerformance(FAST_HTML, 3000, GZIP_HEADERS);
    expect(result.suggestions.some(s => s.includes('very slow'))).toBe(true);
  });

  it('should detect gzip compression', () => {
    const result = analyzePerformance(FAST_HTML, 300, GZIP_HEADERS);
    expect(result.metrics.isCompressed).toBe(true);
  });

  it('should detect brotli compression', () => {
    const result = analyzePerformance(FAST_HTML, 300, BROTLI_HEADERS);
    expect(result.metrics.isCompressed).toBe(true);
  });

  it('should penalise missing compression', () => {
    const result = analyzePerformance(FAST_HTML, 300, EMPTY_HEADERS);
    expect(result.metrics.isCompressed).toBe(false);
    expect(result.suggestions).toContain('Content is not compressed (Gzip/Brotli). This increases load time.');
  });

  it('should penalise too many scripts', () => {
    const result = analyzePerformance(HEAVY_HTML, 300, GZIP_HEADERS);
    expect(result.metrics.scriptCount).toBeGreaterThan(10);
    expect(result.suggestions.some(s => s.includes('scripts'))).toBe(true);
  });

  it('should penalise too many CSS files', () => {
    const result = analyzePerformance(HEAVY_HTML, 300, GZIP_HEADERS);
    expect(result.metrics.cssCount).toBeGreaterThan(5);
    expect(result.suggestions.some(s => s.includes('CSS'))).toBe(true);
  });

  it('should record loadTimeMs in metrics', () => {
    const result = analyzePerformance(FAST_HTML, 450, GZIP_HEADERS);
    expect(result.metrics.loadTimeMs).toBe(450);
  });

  it('should count img tags in metrics', () => {
    const html = '<html><img src="a.png" /><img src="b.png" /></html>';
    const result = analyzePerformance(html, 300, GZIP_HEADERS);
    expect(result.metrics.imageCount).toBe(2);
  });
});
