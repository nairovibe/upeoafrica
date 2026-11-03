import Link from "next/link";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

function Spark({ values }: { values: number[] }) {
  const max = Math.max(...values, 0);
  const w = 6;
  const gap = 3;
  const h = 36;
  return (
    <svg
      viewBox={`0 0 ${values.length * (w + gap) - gap} ${h}`}
      className="h-9 w-[86px] shrink-0"
      aria-hidden
    >
      {values.map((v, i) => {
        const bar = max > 0 ? Math.max(2, (v / max) * h) : 2;
        return (
          <rect
            key={i}
            x={i * (w + gap)}
            y={h - bar}
            width={w}
            height={bar}
            rx={1.5}
            className={v <= 0 ? "fill-surface-3" : i === values.length - 1 ? "fill-brand-500" : "fill-brand-200"}
          />
        );
      })}
    </svg>
  );
}

export function KpiCard({
  label,
  value,
  trend,
  tone = "neutral",
  href,
  series,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  trend: React.ReactNode;
  tone?: "up" | "down" | "neutral";
  href: string;
  series?: number[];
  icon?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col justify-between gap-4 rounded-[5px] border border-line bg-white p-5 transition-colors duration-150 hover:border-brand-300"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium text-body">{label}</p>
        {icon ? (
          <span className="flex h-8 w-8 items-center justify-center rounded-[5px] bg-brand-50 text-brand-600">{icon}</span>
        ) : null}
      </div>
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-display text-[26px] font-semibold leading-none tabular-nums text-ink-900">{value}</p>
          <p
            className={cn(
              "mt-2 flex items-center gap-1 text-xs font-medium",
              tone === "up" && "text-emerald-600",
              tone === "down" && "text-red-600",
              tone === "neutral" && "text-muted",
            )}
          >
            {tone === "up" ? <TrendingUp className="h-3.5 w-3.5" aria-hidden /> : null}
            {tone === "down" ? <TrendingDown className="h-3.5 w-3.5" aria-hidden /> : null}
            {trend}
          </p>
        </div>
        {series ? <Spark values={series} /> : null}
      </div>
    </Link>
  );
}
