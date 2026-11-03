import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminPage } from "@/components/admin/ui";
import { VideoEditor } from "@/components/admin/VideoEditor";
import { getStaff } from "@/lib/cms";

export default async function NewVideoPage() {
  const staff = await getStaff();
  if (staff?.role === "sales") redirect("/console/videos");
  const supabase = await createClient();
  const [{ data: cases }, { data: products }] = await Promise.all([
    supabase.from("case_studies").select("id, title").order("title"),
    supabase.from("products").select("id, title").order("title"),
  ]);
  return (
    <AdminPage title="Add video">
      <VideoEditor caseStudies={cases ?? []} products={products ?? []} />
    </AdminPage>
  );
}
