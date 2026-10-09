import { NextResponse } from "next/server";
import { getData, searchStations, lookupStation } from "@/lib/transit";

// Minimal MCP server over streamable HTTP (JSON-RPC 2.0 via POST).
// Supports: initialize, tools/list, tools/call. Stateless.

const SERVER = { name: "canada-transit-supply", version: "1.0.0" };

const TOOLS = [
  {
    name: "station_lookup",
    description:
      "Full record for one Toronto rail station: location, agency, lines, opening date, status, and the 800-metre housing-supply join (projects, homes, status split, before/after opening).",
    inputSchema: {
      type: "object",
      properties: {
        station_id: { type: "string", description: "Station id, e.g. ttc-finch-west from the search tool" },
      },
      required: ["station_id"],
    },
  },
  {
    name: "station_search",
    description:
      "Search 125 Toronto rail stations (78 open, 47 under construction) by name, filter by status, ranked by pipeline homes within 800 metres.",
    inputSchema: {
      type: "object",
      properties: {
        q: { type: "string", description: "Station name fragment" },
        status: { type: "string", description: "all, open, or under_construction", enum: ["all", "open", "under_construction"] },
        limit: { type: "integer", description: "Max results, default 50, max 200" },
      },
    },
  },
  {
    name: "supply_summary",
    description:
      "Citywide supply-response aggregates: station counts, deduplicated 800-metre coverage (41.1% of pipeline homes near an open station), top stations, and status split.",
    inputSchema: { type: "object", properties: {} },
  },
];

function ok(id: unknown, result: unknown) {
  return { jsonrpc: "2.0", id, result };
}
function err(id: unknown, code: number, message: string) {
  return { jsonrpc: "2.0", id, error: { code, message } };
}
function textResult(data: unknown) {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

function handle(msg: any) {
  if (!msg || msg.jsonrpc !== "2.0" || typeof msg.method !== "string") {
    return err(msg?.id ?? null, -32600, "Invalid Request");
  }
  const id = msg.id ?? null;
  switch (msg.method) {
    case "initialize":
      return ok(id, {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: SERVER,
      });
    case "notifications/initialized":
      return null;
    case "tools/list":
      return ok(id, { tools: TOOLS });
    case "tools/call": {
      const { name, arguments: args } = msg.params ?? {};
      try {
        if (name === "station_lookup") {
          const hit = lookupStation(String(args.station_id ?? ""));
          if (!hit) return err(id, -32001, `No station ${args.station_id}`);
          return ok(id, textResult(hit));
        }
        if (name === "station_search") {
          const q = String(args.q ?? "");
          const status = String(args.status ?? "all");
          const limit = Math.min(Math.max(parseInt(String(args.limit ?? "50"), 10) || 50, 1), 200);
          return ok(id, textResult({ q, status, limit, ...searchStations(q, status, limit) }));
        }
        if (name === "supply_summary") {
          const { summary } = getData();
          return ok(id, textResult(summary));
        }
        return err(id, -32602, `Unknown tool ${name}`);
      } catch (e) {
        return err(id, -32000, `Tool error: ${(e as Error).message}`);
      }
    }
    default:
      return err(id, -32601, `Method not found: ${msg.method}`);
  }
}

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(err(null, -32700, "Parse error"), { status: 400 });
  }
  if (Array.isArray(body)) {
    const out = body.map(handle).filter((r) => r !== null);
    return NextResponse.json(out);
  }
  const out = handle(body);
  if (out === null) return new NextResponse(null, { status: 202 });
  return NextResponse.json(out);
}

export async function GET() {
  return NextResponse.json(
    { error: "This MCP server accepts JSON-RPC 2.0 via POST only." },
    { status: 405 }
  );
}

export async function DELETE() {
  return new NextResponse(null, { status: 405 });
}
