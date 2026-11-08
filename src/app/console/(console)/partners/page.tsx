import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AdminBtn, AdminPage, FilterTabs } from "@/components/admin/ui";
import { ManageTable, type DeskItem } from "@/components/admin/ManageTable";
import { formatDay } from "@/components/admin/studio/format";
import { getStaff } from "@/lib/cms";
import { PARTNER_RELATIONSHIPS } from "@/lib/constants";

const TABS = [
  { id: "all", label: "All" },
  { id: "trash", label: "Trash" },
] as const;

export default async function PartnersListPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = "all" } = await searchParams;
  const staff = await getStaff();
  const canEdit = staff?.role === "owner" || staff?.role === "editor";
  const supabase = await createClient();
  const { data } = await supabase.from("partners").select("*").order("sort_order").order("name");
  const all = data ?? [];
  const activeRows = all.filter((row) => !row.deleted_at);
  const trashed = all.filter((row) => row.deleted_at);
  const active = status === "trash" ? "trash" : "all";
  const pool = active === "trash" ? trashed : activeRows;
  const items: DeskItem[] = pool.map((row) => ({
    id: row.id,
    title: row.name,
    path: row.slug,
    editHref: `/console/partners/${row.id}`,
    viewHref: null,
    status: row.deleted_at ? "Trash" : "Active",
    tone: row.deleted_at ? "warning" : "success",
    updated: formatDay(row.deleted_at || row.updated_at),
    deleted: Boolean(row.deleted_at),
    details: [PARTNER_RELATIONSHIPS.find((item) => item.value === row.relationship)?.label ?? row.relationship],
    quickName: row.name,
    quickSlug: row.slug,
    quickLive: false,
  }));
  const addBtn = canEdit ? (
    <AdminBtn href="/console/partners/new" icon={<Plus aria-hidden />}>
      Add partner
    </AdminBtn>
  ) : null;

  return (
    <AdminPage title="Partners" action={addBtn}>
      <div className="space-y-4">
        <FilterTabs
          active={active}
          items={TABS.map((tab) => ({
            id: tab.id,
            label: tab.label,
            href: tab.id === "all" ? "/console/partners" : "/console/partners?status=trash",
            count: tab.id === "trash" ? trashed.length : activeRows.length,
          }))}
        />
        <ManageTable
          resource="partners"
          items={items}
          canEdit={canEdit}
          headers={["Relationship"]}
          hasSlug
          hasLive={false}
          nameLabel="Name"
          trashView={active === "trash"}
          empty={active === "trash" ? "Trash is empty." : "No partners yet. Technology and delivery partners will be listed here."}
        />
      </div>
    </AdminPage>
  );
}
