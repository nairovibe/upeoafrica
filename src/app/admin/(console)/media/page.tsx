import { createClient } from "@/lib/supabase/server";
import { AdminPage, AdminTable } from "@/components/admin/ui";
import { MediaDrop } from "@/components/admin/MediaDrop";
import { publicMediaUrl } from "@/lib/constants";

export default async function MediaPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("media").select("*").order("created_at", { ascending: false });

  return (
    <AdminPage title="Media" hint="Images uploaded from editors also appear here.">
      <div className="mb-6 max-w-md border border-line bg-white p-4 rounded-[5px]">
        <MediaDrop />
      </div>
      <AdminTable
        headers={["File", "Kind", "When"]}
        empty="Nothing in the library yet."
        rows={(data ?? []).map((row) => [
          publicMediaUrl(row.storage_path) ? (
            <a
              href={publicMediaUrl(row.storage_path)!}
              className="text-brand-600 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              {row.storage_path}
            </a>
          ) : (
            row.storage_path
          ),
          row.kind,
          new Date(row.created_at).toLocaleDateString("en-KE"),
        ])}
      />
    </AdminPage>
  );
}
