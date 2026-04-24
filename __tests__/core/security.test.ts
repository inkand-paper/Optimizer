import { describe, it, expect } from 'vitest';
import { analyzeSecurity } from '../../core/analyzer/security';

function makeHeaders(entries: Record<string, string>): Headers {
  const h = new Headers();
  for (const [key, value] of Object.entries(entries)) {
    h.set(key, value);
  }
  return h;
}

const FULL_SECURITY_HEADERS = makeHeaders({
  'content-security-policy': "default-src 'self'",
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  'x-frame-options': 'DENY',
  'x-xss-protection': '1; mode=block',
});

const EMPTY_HEADERS = makeHeaders({});

describe('Security Analyzer', () => {
  it('should give full score for HTTPS + all security headers', () => {
    const result = analyzeSecurity('https://example.com', FULL_SECURITY_HEADERS);
    expect(result.score).toBe(100);
    expect(result.suggestions).toHaveLength(0);
  });

  it('should detect HTTPS correctly', () => {
    const result = analyzeSecurity('https://example.com', EMPTY_HEADERS);
    expect(result.metrics.isHttps).toBe(true);
  });

  it('should detect HTTP (non-secure) correctly', () => {
    const result = analyzeSecurity('http://example.com', EMPTY_HEADERS);
    expect(result.metrics.isHttps).toBe(false);
  });

  it('should heavily penalise HTTP sites', () => {
    const result = analyzeSecurity('http://example.com', EMPTY_HEADERS);
    expect(result.score).toBe(0);
    expect(result.suggestions).toContain('Site is not using HTTPS. This is a critical security risk.');
  });

  it('should detect Content-Security-Policy header', () => {
    const result = analyzeSecurity('https://x.com', makeHeaders({
      'content-security-policy': "default-src 'self'",
    }));
    expect(result.metrics.hasCsp).toBe(true);
  });

  it('should warn about missing CSP', () => {
    const result = analyzeSecurity('https://example.com', EMPTY_HEADERS);
    expect(result.suggestions).toContain('Missing Content-Security-Policy (CSP) header.');
  });

  it('should detect HSTS header', () => {
    const result = analyzeSecurity('https://x.com', makeHeaders({
      'strict-transport-security': 'max-age=31536000',
    }));
    expect(result.metrics.hasHsts).toBe(true);
  });

  it('should warn about missing HSTS', () => {
    const result = analyzeSecurity('https://example.com', EMPTY_HEADERS);
    expect(result.suggestions).toContain('Missing Strict-Transport-Security (HSTS) header.');
  });

  it('should detect X-Frame-Options header', () => {
    const result = analyzeSecurity('https://x.com', makeHeaders({
      'x-frame-options': 'DENY',
    }));
    expect(result.metrics.hasXFrame).toBe(true);
  });

  it('should warn about clickjacking risk when X-Frame-Options missing', () => {
    const result = analyzeSecurity('https://example.com', EMPTY_HEADERS);
    expect(result.suggestions).toContain('Missing X-Frame-Options header (vulnerable to clickjacking).');
  });

  it('should detect X-XSS-Protection header', () => {
    const result = analyzeSecurity('https://x.com', makeHeaders({
      'x-xss-protection': '1; mode=block',
    }));
    expect(result.metrics.hasXssProtection).toBe(true);
  });

  it('should warn when server header reveals info', () => {
    const result = analyzeSecurity('https://x.com', makeHeaders({
      'server': 'Apache/2.4.51',
    }));
    expect(result.suggestions.some(s => s.includes('Server header reveals'))).toBe(true);
  });

  it('should return partial score for partial headers', () => {
    const result = analyzeSecurity('https://x.com', makeHeaders({
      'content-security-policy': "default-src 'self'",
      'strict-transport-security': 'max-age=31536000',
    }));
    // HTTPS(40) + CSP(20) + HSTS(15) = 75
    expect(result.score).toBe(75);
  });
});
