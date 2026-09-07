import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { runFullAudit } from "@/core/analyzer";
import { revalidateTag } from "next/cache";

// MCP (Model Context Protocol) API Endpoint Specification v1.0
// Enables AI Agents (Claude Desktop, Cursor, Custom Agents) to inspect and operate NexPulse telemetry.

export interface MCPRequest {
  jsonrpc?: "2.0";
  id?: string | number;
  method: "tools/list" | "tools/call" | "ping";
  params?: {
    name?: string;
    arguments?: Record<string, unknown>;
  };
}

const MCP_TOOLS = [
  {
    name: "get_system_health",
    description: "Fetch real-time telemetry metrics, uptime status, and latency across all active monitors.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_active_incidents",
    description: "Fetch all active or recent autonomous root-cause incidents detected by NexPulse Autopilot.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "run_seo_audit",
    description: "Perform an automated SEO and technical audit for a target web application URL.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "Target URL to inspect (e.g. https://example.com)" },
      },
      required: ["url"],
    },
  },
  {
    name: "trigger_cache_purge",
    description: "Instantly purge Next.js or CDN cache tags across the global edge network.",
    inputSchema: {
      type: "object",
      properties: {
        tag: { type: "string", description: "Cache tag to revalidate (e.g. products)" },
      },
      required: ["tag"],
    },
  },
];

async function authenticateApiKey(authHeader: string | null) {
  if (!authHeader) return null;
  const apiKey = authHeader.replace("Bearer ", "").trim();
  if (!apiKey) return null;

  const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex");
  const dbKey = await prisma.apiKey.findUnique({
    where: { keyHash },
    include: { user: true },
  });

  return dbKey?.user || null;
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const user = await authenticateApiKey(authHeader);

    const body: MCPRequest = await req.json();
    const { method, params, id = "1" } = body;

    // Ping check
    if (method === "ping") {
      return NextResponse.json({ jsonrpc: "2.0", id, result: { status: "pong" } });
    }

    // List tools
    if (method === "tools/list") {
      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        result: {
          tools: MCP_TOOLS,
        },
      });
    }

    // Call tool
    if (method === "tools/call") {
      const toolName = params?.name;
      const args = params?.arguments || {};

      if (!toolName) {
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          error: { code: -32602, message: "Missing tool name in params" },
        }, { status: 400 });
      }

      switch (toolName) {
        case "get_system_health": {
          const monitors = user
            ? await prisma.monitor.findMany({ where: { userId: user.id } })
            : [];

          return NextResponse.json({
            jsonrpc: "2.0",
            id,
            result: {
              content: [
                {
                  type: "text",
                  text: JSON.stringify({
                    status: "OPERATIONAL",
                    activeMonitorsCount: monitors.length,
                    monitors: monitors.map((m) => ({
                      name: m.name,
                      url: m.url,
                      status: m.status,
                      lastChecked: m.lastChecked,
                    })),
                  }, null, 2),
                },
              ],
            },
          });
        }

        case "get_active_incidents": {
          const incidents = user
            ? await prisma.autopilotIncident.findMany({
                where: { userId: user.id },
                orderBy: { createdAt: "desc" },
                take: 5,
              })
            : [];

          return NextResponse.json({
            jsonrpc: "2.0",
            id,
            result: {
              content: [
                {
                  type: "text",
                  text: JSON.stringify({ incidents }, null, 2),
                },
              ],
            },
          });
        }

        case "run_seo_audit": {
          const targetUrl = args.url as string;
          if (!targetUrl) {
            return NextResponse.json({
              jsonrpc: "2.0",
              id,
              error: { code: -32602, message: "Missing required argument 'url'" },
            }, { status: 400 });
          }

          const audit = await runFullAudit(targetUrl);
          return NextResponse.json({
            jsonrpc: "2.0",
            id,
            result: {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(audit, null, 2),
                },
              ],
            },
          });
        }

        case "trigger_cache_purge": {
          const tag = args.tag as string;
          if (!tag) {
            return NextResponse.json({
              jsonrpc: "2.0",
              id,
              error: { code: -32602, message: "Missing required argument 'tag'" },
            }, { status: 400 });
          }

          (revalidateTag as unknown as (t: string) => void)(tag);
          return NextResponse.json({
            jsonrpc: "2.0",
            id,
            result: {
              content: [
                {
                  type: "text",
                  text: JSON.stringify({ success: true, revalidatedTag: tag, timestamp: new Date().toISOString() }),
                },
              ],
            },
          });
        }

        default:
          return NextResponse.json({
            jsonrpc: "2.0",
            id,
            error: { code: -32601, message: `Unknown MCP Tool: ${toolName}` },
          }, { status: 404 });
      }
    }

    return NextResponse.json({
      jsonrpc: "2.0",
      id,
      error: { code: -32601, message: `Method not found: ${method}` },
    }, { status: 400 });
  } catch (err) {
    console.error("[MCP_ENDPOINT_ERROR]", err);
    return NextResponse.json({
      jsonrpc: "2.0",
      id: "1",
      error: { code: -32603, message: "Internal server error" },
    }, { status: 500 });
  }
}
