import { NextResponse } from "next/server";
import { lookupStation } from "@/lib/transit";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const stationId = url.searchParams.get("station_id") ?? "";
  const hit = lookupStation(stationId);
  if (!hit) return NextResponse.json({ error: "No station with that id" }, { status: 404 });
  return NextResponse.json(hit);
}
