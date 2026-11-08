import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AdminBtn, AdminPage, FilterTabs } from "@/components/admin/ui";
import { ManageTable, type DeskItem } from "@/components/admin/ManageTable";
import { formatDay } from "@/components/admin/studio/format";
import { getStaff } from "@/lib/cms";
import { EXPERT_DISCIPLINES } from "@/lib/constants";

const TABS = [
  { id: "all", label: "All" },
  { id: "live", label: "Live" },
  { id: "draft", label: "Drafts" },
  { id: "trash", label: "Trash" },
] as const;

export default async function ExpertsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = "all" } = await searchParams;
  const staff = await getStaff();
  const canEdit = staff?.role === "owner" || staff?.role === "editor";
  const supabase = await createClient();
  const { data } = await supabase.from("experts").select("*").order("sort_order").order("name");
  const all = data ?? [];
  const activeRows = all.filter((row) => !row.deleted_at);
  const trashed = all.filter((row) => row.deleted_at);
  const active = TABS.some((tab) => tab.id === status) ? status : "all";
  const pool =
    active === "trash" ? trashed : activeRows.filter((row) => active === "all" || (active === "live" ? row.published : !row.published));
  const items: DeskItem[] = pool.map((row) => ({
    id: row.id,
    title: row.name,
    path: `/experts/${row.slug}`,
    editHref: `/console/experts/${row.id}`,
    viewHref: row.published && !row.deleted_at ? `/experts/${row.slug}` : null,
    status: row.deleted_at ? "Trash" : row.published ? "Live" : "Draft",
    tone: row.deleted_at ? "warning" : row.published ? "success" : "neutral",
    updated: formatDay(row.deleted_at || row.updated_at),
    deleted: Boolean(row.deleted_at),
    details: [
      row.title || "-",
      EXPERT_DISCIPLINES.find((item) => item.value === row.discipline)?.label ?? row.discipline,
      String(row.sort_order),
    ],
    quickName: row.name,
    quickSlug: row.slug,
    quickLive: row.published,
  }));
  const addBtn = canEdit ? (
    <AdminBtn href="/console/experts/new" icon={<Plus aria-hidden />}>
      Add expert
    </AdminBtn>
  ) : null;

  return (
    <AdminPage title="Experts" hint="People published here appear on the About page." action={addBtn}>
      <div className="space-y-4">
        <FilterTabs
          active={active}
          items={TABS.map((tab) => ({
            id: tab.id,
            label: tab.label,
            href: tab.id === "all" ? "/console/experts" : `/console/experts?status=${tab.id}`,
            count: tab.id === "trash" ? trashed.length : tab.id === "live" ? activeRows.filter((row) => row.published).length : tab.id === "draft" ? activeRows.filter((row) => !row.published).length : activeRows.length,
          }))}
        />
        <ManageTable
          resource="experts"
          items={items}
          canEdit={canEdit}
          headers={["Role", "Practice", "Sort"]}
          hasSlug
          hasLive
          nameLabel="Name"
          trashView={active === "trash"}
          empty={active === "trash" ? "Trash is empty." : all.length === 0 ? "No experts yet. Add the people clients should meet." : "Nothing in this view."}
        />
      </div>
    </AdminPage>
  );
}
