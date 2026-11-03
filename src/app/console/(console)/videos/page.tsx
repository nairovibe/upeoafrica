import Link from "next/link";
import { Film, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AdminBtn, AdminPage, AdminTable, FilterTabs, Pill } from "@/components/admin/ui";
import { Thumb } from "@/components/admin/studio/Thumb";
import { formatDay } from "@/components/admin/studio/format";
import { parseVideoUrl } from "@/components/admin/studio/video";
import { getStaff } from "@/lib/cms";

const PROVIDER_LABEL: Record<string, string> = { youtube: "YouTube", vimeo: "Vimeo", file: "File" };

const TABS = [
  { id: "all", label: "All" },
  { id: "live", label: "Live" },
  { id: "draft", label: "Drafts" },
] as const;

export default async function VideosPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = "all" } = await searchParams;
  const staff = await getStaff();
  const canEdit = staff?.role === "owner" || staff?.role === "editor";
  const supabase = await createClient();
  const [{ data }, { data: cases }, { data: products }] = await Promise.all([
    supabase.from("videos").select("*").order("created_at", { ascending: false }),
    supabase.from("case_studies").select("id, title"),
    supabase.from("products").select("id, title"),
  ]);

  const all = data ?? [];
  const caseTitle = new Map((cases ?? []).map((c) => [c.id, c.title]));
  const productTitle = new Map((products ?? []).map((p) => [p.id, p.title]));
  const active = TABS.some((t) => t.id === status) ? status : "all";
  const inTab = (id: string, row: (typeof all)[number]) =>
    id === "all" || (id === "live" ? Boolean(row.published_at) : !row.published_at);
  const rows = all.filter((r) => inTab(active, r));
  const newBtn = canEdit ? (
    <AdminBtn href="/console/videos/new" icon={<Plus aria-hidden />}>
      Add video
    </AdminBtn>
  ) : null;

  return (
    <AdminPage title="Videos" action={newBtn}>
        <div className="space-y-4">
          <FilterTabs
            active={active}
            items={TABS.map((t) => ({
              id: t.id,
              label: t.label,
              href: t.id === "all" ? "/console/videos" : `/console/videos?status=${t.id}`,
              count: all.filter((r) => inTab(t.id, r)).length,
            }))}
          />
          <AdminTable
            headers={["", "Title", "Provider", "Linked to", "Status", "Added"]}
            empty={all.length === 0 ? "No videos yet. YouTube, Vimeo and uploaded films will be listed here." : "Nothing in this view."}
            emptyAction={all.length === 0 ? newBtn : null}
            rows={rows.map((row) => {
              const linked = [
                row.case_study_id ? caseTitle.get(row.case_study_id) : null,
                row.product_id ? productTitle.get(row.product_id) : null,
              ].filter(Boolean);
              return [
                <Thumb key="thumb" src={parseVideoUrl(row.url)?.thumbUrl} icon={Film} className="h-10 w-16" />,
                <Link key="title" href={`/console/videos/${row.id}`} className="font-medium text-ink-900 hover:text-brand-600">
                  {row.title}
                </Link>,
                <span key="provider" className="text-body">{PROVIDER_LABEL[row.provider] ?? row.provider}</span>,
                <span key="linked" className="text-body">{linked.length ? linked.join(", ") : "-"}</span>,
                <Pill key="status" tone={row.published_at ? "success" : "neutral"}>
                  {row.published_at ? "Live" : "Draft"}
                </Pill>,
                <span key="added" className="whitespace-nowrap text-body">{formatDay(row.created_at)}</span>,
              ];
            })}
          />
        </div>
    </AdminPage>
  );
}
