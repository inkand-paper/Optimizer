#!/usr/bin/env node

/**
 * njo - Next.js Optimizer CLI
 * Usage:
 *   njo analyze <url>
 *   njo revalidate --tag <tag> --key <api-key>
 *   njo monitor <url>
 *   njo status
 */

import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const CONFIG_PATH = join(homedir(), '.njo', 'config.json');
const VERSION = '1.0.0';
const BASE_URL = process.env.NJO_API_URL || 'http://localhost:3000';

// --- ANSI Colors ---
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function fmt(color, text) { return `${color}${text}${c.reset}`; }

// --- Config ---
function loadConfig() {
  if (!existsSync(CONFIG_PATH)) return {};
  try {
    return JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
  } catch {
    return {};
  }
}

function saveConfig(cfg) {
  const dir = join(homedir(), '.njo');
  mkdirSync(dir, { recursive: true });
  writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2));
}

// --- Banner ---
function banner() {
  console.log(`
${fmt(c.bold + c.cyan, ' ╔═══════════════════════════════╗')}
${fmt(c.bold + c.cyan, ' ║')}  ${fmt(c.bold, 'njo')} - Next.js Optimizer Suite  ${fmt(c.bold + c.cyan, '║')}
${fmt(c.bold + c.cyan, ' ║')}  ${fmt(c.dim, `v${VERSION} · framework-agnostic`)}   ${fmt(c.bold + c.cyan, '║')}
${fmt(c.bold + c.cyan, ' ╚═══════════════════════════════╝')}
`);
}

// --- Help ---
function help() {
  banner();
  console.log(`${fmt(c.bold, 'Usage:')}  njo <command> [options]

${fmt(c.bold, 'Commands:')}
  ${fmt(c.green, 'analyze <url>')}          Run a full SEO, Security & Performance audit
  ${fmt(c.green, 'revalidate')}             Trigger cache revalidation
  ${fmt(c.green, 'monitor <url>')}          Add a URL to real-time monitoring
  ${fmt(c.green, 'status')}                 Check system health
  ${fmt(c.green, 'config set-key <key>')}   Save your API key locally

${fmt(c.bold, 'Options:')}
  ${fmt(c.yellow, '--tag <tag>')}            Cache tag to revalidate
  ${fmt(c.yellow, '--path <path>')}          Path to revalidate
  ${fmt(c.yellow, '--key <api-key>')}        API key (overrides saved config)
  ${fmt(c.yellow, '--json')}                 Output raw JSON
  ${fmt(c.yellow, '--version, -v')}          Show version
  ${fmt(c.yellow, '--help, -h')}             Show this help

${fmt(c.bold, 'Examples:')}
  ${fmt(c.dim, '$ njo analyze https://mysite.com')}
  ${fmt(c.dim, '$ njo revalidate --tag products --key opt_...')}
  ${fmt(c.dim, '$ njo config set-key opt_abc123')}
  ${fmt(c.dim, '$ njo status')}
`);
}

// --- HTTP Helper ---
async function apiRequest(endpoint, options = {}) {
  const config = loadConfig();
  const key = options.apiKey || config.apiKey;

  const headers = { 'Content-Type': 'application/json' };
  if (key) headers['Authorization'] = `Bearer ${key}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

// --- Commands ---
async function cmdAnalyze(url, opts) {
  if (!url) { console.error(fmt(c.red, 'Error: URL is required')); process.exit(1); }

  const spinner = setInterval(() => process.stdout.write(fmt(c.dim, '.')), 400);
  process.stdout.write(fmt(c.cyan, `\n  🔍 Scanning ${url} `));

  const { ok, data } = await apiRequest('/api/analyze', {
    method: 'POST',
    apiKey: opts.key,
    body: { url }
  });

  clearInterval(spinner);
  console.log('\n');

  if (!ok) {
    console.error(fmt(c.red, `  ✗ Scan failed: ${data.message || 'Unknown error'}`));
    process.exit(1);
  }

  if (opts.json) { console.log(JSON.stringify(data, null, 2)); return; }

  const r = data.results;
  console.log(`${fmt(c.bold, '  AUDIT REPORT')}  ${fmt(c.dim, url)}\n`);
  console.log(`  ${'─'.repeat(40)}`);

  const score = r.overallScore;
  const scoreColor = score >= 80 ? c.green : score >= 50 ? c.yellow : c.red;
  console.log(`  Overall Score   ${fmt(c.bold + scoreColor, `${score}/100`)}`);
  console.log(`  SEO             ${fmt(c.bold, `${r.seo?.score ?? 'N/A'}/100`)}`);
  console.log(`  Security        ${fmt(c.bold, `${r.security?.score ?? 'N/A'}/100`)}`);
  console.log(`  Performance     ${fmt(c.bold, `${r.performance?.score ?? 'N/A'}/100`)}`);
  console.log(`  ${'─'.repeat(40)}`);

  if (r.seo?.issues?.length) {
    console.log(`\n  ${fmt(c.yellow, '⚠  SEO Issues:')}`);
    r.seo.issues.forEach(i => console.log(`     • ${i}`));
  }
  if (r.security?.issues?.length) {
    console.log(`\n  ${fmt(c.red, '⚠  Security Issues:')}`);
    r.security.issues.forEach(i => console.log(`     • ${i}`));
  }
  console.log('');
}

async function cmdRevalidate(opts) {
  if (!opts.tag && !opts.path) {
    console.error(fmt(c.red, 'Error: --tag or --path is required'));
    process.exit(1);
  }

  const target = opts.tag || opts.path;
  const type = opts.tag ? 'tag' : 'path';
  process.stdout.write(fmt(c.cyan, `\n  🔄 Revalidating ${type}: ${target} ...`));

  const { ok, data } = await apiRequest('/api/revalidate', {
    method: 'POST',
    apiKey: opts.key,
    body: { tag: opts.tag, path: opts.path }
  });

  console.log('\n');

  if (opts.json) { console.log(JSON.stringify(data, null, 2)); return; }

  if (ok) {
    console.log(fmt(c.green, `  ✓ Revalidation successful`));
    console.log(`  ${fmt(c.dim, `Type: ${type}  Value: ${target}`)}`);
  } else {
    console.error(fmt(c.red, `  ✗ Revalidation failed: ${data.message || 'Unknown error'}`));
    process.exit(1);
  }
  console.log('');
}

async function cmdStatus() {
  process.stdout.write(fmt(c.cyan, '\n  🩺 Checking system health ...'));
  const { ok, data } = await apiRequest('/api/health');
  console.log('\n');

  if (!ok) { console.error(fmt(c.red, '  ✗ Server unreachable')); process.exit(1); }

  const statusColor = data.status === 'healthy' ? c.green : c.red;
  console.log(`  Status     ${fmt(c.bold + statusColor, data.status?.toUpperCase() ?? 'UNKNOWN')}`);
  console.log(`  Version    ${fmt(c.bold, data.version ?? '?')}`);
  console.log(`  Uptime     ${fmt(c.bold, `${data.uptime?.hours ?? 0}h ${data.uptime?.minutes ?? 0}m`)}`);
  console.log('');
}

async function cmdConfigSetKey(key) {
  if (!key) { console.error(fmt(c.red, 'Error: API key required')); process.exit(1); }
  mkdirSync(join(homedir(), '.njo'), { recursive: true });
  const cfg = loadConfig();
  cfg.apiKey = key;
  writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2));
  console.log(fmt(c.green, `\n  ✓ API key saved to ${CONFIG_PATH}\n`));
}

async function cmdCron(opts) {
  const interval = opts.interval || 60; // default 60s
  console.log(fmt(c.cyan, `\n  🕰️ Starting monitoring cron loop (interval: ${interval}s). Press Ctrl+C to stop.\n`));
  
  const tick = async () => {
    try {
      const { ok, data } = await apiRequest('/api/cron/monitor');
      const time = new Date().toLocaleTimeString();
      if (ok) {
        console.log(fmt(c.dim, `  [${time}] Checked ${data.checked} monitors. successful: ${data.successful}, failed: ${data.failed}`));
      } else {
        console.error(fmt(c.red, `  [${time}] Error triggering monitors: ${data?.error || 'Unknown error'}`));
      }
    } catch (e) {
      console.error(fmt(c.red, `  [${new Date().toLocaleTimeString()}] Network error reaching API`));
    }
  };

  await tick();
  setInterval(tick, interval * 1000);
  
  // Keep alive
  await new Promise(() => {});
}

// --- Main ---
async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];

  const opts = {};
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--tag') opts.tag = args[++i];
    else if (args[i] === '--path') opts.path = args[++i];
    else if (args[i] === '--key') opts.key = args[++i];
    else if (args[i] === '--json') opts.json = true;
    else if (args[i] === '--interval') opts.interval = parseInt(args[++i], 10);
  }

  if (!cmd || cmd === '--help' || cmd === '-h') { help(); return; }
  if (cmd === '--version' || cmd === '-v') { console.log(`njo v${VERSION}`); return; }

  banner();

  if (cmd === 'analyze') await cmdAnalyze(args[1], opts);
  else if (cmd === 'revalidate') await cmdRevalidate(opts);
  else if (cmd === 'status') await cmdStatus();
  else if (cmd === 'cron') await cmdCron(opts);
  else if (cmd === 'config' && args[1] === 'set-key') await cmdConfigSetKey(args[2]);

  else {
    console.error(fmt(c.red, `  Unknown command: ${cmd}\n`));
    help();
    process.exit(1);
  }
}

main().catch(err => {
  console.error(fmt(c.red, `\n  Fatal error: ${err.message}\n`));
  process.exit(1);
});
