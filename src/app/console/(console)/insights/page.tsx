import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AdminBtn, AdminPage, AdminTable, FilterTabs, Pill, inputClass } from "@/components/admin/ui";
import { getStaff } from "@/lib/cms";
import { articleStatus, seoTone, type ArticleStatus } from "@/components/blog/analysis";

const TABS = [
  { id: "all", label: "All" },
  { id: "live", label: "Live" },
  { id: "scheduled", label: "Scheduled" },
  { id: "draft", label: "Drafts" },
] as const;

const STATUS_TONE: Record<ArticleStatus, "success" | "warning" | "neutral"> = {
  live: "success",
  scheduled: "warning",
  draft: "neutral",
};

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
  const active = TABS.some((t) => t.id === sp.status) ? (sp.status as string) : "all";
  const q = (sp.q ?? "").trim();
  const staff = await getStaff();
  const canEdit = staff?.role !== "sales";
  const supabase = await createClient();
  const { data } = await supabase
    .from("articles")
    .select("id, title, slug, category, published_at, seo_score, reading_minutes, updated_at")
    .order("updated_at", { ascending: false });

  const rows = (data ?? []).map((row) => ({ ...row, status: articleStatus(row.published_at) }));
  const counts = {
    all: rows.length,
    live: rows.filter((r) => r.status === "live").length,
    scheduled: rows.filter((r) => r.status === "scheduled").length,
    draft: rows.filter((r) => r.status === "draft").length,
  };
  const term = q.toLowerCase();
  const visible = rows.filter(
    (r) =>
      (active === "all" || r.status === active) &&
      (!term || r.title.toLowerCase().includes(term) || r.slug.includes(term) || (r.category ?? "").toLowerCase().includes(term)),
  );

  const newBtn = canEdit ? (
    <AdminBtn href="/console/insights/new" icon={<Plus aria-hidden />}>
      New article
    </AdminBtn>
  ) : null;

  return (
    <AdminPage title="Blog" action={newBtn}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <FilterTabs
          active={active}
          items={TABS.map((t) => ({ id: t.id, label: t.label, href: href(t.id, q), count: counts[t.id] }))}
        />
        <form action="/console/insights" className="relative w-full max-w-xs">
          {active !== "all" ? <input type="hidden" name="status" value={active} /> : null}
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input name="q" defaultValue={q} placeholder="Search articles" className={`${inputClass} pl-9`} />
        </form>
      </div>

      <AdminTable
          headers={["Title", "Category", "Status", "SEO", "Read", "Updated", ""]}
          empty={rows.length === 0 ? "No articles yet. Published and draft posts will be listed here." : "No articles match."}
          emptyAction={rows.length === 0 ? newBtn : null}
          rows={visible.map((row) => [
            <div key="t" className="min-w-0 max-w-md">
              {canEdit ? (
                <Link href={`/console/insights/${row.id}`} className="block truncate font-medium text-ink-900 hover:text-brand-600">
                  {row.title}
                </Link>
              ) : (
                <span className="block truncate font-medium">{row.title}</span>
              )}
              <span className="block truncate text-xs text-muted">/blogs/{row.slug}</span>
            </div>,
            row.category ? <span key="c" className="text-body">{row.category}</span> : <span key="c" className="text-muted">—</span>,
            <span key="s" title={row.status === "scheduled" && row.published_at ? new Date(row.published_at).toLocaleString("en-GB") : undefined}>
              <Pill tone={STATUS_TONE[row.status]}>{row.status}</Pill>
            </span>,
            row.seo_score == null ? <span key="seo" className="text-muted">—</span> : <Pill key="seo" tone={seoTone(row.seo_score)}>{row.seo_score}</Pill>,
            <span key="r" className="tabular-nums text-body">{row.reading_minutes ? `${row.reading_minutes} min` : "—"}</span>,
            <span key="u" className="whitespace-nowrap text-body">
              {new Date(row.updated_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </span>,
            <span key="a" className="flex justify-end gap-3 whitespace-nowrap text-[13px]">
              {canEdit ? (
                <Link href={`/console/insights/${row.id}`} className="font-medium text-brand-600 hover:underline">Edit</Link>
              ) : null}
              {row.status === "live" ? (
                <a href={`/blogs/${row.slug}`} target="_blank" rel="noreferrer" className="text-body hover:text-brand-600">View</a>
              ) : null}
            </span>,
          ])}
        />
    </AdminPage>
  );
}
