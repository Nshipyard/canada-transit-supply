"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/i18n";

const RED = "#d80621";
const INK = "#0a0f1e";

interface TopRow { name: string; units: number; projects: number; }

function Bar({ label, value, max, fmt }: { label: string; value: number; max: number; fmt: (n: number) => string }) {
  return (
    <div className="grid grid-cols-[150px_1fr_90px] items-center gap-3 sm:grid-cols-[220px_1fr_100px]">
      <p className="truncate text-[14px] font-medium" title={label}>{label}</p>
      <div className="h-7 overflow-hidden rounded-md bg-muted">
        <div className="flex h-full items-center justify-end rounded-md pr-2" style={{ width: `${Math.max(4, (value / max) * 100)}%`, background: RED }}>
        </div>
      </div>
      <p className="text-right font-mono text-[13px]">{fmt(value)}</p>
    </div>
  );
}

export default function Showcase() {
  const { t, lang } = useLang();
  const [top, setTop] = useState<TopRow[]>([]);
  const [future, setFuture] = useState<TopRow[]>([]);
  const [split, setSplit] = useState<{ built: number; active: number; proposed: number } | null>(null);
  useEffect(() => {
    fetch("/api/v1/supply/summary")
      .then((r) => r.json())
      .then((d) => {
        setTop(d.top_stations_by_units.slice(0, 12));
        setFuture(d.top_future_stations.slice(0, 8));
        setSplit(d.units_near_open_by_status);
      });
  }, []);
  const fmt = (n: number) => n.toLocaleString(lang === "fr" ? "fr-CA" : "en-CA");
  const maxTop = Math.max(...top.map((x) => x.units), 1);
  const maxFut = Math.max(...future.map((x) => x.units), 1);

  const ba = [
    { name: "Finch West", before: 0, after: 3593 },
    { name: "York University", before: 0, after: 1009 },
    { name: "Downsview Park", before: 205, after: 350 },
  ];

  return (
    <section id="showcase" className="bg-paper">
      <div className="mx-auto max-w-[1392px] px-6 py-20 md:py-28">
        <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-canada">{t.showcase.kicker}</p>
        <h2 className="display mt-4 max-w-[720px] text-[40px] md:text-[52px]">{t.showcase.title}</h2>
        <p className="mt-5 max-w-[760px] text-[18px] leading-relaxed text-ink/70">{t.showcase.body}</p>

        <div className="mt-14 grid gap-10 lg:grid-cols-2">
          <div className="rounded-[24px] border border-line bg-paper-warm p-6 md:p-8">
            <h3 className="text-[22px] font-semibold">{t.showcase.topTitle}</h3>
            <p className="mt-2 text-[14px] text-ink/60">{t.showcase.topSub}</p>
            <div className="mt-6 space-y-2.5">
              {top.map((r) => (
                <Bar key={r.name} label={r.name} value={r.units} max={maxTop} fmt={fmt} />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-10">
            <div className="rounded-[24px] border border-line bg-paper-warm p-6 md:p-8">
              <h3 className="text-[22px] font-semibold">{t.showcase.baTitle}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-ink/60">{t.showcase.baBody}</p>
              <div className="mt-6 space-y-4">
                {ba.map((r) => (
                  <div key={r.name}>
                    <p className="text-[14px] font-semibold">{r.name}</p>
                    <div className="mt-1.5 grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-muted p-3">
                        <p className="text-[11px] uppercase tracking-wide text-ink/50">{t.showcase.before}</p>
                        <p className="font-mono text-[15px]">{fmt(r.before)} {t.showcase.units}</p>
                      </div>
                      <div className="rounded-lg p-3" style={{ background: "#fdeef0" }}>
                        <p className="text-[11px] uppercase tracking-wide text-ink/50">{t.showcase.after}</p>
                        <p className="font-mono text-[15px] font-semibold" style={{ color: RED }}>{fmt(r.after)} {t.showcase.units}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-line bg-paper-warm p-6 md:p-8">
              <h3 className="text-[22px] font-semibold">{t.showcase.futureTitle}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-ink/60">{t.showcase.futureBody}</p>
              <p className="mt-4 text-[13px] font-medium text-ink/50">{t.showcase.futureSub}</p>
              <div className="mt-3 space-y-2.5">
                {future.map((r) => (
                  <Bar key={r.name} label={r.name} value={r.units} max={maxFut} fmt={fmt} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <div className="rounded-[24px] border border-line bg-paper-warm p-6 md:p-8">
            <h3 className="text-[22px] font-semibold">{t.showcase.statusTitle}</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-ink/60">{t.showcase.statusBody}</p>
            {split && (
              <div className="mt-6">
                <div className="flex h-10 overflow-hidden rounded-[12px]">
                  {[
                    { k: "built", v: split.built, c: RED, l: t.showcase.built },
                    { k: "active", v: split.active, c: INK, l: t.showcase.active },
                    { k: "proposed", v: split.proposed, c: "#9aa0b4", l: t.showcase.proposed },
                  ].map((s) => {
                    const tot = split.built + split.active + split.proposed || 1;
                    return (
                      <div key={s.k} className="flex items-center justify-center" style={{ width: `${(s.v / tot) * 100}%`, background: s.c }}>
                        <span className="px-2 text-[12px] font-semibold text-white">{Math.round((s.v / tot) * 100)}%</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1">
                  {[
                    { l: t.showcase.built, v: split.built },
                    { l: t.showcase.active, v: split.active },
                    { l: t.showcase.proposed, v: split.proposed },
                  ].map((s) => (
                    <p key={s.l} className="text-[14px] text-ink/70"><span className="font-semibold">{s.l}</span>: {fmt(s.v)} {t.showcase.units}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="rounded-[24px] bg-ink p-6 text-white md:p-10">
            <h3 className="display text-[28px] md:text-[36px]">{t.showcase.litTitle}</h3>
            <p className="mt-4 max-w-[860px] text-[16px] leading-relaxed text-white/75 md:text-[18px]">{t.showcase.litBody}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
