import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AdminBtn, AdminPage, FilterTabs } from "@/components/admin/ui";
import { ManageTable, type DeskItem } from "@/components/admin/ManageTable";
import { formatDay } from "@/components/admin/studio/format";
import { getStaff } from "@/lib/cms";

const TABS = [
  { id: "all", label: "All" },
  { id: "live", label: "Live" },
  { id: "draft", label: "Drafts" },
  { id: "featured", label: "Featured" },
  { id: "trash", label: "Trash" },
] as const;

export default async function WorkListPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = "all" } = await searchParams;
  const staff = await getStaff();
  const canEdit = staff?.role === "owner" || staff?.role === "editor";
  const supabase = await createClient();
  const [{ data }, { data: clients }] = await Promise.all([
    supabase
      .from("case_studies")
      .select("id, title, slug, industry, featured, confidential, published_at, updated_at, project_year, deleted_at, client_id")
      .order("featured", { ascending: false })
      .order("sort_order", { ascending: true })
      .order("updated_at", { ascending: false }),
    supabase.from("clients").select("id, name").is("deleted_at", null),
  ]);
  const all = data ?? [];
  const clientName = new Map((clients ?? []).map((client) => [client.id, client.name]));
  const activeRows = all.filter((row) => !row.deleted_at);
  const trashed = all.filter((row) => row.deleted_at);
  const active = TABS.some((tab) => tab.id === status) ? status : "all";
  const pool =
    active === "trash"
      ? trashed
      : activeRows.filter((row) => {
          if (active === "live") return Boolean(row.published_at);
          if (active === "draft") return !row.published_at;
          if (active === "featured") return row.featured;
          return true;
        });
  const items: DeskItem[] = pool.map((row) => ({
    id: row.id,
    title: row.title,
    path: `${(row.client_id && clientName.get(row.client_id)) || "No client"}${row.confidential ? " · NDA" : ""}`,
    editHref: `/console/work/${row.id}`,
    viewHref: row.published_at && !row.deleted_at ? `/work/${row.slug}` : null,
    status: row.deleted_at ? "Trash" : row.published_at ? "Live" : "Draft",
    tone: row.deleted_at ? "warning" : row.published_at ? "success" : "neutral",
    updated: formatDay(row.deleted_at || row.updated_at),
    deleted: Boolean(row.deleted_at),
    details: [row.project_year ? String(row.project_year) : "-", row.industry || "-", row.featured ? "Featured" : "-"],
    quickName: row.title,
    quickSlug: row.slug,
    quickLive: Boolean(row.published_at),
  }));
  const addBtn = canEdit ? (
    <AdminBtn href="/console/work/new" icon={<Plus aria-hidden />}>
      New case study
    </AdminBtn>
  ) : null;
  const count = (id: (typeof TABS)[number]["id"]) => {
    if (id === "trash") return trashed.length;
    if (id === "live") return activeRows.filter((row) => row.published_at).length;
    if (id === "draft") return activeRows.filter((row) => !row.published_at).length;
    if (id === "featured") return activeRows.filter((row) => row.featured).length;
    return activeRows.length;
  };

  return (
    <AdminPage title="Work" action={addBtn}>
      <div className="space-y-4">
        <FilterTabs
          active={active}
          items={TABS.map((tab) => ({
            id: tab.id,
            label: tab.label,
            href: tab.id === "all" ? "/console/work" : `/console/work?status=${tab.id}`,
            count: count(tab.id),
          }))}
        />
        <ManageTable
          resource="case_studies"
          items={items}
          canEdit={canEdit}
          headers={["Year", "Industry", "Featured"]}
          hasSlug
          hasLive
          nameLabel="Project"
          trashView={active === "trash"}
          empty={active === "trash" ? "Trash is empty." : all.length === 0 ? "No case studies yet. Past client projects will be listed here." : "Nothing in this view."}
        />
      </div>
    </AdminPage>
  );
}
