import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AdminBtn, AdminPage, FilterTabs } from "@/components/admin/ui";
import { ManageTable, type DeskItem } from "@/components/admin/ManageTable";
import { billedTotal } from "@/components/admin/house/invoices";
import { formatDay } from "@/components/admin/studio/format";
import { getStaff } from "@/lib/cms";
import { formatKes } from "@/lib/constants";

const TABS = [
  { id: "all", label: "All" },
  { id: "trash", label: "Trash" },
] as const;

export default async function ClientsListPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = "all" } = await searchParams;
  const staff = await getStaff();
  const canEdit = staff?.role === "owner" || staff?.role === "editor";
  const supabase = await createClient();
  const [{ data }, { data: invoices }] = await Promise.all([
    supabase.from("clients").select("*").order("sort_order").order("name"),
    supabase.from("invoices").select("client_id, status, total_kes").not("client_id", "is", null),
  ]);
  const byClient = new Map<string, { status: string; total_kes: number }[]>();
  for (const invoice of invoices ?? []) {
    if (!invoice.client_id || invoice.status === "void") continue;
    byClient.set(invoice.client_id, [...(byClient.get(invoice.client_id) ?? []), invoice]);
  }
  const all = data ?? [];
  const activeRows = all.filter((row) => !row.deleted_at);
  const trashed = all.filter((row) => row.deleted_at);
  const active = status === "trash" ? "trash" : "all";
  const pool = active === "trash" ? trashed : activeRows;
  const items: DeskItem[] = pool.map((row) => {
    const list = byClient.get(row.id) ?? [];
    return {
      id: row.id,
      title: row.name,
      path: row.slug,
      editHref: `/console/clients/${row.id}`,
      viewHref: null,
      status: row.deleted_at ? "Trash" : "Active",
      tone: row.deleted_at ? "warning" : "success",
      updated: formatDay(row.deleted_at || row.updated_at),
      deleted: Boolean(row.deleted_at),
      details: [row.billing_email || "-", row.phone || "-", list.length ? `${list.length} · ${formatKes(billedTotal(list))}` : "-"],
      quickName: row.name,
      quickSlug: row.slug,
      quickLive: false,
    };
  });
  const addBtn = canEdit ? (
    <AdminBtn href="/console/clients/new" icon={<Plus aria-hidden />}>
      Add client
    </AdminBtn>
  ) : null;

  return (
    <AdminPage title="Clients" action={addBtn}>
      <div className="space-y-4">
        <FilterTabs
          active={active}
          items={TABS.map((tab) => ({
            id: tab.id,
            label: tab.label,
            href: tab.id === "all" ? "/console/clients" : "/console/clients?status=trash",
            count: tab.id === "trash" ? trashed.length : activeRows.length,
          }))}
        />
        <ManageTable
          resource="clients"
          items={items}
          canEdit={canEdit}
          headers={["Billing email", "Phone", "Invoices"]}
          hasSlug
          hasLive={false}
          nameLabel="Name"
          trashView={active === "trash"}
          empty={active === "trash" ? "Trash is empty." : "No clients yet. Companies you bill and feature on the site will be listed here."}
        />
      </div>
    </AdminPage>
  );
}
