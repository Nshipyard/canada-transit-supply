import { NextResponse } from "next/server";

const spec = {
  openapi: "3.1.0",
  info: {
    title: "Canada Transit Supply API",
    version: "1.0.0",
    description:
      "Toronto's rail-station supply response: 125 stations (78 open, 47 under construction) joined to 2,314 development projects within 800 metres. Station search and lookup with before/after opening supply splits, plus citywide aggregates. 41.1% of pipeline homes sit within 800m of an open station. Sources: TTC GTFS and City of Toronto Major Transit Station Areas (locations), TTC/Metrolinx public records (opening dates), City of Toronto Development Pipeline (supply). MIT licensed.",
  },
  servers: [{ url: "https://supply.canada.nshipyard.com/api/v1" }],
  paths: {
    "/station/search": {
      get: {
        summary: "Search stations by name, filter by status, ranked by pipeline homes within 800m",
        parameters: [
          { name: "q", in: "query", required: false, schema: { type: "string" }, example: "Finch" },
          { name: "status", in: "query", required: false, schema: { type: "string", enum: ["all", "open", "under_construction"] }, example: "open" },
          { name: "limit", in: "query", required: false, schema: { type: "integer", default: 50, maximum: 200 } },
        ],
        responses: { "200": { description: "Total plus matching station records with supply aggregates" } },
      },
    },
    "/station/lookup": {
      get: {
        summary: "Full record for one station: location, opening date, 800m supply join, before/after opening",
        parameters: [{ name: "station_id", in: "query", required: true, schema: { type: "string" }, example: "ttc-finch-west" }],
        responses: { "200": { description: "Station record" }, "404": { description: "No station with that id" } },
      },
    },
    "/supply/summary": {
      get: {
        summary: "Citywide aggregates: station counts, deduplicated 800m coverage, top stations, status split",
        responses: { "200": { description: "Full aggregate summary with methodology notes" } },
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(spec);
}
