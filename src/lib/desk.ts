import { createClient } from "@/lib/supabase/server";
import { megaServices } from "@/lib/content";
import { services as serviceCatalog } from "@/lib/services";
import { formatKes } from "@/lib/constants";
import type { Lead } from "@/lib/cms";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const TZ = "Africa/Nairobi";

export function hoursAgo(iso: string) {
  return (Date.now() - new Date(iso).getTime()) / HOUR;
}

export function relativeAge(iso: string) {
  const h = hoursAgo(iso);
  if (h < 1) return `${Math.max(1, Math.round(h * 60))}m`;
  if (h < 24) return `${Math.round(h)}h`;
  return `${Math.round(h / 24)}d`;
}

export function slaBreached(lead: Pick<Lead, "status" | "created_at" | "updated_at">, hours = 24) {
  if (lead.status !== "new" && lead.status !== "contacted") return false;
  const from = lead.status === "new" ? lead.created_at : lead.updated_at;
  return hoursAgo(from) >= hours;
}

export function pipelineGroup(services: string[]) {
  const groups = { Build: 0, Design: 0, Grow: 0, Other: 0 };
  if (!services.length) {
    groups.Other += 1;
    return groups;
  }
  for (const slug of services) {
    const hit = megaServices.find((g) => g.slugs.includes(slug));
    if (hit) groups[hit.group as keyof typeof groups] += 1;
    else groups.Other += 1;
  }
  return groups;
}

export type DeskBadges = {
  inbox: number;
  money: number;
  invoices: number;
  notices: number;
};

export async function getDeskBadges(): Promise<DeskBadges> {
  const supabase = await createClient();
  const [inbox, pendingOrders, unpaidInvoices, notices] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("invoices").select("id", { count: "exact", head: true }).in("status", ["draft", "sent"]),
    supabase.from("notifications").select("id", { count: "exact", head: true }).is("read_at", null),
  ]);
  return {
    inbox: inbox.count ?? 0,
    money: pendingOrders.count ?? 0,
    invoices: unpaidInvoices.count ?? 0,
    notices: notices.count ?? 0,
  };
}

const dayFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Calendar day in Nairobi as YYYY-MM-DD. */
export function nairobiDay(value: string | Date) {
  return dayFormat.format(typeof value === "string" ? new Date(value) : value);
}

export function serviceLabel(slugs: string[]) {
  if (!slugs.length) return "General enquiry";
  const first = serviceCatalog.find((s) => s.slug === slugs[0])?.title ?? slugs[0];
  return slugs.length > 1 ? `${first} +${slugs.length - 1}` : first;
}

const labelFormat = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, day: "numeric", month: "short" });

export type DayPoint = { day: string; label: string; enquiries: number; revenue: number; tickets: number };

export type FunnelStage = { status: "new" | "contacted" | "qualified" | "won"; label: string; reached: number };

export type UpcomingEvent = {
  id: string;
  title: string;
  starts_at: string;
  mode: string;
  venue: string | null;
  capacity: number | null;
  published: boolean;
  sold: number;
  held: number;
};

export type RecentLead = {
  id: string;
  name: string;
  company: string | null;
  service: string;
  status: string;
  created_at: string;
};

export type Transaction = {
  id: string;
  kind: "product" | "ticket" | "invoice";
  who: string;
  what: string;
  amount: number;
  status: "paid" | "pending";
  when: string;
  href: string;
};

export type QueueItem = {
  id: string;
  kind: "enquiry" | "payment" | "overdue" | "invoice" | "event";
  who: string;
  what: string;
  when: string;
  href: string;
  action: string;
};

export type DraftItem = { id: string; kind: string; title: string; updated_at: string; href: string };

export type Overview = {
  series: DayPoint[];
  enquiries: { current: number; previous: number };
  revenue: { current: number; previous: number };
  outstanding: { total: number; count: number; overdue: number };
  tickets: { sold: number; events: number };
  funnel: { stages: FunnelStage[]; total: number; lost: number };
  lines: { Build: number; Design: number; Grow: number; Other: number };
  upcoming: UpcomingEvent[];
  recentLeads: RecentLead[];
  transactions: Transaction[];
  queue: QueueItem[];
  queueTotal: number;
  published: { label: string; count: number; href: string }[];
  drafts: DraftItem[];
};

const SERIES_DAYS = 30;
const QUEUE_ORDER: QueueItem["kind"][] = ["enquiry", "payment", "overdue", "invoice", "event"];

function sum<T>(rows: T[], pick: (row: T) => number) {
  return rows.reduce((s, row) => s + pick(row), 0);
}

export async function getOverview(): Promise<Overview> {
  const supabase = await createClient();
  const now = Date.now();
  const today = nairobiDay(new Date(now));
  const seriesStart = new Date(now - SERIES_DAYS * DAY).toISOString();
  const pipelineStart = new Date(now - 90 * DAY).toISOString();
  const monthStart = new Date(`${today.slice(0, 7)}-01T00:00:00+03:00`).toISOString();
  const eventsFrom = new Date(now - 12 * HOUR).toISOString();
  const failedFrom = new Date(now - 14 * DAY).toISOString();

  const [
    leads90,
    recentLeads,
    openLeads,
    paidOrders,
    paidInvoices,
    unpaidInvoices,
    upcomingEvents,
    ticketStats,
    txOrders,
    txInvoices,
    failedOrders,
    workLive,
    articlesLive,
    productsLive,
    eventsLive,
    workDrafts,
    articleDrafts,
    productDrafts,
    eventDrafts,
  ] = await Promise.all([
    supabase.from("leads").select("status, services, created_at").gte("created_at", pipelineStart).limit(5000),
    supabase
      .from("leads")
      .select("id, name, company, services, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("leads")
      .select("id, name, company, services, status, created_at, updated_at")
      .in("status", ["new", "contacted"])
      .order("created_at", { ascending: true })
      .limit(30),
    supabase
      .from("orders")
      .select("amount_kes, kind, quantity, created_at")
      .eq("status", "paid")
      .gte("created_at", seriesStart),
    supabase.from("invoices").select("total_kes, paid_at").eq("status", "paid").gte("paid_at", seriesStart),
    supabase
      .from("invoices")
      .select("id, number, bill_name, bill_company, total_kes, amount_paid_kes, status, due_on, created_at")
      .in("status", ["draft", "sent"])
      .order("created_at", { ascending: true })
      .limit(500),
    supabase
      .from("events")
      .select("id, title, starts_at, mode, venue, capacity, published_at")
      .gte("starts_at", eventsFrom)
      .order("starts_at", { ascending: true })
      .limit(50),
    supabase.from("event_ticket_stats").select("event_id, sold, held").limit(2000),
    supabase
      .from("orders")
      .select("id, kind, email, attendee_name, amount_kes, quantity, status, created_at, product:products(title), event:events(title)")
      .in("status", ["paid", "pending"])
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("invoices")
      .select("id, number, bill_name, bill_company, total_kes, status, sent_at, paid_at, updated_at")
      .in("status", ["sent", "paid"])
      .order("updated_at", { ascending: false })
      .limit(5),
    supabase
      .from("orders")
      .select("id, email, attendee_name, amount_kes, created_at")
      .eq("status", "failed")
      .gte("created_at", failedFrom)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("case_studies").select("id", { count: "exact", head: true }).gte("published_at", monthStart),
    supabase.from("articles").select("id", { count: "exact", head: true }).is("deleted_at", null).gte("published_at", monthStart),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("published", true)
      .gte("created_at", monthStart),
    supabase.from("events").select("id", { count: "exact", head: true }).gte("published_at", monthStart),
    supabase
      .from("case_studies")
      .select("id, title, updated_at")
      .is("published_at", null)
      .order("updated_at", { ascending: false })
      .limit(4),
    supabase
      .from("articles")
      .select("id, title, updated_at")
      .is("deleted_at", null)
      .is("published_at", null)
      .order("updated_at", { ascending: false })
      .limit(4),
    supabase
      .from("products")
      .select("id, title, updated_at")
      .eq("published", false)
      .order("updated_at", { ascending: false })
      .limit(4),
    supabase
      .from("events")
      .select("id, title, updated_at")
      .is("published_at", null)
      .order("updated_at", { ascending: false })
      .limit(4),
  ]);

  // Daily series, oldest first, bucketed by Nairobi calendar day.
  const series: DayPoint[] = [];
  for (let i = SERIES_DAYS - 1; i >= 0; i--) {
    const date = new Date(now - i * DAY);
    series.push({ day: nairobiDay(date), label: labelFormat.format(date), enquiries: 0, revenue: 0, tickets: 0 });
  }
  const index = new Map(series.map((p, i) => [p.day, i]));
  const bump = (iso: string | null, apply: (p: DayPoint) => void) => {
    if (!iso) return;
    const i = index.get(nairobiDay(iso));
    if (i != null) apply(series[i]);
  };

  const pipelineLeads = leads90.data ?? [];
  for (const lead of pipelineLeads) bump(lead.created_at, (p) => (p.enquiries += 1));
  for (const order of paidOrders.data ?? []) {
    bump(order.created_at, (p) => {
      p.revenue += Number(order.amount_kes);
      if (order.kind === "ticket") p.tickets += order.quantity;
    });
  }
  for (const inv of paidInvoices.data ?? []) bump(inv.paid_at, (p) => (p.revenue += Number(inv.total_kes)));

  const last7 = series.slice(-7);
  const prev7 = series.slice(-14, -7);

  const unpaid = unpaidInvoices.data ?? [];
  const balance = (inv: (typeof unpaid)[number]) => Number(inv.total_kes) - Number(inv.amount_paid_kes);
  const overdueInvoices = unpaid.filter((inv) => inv.status === "sent" && inv.due_on && inv.due_on < today);

  const statsByEvent = new Map<string, { sold: number; held: number }>();
  for (const row of ticketStats.data ?? []) {
    if (!row.event_id) continue;
    const cur = statsByEvent.get(row.event_id) ?? { sold: 0, held: 0 };
    cur.sold += row.sold ?? 0;
    cur.held += row.held ?? 0;
    statsByEvent.set(row.event_id, cur);
  }
  const events: UpcomingEvent[] = (upcomingEvents.data ?? []).map((e) => ({
    id: e.id,
    title: e.title,
    starts_at: e.starts_at,
    mode: e.mode,
    venue: e.venue,
    capacity: e.capacity,
    published: e.published_at != null,
    sold: statsByEvent.get(e.id)?.sold ?? 0,
    held: statsByEvent.get(e.id)?.held ?? 0,
  }));

  const statusCount = (status: string) => pipelineLeads.filter((l) => l.status === status).length;
  const won = statusCount("won");
  const qualified = statusCount("qualified") + won;
  const contacted = statusCount("contacted") + qualified;
  const lost = statusCount("lost");
  const funnel = {
    total: pipelineLeads.length,
    lost,
    stages: [
      { status: "new", label: "New", reached: pipelineLeads.length },
      { status: "contacted", label: "Contacted", reached: contacted },
      { status: "qualified", label: "Qualified", reached: qualified },
      { status: "won", label: "Won", reached: won },
    ] satisfies FunnelStage[],
  };

  const lines = { Build: 0, Design: 0, Grow: 0, Other: 0 };
  for (const lead of pipelineLeads) {
    if (!["new", "contacted", "qualified"].includes(lead.status)) continue;
    const g = pipelineGroup(lead.services ?? []);
    lines.Build += g.Build;
    lines.Design += g.Design;
    lines.Grow += g.Grow;
    lines.Other += g.Other;
  }

  const transactions: Transaction[] = [
    ...(txOrders.data ?? []).map((o): Transaction => {
      const isTicket = o.kind === "ticket";
      const title = isTicket ? o.event?.title : o.product?.title;
      return {
        id: o.id,
        kind: isTicket ? "ticket" : "product",
        who: o.attendee_name || o.email,
        what: title ? (isTicket && o.quantity > 1 ? `${o.quantity} x ${title}` : title) : isTicket ? "Ticket" : "Download",
        amount: Number(o.amount_kes),
        status: o.status === "paid" ? "paid" : "pending",
        when: o.created_at,
        href: "/console/orders",
      };
    }),
    ...(txInvoices.data ?? []).map(
      (inv): Transaction => ({
        id: inv.id,
        kind: "invoice",
        who: inv.bill_company || inv.bill_name,
        what: `Invoice ${inv.number}`,
        amount: Number(inv.total_kes),
        status: inv.status === "paid" ? "paid" : "pending",
        when: inv.paid_at ?? inv.sent_at ?? inv.updated_at,
        href: `/console/invoices/${inv.id}`,
      }),
    ),
  ]
    .sort((a, b) => +new Date(b.when) - +new Date(a.when))
    .slice(0, 5);

  const queue: QueueItem[] = [];
  for (const lead of openLeads.data ?? []) {
    if (!slaBreached(lead)) continue;
    queue.push({
      id: lead.id,
      kind: "enquiry",
      who: lead.company ? `${lead.name}, ${lead.company}` : lead.name,
      what: lead.status === "new" ? `Unanswered · ${serviceLabel(lead.services ?? [])}` : "Follow-up due",
      when: lead.status === "new" ? lead.created_at : lead.updated_at,
      href: `/console/leads/${lead.id}`,
      action: "Reply",
    });
  }
  for (const order of failedOrders.data ?? []) {
    queue.push({
      id: order.id,
      kind: "payment",
      who: order.attendee_name || order.email,
      what: `M-Pesa payment failed · ${formatKes(Number(order.amount_kes))}`,
      when: order.created_at,
      href: "/console/orders",
      action: "Review",
    });
  }
  for (const inv of overdueInvoices) {
    queue.push({
      id: inv.id,
      kind: "overdue",
      who: inv.bill_company || inv.bill_name,
      what: `${inv.number} overdue · ${formatKes(balance(inv))}`,
      when: `${inv.due_on}T00:00:00+03:00`,
      href: `/console/invoices/${inv.id}`,
      action: "Chase",
    });
  }
  for (const inv of unpaid.filter((i) => i.status === "draft")) {
    queue.push({
      id: inv.id,
      kind: "invoice",
      who: inv.bill_company || inv.bill_name,
      what: `${inv.number} draft · ${formatKes(Number(inv.total_kes))}`,
      when: inv.created_at,
      href: `/console/invoices/${inv.id}`,
      action: "Send",
    });
  }
  for (const e of events) {
    if (e.published || new Date(e.starts_at).getTime() - now > 14 * DAY) continue;
    queue.push({
      id: e.id,
      kind: "event",
      who: e.title,
      what: "Draft event starts soon",
      when: e.starts_at,
      href: `/console/events/${e.id}`,
      action: "Publish",
    });
  }
  queue.sort(
    (a, b) => QUEUE_ORDER.indexOf(a.kind) - QUEUE_ORDER.indexOf(b.kind) || +new Date(a.when) - +new Date(b.when),
  );

  const drafts: DraftItem[] = [
    ...(workDrafts.data ?? []).map((d) => ({ ...d, kind: "Work", href: `/console/work/${d.id}` })),
    ...(articleDrafts.data ?? []).map((d) => ({ ...d, kind: "Blog", href: `/console/insights/${d.id}` })),
    ...(productDrafts.data ?? []).map((d) => ({ ...d, kind: "Product", href: `/console/products/${d.id}` })),
    ...(eventDrafts.data ?? []).map((d) => ({ ...d, kind: "Event", href: `/console/events/${d.id}` })),
  ]
    .sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at))
    .slice(0, 4);

  return {
    series,
    enquiries: { current: sum(last7, (p) => p.enquiries), previous: sum(prev7, (p) => p.enquiries) },
    revenue: { current: sum(last7, (p) => p.revenue), previous: sum(prev7, (p) => p.revenue) },
    outstanding: { total: sum(unpaid, balance), count: unpaid.length, overdue: overdueInvoices.length },
    tickets: { sold: sum(events, (e) => e.sold), events: events.length },
    funnel,
    lines,
    upcoming: events.slice(0, 3),
    recentLeads: (recentLeads.data ?? []).map((l) => ({
      id: l.id,
      name: l.name,
      company: l.company,
      service: serviceLabel(l.services ?? []),
      status: l.status,
      created_at: l.created_at,
    })),
    transactions,
    queue: queue.slice(0, 6),
    queueTotal: queue.length,
    published: [
      { label: "Work", count: workLive.count ?? 0, href: "/console/work" },
      { label: "Blog", count: articlesLive.count ?? 0, href: "/console/insights" },
      { label: "Products", count: productsLive.count ?? 0, href: "/console/products" },
      { label: "Events", count: eventsLive.count ?? 0, href: "/console/events" },
    ],
    drafts,
  };
}
