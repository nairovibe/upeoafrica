import Link from "next/link";
import { Plus } from "lucide-react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminBtn, AdminPage, Panel, Pill } from "@/components/admin/ui";
import { ClientEditor } from "@/components/admin/ClientEditor";
import { formatDay } from "@/components/admin/studio/format";
import { INVOICE_TONE, billedTotal } from "@/components/admin/house/invoices";
import { getStaff } from "@/lib/cms";
import { formatKes } from "@/lib/constants";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const staff = await getStaff();
  const supabase = await createClient();
  const [{ data }, { data: invoices }] = await Promise.all([
    supabase.from("clients").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("invoices")
      .select("id, number, status, total_kes, issued_on, created_at")
      .eq("client_id", id)
      .order("created_at", { ascending: false }),
  ]);
  if (!data) notFound();

  const list = invoices ?? [];
  const billed = billedTotal(list);
  const newInvoice = `/console/invoices/new?client=${data.id}`;

  return (
    <AdminPage
      title={data.name}
      action={
        <AdminBtn href={newInvoice} icon={<Plus aria-hidden />}>
          New invoice
        </AdminBtn>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <ClientEditor initial={data} readOnly={staff?.role === "sales"} />

        <Panel
          title="Invoices"
          meta={list.length ? `${formatKes(billed)} billed` : undefined}
          flush
          className="self-start"
        >
          {list.length === 0 ? (
            <p className="px-5 pb-6 pt-2 text-sm text-muted">No invoices for this client yet.</p>
          ) : (
            <ul className="divide-y divide-line border-t border-line">
              {list.map((inv) => (
                <li key={inv.id}>
                  <Link
                    href={`/console/invoices/${inv.id}`}
                    className="flex items-center gap-3 px-5 py-3 text-sm hover:bg-surface-2"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-ink-900">{inv.number}</span>
                      <span className="block text-xs text-muted">{formatDay(inv.issued_on ?? inv.created_at)}</span>
                    </span>
                    <Pill tone={INVOICE_TONE[inv.status] ?? "neutral"}>{inv.status}</Pill>
                    <span className="w-28 text-right font-display tabular-nums text-ink-900">{formatKes(Number(inv.total_kes))}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </AdminPage>
  );
}
