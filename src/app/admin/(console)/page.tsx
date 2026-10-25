import Link from "next/link";
import { getTodayBrief, relativeAge } from "@/lib/desk";
import { formatKes } from "@/lib/constants";
import { cn } from "@/lib/utils";

function delta(current: number, previous: number) {
  if (previous === 0 && current === 0) return "Flat vs last week";
  if (previous === 0) return "New this week";
  const pct = Math.round(((current - previous) / previous) * 100);
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct}% vs last week`;
}

function Sparkline({ series }: { series: { day: string; enquiries: number; money: number }[] }) {
  const maxE = Math.max(1, ...series.map((s) => s.enquiries));
  const maxM = Math.max(1, ...series.map((s) => s.money));
  const w = 560;
  const h = 120;
  const step = w / Math.max(1, series.length - 1);
  const ePoints = series.map((s, i) => `${i * step},${h - (s.enquiries / maxE) * (h - 8) - 4}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-28 w-full" role="img" aria-label="Enquiries and money over 14 days">
      {series.map((s, i) => (
        <rect
          key={s.day}
          x={i * step - 6}
          y={h - (s.money / maxM) * (h - 12) - 4}
          width="12"
          height={(s.money / maxM) * (h - 12)}
          className="fill-brand-100"
        />
      ))}
      <polyline fill="none" stroke="#f97316" strokeWidth="2" points={ePoints} />
    </svg>
  );
}

export default async function AdminDeskPage() {
  const brief = await getTodayBrief();
  const metrics = [
    {
      label: "Needs a reply",
      value: String(brief.needsReply),
      hint: brief.slaLate ? `${brief.slaLate} past 24 hours` : "Inside the 24 hour clock",
      href: "/admin/leads",
    },
    {
      label: "Money in (7 days)",
      value: formatKes(brief.money7),
      hint: delta(brief.money7, brief.moneyPrev),
      href: "/admin/orders",
    },
    {
      label: "Waiting on M-Pesa",
      value: String(brief.waitingPay),
      hint: "Pending orders and unpaid invoices",
      href: "/admin/invoices",
    },
    {
      label: "Live this month",
      value: String(brief.liveMonth),
      hint: "Work, articles, and products published",
      href: "/admin/work",
    },
  ];

  const pipelineTotal = brief.pipeline.Build + brief.pipeline.Design + brief.pipeline.Grow + brief.pipeline.Other || 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">Today</h1>
        <p className="mt-1 text-sm text-body">What needs a human before the day runs away from you.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m) => (
          <Link
            key={m.label}
            href={m.href}
            className="border border-line bg-white px-4 py-4 rounded-[5px] hover:border-brand-300"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{m.label}</p>
            <p className="mt-2 font-display text-3xl font-semibold tabular-nums text-ink-900">{m.value}</p>
            <p className="mt-1 text-xs text-body">{m.hint}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
        <section className="border border-line bg-white p-4 rounded-[5px]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Fourteen days</p>
          <p className="mt-1 text-sm text-body">Orange line is enquiries. Bars are money in.</p>
          <div className="mt-3">
            <Sparkline series={brief.series} />
          </div>
          <p className="mt-2 text-xs text-muted">
            {brief.series.reduce((s, d) => s + d.enquiries, 0)} enquiries and{" "}
            {formatKes(brief.series.reduce((s, d) => s + d.money, 0))} paid in this window.
          </p>
        </section>
        <section className="border border-line bg-white p-4 rounded-[5px]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Open pipeline</p>
          <p className="mt-1 text-sm text-body">Live briefs by studio line.</p>
          <ul className="mt-4 space-y-3">
            {(["Build", "Design", "Grow", "Other"] as const).map((name) => {
              const n = brief.pipeline[name];
              return (
                <li key={name}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium text-ink-900">{name}</span>
                    <span className="tabular-nums text-muted">{n}</span>
                  </div>
                  <div className="h-1.5 bg-surface-3">
                    <div
                      className={cn("h-1.5 bg-brand-500", name === "Other" && "bg-ink-700")}
                      style={{ width: `${Math.round((n / pipelineTotal) * 100)}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
          {brief.nextEvent ? (
            <Link href={`/admin/events/${brief.nextEvent.id}`} className="mt-5 block border-t border-line pt-4 text-sm hover:text-brand-600">
              Next event: {brief.nextEvent.title}
              <span className="mt-1 block text-xs text-muted">
                {new Date(brief.nextEvent.starts_at).toLocaleString("en-KE")} · {brief.ticketsSold} tickets paid
              </span>
            </Link>
          ) : (
            <p className="mt-5 border-t border-line pt-4 text-xs text-muted">
              No upcoming event. Publish one when training or a talk is on the calendar.
            </p>
          )}
        </section>
      </div>

      <section className="border border-line bg-white rounded-[5px]">
        <div className="flex items-end justify-between border-b border-line px-4 py-3">
          <div>
            <p className="font-display text-lg font-semibold text-ink-900">Work queue</p>
            <p className="text-xs text-muted">The next eight things that should not wait.</p>
          </div>
        </div>
        {brief.queue.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted">
            Queue is clear. Raise an invoice from a won lead when the next brief lands.
          </p>
        ) : (
          <ul>
            {brief.queue.map((item) => (
              <li key={`${item.kind}-${item.id}`} className="flex items-center gap-3 border-b border-line px-4 py-3 last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-900">{item.who}</p>
                  <p className="truncate text-xs text-muted">{item.what}</p>
                </div>
                <span className="tabular-nums text-xs text-muted">{relativeAge(item.when)}</span>
                <Link
                  href={item.href}
                  className="shrink-0 text-[13px] font-medium text-brand-600 hover:text-brand-700"
                >
                  {item.action}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
