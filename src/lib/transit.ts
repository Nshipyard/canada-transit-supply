import fs from "node:fs";
import path from "node:path";

const DATA = path.join(process.cwd(), "data");

export interface Station {
  id: string;
  name: string;
  agency: string;
  lines: string[];
  lat: number;
  lon: number;
  opening_date: string | null;
  date_precision: string;
  status: "open" | "under_construction" | "unknown";
  coord_source: string;
}

export interface BeforeAfter {
  projects: number;
  units: number;
}

export interface StationSupply {
  station_id: string;
  projects_800m: number;
  units_800m: number;
  by_status: Record<string, { projects: number; units: number }>;
  earliest_application: string | null;
  latest_application: string | null;
  before_opening: BeforeAfter | null;
  after_opening: BeforeAfter | null;
}

export interface TopStation {
  name: string;
  units: number;
  projects: number;
}

export interface Summary {
  stations_total: number;
  stations_open: number;
  stations_under_construction: number;
  pipeline_projects_total: number;
  total_pipeline_units: number;
  units_within_800m_open_station_dedup: number;
  units_within_800m_open_station_dedup_pct: number;
  projects_within_800m_open_station_dedup: number;
  units_near_open_stations: number;
  units_near_future_stations: number;
  top_stations_by_units: TopStation[];
}

interface Cache {
  stations: Station[];
  supply: StationSupply[];
  summary: Summary;
}

let cache: Cache | null = null;

export function getData(): Cache {
  if (cache) return cache;
  const stations = JSON.parse(fs.readFileSync(path.join(DATA, "stations.json"), "utf8")) as Station[];
  const supply = JSON.parse(fs.readFileSync(path.join(DATA, "supply_by_station.json"), "utf8")) as StationSupply[];
  const summary = JSON.parse(fs.readFileSync(path.join(DATA, "summary.json"), "utf8")) as Summary;
  cache = { stations, supply, summary };
  return cache;
}

const supplyById = (): Map<string, StationSupply> => {
  const { supply } = getData();
  return new Map(supply.map((s) => [s.station_id, s]));
};

export interface StationHit extends Station {
  projects_800m: number;
  units_800m: number;
}

export function searchStations(q: string, status: string, limit: number): { total: number; hits: StationHit[] } {
  const { stations } = getData();
  const sup = supplyById();
  const needle = q.trim().toLowerCase();
  const out: StationHit[] = [];
  for (const st of stations) {
    if (status !== "all" && st.status !== status) continue;
    if (needle && !st.name.toLowerCase().includes(needle)) continue;
    const s = sup.get(st.id);
    out.push({ ...st, projects_800m: s?.projects_800m ?? 0, units_800m: s?.units_800m ?? 0 });
  }
  out.sort((a, b) => b.units_800m - a.units_800m);
  return { total: out.length, hits: out.slice(0, limit) };
}

export function lookupStation(stationId: string): (Station & { supply: StationSupply | null }) | null {
  const { stations } = getData();
  const sup = supplyById();
  const st = stations.find((s) => s.id === stationId.trim().toLowerCase());
  if (!st) return null;
  return { ...st, supply: sup.get(st.id) ?? null };
}
