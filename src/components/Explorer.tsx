"use client";

import { useEffect, useMemo, useState } from "react";
import { useLang } from "@/i18n";
import type { StationHit } from "@/lib/transit";

interface Detail extends StationHit {
  supply: {
    projects_800m: number;
    units_800m: number;
    by_status: Record<string, { projects: number; units: number }>;
    earliest_application: string | null;
    latest_application: string | null;
    before_opening: { projects: number; units: number } | null;
    after_opening: { projects: number; units: number } | null;
  } | null;
}

const RED = "#d80621";

export default function Explorer() {
  const { t, lang } = useLang();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [list, setList] = useState<StationHit[]>([]);
  const [total, setTotal] = useState(0);
  const [sel, setSel] = useState<Detail | null>(null);

  useEffect(() => {
    fetch(`/api/v1/station/search?q=${encodeURIComponent(q)}&status=${status}&limit=60`)
      .then((r) => r.json())
      .then((d) => {
        setList(d.hits);
        setTotal(d.total);
      });
  }, [q, status]);

  const openDetail = (id: string) => {
    fetch(`/api/v1/station/lookup?station_id=${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((d) => setSel({ ...d, projects_800m: d.supply?.projects_800m ?? 0, units_800m: d.supply?.units_800m ?? 0 }));
  };

  const fmt = (n: number) => n.toLocaleString(lang === "fr" ? "fr-CA" : "en-CA");

  const statusRows = useMemo(() => {
    if (!sel?.supply) return [];
    const bs = sel.supply.by_status;
    return [
      { key: "built", label: t.explorer.built, ...(bs["built"] ?? { projects: 0, units: 0 }) },
      { key: "active", label: t.explorer.active, ...(bs["active"] ?? { projects: 0, units: 0 }) },
      { key: "proposed", label: t.explorer.proposed, ...(bs["proposed"] ?? { projects: 0, units: 0 }) },
    ].filter((r) => r.projects > 0);
  }, [sel, t]);

  if (sel) {
    const s = sel.supply;
    return (
      <div className="rounded-[24px] border border-line bg-paper p-6 md:p-8">
        <button onClick={() => setSel(null)} className="text-[14px] font-semibold text-canada hover:underline">
          ← {t.explorer.back}
        </button>
        <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <h3 className="display text-[32px] md:text-[40px]">{sel.name}</h3>
          <span
            className="rounded-full px-3 py-1 text-[13px] font-semibold"
            style={{
              background: sel.status === "open" ? "#e8f5e9" : "#fff3e0",
              color: sel.status === "open" ? "#1b5e20" : "#e65100",
            }}
          >
            {sel.status === "open" ? t.explorer.filterOpen : t.explorer.underConstruction}
          </span>
        </div>
        <p className="mt-2 text-[15px] text-ink/60">
          {sel.agency} · {sel.lines.join(", ")} · {t.explorer.stationId}: <code className="font-mono">{sel.id}</code>
        </p>
        <p className="mt-1 text-[15px] text-ink/60">
          {sel.opening_date ? `${t.explorer.opened} ${sel.opening_date}` : t.explorer.openingUnknown} · {t.explorer.coordSource}: {sel.coord_source}
        </p>
        <div className="mt-6 grid gap-px overflow-hidden rounded-[20px] border border-line bg-line sm:grid-cols-2">
          <div className="bg-paper p-6">
            <p className="display text-[40px] text-canada">{fmt(sel.units_800m)}</p>
            <p className="mt-1 text-[14px] text-ink/60">{t.explorer.units}</p>
          </div>
          <div className="bg-paper p-6">
            <p className="display text-[40px]">{fmt(sel.projects_800m)}</p>
            <p className="mt-1 text-[14px] text-ink/60">{t.explorer.projects}</p>
          </div>
        </div>
        {statusRows.length > 0 && (
          <div className="mt-6">
            <div className="flex h-4 overflow-hidden rounded-full">
              {statusRows.map((r, i) => {
                const tot = statusRows.reduce((a, x) => a + x.units, 0) || 1;
                const colors = [RED, "#0a0f1e", "#9aa0b4"];
                return (
                  <div key={r.key} style={{ width: `${(r.units / tot) * 100}%`, background: colors[i % 3] }} title={`${r.label}: ${fmt(r.units)}`} />
                );
              })}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1">
              {statusRows.map((r) => (
                <p key={r.key} className="text-[14px] text-ink/70">
                  <span className="font-semibold">{r.label}</span>: {fmt(r.units)} {t.showcase.units}
                </p>
              ))}
            </div>
          </div>
        )}
        {s?.before_opening && s?.after_opening && (
          <div className="mt-6 grid gap-px overflow-hidden rounded-[20px] border border-line bg-line sm:grid-cols-2">
            <div className="bg-paper p-6">
              <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-ink/50">{t.explorer.beforeOpening}</p>
              <p className="display mt-2 text-[32px]">{fmt(s.before_opening.projects)}</p>
              <p className="text-[14px] text-ink/60">{t.explorer.projects} · {fmt(s.before_opening.units)} {t.showcase.units}</p>
            </div>
            <div className="bg-paper p-6">
              <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-ink/50">{t.explorer.afterOpening}</p>
              <p className="display mt-2 text-[32px] text-canada">{fmt(s.after_opening.projects)}</p>
              <p className="text-[14px] text-ink/60">{t.explorer.projects} · {fmt(s.after_opening.units)} {t.showcase.units}</p>
            </div>
          </div>
        )}
        {s?.earliest_application && (
          <p className="mt-4 text-[14px] text-ink/60">
            {t.explorer.earliestApp}: {s.earliest_application} · {t.explorer.latestApp}: {s.latest_application}
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.explorer.search}
          className="min-w-0 flex-1 rounded-full border border-line bg-paper px-6 py-3.5 text-[16px] outline-none focus:border-canada"
        />
        <div className="flex shrink-0 rounded-full border border-line p-1">
          {[
            { v: "all", l: t.explorer.filterAll },
            { v: "open", l: t.explorer.filterOpen },
            { v: "under_construction", l: t.explorer.filterFuture },
          ].map((o) => (
            <button
              key={o.v}
              onClick={() => setStatus(o.v)}
              className={`rounded-full px-4 py-2 text-[14px] font-semibold ${status === o.v ? "bg-ink text-white" : "text-ink/60 hover:text-ink"}`}
            >
              {o.l}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-4 text-[14px] text-ink/55">
        {t.explorer.showing} {list.length} {t.explorer.of} {fmt(total)}
      </p>
      {list.length === 0 ? (
        <p className="mt-8 rounded-[20px] border border-line bg-paper p-8 text-[15px] text-ink/60">{q ? t.explorer.noResult : t.explorer.empty}</p>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {list.map((s) => (
            <button
              key={s.id}
              onClick={() => openDetail(s.id)}
              className="rounded-[20px] border border-line bg-paper p-5 text-left transition hover:border-ink/40"
            >
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-semibold text-[17px]">{s.name}</p>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${s.status === "open" ? "bg-[#e8f5e9] text-[#1b5e20]" : "bg-[#fff3e0] text-[#e65100]"}`}>
                  {s.status === "open" ? t.explorer.filterOpen : t.explorer.underConstruction}
                </span>
              </div>
              <p className="mt-1 text-[14px] text-ink/55">{s.agency} · {s.lines.join(", ")}</p>
              <p className="mt-3 text-[15px]">
                <span className="display text-[24px] text-canada">{fmt(s.units_800m)}</span>{" "}
                <span className="text-ink/60">{t.showcase.units}</span>
                <span className="text-ink/40"> · </span>
                <span className="text-ink/60">{fmt(s.projects_800m)} proj.</span>
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
