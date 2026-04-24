export interface SeoMetrics {
  hasTitle: boolean;
  titleText?: string;
  hasDescription: boolean;
  descriptionText?: string;
  h1Count: number;
  hasKeywords: boolean;
  canonicalUrl?: string;
  ogImage?: string;
}

export function analyzeSeo(html: string): { score: number; metrics: SeoMetrics; suggestions: string[] } {
  const suggestions: string[] = [];
  let score = 0;

  // Title
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  const hasTitle = !!titleMatch;
  const titleText = titleMatch?.[1]?.trim();

  // Description
  const descMatch = html.match(/<meta name="description" content="(.*?)"/i) || 
                    html.match(/<meta content="(.*?)" name="description"/i);
  const hasDescription = !!descMatch;
  const descriptionText = descMatch?.[1]?.trim();

  // H1
  const h1Matches = html.match(/<h1.*?>.*?<\/h1>/gi) || [];
  const h1Count = h1Matches.length;

  // OG Image
  const ogImageMatch = html.match(/<meta property="og:image" content="(.*?)"/i);
  const ogImage = ogImageMatch?.[1];

  // Canonical
  const canonicalMatch = html.match(/<link rel="canonical" href="(.*?)"/i);
  const canonicalUrl = canonicalMatch?.[1];

  // Keywords
  const hasKeywords = /<meta name="keywords"/i.test(html);

  // Scoring & Suggestions
  if (hasTitle) {
    score += 30;
    if (titleText && titleText.length < 10) suggestions.push("Title is too short.");
    if (titleText && titleText.length > 60) suggestions.push("Title is too long (over 60 chars).");
  } else {
    suggestions.push("Missing <title> tag.");
  }

  if (hasDescription) {
    score += 30;
    if (descriptionText && descriptionText.length < 50) suggestions.push("Meta description is too short.");
    if (descriptionText && descriptionText.length > 160) suggestions.push("Meta description is too long.");
  } else {
    suggestions.push("Missing meta description.");
  }

  if (h1Count === 1) {
    score += 20;
  } else if (h1Count === 0) {
    suggestions.push("Missing <h1> tag.");
  } else {
    suggestions.push(`Multiple <h1> tags found (${h1Count}). Best practice is exactly one.`);
  }

  if (ogImage) score += 10;
  else suggestions.push("Missing OpenGraph image (og:image).");

  if (canonicalUrl) score += 10;
  else suggestions.push("Missing canonical URL.");

  const metrics: SeoMetrics = {
    hasTitle,
    titleText,
    hasDescription,
    descriptionText,
    h1Count,
    hasKeywords,
    canonicalUrl,
    ogImage
  };

  return { score, metrics, suggestions };
}
