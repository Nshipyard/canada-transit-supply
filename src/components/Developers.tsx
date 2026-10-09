"use client";

import { useLang } from "@/i18n";
import McpConnect from "./McpConnect";

const endpoints = [
  {
    method: "GET",
    path: "/api/v1/station/search?q=finch&status=all&limit=3",
    desc: "Search 125 stations by name, filter by open / under construction, ranked by pipeline homes",
    response: `{
  "q": "finch", "total": 3,
  "hits": [
    { "id": "ttc-finch", "name": "Finch Station",
      "agency": "TTC", "status": "open",
      "units_800m": 10836, "projects_800m": 23 }
  ]}`,
  },
  {
    method: "GET",
    path: "/api/v1/station/lookup?station_id=ttc-finch-west",
    desc: "Full station record: location, opening date, 800m supply join, before/after opening split",
    response: `{
  "id": "ttc-finch-west", "name": "Finch West Station",
  "opening_date": "2017-12-17",
  "supply": { "units_800m": 3593, "projects_800m": 4,
    "before_opening": { "projects": 0, "units": 0 },
    "after_opening": { "projects": 4, "units": 3593 } }}`,
  },
  {
    method: "GET",
    path: "/api/v1/supply/summary",
    desc: "Citywide aggregates: station counts, deduplicated 800m coverage, top stations, status split",
    response: `{
  "stations_total": 125, "stations_open": 78,
  "units_within_800m_open_station_dedup": 365770,
  "units_within_800m_open_station_dedup_pct": 41.1,
  "top_stations_by_units": [ … ] }`,
  },
];

export default function Developers() {
  const { t } = useLang();
  return (
    <section id="developers" className="bg-ink text-white">
      <div className="mx-auto max-w-[1392px] px-6 py-20 md:py-28">
        <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-white/60">{t.developers.kicker}</p>
        <h2 className="display mt-4 max-w-[720px] text-[40px] md:text-[52px]">{t.developers.title}</h2>
        <p className="mt-5 max-w-[720px] text-[18px] leading-relaxed text-white/70">{t.developers.body}</p>

        <h3 className="mt-14 text-[13px] font-semibold uppercase tracking-[0.12em] text-white/60">{t.developers.endpoints}</h3>
        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          {endpoints.map((e) => (
            <article key={e.path} className="flex min-w-0 flex-col rounded-[24px] border border-white/15 bg-white/5 p-6">
              <p className="font-mono text-[12px] font-semibold text-white/60">{e.method}</p>
              <code className="mt-1 break-all font-mono text-[13px] text-white">{e.path}</code>
              <p className="mt-2 text-[14px] text-white/65">{e.desc}</p>
              <pre className="mt-4 flex-1 overflow-x-auto rounded-[16px] bg-black/40 p-4 font-mono text-[12px] leading-relaxed text-white/80">
                {e.response}
              </pre>
              <a
                href={e.path}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block self-start rounded-full border border-white/25 px-5 py-2 text-[14px] font-semibold hover:border-white"
              >
                {t.developers.tryIt} →
              </a>
            </article>
          ))}
        </div>

        <div className="mt-8">
          <a href="/api/openapi.json" target="_blank" rel="noreferrer" className="block rounded-[24px] bg-white/[0.06] p-6 hover:bg-white/[0.09]">
            <h4 className="text-[19px] font-semibold">{t.developers.openapi}</h4>
            <code className="mt-2 block font-mono text-[13px] text-white/60">GET /api/openapi.json</code>
          </a>
        </div>

        <McpConnect
          config={{
            slug: "canada-transit-supply",
            displayName: "Canada Transit Supply",
            exampleEn: 'Look up Finch West station and tell me how housing supply changed after it opened',
            exampleFr: 'Cherche la station Finch West et dis-moi comment l’offre de logements a changé après son ouverture',
          }}
        />
      </div>
    </section>
  );
}
