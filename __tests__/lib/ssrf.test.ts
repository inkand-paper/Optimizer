/**
 * __tests__/lib/ssrf.test.ts
 * Unit tests for validateSafeUrl — SSRF prevention logic.
 * dns/promises is mocked so no real network calls are made.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// vi.hoisted runs before the vi.mock factory, allowing shared mutable state.
const dnsState = vi.hoisted(() => ({ resolvedIp: '8.8.8.8' }));

vi.mock('dns/promises', () => ({
  lookup: vi.fn((_host: string) =>
    Promise.resolve({ address: dnsState.resolvedIp, family: dnsState.resolvedIp.includes(':') ? 6 : 4 })
  ),
}));

import { validateSafeUrl } from '@/lib/ssrf';

beforeEach(() => {
  dnsState.resolvedIp = '8.8.8.8';
});

describe('validateSafeUrl — private IPs (should throw)', () => {
  const privateIPs: [string, string][] = [
    ['10.0.0.1', '10.x RFC1918'],
    ['10.255.255.255', '10.x end'],
    ['192.168.1.1', '192.168.x'],
    ['172.16.0.1', '172.16 RFC1918'],
    ['172.31.255.255', '172.31 RFC1918'],
    ['127.0.0.1', 'loopback'],
    ['127.0.0.2', 'loopback range'],
    ['169.254.169.254', 'AWS metadata'],
    ['169.254.0.1', 'link-local'],
    ['::1', 'IPv6 loopback'],
    ['fc00::1', 'IPv6 unique local fc'],
    ['fd12:3456::1', 'IPv6 unique local fd'],
    ['fe80::1', 'IPv6 link-local'],
    ['fe8f::1', 'IPv6 link-local fe8x'],
    ['fea0::1', 'IPv6 link-local feax'],
    ['feb0::1', 'IPv6 link-local febx'],
    ['::ffff:127.0.0.1', 'IPv4-mapped loopback'],
    ['::ffff:10.0.0.1', 'IPv4-mapped private 10.x'],
    ['::ffff:192.168.0.1', 'IPv4-mapped private 192.168.x'],
  ];

  privateIPs.forEach(([ip, label]) => {
    it(`blocks ${label} (${ip})`, async () => {
      dnsState.resolvedIp = ip;
      await expect(validateSafeUrl('https://example.com/path')).rejects.toThrow();
    });
  });
});

describe('validateSafeUrl — public IPs (should resolve)', () => {
  it('allows a public IPv4 address', async () => {
    dnsState.resolvedIp = '8.8.8.8';
    await expect(validateSafeUrl('https://example.com')).resolves.toBe('https://example.com');
  });

  it('allows another public IP', async () => {
    dnsState.resolvedIp = '1.1.1.1';
    await expect(validateSafeUrl('https://cloudflare.com')).resolves.toBe('https://cloudflare.com');
  });
});

describe('validateSafeUrl — invalid protocols', () => {
  it('blocks file:// protocol', async () => {
    dnsState.resolvedIp = '1.2.3.4';
    await expect(validateSafeUrl('file:///etc/passwd')).rejects.toThrow();
  });

  it('blocks ftp:// protocol', async () => {
    dnsState.resolvedIp = '1.2.3.4';
    await expect(validateSafeUrl('ftp://example.com/file')).rejects.toThrow();
  });

  it('throws on a completely invalid URL', async () => {
    dnsState.resolvedIp = '1.2.3.4';
    await expect(validateSafeUrl('not-a-url')).rejects.toThrow();
  });
});
