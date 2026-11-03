import { CircleAlert, Clock, Ticket, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AdminPage, FilterTabs, Stat } from "@/components/admin/ui";
import { formatKes } from "@/lib/constants";
import { OrdersTable, type OrderRow } from "@/components/admin/money/OrdersTable";
import { SearchForm } from "@/components/admin/money/SearchForm";
import { cleanQuery, daysAgoIso, formatWhen, withParams } from "@/components/admin/money/format";

const STATUSES = ["all", "paid", "pending", "failed"] as const;
const KINDS = ["all", "product", "ticket"] as const;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; kind?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const status = STATUSES.find((s) => s === sp.status) ?? "all";
  const kind = KINDS.find((k) => k === sp.kind) ?? "all";
  const q = cleanQuery(sp.q);

  const supabase = await createClient();
  let list = supabase
    .from("orders")
    .select(
      "id, created_at, email, phone, attendee_name, attendee_company, kind, amount_kes, status, provider_ref, ticket_code, quantity, checked_in_at, download_expires_at, event_id, products(title), events(title), ticket_types(name), payments(id, result, created_at)",
    )
    .order("created_at", { ascending: false })
    .limit(200);
  if (status !== "all") list = list.eq("status", status);
  if (kind !== "all") list = list.eq("kind", kind);
  if (q) list = list.or(`email.ilike.%${q}%,phone.ilike.%${q}%,ticket_code.ilike.%${q}%,attendee_name.ilike.%${q}%`);

  const [{ data: orders }, { data: all }] = await Promise.all([
    list,
    supabase.from("orders").select("status, kind, amount_kes, created_at"),
  ]);

  const since = daysAgoIso(30);
  const stats = { paid30: 0, paid30Count: 0, pending: 0, pendingKes: 0, failed: 0, tickets: 0, products: 0 };
  const counts: Record<string, number> = { all: 0, paid: 0, pending: 0, failed: 0 };
  for (const o of all ?? []) {
    const inKind = kind === "all" || o.kind === kind;
    if (inKind) {
      counts.all += 1;
      counts[o.status] = (counts[o.status] ?? 0) + 1;
    }
    if (o.status === "paid") {
      if (o.created_at >= since) {
        stats.paid30 += o.amount_kes;
        stats.paid30Count += 1;
      }
      if (o.kind === "ticket") stats.tickets += o.amount_kes;
      else stats.products += o.amount_kes;
    } else if (o.status === "pending") {
      stats.pending += 1;
      stats.pendingKes += o.amount_kes;
    } else if (o.status === "failed") {
      stats.failed += 1;
    }
  }

  const rows: OrderRow[] = (orders ?? []).map((o) => {
    const isTicket = o.kind === "ticket";
    const details: OrderRow["details"] = [];
    if (isTicket) {
      if (o.attendee_company) details.push({ label: "Company", value: o.attendee_company });
      details.push({ label: "Checked in", value: o.checked_in_at ? formatWhen(o.checked_in_at) : "Not yet" });
    } else if (o.download_expires_at) {
      details.push({ label: "Download expires", value: formatWhen(o.download_expires_at) });
    }
    return {
      id: o.id,
      when: formatWhen(o.created_at),
      buyer: o.attendee_name || o.email,
      contact: [o.attendee_name ? o.email : null, o.phone].filter(Boolean).join(" · "),
      kind: o.kind,
      item: isTicket ? o.events?.title || "Event ticket" : o.products?.title || "Product",
      itemMeta: isTicket
        ? [o.ticket_types?.name, `${o.quantity} ${o.quantity === 1 ? "ticket" : "tickets"}`].filter(Boolean).join(" · ")
        : "Product",
      amount: formatKes(o.amount_kes),
      status: o.status,
      reference: (isTicket ? o.ticket_code : o.provider_ref) ?? "",
      providerRef: o.provider_ref,
      eventId: o.event_id,
      details,
      payments: [...(o.payments ?? [])]
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .map((p) => ({ id: p.id, result: p.result, when: formatWhen(p.created_at) })),
    };
  });

  const params = { status: status === "all" ? undefined : status, kind: kind === "all" ? undefined : kind, q: q || undefined };
  const filtered = status !== "all" || kind !== "all" || q;

  return (
    <AdminPage title="Orders">
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Paid, last 30 days"
          value={formatKes(stats.paid30)}
          trend={`${stats.paid30Count} ${stats.paid30Count === 1 ? "order" : "orders"}`}
          tone={stats.paid30 > 0 ? "up" : "neutral"}
          icon={<Wallet className="h-4 w-4" />}
        />
        <Stat
          label="Pending"
          value={stats.pending}
          trend={stats.pending ? `${formatKes(stats.pendingKes)} awaiting M-Pesa` : "Nothing waiting"}
          icon={<Clock className="h-4 w-4" />}
          href={withParams("/console/orders", { status: "pending" })}
        />
        <Stat
          label="Failed"
          value={stats.failed}
          trend={stats.failed ? "Payment did not complete" : "No failed payments"}
          tone={stats.failed ? "down" : "neutral"}
          icon={<CircleAlert className="h-4 w-4" />}
          href={withParams("/console/orders", { status: "failed" })}
        />
        <Stat
          label="Ticket revenue"
          value={formatKes(stats.tickets)}
          trend={`Products ${formatKes(stats.products)}`}
          icon={<Ticket className="h-4 w-4" />}
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <FilterTabs
            active={status}
            items={STATUSES.map((s) => ({
              id: s,
              label: s === "all" ? "All" : s[0].toUpperCase() + s.slice(1),
              href: withParams("/console/orders", { ...params, status: s === "all" ? undefined : s }),
              count: counts[s] ?? 0,
            }))}
          />
          <span className="hidden h-5 w-px bg-line sm:block" aria-hidden />
          <FilterTabs
            active={kind}
            items={[
              { id: "all", label: "Everything", href: withParams("/console/orders", { ...params, kind: undefined }) },
              { id: "product", label: "Products", href: withParams("/console/orders", { ...params, kind: "product" }) },
              { id: "ticket", label: "Tickets", href: withParams("/console/orders", { ...params, kind: "ticket" }) },
            ]}
          />
        </div>
        <SearchForm
          action="/console/orders"
          value={q}
          placeholder="Email, phone or ticket code"
          keep={{ status: params.status, kind: params.kind }}
        />
      </div>

      <OrdersTable
        rows={rows}
        empty={filtered ? "No orders match this view." : "Product sales and event tickets will show here."}
      />
    </AdminPage>
  );
}
