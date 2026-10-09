import { NextResponse } from "next/server";
import { getData } from "@/lib/transit";

export async function GET() {
  const { summary } = getData();
  return NextResponse.json(summary);
}
