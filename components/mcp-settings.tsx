"use client";

import * as React from "react";
import { Card, Button } from "@/components/ui-elements";
import {
  Terminal, Key, Copy, CheckCircle2, ExternalLink,
  Server, Cpu, Globe, RefreshCw,
} from "lucide-react";

interface MCPTool {
  name: string;
  description: string;
  inputRequired: boolean;
  icon: React.ElementType;
}

const MCP_TOOLS: MCPTool[] = [
  { name: "get_system_health", description: "Fetch real-time uptime & latency across all monitors.", inputRequired: false, icon: Server },
  { name: "get_active_incidents", description: "List active Autopilot root-cause incidents.", inputRequired: false, icon: Cpu },
  { name: "run_seo_audit", description: "Run a full SEO & performance audit on a URL.", inputRequired: true, icon: Globe },
  { name: "trigger_cache_purge", description: "Instantly purge Next.js edge cache by tag.", inputRequired: true, icon: RefreshCw },
];

export function MCPSettings() {
  const [apiKey, setApiKey] = React.useState("");
  const [copied, setCopied] = React.useState<string | null>(null);
  const [testing, setTesting] = React.useState(false);
  const [testResult, setTestResult] = React.useState<"ok" | "fail" | null>(null);

  const appUrl = typeof window !== "undefined"
    ? window.location.origin
    : "https://nexpulse.dev";

  const mcpEndpoint = `${appUrl}/api/mcp`;

  const cursorConfig = `{
  "mcpServers": {
    "nexpulse": {
      "url": "${mcpEndpoint}",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}`;

  const claudeConfig = `{
  "mcpServers": {
    "nexpulse": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch", "${mcpEndpoint}"],
      "env": {
        "AUTHORIZATION": "Bearer YOUR_API_KEY"
      }
    }
  }
}`;

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  async function testConnection() {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/mcp", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify({ jsonrpc: "2.0", id: "1", method: "ping" }),
      });
      const data = await res.json();
      setTestResult(data?.result?.status === "pong" ? "ok" : "fail");
    } catch {
      setTestResult("fail");
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">

      {/* ── Header ── */}
      <Card className="p-6 bg-gradient-to-r from-np-gold/5 via-background to-background border-np-gold/20">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-ui bg-np-gold/10 border border-np-gold/30 flex items-center justify-center text-np-gold">
            <Terminal className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold uppercase tracking-tight">MCP Server Integration</h2>
              <span className="bg-np-gold/20 text-np-gold font-bold text-[9px] uppercase tracking-widest px-2 py-0.5 rounded border border-np-gold/30">v1.0</span>
            </div>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              Connect AI agents (Cursor, Claude Desktop) directly to your NexPulse infrastructure telemetry.
            </p>
          </div>
        </div>
      </Card>

      {/* ── MCP Endpoint & Test ── */}
      <Card className="p-6 space-y-5">
        <h3 className="text-[13px] font-semibold uppercase tracking-wider flex items-center gap-2">
          <Server className="h-4 w-4 text-np-gold" />
          Server Endpoint
        </h3>

        <div className="space-y-2">
          <p className="text-[11px] text-muted-foreground uppercase tracking-widest">MCP URL</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 font-mono text-[12px] p-2.5 bg-black/50 rounded-ui border border-border text-np-gold truncate">
              {mcpEndpoint}
            </code>
            <Button size="sm" variant="outline" onClick={() => copyText(mcpEndpoint, "url")}>
              {copied === "url" ? <CheckCircle2 className="h-3.5 w-3.5 text-np-teal" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] text-muted-foreground uppercase tracking-widest">Test Connection with API Key</p>
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="npx_xxxxxxxxxxxxxxxxxxxxxxxx"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1 font-mono text-[12px] px-3 py-2 bg-background border border-border rounded-ui focus:outline-none focus:border-np-gold/50 transition-colors"
            />
            <Button onClick={testConnection} disabled={testing || !apiKey} variant="outline">
              {testing ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Ping"}
            </Button>
          </div>
          {testResult === "ok" && (
            <p className="text-[11px] text-np-teal flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Connection successful — MCP server is reachable.
            </p>
          )}
          {testResult === "fail" && (
            <p className="text-[11px] text-np-crimson">
              Connection failed — check your API key and try again.
            </p>
          )}
        </div>
      </Card>

      {/* ── Available Tools ── */}
      <Card className="p-6 space-y-4">
        <h3 className="text-[13px] font-semibold uppercase tracking-wider flex items-center gap-2">
          <Terminal className="h-4 w-4 text-np-gold" />
          Available Tools
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {MCP_TOOLS.map((tool) => (
            <div
              key={tool.name}
              className="p-3.5 rounded-ui border border-border bg-muted/20 hover:border-np-gold/30 transition-all space-y-1"
            >
              <div className="flex items-center gap-2">
                <tool.icon className="h-3.5 w-3.5 text-np-gold shrink-0" />
                <code className="text-[11px] font-mono text-foreground font-semibold">{tool.name}</code>
                {tool.inputRequired && (
                  <span className="ml-auto text-[8px] uppercase tracking-widest bg-muted px-1.5 py-0.5 rounded text-muted-foreground">args</span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed pl-5">{tool.description}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Config Blocks ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Cursor */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-semibold uppercase tracking-wider flex items-center gap-2">
              <Key className="h-4 w-4 text-np-gold" />
              Cursor Config
            </h3>
            <a
              href="https://docs.cursor.com/context/model-context-protocol"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              Docs <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
          <div className="relative">
            <pre className="p-4 bg-black/50 rounded-ui border border-border text-[11px] font-mono text-emerald-400 overflow-auto max-h-52 leading-relaxed">
              {cursorConfig}
            </pre>
            <button
              onClick={() => copyText(cursorConfig, "cursor")}
              className="absolute top-2 right-2 p-1.5 rounded bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
            >
              {copied === "cursor" ? <CheckCircle2 className="h-3.5 w-3.5 text-np-teal" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Add to <code className="font-mono">~/.cursor/mcp.json</code>, then replace <code className="font-mono">YOUR_API_KEY</code> with your key from the API Keys tab.
          </p>
        </Card>

        {/* Claude Desktop */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-semibold uppercase tracking-wider flex items-center gap-2">
              <Key className="h-4 w-4 text-np-gold" />
              Claude Desktop Config
            </h3>
            <a
              href="https://modelcontextprotocol.io/quickstart/user"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              Docs <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
          <div className="relative">
            <pre className="p-4 bg-black/50 rounded-ui border border-border text-[11px] font-mono text-emerald-400 overflow-auto max-h-52 leading-relaxed">
              {claudeConfig}
            </pre>
            <button
              onClick={() => copyText(claudeConfig, "claude")}
              className="absolute top-2 right-2 p-1.5 rounded bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
            >
              {copied === "claude" ? <CheckCircle2 className="h-3.5 w-3.5 text-np-teal" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Add to <code className="font-mono">claude_desktop_config.json</code>, then replace <code className="font-mono">YOUR_API_KEY</code>.
          </p>
        </Card>
      </div>
    </div>
  );
}
