import { createClient } from "@/lib/supabase/server";
import { megaServices } from "@/lib/content";
import { formatKes } from "@/lib/constants";
import type { Lead, Order, Invoice, Event, CaseStudy } from "@/lib/cms";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

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

export type QueueItem = {
  id: string;
  kind: string;
  who: string;
  what: string;
  when: string;
  href: string;
  action: string;
};

export type TodayBrief = {
  needsReply: number;
  slaLate: number;
  money7: number;
  moneyPrev: number;
  pipeline: { Build: number; Design: number; Grow: number; Other: number };
  waitingPay: number;
  liveMonth: number;
  series: { day: string; enquiries: number; money: number }[];
  queue: QueueItem[];
  nextEvent: Event | null;
  ticketsSold: number;
};

export async function getTodayBrief(): Promise<TodayBrief> {
  const supabase = await createClient();
  const now = Date.now();
  const start7 = new Date(now - 7 * DAY).toISOString();
  const start14 = new Date(now - 14 * DAY).toISOString();
  const prev7 = new Date(now - 14 * DAY).toISOString();
  const monthAgo = new Date(now - 30 * DAY).toISOString();

  const [
    leadsRes,
    paidOrders,
    paidPrev,
    pendingOrders,
    unpaidInvoices,
    workLive,
    articlesLive,
    productsLive,
    drafts,
    failedOrders,
    eventsRes,
    ticketOrders,
  ] = await Promise.all([
    supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(80),
    supabase.from("orders").select("amount_kes, created_at, status").gte("created_at", start7).eq("status", "paid"),
    supabase
      .from("orders")
      .select("amount_kes")
      .gte("created_at", prev7)
      .lt("created_at", start7)
      .eq("status", "paid"),
    supabase.from("orders").select("*").eq("status", "pending").order("created_at", { ascending: false }).limit(20),
    supabase.from("invoices").select("*").in("status", ["draft", "sent"]).order("created_at", { ascending: false }).limit(20),
    supabase
      .from("case_studies")
      .select("id", { count: "exact", head: true })
      .gte("published_at", monthAgo)
      .not("published_at", "is", null),
    supabase
      .from("articles")
      .select("id", { count: "exact", head: true })
      .gte("published_at", monthAgo)
      .not("published_at", "is", null),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("published", true).gte("updated_at", monthAgo),
    supabase.from("case_studies").select("id, title, created_at").is("published_at", null).order("created_at", { ascending: false }).limit(5),
    supabase.from("orders").select("*").eq("status", "failed").order("created_at", { ascending: false }).limit(5),
    supabase
      .from("events")
      .select("*")
      .gte("starts_at", new Date(now - DAY).toISOString())
      .order("starts_at")
      .limit(1),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("kind", "ticket").eq("status", "paid"),
  ]);

  const paidInvoices7 = await supabase
    .from("invoices")
    .select("total_kes, paid_at")
    .eq("status", "paid")
    .gte("paid_at", start7);
  const paidInvoicesPrev = await supabase
    .from("invoices")
    .select("total_kes")
    .eq("status", "paid")
    .gte("paid_at", prev7)
    .lt("paid_at", start7);

  const leads = (leadsRes.data ?? []) as Lead[];
  const open = leads.filter((l) => ["new", "contacted", "qualified"].includes(l.status));
  const needsReply = leads.filter((l) => l.status === "new" || (l.status === "contacted" && slaBreached(l))).length;
  const slaLate = leads.filter((l) => slaBreached(l)).length;

  const pipeline = { Build: 0, Design: 0, Grow: 0, Other: 0 };
  for (const lead of open) {
    const g = pipelineGroup(lead.services ?? []);
    pipeline.Build += g.Build;
    pipeline.Design += g.Design;
    pipeline.Grow += g.Grow;
    pipeline.Other += g.Other;
  }

  const money7 =
    (paidOrders.data ?? []).reduce((s, o) => s + Number(o.amount_kes), 0) +
    (paidInvoices7.data ?? []).reduce((s, i) => s + Number(i.total_kes), 0);
  const moneyPrev =
    (paidPrev.data ?? []).reduce((s, o) => s + Number(o.amount_kes), 0) +
    (paidInvoicesPrev.data ?? []).reduce((s, i) => s + Number(i.total_kes), 0);

  const waitingPay = (pendingOrders.data?.length ?? 0) + (unpaidInvoices.data?.length ?? 0);

  const series: TodayBrief["series"] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now - i * DAY);
    const key = d.toISOString().slice(0, 10);
    series.push({ day: key.slice(5), enquiries: 0, money: 0 });
  }
  const seriesIndex = Object.fromEntries(series.map((s, i) => [s.day, i]));
  for (const lead of leads) {
    if (lead.created_at < start14) continue;
    const day = lead.created_at.slice(5, 10);
    const idx = seriesIndex[day];
    if (idx != null) series[idx].enquiries += 1;
  }
  for (const order of paidOrders.data ?? []) {
    const day = order.created_at.slice(5, 10);
    const idx = seriesIndex[day];
    if (idx != null) series[idx].money += Number(order.amount_kes);
  }
  for (const inv of paidInvoices7.data ?? []) {
    if (!inv.paid_at) continue;
    const day = inv.paid_at.slice(5, 10);
    const idx = seriesIndex[day];
    if (idx != null) series[idx].money += Number(inv.total_kes);
  }

  const queue: QueueItem[] = [];
  for (const lead of leads.filter((l) => l.status === "new").slice(0, 5)) {
    queue.push({
      id: lead.id,
      kind: "enquiry",
      who: lead.name,
      what: (lead.services ?? []).join(", ") || lead.message?.slice(0, 80) || "New enquiry",
      when: lead.created_at,
      href: `/admin/leads/${lead.id}`,
      action: "Reply",
    });
  }
  for (const inv of (unpaidInvoices.data ?? []) as Invoice[]) {
    queue.push({
      id: inv.id,
      kind: "invoice",
      who: inv.bill_name,
      what: `${inv.number} · ${formatKes(Number(inv.total_kes))} · ${inv.status}`,
      when: inv.created_at,
      href: `/admin/invoices/${inv.id}`,
      action: inv.status === "draft" ? "Send" : "Open",
    });
  }
  for (const order of (failedOrders.data ?? []) as Order[]) {
    queue.push({
      id: order.id,
      kind: "payment",
      who: order.email,
      what: `M-Pesa failed · ${formatKes(Number(order.amount_kes))}`,
      when: order.created_at,
      href: "/admin/orders",
      action: "Open",
    });
  }
  for (const draft of (drafts.data ?? []) as Pick<CaseStudy, "id" | "title" | "created_at">[]) {
    queue.push({
      id: draft.id,
      kind: "draft",
      who: "Studio",
      what: `Draft case study: ${draft.title}`,
      when: draft.created_at,
      href: `/admin/work/${draft.id}`,
      action: "Publish",
    });
  }
  const next = (eventsRes.data ?? [])[0] as Event | undefined;
  if (next && new Date(next.starts_at).getTime() - now < 2 * DAY) {
    queue.push({
      id: next.id,
      kind: "event",
      who: next.title,
      what: next.published_at ? "Goes live soon" : "Draft event with a date",
      when: next.starts_at,
      href: `/admin/events/${next.id}`,
      action: "Open",
    });
  }
  queue.sort((a, b) => +new Date(b.when) - +new Date(a.when));

  return {
    needsReply,
    slaLate,
    money7,
    moneyPrev,
    pipeline,
    waitingPay,
    liveMonth: (workLive.count ?? 0) + (articlesLive.count ?? 0) + (productsLive.count ?? 0),
    series,
    queue: queue.slice(0, 8),
    nextEvent: ((eventsRes.data ?? [])[0] as Event | undefined) ?? null,
    ticketsSold: ticketOrders.count ?? 0,
  };
}
