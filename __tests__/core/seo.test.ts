import { describe, it, expect } from 'vitest';
import { analyzeSeo } from '../../core/analyzer/seo';

const GOOD_HTML = `
<html>
  <head>
    <title>The Best Widget Shop — Premium Quality</title>
    <meta name="description" content="Buy the best widgets online. Top quality, fast shipping, 30-day returns." />
    <meta property="og:image" content="https://example.com/og.png" />
    <link rel="canonical" href="https://example.com/widgets" />
  </head>
  <body>
    <h1>Welcome to Widget Shop</h1>
    <p>We sell great widgets.</p>
  </body>
</html>
`;

const BARE_HTML = `<html><body><p>Hello</p></body></html>`;

const MULTI_H1_HTML = `
<html><head>
  <title>Page Title</title>
  <meta name="description" content="A decent description that is long enough to pass." />
</head><body>
  <h1>First Heading</h1>
  <h1>Second Heading</h1>
</body></html>
`;

describe('SEO Analyzer', () => {
  it('should score a perfect page highly', () => {
    const result = analyzeSeo(GOOD_HTML);
    expect(result.score).toBe(100);
    expect(result.suggestions).toHaveLength(0);
  });

  it('should detect a title tag', () => {
    const result = analyzeSeo(GOOD_HTML);
    expect(result.metrics.hasTitle).toBe(true);
    expect(result.metrics.titleText).toBe('The Best Widget Shop — Premium Quality');
  });

  it('should detect a meta description', () => {
    const result = analyzeSeo(GOOD_HTML);
    expect(result.metrics.hasDescription).toBe(true);
  });

  it('should detect exactly one H1', () => {
    const result = analyzeSeo(GOOD_HTML);
    expect(result.metrics.h1Count).toBe(1);
  });

  it('should detect og:image', () => {
    const result = analyzeSeo(GOOD_HTML);
    expect(result.metrics.ogImage).toBe('https://example.com/og.png');
  });

  it('should detect canonical URL', () => {
    const result = analyzeSeo(GOOD_HTML);
    expect(result.metrics.canonicalUrl).toBe('https://example.com/widgets');
  });

  it('should score a bare page at 0', () => {
    const result = analyzeSeo(BARE_HTML);
    expect(result.score).toBe(0);
    expect(result.suggestions.length).toBeGreaterThan(0);
  });

  it('should penalise missing title tag', () => {
    const result = analyzeSeo(BARE_HTML);
    expect(result.suggestions).toContain('Missing <title> tag.');
  });

  it('should penalise missing meta description', () => {
    const result = analyzeSeo(BARE_HTML);
    expect(result.suggestions).toContain('Missing meta description.');
  });

  it('should penalise missing H1', () => {
    const result = analyzeSeo(BARE_HTML);
    expect(result.suggestions).toContain('Missing <h1> tag.');
  });

  it('should warn about multiple H1 tags', () => {
    const result = analyzeSeo(MULTI_H1_HTML);
    expect(result.metrics.h1Count).toBe(2);
    expect(result.suggestions.some(s => s.includes('Multiple'))).toBe(true);
  });

  it('should warn when title is too short', () => {
    const html = `<html><head><title>Hi</title><meta name="description" content="A decent description that is long enough." /><link rel="canonical" href="https://x.com" /></head><body><h1>H</h1></body></html>`;
    const result = analyzeSeo(html);
    expect(result.suggestions).toContain('Title is too short.');
  });

  it('should warn when title is too long', () => {
    const longTitle = 'A'.repeat(70);
    const html = `<html><head><title>${longTitle}</title></head></html>`;
    const result = analyzeSeo(html);
    expect(result.suggestions).toContain('Title is too long (over 60 chars).');
  });
});
