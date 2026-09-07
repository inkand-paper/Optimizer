import { describe, it, expect } from "vitest";

export interface MCPResponse {
  jsonrpc: "2.0";
  id: string | number;
  result?: {
    tools?: Array<{ name: string; description: string }>;
    content?: Array<{ type: string; text: string }>;
    status?: string;
  };
  error?: {
    code: number;
    message: string;
  };
}

export function handleMcpProtocol(method: string, toolName?: string): MCPResponse {
  if (method === "ping") {
    return { jsonrpc: "2.0", id: "1", result: { status: "pong" } };
  }

  if (method === "tools/list") {
    return {
      jsonrpc: "2.0",
      id: "1",
      result: {
        tools: [
          { name: "get_system_health", description: "Fetch telemetry metrics" },
          { name: "get_active_incidents", description: "Fetch Autopilot incidents" },
          { name: "run_seo_audit", description: "Perform SEO audit" },
          { name: "trigger_cache_purge", description: "Purge cache tags" },
        ],
      },
    };
  }

  if (method === "tools/call") {
    if (toolName === "get_system_health") {
      return {
        jsonrpc: "2.0",
        id: "1",
        result: {
          content: [
            {
              type: "text",
              text: JSON.stringify({ status: "OPERATIONAL", activeMonitorsCount: 3 }),
            },
          ],
        },
      };
    }
  }

  return {
    jsonrpc: "2.0",
    id: "1",
    error: { code: -32601, message: "Method not found" },
  };
}

describe("MCP (Model Context Protocol) Server API", () => {
  it("responds to ping method", () => {
    const res = handleMcpProtocol("ping");
    expect(res.result?.status).toBe("pong");
  });

  it("lists all available system telemetry tools", () => {
    const res = handleMcpProtocol("tools/list");
    expect(res.result?.tools?.length).toBe(4);
    expect(res.result?.tools?.map((t) => t.name)).toContain("get_system_health");
  });

  it("handles get_system_health tool call", () => {
    const res = handleMcpProtocol("tools/call", "get_system_health");
    expect(res.result?.content?.[0].text).toContain("OPERATIONAL");
  });

  it("returns error for unknown method", () => {
    const res = handleMcpProtocol("unknown_method");
    expect(res.error?.code).toBe(-32601);
  });
});
