import Link from "next/link";
import {
  AlertTriangle,
  CalendarDays,
  Clock,
  Download,
  FileText,
  MessageSquare,
  Plus,
  Ticket,
  type LucideIcon,
} from "lucide-react";
import { LinkPending } from "@/components/admin/pending";
import { Panel, Pill, type PillTone } from "@/components/admin/ui";
import { formatKes } from "@/lib/constants";
import { hoursAgo, relativeAge } from "@/lib/desk";
import type { DraftItem, Overview, QueueItem, RecentLead, Transaction, UpcomingEvent } from "@/lib/desk";
import { cn } from "@/lib/utils";
import { percent } from "./format";

const TZ = "Africa/Nairobi";
const dayNum = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, day: "numeric" });
const monthShort = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, month: "short" });
const timeShort = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, weekday: "short", hour: "2-digit", minute: "2-digit" });

const LEAD_TONES: Record<string, PillTone> = {
  new: "brand",
  contacted: "warning",
  qualified: "ink",
  won: "success",
  lost: "neutral",
};

const MODE_LABEL: Record<string, string> = { in_person: "In person", online: "Online", hybrid: "Hybrid" };

function CardLink({ href, icon, children }: { href: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-[12px] font-medium text-brand-600 hover:text-brand-700 [&_svg]:h-3.5 [&_svg]:w-3.5"
    >
      <LinkPending icon={icon} />
      {children}
    </Link>
  );
}

function Empty({ text, href, cta }: { text: string; href: string; cta: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-5 py-10 text-center">
      <p className="text-sm text-muted">{text}</p>
      <CardLink href={href} icon={/^(New|Write) /.test(cta) ? <Plus aria-hidden /> : undefined}>
        {cta}
      </CardLink>
    </div>
  );
}

function Glyph({ icon: Icon, className }: { icon: LucideIcon; className?: string }) {
  return (
    <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-[5px] bg-surface-3 text-ink-900", className)}>
      <Icon className="h-4 w-4" aria-hidden />
    </span>
  );
}

function ageLabel(iso: string) {
  const h = hoursAgo(iso);
  if (h >= 0) return relativeAge(iso);
  const ahead = -h;
  return ahead < 24 ? `in ${Math.max(1, Math.round(ahead))}h` : `in ${Math.round(ahead / 24)}d`;
}

const LINE_COLORS = {
  Build: "bg-brand-500",
  Design: "bg-brand-300",
  Grow: "bg-ink-700",
  Other: "bg-line",
} as const;

export function PipelineCard({ funnel, lines }: Pick<Overview, "funnel" | "lines">) {
  const won = funnel.stages[funnel.stages.length - 1].reached;
  const open = lines.Build + lines.Design + lines.Grow + lines.Other;
  return (
    <Panel
      title="Pipeline"
      meta={funnel.total ? `Last 90 days · ${percent(won, funnel.total)}% won` : "Last 90 days"}
      action={<CardLink href="/console/leads">Enquiries</CardLink>}
    >
      {funnel.total === 0 ? (
        <Empty text="No enquiries in the last 90 days" href="/console/leads" cta="Open enquiries" />
      ) : (
        <>
          <ul className="space-y-3.5">
            {funnel.stages.map((s) => {
              const pct = percent(s.reached, funnel.total);
              return (
                <li key={s.status}>
                  <div className="mb-1.5 flex items-baseline justify-between text-[13px]">
                    <span className="font-medium text-ink-900">{s.label}</span>
                    <span className="tabular-nums text-muted">
                      <span className="font-display font-semibold text-ink-900">{s.reached}</span> · {pct}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-surface-3">
                    <div className="h-1.5 rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-5 border-t border-line pt-4">
            <div className="mb-2.5 flex items-baseline justify-between text-[13px]">
              <span className="font-medium text-ink-900">Open briefs by line</span>
              <span className="font-display font-semibold tabular-nums text-ink-900">{open}</span>
            </div>
            {open === 0 ? (
              <p className="text-xs text-muted">No open briefs</p>
            ) : (
              <>
                <div className="flex h-2 gap-0.5 overflow-hidden rounded-full">
                  {(Object.keys(LINE_COLORS) as (keyof typeof LINE_COLORS)[]).map((name) =>
                    lines[name] > 0 ? (
                      <div key={name} className={LINE_COLORS[name]} style={{ width: `${percent(lines[name], open)}%` }} />
                    ) : null,
                  )}
                </div>
                <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                  {(Object.keys(LINE_COLORS) as (keyof typeof LINE_COLORS)[]).map((name) => (
                    <li key={name} className="flex items-center gap-2">
                      <span className={cn("h-2 w-2 rounded-full", LINE_COLORS[name])} />
                      <span className="text-body">{name}</span>
                      <span className="ml-auto tabular-nums text-ink-900">{lines[name]}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </>
      )}
    </Panel>
  );
}

function EventRow({ event }: { event: UpcomingEvent }) {
  const pct = event.capacity ? Math.min(100, percent(event.sold, event.capacity)) : 0;
  const where = [MODE_LABEL[event.mode] ?? event.mode, event.venue].filter(Boolean).join(" · ");
  return (
    <li>
      <Link href={`/console/events/${event.id}`} className="flex gap-3 border-t border-line px-5 py-3.5 hover:bg-surface-2">
        <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-[5px] border border-line">
          <span className="font-display text-[15px] font-semibold leading-none tabular-nums text-ink-900">
            {dayNum.format(new Date(event.starts_at))}
          </span>
          <span className="mt-0.5 text-[10px] font-medium uppercase text-muted">{monthShort.format(new Date(event.starts_at))}</span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate text-[13px] font-medium text-ink-900">{event.title}</span>
            {event.published ? null : <Pill>Draft</Pill>}
          </span>
          <span className="block truncate text-xs text-muted">
            {timeShort.format(new Date(event.starts_at))}
            {where ? ` · ${where}` : ""}
          </span>
          <span className="mt-2 flex items-center gap-2">
            <span className="h-1.5 flex-1 rounded-full bg-surface-3">
              <span className="block h-1.5 rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
            </span>
            <span className="shrink-0 text-[11px] tabular-nums text-body">
              {event.capacity ? `${event.sold}/${event.capacity}` : `${event.sold} sold`}
            </span>
          </span>
        </span>
      </Link>
    </li>
  );
}

export function UpcomingEventsCard({ events }: { events: UpcomingEvent[] }) {
  return (
    <Panel title="Upcoming events" action={<CardLink href="/console/events">All events</CardLink>} flush>
      {events.length === 0 ? (
        <Empty text="No upcoming events" href="/console/events/new" cta="New event" />
      ) : (
        <ul>
          {events.map((e) => (
            <EventRow key={e.id} event={e} />
          ))}
        </ul>
      )}
    </Panel>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function RecentEnquiriesCard({ leads }: { leads: RecentLead[] }) {
  return (
    <Panel title="Recent enquiries" action={<CardLink href="/console/leads">View all</CardLink>} flush>
      {leads.length === 0 ? (
        <Empty text="No enquiries yet" href="/console/leads" cta="Open enquiries" />
      ) : (
        <ul>
          {leads.map((lead) => (
            <li key={lead.id}>
              <Link href={`/console/leads/${lead.id}`} className="flex items-center gap-3 border-t border-line px-5 py-3 hover:bg-surface-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-3 text-[12px] font-semibold text-ink-900">
                  {initials(lead.name)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-ink-900">
                    {lead.name}
                    {lead.company ? <span className="font-normal text-muted"> · {lead.company}</span> : null}
                  </span>
                  <span className="block truncate text-xs text-muted">{lead.service}</span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1">
                  <Pill tone={LEAD_TONES[lead.status] ?? "neutral"}>{lead.status}</Pill>
                  <span className="text-[11px] tabular-nums text-muted">{relativeAge(lead.created_at)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

const TX_ICONS: Record<Transaction["kind"], LucideIcon> = {
  product: Download,
  ticket: Ticket,
  invoice: FileText,
};

export function TransactionsCard({ transactions, className }: { transactions: Transaction[]; className?: string }) {
  return (
    <Panel
      title="Latest transactions"
      action={<CardLink href="/console/orders">Orders</CardLink>}
      flush
      className={className}
    >
      {transactions.length === 0 ? (
        <Empty text="No transactions yet" href="/console/invoices/new" cta="New invoice" />
      ) : (
        <ul>
          {transactions.map((tx) => (
            <li key={`${tx.kind}-${tx.id}`}>
              <Link href={tx.href} className="flex items-center gap-3 border-t border-line px-5 py-3 hover:bg-surface-2">
                <Glyph icon={TX_ICONS[tx.kind]} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-ink-900">{tx.who}</span>
                  <span className="block truncate text-xs text-muted">{tx.what}</span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1">
                  <span className="font-display text-[13px] font-semibold tabular-nums text-ink-900">{formatKes(tx.amount)}</span>
                  <Pill tone={tx.status === "paid" ? "success" : "warning"}>{tx.status}</Pill>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

const QUEUE_ICONS: Record<QueueItem["kind"], { icon: LucideIcon; className: string }> = {
  enquiry: { icon: MessageSquare, className: "bg-brand-50 text-brand-600" },
  payment: { icon: AlertTriangle, className: "bg-red-50 text-red-600" },
  overdue: { icon: Clock, className: "bg-amber-50 text-amber-700" },
  invoice: { icon: FileText, className: "" },
  event: { icon: CalendarDays, className: "" },
};

export function AttentionCard({ queue, total, className }: { queue: QueueItem[]; total: number; className?: string }) {
  return (
    <Panel title="Needs attention" meta={total ? `${total} open` : "All caught up"} flush className={className}>
      {queue.length === 0 ? (
        <Empty text="Nothing is waiting on you" href="/console/leads" cta="Open enquiries" />
      ) : (
        <ul>
          {queue.map((item) => {
            const look = QUEUE_ICONS[item.kind];
            return (
              <li key={`${item.kind}-${item.id}`} className="flex items-center gap-3 border-t border-line px-5 py-3">
                <Glyph icon={look.icon} className={look.className} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-ink-900">{item.who}</span>
                  <span className="block truncate text-xs text-muted">{item.what}</span>
                </span>
                <span className="hidden shrink-0 text-[11px] tabular-nums text-muted sm:block">{ageLabel(item.when)}</span>
                <Link
                  href={item.href}
                  className="shrink-0 rounded-[5px] border border-line px-2.5 py-1 text-[12px] font-medium text-ink-900 hover:border-brand-300 hover:text-brand-600"
                >
                  {item.action}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      {total > queue.length ? (
        <p className="border-t border-line px-5 py-3 text-xs text-muted">{total - queue.length} more in the queue</p>
      ) : null}
    </Panel>
  );
}

export function PublishingCard({ published, drafts }: { published: Overview["published"]; drafts: DraftItem[] }) {
  return (
    <Panel title="Publishing" meta="Published this month" flush>
      <div className="grid grid-cols-4 border-t border-line">
        {published.map((p) => (
          <Link key={p.label} href={p.href} className="border-l border-line px-3 py-3.5 text-center first:border-l-0 hover:bg-surface-2">
            <span className="block font-display text-xl font-semibold tabular-nums text-ink-900">{p.count}</span>
            <span className="mt-0.5 block text-[11px] text-muted">{p.label}</span>
          </Link>
        ))}
      </div>
      {drafts.length === 0 ? (
        <div className="border-t border-line">
          <Empty text="No drafts in progress" href="/console/insights/new" cta="Write a post" />
        </div>
      ) : (
        <ul>
          {drafts.map((d) => (
            <li key={`${d.kind}-${d.id}`} className="flex items-center gap-3 border-t border-line px-5 py-3">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-ink-900">{d.title || "Untitled"}</span>
                <span className="block text-xs text-muted">
                  {d.kind} draft · {relativeAge(d.updated_at)}
                </span>
              </span>
              <Link href={d.href} className="shrink-0 text-[12px] font-medium text-brand-600 hover:text-brand-700">
                Edit
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
