import Link from "next/link";
import { AlarmClock, CircleCheck, FilePen, Plus, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AdminBtn, AdminPage, AdminTable, FilterTabs, Pill, Stat } from "@/components/admin/ui";
import { formatKes } from "@/lib/constants";
import { InvoiceRowActions } from "@/components/admin/money/InvoiceRowActions";
import { SearchForm } from "@/components/admin/money/SearchForm";
import {
  cleanQuery,
  formatDay,
  invoiceState,
  invoiceTone,
  monthStartNairobi,
  todayNairobi,
  withParams,
  type InvoiceState,
} from "@/components/admin/money/format";

const TABS: { id: "all" | InvoiceState; label: string }[] = [
  { id: "all", label: "All" },
  { id: "draft", label: "Draft" },
  { id: "sent", label: "Sent" },
  { id: "overdue", label: "Overdue" },
  { id: "paid", label: "Paid" },
  { id: "void", label: "Void" },
];

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const tab = TABS.find((t) => t.id === sp.status)?.id ?? "all";
  const q = cleanQuery(sp.q);
  const needle = q.toLowerCase();

  const supabase = await createClient();
  const { data } = await supabase
    .from("invoices")
    .select("id, number, bill_name, bill_company, bill_email, bill_phone, status, issued_on, due_on, created_at, total_kes, amount_paid_kes, paid_at")
    .order("created_at", { ascending: false });

  const today = todayNairobi();
  const monthStart = monthStartNairobi();
  const invoices = (data ?? []).map((inv) => {
    const total = Number(inv.total_kes) || 0;
    const paid = Number(inv.amount_paid_kes) || 0;
    return { ...inv, total, paid, balance: Math.max(0, total - paid), state: invoiceState(inv, today) };
  });

  const counts: Record<string, number> = { all: invoices.length };
  const stats = { outstanding: 0, outstandingCount: 0, overdue: 0, overdueKes: 0, paidMonth: 0, paidMonthCount: 0, drafts: 0 };
  for (const inv of invoices) {
    counts[inv.state] = (counts[inv.state] ?? 0) + 1;
    if (inv.state === "sent" || inv.state === "overdue") {
      stats.outstanding += inv.balance;
      stats.outstandingCount += 1;
    }
    if (inv.state === "overdue") {
      stats.overdue += 1;
      stats.overdueKes += inv.balance;
    }
    if (inv.state === "draft") stats.drafts += 1;
    if (inv.state === "paid" && inv.paid_at && inv.paid_at.slice(0, 10) >= monthStart) {
      stats.paidMonth += inv.paid;
      stats.paidMonthCount += 1;
    }
  }

  const rows = invoices.filter(
    (inv) =>
      (tab === "all" || inv.state === tab) &&
      (!needle ||
        [inv.number, inv.bill_name, inv.bill_company, inv.bill_email].some((v) => (v ?? "").toLowerCase().includes(needle))),
  );

  return (
    <AdminPage
      title="Invoices"
      action={
        <AdminBtn href="/console/invoices/new" icon={<Plus aria-hidden />}>
          New invoice
        </AdminBtn>
      }
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Outstanding"
          value={formatKes(stats.outstanding)}
          trend={`${stats.outstandingCount} open ${stats.outstandingCount === 1 ? "invoice" : "invoices"}`}
          icon={<Wallet className="h-4 w-4" />}
          href={withParams("/console/invoices", { status: "sent" })}
        />
        <Stat
          label="Overdue"
          value={stats.overdue}
          trend={stats.overdue ? `${formatKes(stats.overdueKes)} past due` : "All on time"}
          tone={stats.overdue ? "down" : "neutral"}
          icon={<AlarmClock className="h-4 w-4" />}
          href={withParams("/console/invoices", { status: "overdue" })}
        />
        <Stat
          label="Paid this month"
          value={formatKes(stats.paidMonth)}
          trend={`${stats.paidMonthCount} ${stats.paidMonthCount === 1 ? "invoice" : "invoices"}`}
          tone={stats.paidMonth > 0 ? "up" : "neutral"}
          icon={<CircleCheck className="h-4 w-4" />}
        />
        <Stat
          label="Drafts"
          value={stats.drafts}
          trend={stats.drafts ? "Ready to finish and send" : "No drafts"}
          icon={<FilePen className="h-4 w-4" />}
          href={withParams("/console/invoices", { status: "draft" })}
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <FilterTabs
          active={tab}
          items={TABS.map((t) => ({
            id: t.id,
            label: t.label,
            href: withParams("/console/invoices", { status: t.id === "all" ? undefined : t.id, q: q || undefined }),
            count: counts[t.id] ?? 0,
          }))}
        />
        <SearchForm
          action="/console/invoices"
          value={q}
          placeholder="Number, client or email"
          keep={{ status: tab === "all" ? undefined : tab }}
        />
      </div>

      <AdminTable
          headers={["Number", "Bill to", "Issued", "Due", "Total", "Paid", "Status", ""]}
          empty={invoices.length === 0 ? "Invoices you raise for clients will show here." : "No invoices match this view."}
          emptyAction={
            invoices.length === 0 ? (
              <AdminBtn href="/console/invoices/new" icon={<Plus aria-hidden />}>
                New invoice
              </AdminBtn>
            ) : null
          }
          rows={rows.map((inv) => [
            <Link key="n" href={`/console/invoices/${inv.id}`} className="font-medium text-ink-900 hover:text-brand-600">
              {inv.number}
            </Link>,
            <div key="b" className="min-w-0">
              <p className="truncate">{inv.bill_name}</p>
              <p className="truncate text-xs text-muted">{inv.bill_email || "No email"}</p>
            </div>,
            <span key="i" className="whitespace-nowrap text-body">
              {formatDay(inv.issued_on || inv.created_at)}
            </span>,
            <span key="d" className={inv.state === "overdue" ? "whitespace-nowrap font-medium text-red-600" : "whitespace-nowrap text-body"}>
              {inv.due_on ? formatDay(inv.due_on) : "—"}
            </span>,
            <span key="t" className="whitespace-nowrap font-medium tabular-nums">
              {formatKes(inv.total)}
            </span>,
            <span key="p" className="whitespace-nowrap tabular-nums text-body">
              {inv.paid ? formatKes(inv.paid) : "—"}
            </span>,
            <Pill key="s" tone={invoiceTone(inv.state)}>
              {inv.state}
            </Pill>,
            <InvoiceRowActions
              key="a"
              id={inv.id}
              status={inv.status}
              email={inv.bill_email}
              phone={inv.bill_phone}
              balance={inv.balance}
            />,
          ])}
        />
    </AdminPage>
  );
}
