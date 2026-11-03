"use client";

import { Check, Minus, X } from "lucide-react";
import { Panel } from "@/components/admin/ui";
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

export function SeoScore({ report }: { report: SeoReport }) {
  const tone = report.score >= 80 ? "text-emerald-600" : report.score >= 50 ? "text-amber-600" : "text-red-600";
  const bar = report.score >= 80 ? "bg-emerald-500" : report.score >= 50 ? "bg-amber-500" : "bg-red-500";
  return (
    <Panel
      title="SEO score"
      action={<span className={cn("font-display text-xl font-semibold tabular-nums", tone)}>{report.score}</span>}
    >
      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-surface-3">
        <div className={cn("h-full transition-[width] duration-300", bar)} style={{ width: `${report.score}%` }} />
      </div>
      <ul className="space-y-2">
        {report.checks.map((c) => (
          <li key={c.id} className="flex items-start gap-2 text-[13px]">
            <span
              className={cn(
                "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                c.state === "pass" && "bg-emerald-50 text-emerald-600",
                c.state === "warn" && "bg-amber-50 text-amber-600",
                c.state === "fail" && "bg-red-50 text-red-600",
              )}
            >
              {c.state === "pass" ? <Check className="h-3 w-3" /> : c.state === "warn" ? <Minus className="h-3 w-3" /> : <X className="h-3 w-3" />}
            </span>
            <span className="min-w-0 flex-1 text-ink-900">{c.label}</span>
            {c.detail ? <span className="shrink-0 text-xs text-muted">{c.detail}</span> : null}
          </li>
        ))}
      </ul>
    </Panel>
  );
}
