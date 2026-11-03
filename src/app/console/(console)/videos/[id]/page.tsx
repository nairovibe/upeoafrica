import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminPage } from "@/components/admin/ui";
import { VideoEditor } from "@/components/admin/VideoEditor";
import { getStaff } from "@/lib/cms";

export default async function EditVideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const staff = await getStaff();
  const supabase = await createClient();
  const [{ data: row }, { data: cases }, { data: products }] = await Promise.all([
    supabase.from("videos").select("*").eq("id", id).maybeSingle(),
    supabase.from("case_studies").select("id, title").order("title"),
    supabase.from("products").select("id, title").order("title"),
  ]);
  if (!row) notFound();
  return (
    <AdminPage title={row.title}>
      <VideoEditor
        initial={row}
        caseStudies={cases ?? []}
        products={products ?? []}
        readOnly={staff?.role === "sales"}
      />
    </AdminPage>
  );
}
