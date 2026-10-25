import { createClient } from "@/lib/supabase/server";
import { AdminPage, AdminTable } from "@/components/admin/ui";
import { VideoEditor } from "@/components/admin/VideoEditor";

export default async function VideosPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("videos").select("*").order("created_at", { ascending: false });
  return (
    <AdminPage title="Videos" hint="Prefer YouTube or Vimeo. Direct file uploads belong in Media only when the footage cannot live there.">
      <div className="mb-6">
        <VideoEditor />
      </div>
      <AdminTable
        headers={["Title", "Provider", "URL"]}
        empty="No videos yet."
        rows={(data ?? []).map((row) => [row.title, row.provider, row.url || row.storage_path || "-"])}
      />
    </AdminPage>
  );
}
