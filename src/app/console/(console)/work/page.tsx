import Link from "next/link";
import { Images, Plus, Star, Video } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AdminBtn, AdminPage, AdminTable, FilterTabs, Pill } from "@/components/admin/ui";
import { Thumb } from "@/components/admin/studio/Thumb";
import { formatDay } from "@/components/admin/studio/format";
import { getStaff } from "@/lib/cms";
import { publicMediaUrl } from "@/lib/constants";

const TABS = [
  { id: "all", label: "All" },
  { id: "live", label: "Live" },
  { id: "draft", label: "Drafts" },
  { id: "featured", label: "Featured" },
] as const;

export default async function WorkListPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = "all" } = await searchParams;
  const staff = await getStaff();
  const canEdit = staff?.role === "owner" || staff?.role === "editor";
  const supabase = await createClient();
  const [{ data }, { data: clients }] = await Promise.all([
    supabase
      .from("case_studies")
      .select("id, title, slug, cover_path, industry, services, featured, published_at, updated_at, project_year, gallery, video_url, client_id")
      .order("featured", { ascending: false })
      .order("sort_order", { ascending: true })
      .order("updated_at", { ascending: false }),
    supabase.from("clients").select("id, name"),
  ]);

  const all = data ?? [];
  const clientName = new Map((clients ?? []).map((c) => [c.id, c.name]));
  const match = {
    all: () => true,
    live: (r: (typeof all)[number]) => Boolean(r.published_at),
    draft: (r: (typeof all)[number]) => !r.published_at,
    featured: (r: (typeof all)[number]) => r.featured,
  };
  const active = (status in match ? status : "all") as keyof typeof match;
  const rows = all.filter(match[active]);

  const addBtn = canEdit ? (
    <AdminBtn href="/console/work/new" icon={<Plus aria-hidden />}>
      New case study
    </AdminBtn>
  ) : null;

  return (
    <AdminPage title="Work" action={addBtn}>
      <div className="space-y-4">
        <FilterTabs
          active={active}
          items={TABS.map((t) => ({
            id: t.id,
            label: t.label,
            href: t.id === "all" ? "/console/work" : `/console/work?status=${t.id}`,
            count: all.filter(match[t.id]).length,
          }))}
        />
        <AdminTable
          headers={["Project", "Year", "Industry", "Services", "Media", "Featured", "Status", "Updated"]}
          minWidth={860}
          empty={all.length === 0 ? "No case studies yet. Past client projects will be listed here." : "Nothing in this view."}
          emptyAction={all.length === 0 ? addBtn : null}
          rows={rows.map((row) => [
            <div key="project" className="flex items-center gap-3">
              <Thumb src={publicMediaUrl(row.cover_path)} alt="" />
              <div className="min-w-0">
                <Link href={`/console/work/${row.id}`} className="block truncate font-medium text-ink-900 hover:text-brand-600">
                  {row.title}
                </Link>
                <p className="truncate text-xs text-muted">{(row.client_id && clientName.get(row.client_id)) || "No client"}</p>
              </div>
            </div>,
            <span key="year" className="tabular-nums text-body">{row.project_year || "-"}</span>,
            <span key="industry" className="text-body">{row.industry || "-"}</span>,
            <span key="services" className="block max-w-56 truncate text-body" title={row.services.join(", ")}>
              {row.services.length ? row.services.join(", ") : "-"}
            </span>,
            <span key="media" className="flex items-center gap-3 text-xs text-body">
              <span className="inline-flex items-center gap-1" title="Gallery images">
                <Images className="h-3.5 w-3.5 text-muted" aria-hidden />
                {row.gallery.length}
              </span>
              {row.video_url ? <Video className="h-3.5 w-3.5 text-brand-600" aria-label="Has a video" /> : null}
            </span>,
            row.featured ? (
              <Star key="featured" className="h-4 w-4 fill-brand-500 text-brand-500" aria-label="Featured" />
            ) : (
              <span key="featured" className="text-muted">-</span>
            ),
            <Pill key="status" tone={row.published_at ? "success" : "neutral"}>
              {row.published_at ? "Live" : "Draft"}
            </Pill>,
            <span key="updated" className="whitespace-nowrap text-body">{formatDay(row.updated_at)}</span>,
          ])}
        />
      </div>
    </AdminPage>
  );
}
