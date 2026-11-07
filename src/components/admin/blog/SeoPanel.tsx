"use client";

import { cn } from "@/lib/utils";
import { company } from "@/lib/content";
import type { SeoReport } from "@/components/blog/analysis";

export function Meter({ value, max, min = 0 }: { value: number; max: number; min?: number }) {
  const over = value > max;
  const under = value > 0 && value < min;
  return (
    <span className={cn("tabular-nums", over ? "text-red-600" : under ? "text-amber-600" : value ? "text-emerald-600" : "text-muted")}>
      {value}/{max}
    </span>
  );
}

export function GooglePreview({
  title,
  metaTitle,
  description,
  slug,
}: {
  title: string;
  metaTitle: string;
  description: string;
  slug: string;
}) {
  const shownTitle = metaTitle.trim() || `${title.trim() || "Article title"} · ${company.name}`;
  const host = company.domain.replace(/^https?:\/\//, "");
  return (
    <div className="rounded-[5px] border border-line bg-white p-3">
      <p className="truncate text-xs text-[#4d5156]">
        {host} › blogs › {slug || "slug"}
      </p>
      <p className="mt-0.5 line-clamp-1 text-[17px] leading-snug text-[#1a0dab]">{shownTitle}</p>
      <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-[#4d5156]">
        {description.trim() || "Add a meta description or excerpt to control this snippet."}
      </p>
    </div>
  );
}

export function SeoScore({
  report,
  titleLength,
  metaLength,
}: {
  report: SeoReport;
  titleLength: number;
  metaLength: number;
}) {
  const tone = report.score >= 80 ? "text-emerald-600" : report.score >= 50 ? "text-amber-600" : "text-red-600";
  return (
    <section className="rounded-[5px] border border-line bg-white p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">SEO readiness</p>
      <p className="mt-1 text-xs leading-relaxed text-body">Search, answer engines, and AI citations all read the same page.</p>
      <div className="mt-4 flex items-end justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">Overall score</p>
        <p className={cn("font-display text-4xl font-semibold tabular-nums leading-none", tone)}>{report.score}%</p>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          ["Title", titleLength],
          ["Meta", metaLength],
          ["Words", report.words],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[5px] border border-line px-2 py-2 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">{label}</p>
            <p className="mt-1 font-display text-lg font-semibold tabular-nums text-ink-900">{value}</p>
          </div>
        ))}
      </div>
      <ul className="mt-4 space-y-2.5">
        {report.checks.map((c) => (
          <li key={c.id} className="flex items-start gap-2 text-[13px] leading-snug">
            <span
              className={cn(
                "mt-1 h-2 w-2 shrink-0 rounded-full",
                c.state === "pass" && "bg-emerald-500",
                c.state === "warn" && "bg-amber-500",
                c.state === "fail" && "bg-red-500",
              )}
            />
            <span className={cn("min-w-0", c.state === "pass" ? "text-ink-900" : c.state === "warn" ? "text-amber-700" : "text-red-600")}>
              <span className="font-medium">{c.label}</span>
              {c.detail ? <span className="font-normal text-body"> — {c.detail}</span> : null}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
