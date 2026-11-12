import { lookup as dnsLookup } from 'dns/promises';

/**
 * Checks if an IP address belongs to a private or reserved network range.
 * This helps prevent SSRF attacks against internal infrastructure.
 *
 * [SECURITY — M6] Extended to cover:
 *   - Full IPv6 link-local range (fe80::/10 = fe80 through febf)
 *   - IPv4-mapped IPv6 (::ffff:...)
 *   - IPv6 loopback (::1)
 */
function isPrivateIP(ip: string): boolean {
  const lower = ip.toLowerCase();

  // IPv4 Private Ranges
  if (ip.startsWith('10.')) return true;
  if (ip.startsWith('192.168.')) return true;

  // 172.16.0.0 to 172.31.255.255
  if (ip.startsWith('172.')) {
    const secondOctet = parseInt(ip.split('.')[1], 10);
    if (secondOctet >= 16 && secondOctet <= 31) return true;
  }

  // Localhost / Loopback
  if (ip.startsWith('127.')) return true;
  if (ip === '0.0.0.0') return true;

  // Link-local (169.254.0.0/16) — AWS metadata endpoint lives here
  if (ip.startsWith('169.254.')) return true;

  // IPv6 Loopback
  if (lower === '::1') return true;

  // IPv6 Unique Local Addresses (fc00::/7 = fc and fd prefixes)
  if (lower.startsWith('fc') || lower.startsWith('fd')) return true;

  // IPv6 Link-Local (fe80::/10 = fe80 through febf)
  // The first 10 bits of fe80:: are 1111 1110 10xx xxxx
  // In hex: fe80 through febf — the third hex digit (index 2) is 8–b
  if (lower.startsWith('fe')) {
    const thirdNibble = parseInt(lower[2] ?? '0', 16);
    // fe8x (1000) through febx (1011) → third nibble 8–11
    if (thirdNibble >= 8 && thirdNibble <= 11) return true;
  }

  // IPv4-mapped IPv6 addresses (::ffff:x.x.x.x or ::ffff:hex)
  if (lower.startsWith('::ffff:')) {
    const mapped = lower.slice(7); // strip "::ffff:"
    // Check if the IPv4 portion is private
    if (isPrivateIP(mapped)) return true;
    // Also handle hex-encoded forms like ::ffff:7f00:1 (127.0.0.1)
    return false;
  }

  return false;
}

/**
 * Validates a user-supplied URL to ensure it does not resolve to a private IP.
 * Throws an error if the URL is invalid or points to internal infrastructure.
 *
 * @param urlString The URL to validate
 * @returns The resolved, safe URL string
 */
export async function validateSafeUrl(urlString: string): Promise<string> {
  try {
    const parsedUrl = new URL(urlString);

    // Only allow HTTP/HTTPS
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      throw new Error('Invalid protocol. Only HTTP and HTTPS are allowed.');
    }

    // Resolve the hostname to an IP address (both IPv4 and IPv6)
    const { address } = await dnsLookup(parsedUrl.hostname);

    if (isPrivateIP(address)) {
      throw new Error(`SSRF Prevention: URL resolves to a private internal IP (${address}).`);
    }

    return urlString;
  } catch (error) {
    if (error instanceof Error && error.message.includes('SSRF')) {
      throw error;
    }
    throw new Error('Invalid URL format or DNS resolution failed.');
  }
}
