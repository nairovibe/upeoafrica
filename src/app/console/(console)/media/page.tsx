import { createClient } from "@/lib/supabase/server";
import { AdminPage, FilterTabs } from "@/components/admin/ui";
import { MediaDrop } from "@/components/admin/MediaDrop";
import { MediaLibrary } from "@/components/admin/studio/MediaLibrary";
import { getStaff } from "@/lib/cms";

const KINDS = [
  { id: "all", label: "All" },
  { id: "image", label: "Images" },
  { id: "video", label: "Videos" },
  { id: "file", label: "Files" },
] as const;

export default async function MediaPage({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const { kind = "all" } = await searchParams;
  const staff = await getStaff();
  const canEdit = staff?.role === "owner" || staff?.role === "editor";
  const supabase = await createClient();
  const { data } = await supabase
    .from("media")
    .select("*")
    .eq("bucket", "public-media")
    .order("created_at", { ascending: false });

  const all = data ?? [];
  const active = KINDS.some((k) => k.id === kind) ? kind : "all";
  const items = active === "all" ? all : all.filter((m) => m.kind === active);

  return (
    <AdminPage title="Media">
      <div className="space-y-5">
        {canEdit ? <MediaDrop /> : null}
        <FilterTabs
          active={active}
          items={KINDS.map((k) => ({
            id: k.id,
            label: k.label,
            href: k.id === "all" ? "/console/media" : `/console/media?kind=${k.id}`,
            count: k.id === "all" ? all.length : all.filter((m) => m.kind === k.id).length,
          }))}
        />
        <MediaLibrary items={items} canEdit={canEdit} />
      </div>
    </AdminPage>
  );
}
