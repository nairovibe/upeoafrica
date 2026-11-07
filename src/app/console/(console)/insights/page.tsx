import { Plus, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AdminBtn, AdminPage, FilterTabs, inputClass } from "@/components/admin/ui";
import { ArticleTable } from "@/components/admin/ArticleTable";
import { getStaff } from "@/lib/cms";
import { company } from "@/lib/content";
import { articleStatus } from "@/components/blog/analysis";
import { getEditorTaxonomy } from "@/app/console/(console)/insights/data";

const TABS = [
  { id: "all", label: "All" },
  { id: "live", label: "Live" },
  { id: "scheduled", label: "Scheduled" },
  { id: "draft", label: "Drafts" },
  { id: "trash", label: "Trash" },
] as const;

function href(status: string, q: string) {
  const params = new URLSearchParams();
  if (status !== "all") params.set("status", status);
  if (q) params.set("q", q);
  const s = params.toString();
  return `/console/insights${s ? `?${s}` : ""}`;
}

export default async function InsightsListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const active = TABS.some((tab) => tab.id === sp.status) ? (sp.status as string) : "all";
  const q = (sp.q ?? "").trim();
  const staff = await getStaff();
  const canEdit = staff?.role !== "sales";
  const supabase = await createClient();
  const [{ data }, taxonomy] = await Promise.all([
    supabase
      .from("articles")
      .select("id, title, slug, category, tags, featured, published_at, seo_score, reading_minutes, updated_at, deleted_at")
      .order("updated_at", { ascending: false }),
    getEditorTaxonomy(),
  ]);

  const rows = (data ?? []).map((row) => ({ ...row, status: articleStatus(row.published_at) }));
  const activeRows = rows.filter((row) => !row.deleted_at);
  const trashed = rows.filter((row) => row.deleted_at);
  const counts = {
    all: activeRows.length,
    live: activeRows.filter((row) => row.status === "live").length,
    scheduled: activeRows.filter((row) => row.status === "scheduled").length,
    draft: activeRows.filter((row) => row.status === "draft").length,
    trash: trashed.length,
  };
  const term = q.toLowerCase();
  const pool = active === "trash" ? trashed : activeRows.filter((row) => active === "all" || row.status === active);
  const visible = pool.filter(
    (row) => !term || row.title.toLowerCase().includes(term) || row.slug.includes(term) || (row.category ?? "").toLowerCase().includes(term),
  );

  const newBtn = canEdit ? (
    <AdminBtn href="/console/insights/new" icon={<Plus aria-hidden />}>
      New article
    </AdminBtn>
  ) : null;

  const empty =
    active === "trash"
      ? q
        ? "No articles in the trash match."
        : "Trash is empty."
      : rows.length === 0
        ? "No articles yet. Published and draft posts will be listed here."
        : "No articles match.";

  return (
    <AdminPage title="Blog" action={newBtn}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <FilterTabs
          active={active}
          items={TABS.map((tab) => ({ id: tab.id, label: tab.label, href: href(tab.id, q), count: counts[tab.id] }))}
        />
        <form action="/console/insights" className="relative w-full max-w-xs">
          {active !== "all" ? <input type="hidden" name="status" value={active} /> : null}
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input name="q" defaultValue={q} placeholder="Search articles" className={`${inputClass} pl-9`} />
        </form>
      </div>

      <ArticleTable
        rows={visible.map((row) => ({
          id: row.id,
          title: row.title,
          slug: row.slug,
          category: row.category,
          tags: row.tags,
          featured: row.featured,
          published_at: row.published_at,
          seo_score: row.seo_score,
          reading_minutes: row.reading_minutes,
          updated_at: row.updated_at,
          status: row.status,
        }))}
        categories={taxonomy.categories}
        canEdit={canEdit}
        trash={active === "trash"}
        publicOrigin={company.domain}
        empty={empty}
      />
    </AdminPage>
  );
}
