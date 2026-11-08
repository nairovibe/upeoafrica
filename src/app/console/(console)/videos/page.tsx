import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AdminBtn, AdminPage, FilterTabs } from "@/components/admin/ui";
import { ManageTable, type DeskItem } from "@/components/admin/ManageTable";
import { formatDay } from "@/components/admin/studio/format";
import { getStaff } from "@/lib/cms";

const PROVIDER_LABEL: Record<string, string> = { youtube: "YouTube", vimeo: "Vimeo", file: "File" };

const TABS = [
  { id: "all", label: "All" },
  { id: "live", label: "Live" },
  { id: "draft", label: "Drafts" },
  { id: "trash", label: "Trash" },
] as const;

export default async function VideosPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = "all" } = await searchParams;
  const staff = await getStaff();
  const canEdit = staff?.role === "owner" || staff?.role === "editor";
  const supabase = await createClient();
  const [{ data }, { data: cases }, { data: products }] = await Promise.all([
    supabase.from("videos").select("*").order("created_at", { ascending: false }),
    supabase.from("case_studies").select("id, title").is("deleted_at", null),
    supabase.from("products").select("id, title").is("deleted_at", null),
  ]);
  const all = data ?? [];
  const caseTitle = new Map((cases ?? []).map((item) => [item.id, item.title]));
  const productTitle = new Map((products ?? []).map((item) => [item.id, item.title]));
  const activeRows = all.filter((row) => !row.deleted_at);
  const trashed = all.filter((row) => row.deleted_at);
  const active = TABS.some((tab) => tab.id === status) ? status : "all";
  const pool =
    active === "trash" ? trashed : activeRows.filter((row) => active === "all" || (active === "live" ? Boolean(row.published_at) : !row.published_at));
  const items: DeskItem[] = pool.map((row) => {
    const linked = [row.case_study_id ? caseTitle.get(row.case_study_id) : null, row.product_id ? productTitle.get(row.product_id) : null].filter(Boolean);
    return {
      id: row.id,
      title: row.title,
      path: "",
      editHref: `/console/videos/${row.id}`,
      viewHref: null,
      status: row.deleted_at ? "Trash" : row.published_at ? "Live" : "Draft",
      tone: row.deleted_at ? "warning" : row.published_at ? "success" : "neutral",
      updated: formatDay(row.deleted_at || row.updated_at),
      deleted: Boolean(row.deleted_at),
      details: [PROVIDER_LABEL[row.provider] ?? row.provider, linked.length ? linked.join(", ") : "-"],
      quickName: row.title,
      quickSlug: "",
      quickLive: Boolean(row.published_at),
    };
  });
  const addBtn = canEdit ? (
    <AdminBtn href="/console/videos/new" icon={<Plus aria-hidden />}>
      Add video
    </AdminBtn>
  ) : null;

  return (
    <AdminPage title="Videos" action={addBtn}>
      <div className="space-y-4">
        <FilterTabs
          active={active}
          items={TABS.map((tab) => ({
            id: tab.id,
            label: tab.label,
            href: tab.id === "all" ? "/console/videos" : `/console/videos?status=${tab.id}`,
            count:
              tab.id === "trash"
                ? trashed.length
                : tab.id === "live"
                  ? activeRows.filter((row) => row.published_at).length
                  : tab.id === "draft"
                    ? activeRows.filter((row) => !row.published_at).length
                    : activeRows.length,
          }))}
        />
        <ManageTable
          resource="videos"
          items={items}
          canEdit={canEdit}
          headers={["Provider", "Linked to"]}
          hasSlug={false}
          hasLive
          nameLabel="Title"
          trashView={active === "trash"}
          empty={active === "trash" ? "Trash is empty." : all.length === 0 ? "No videos yet. YouTube, Vimeo and uploaded films will be listed here." : "Nothing in this view."}
        />
      </div>
    </AdminPage>
  );
}
