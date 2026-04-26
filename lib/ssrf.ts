import dns from 'dns';
import { promisify } from 'util';

const lookupAsync = promisify(dns.lookup);

/**
 * Checks if an IP address belongs to a private or reserved network range.
 * This helps prevent SSRF attacks against internal infrastructure.
 */
function isPrivateIP(ip: string): boolean {
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

  // IPv6 Localhost and Unique Local Addresses
  if (ip === '::1') return true;
  if (ip.toLowerCase().startsWith('fc') || ip.toLowerCase().startsWith('fd')) return true;
  if (ip.toLowerCase().startsWith('fe8') || ip.toLowerCase().startsWith('fe9') || 
      ip.toLowerCase().startsWith('fea') || ip.toLowerCase().startsWith('feb')) return true;

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

    // Resolve the hostname to an IP address
    const { address } = await lookupAsync(parsedUrl.hostname);
    
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
