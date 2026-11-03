"use client";

import { useState } from "react";
import Link from "next/link";
import { Panel } from "@/components/admin/ui";
import { formatKes } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { DayPoint } from "@/lib/desk";
import { compact } from "./format";

const TABS = [
  { id: "revenue", label: "Revenue", empty: "No paid revenue in the last 30 days", href: "/console/invoices/new", cta: "New invoice" },
  { id: "enquiries", label: "Enquiries", empty: "No enquiries in the last 30 days", href: "/console/leads", cta: "Open enquiries" },
  { id: "tickets", label: "Tickets", empty: "No tickets sold in the last 30 days", href: "/console/events", cta: "Open events" },
] as const;

type Metric = (typeof TABS)[number]["id"];

function niceStep(raw: number, integer: boolean) {
  if (raw <= 0) return 1;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag;
  return integer ? Math.max(1, Math.ceil(step)) : step;
}

const W = 600;
const H = 200;
const TICKS = 4;

export function ActivityChart({ series }: { series: DayPoint[] }) {
  const [metric, setMetric] = useState<Metric>("revenue");
  const [hover, setHover] = useState<number | null>(null);
  const tab = TABS.find((t) => t.id === metric)!;

  const values = series.map((p) => p[metric]);
  const total = values.reduce((s, v) => s + v, 0);
  const max = Math.max(...values, 0);
  const step = niceStep(max / TICKS, metric !== "revenue");
  const top = step * TICKS;
  const ticks = Array.from({ length: TICKS + 1 }, (_, i) => step * (TICKS - i));
  const peak = max > 0 ? values.indexOf(max) : -1;
  const active = hover ?? peak;

  const slot = W / series.length;
  const barW = slot * 0.56;
  const fmt = (v: number) => (metric === "revenue" ? formatKes(v) : v.toLocaleString("en-KE"));

  return (
    <Panel
      className="lg:col-span-2"
      title={tab.label}
      meta={`${fmt(total)} in the last 30 days`}
      action={
        <div className="flex rounded-[5px] border border-line p-0.5" role="tablist" aria-label="Chart metric">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={metric === t.id}
              onClick={() => {
                setMetric(t.id);
                setHover(null);
              }}
              className={cn(
                "cursor-pointer rounded-[4px] px-2.5 py-1 text-[12px] font-medium transition-colors",
                metric === t.id ? "bg-ink-900 text-white" : "text-body hover:text-ink-900",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      }
    >
      <div className="flex gap-3">
        <div className="relative h-46 w-9 shrink-0 text-right text-[11px] tabular-nums text-muted" aria-hidden>
          {ticks.map((t, i) => (
            <span key={t} className="absolute right-0 -translate-y-1/2 leading-none" style={{ top: `${(i / TICKS) * 100}%` }}>
              {metric === "revenue" ? compact(t) : t}
            </span>
          ))}
        </div>
        <div className="relative min-w-0 flex-1">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            className="block h-46 w-full"
            role="img"
            aria-label={`${tab.label} per day for the last 30 days, ${fmt(total)} in total`}
            onMouseLeave={() => setHover(null)}
          >
            {ticks.map((t) => {
              const y = H - (t / top) * H;
              return (
                <line
                  key={t}
                  x1={0}
                  x2={W}
                  y1={y}
                  y2={y}
                  className="stroke-line"
                  strokeDasharray={t === 0 ? undefined : "3 4"}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
            {values.map((v, i) => {
              const h = v > 0 ? Math.max(3, (v / top) * H) : 0;
              return (
                <g key={series[i].day} onMouseEnter={() => setHover(i)}>
                  <rect x={i * slot} y={0} width={slot} height={H} className="fill-transparent" />
                  {h > 0 ? (
                    <rect
                      x={i * slot + (slot - barW) / 2}
                      y={H - h}
                      width={barW}
                      height={h}
                      rx={2}
                      className={cn("transition-colors", i === active ? "fill-brand-500" : "fill-brand-200")}
                    />
                  ) : null}
                </g>
              );
            })}
          </svg>
          <div className="mt-2 flex h-4 justify-between text-[11px] text-muted">
            {[0, 7, 14, 21, series.length - 1].map((i) => (
              <span key={i}>{series[i]?.label}</span>
            ))}
          </div>

          {total === 0 ? (
            <div className="absolute inset-x-0 top-0 flex h-46 flex-col items-center justify-center gap-2 text-center">
              <p className="text-sm text-muted">{tab.empty}</p>
              <Link href={tab.href} className="text-[13px] font-medium text-brand-600 hover:text-brand-700">
                {tab.cta}
              </Link>
            </div>
          ) : null}

          {hover != null ? (
            <div
              className={cn(
                "pointer-events-none absolute top-0 rounded-[5px] bg-ink-900 px-2.5 py-1.5 text-white shadow-sm",
                hover < 4 ? "translate-x-0" : hover > series.length - 5 ? "-translate-x-full" : "-translate-x-1/2",
              )}
              style={{ left: `${((hover + 0.5) / series.length) * 100}%` }}
            >
              <p className="text-[11px] text-white/60">{series[hover].label}</p>
              <p className="font-display text-[13px] font-semibold tabular-nums">{fmt(values[hover])}</p>
            </div>
          ) : null}
        </div>
      </div>
    </Panel>
  );
}
